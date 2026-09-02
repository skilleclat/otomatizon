const path = require("path");
const fs = require("fs");
let QRCode = null;
let makeWASocket = null;
let useMultiFileAuthState = null;
let makeCacheableSignalKeyStore = null;
let fetchLatestBaileysVersion = null;
let DisconnectReason = null;
let pino = null;

const SESSIONS_BASE_DIR = path.resolve(process.cwd(), "data", "sessions");

// Multi-Tenant Session Registry: Maps organizationId -> SessionState
const activeSessions = new Map();

function loadDependencies() {
  if (!makeWASocket) {
    try {
      const baileys = require("@whiskeysockets/baileys");
      makeWASocket = baileys.default || baileys.makeWASocket || baileys;
      useMultiFileAuthState = baileys.useMultiFileAuthState;
      makeCacheableSignalKeyStore = baileys.makeCacheableSignalKeyStore;
      fetchLatestBaileysVersion = baileys.fetchLatestBaileysVersion;
      DisconnectReason = baileys.DisconnectReason;
      QRCode = require("qrcode");
      pino = require("pino");
      return true;
    } catch (e) {
      console.warn("[BAILEYS MULTI-TENANT] Dependencies loading:", e.message);
      return false;
    }
  }
  return true;
}

function getOrgSessionPath(organizationId) {
  const cleanId = (organizationId || "default").replace(/[^a-zA-Z0-9_-]/g, "_");
  const orgDir = path.join(SESSIONS_BASE_DIR, cleanId, "baileys_auth");
  if (!fs.existsSync(orgDir)) {
    fs.mkdirSync(orgDir, { recursive: true });
  }
  return orgDir;
}

function getOrCreateSessionState(organizationId) {
  const cleanId = (organizationId || "default").replace(/[^a-zA-Z0-9_-]/g, "_");
  if (!activeSessions.has(cleanId)) {
    activeSessions.set(cleanId, {
      organizationId: cleanId,
      sock: null,
      currentQrDataUrl: null,
      currentQrRaw: null,
      connectionStatus: "disconnected", // 'disconnected' | 'connecting' | 'scan_required' | 'connected'
      connectedUser: null,
      lastInitAt: 0
    });
  }
  return activeSessions.get(cleanId);
}

async function startWhatsAppSocket(organizationId = "default", onMessageCallback) {
  if (!loadDependencies()) {
    return { success: false, error: "Baileys dependencies not loaded yet" };
  }

  const session = getOrCreateSessionState(organizationId);
  const authDir = getOrgSessionPath(organizationId);

  // If already connected with an active socket, return connected
  if (session.sock && session.connectionStatus === "connected" && session.connectedUser) {
    return { 
      success: true, 
      status: "connected", 
      user: session.connectedUser,
      organizationId: session.organizationId 
    };
  }

  // If already has a valid QR code generated in the last 45s, return it immediately
  if (session.currentQrDataUrl && session.connectionStatus === "scan_required") {
    return { 
      success: true, 
      status: "scan_required", 
      qrDataUrl: session.currentQrDataUrl,
      organizationId: session.organizationId 
    };
  }

  // Prevent multiple overlapping inits within 4 seconds
  const now = Date.now();
  if (now - session.lastInitAt < 4000) {
    return {
      success: true,
      status: session.connectionStatus,
      qrDataUrl: session.currentQrDataUrl,
      organizationId: session.organizationId
    };
  }

  session.lastInitAt = now;
  session.connectionStatus = "connecting";

  try {
    const { state, saveCreds } = await useMultiFileAuthState(authDir);
    const logger = pino ? pino({ level: "silent" }) : undefined;

    let version;
    try {
      if (fetchLatestBaileysVersion) {
        const vInfo = await fetchLatestBaileysVersion();
        version = vInfo?.version;
      }
    } catch (vErr) {}

    const authConfig = {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore ? makeCacheableSignalKeyStore(state.keys, logger) : state.keys
    };

    const sock = makeWASocket({
      version,
      auth: authConfig,
      printQRInTerminal: false,
      logger: logger,
      browser: ["Otomatizon Business OS", "Chrome", "1.0.0"],
      syncFullHistory: false,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 25000
    });

    session.sock = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        session.currentQrRaw = qr;
        session.connectionStatus = "scan_required";
        try {
          session.currentQrDataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            width: 320,
            color: {
              dark: "#002E25",
              light: "#FFFFFF"
            }
          });
          console.log(`[BAILEYS MULTI-TENANT] Live QR code generated for Org: ${session.organizationId}`);
        } catch (err) {
          console.error(`[BAILEYS] QR generation error for ${session.organizationId}:`, err);
        }
      }

      if (connection === "open") {
        session.connectionStatus = "connected";
        session.currentQrDataUrl = null;
        session.currentQrRaw = null;
        const jid = (sock && sock.user && sock.user.id) ? sock.user.id : (session.connectedUser?.jid || "");
        const rawPhone = jid ? (jid.split(":")[0] || jid.split("@")[0] || "") : "";
        session.connectedUser = {
          jid: jid,
          phone: rawPhone ? `+${rawPhone}` : "Connected Phone",
          name: (sock && sock.user && sock.user.name) ? sock.user.name : "WhatsApp Business User",
          verifiedAt: new Date().toISOString()
        };
        console.log(`[BAILEYS MULTI-TENANT] WhatsApp Connected for Org ${session.organizationId}! Phone: ${session.connectedUser.phone}`);
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== (DisconnectReason ? DisconnectReason.loggedOut : 401);
        console.log(`[BAILEYS] Connection closed for Org ${session.organizationId} (status: ${statusCode}). Reconnecting? ${shouldReconnect}`);

        if (statusCode !== 401 && statusCode !== 403) {
          session.connectionStatus = session.connectedUser ? "connected" : "connecting";
        } else {
          session.connectionStatus = "disconnected";
          session.connectedUser = null;
          session.currentQrDataUrl = null;
          try {
            fs.rmSync(authDir, { recursive: true, force: true });
          } catch (e) {}
        }

        if (shouldReconnect && !session.connectedUser) {
          setTimeout(() => startWhatsAppSocket(organizationId, onMessageCallback), 3000);
        }
      }
    });

    // Inbound customer message handling isolated per organization
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
      if (type === "notify") {
        for (const msg of messages) {
          if (!msg.key.fromMe && msg.message) {
            const senderJid = msg.key.remoteJid;
            const senderPhone = senderJid ? senderJid.split("@")[0] : "Unknown";
            const messageText = 
              msg.message.conversation || 
              msg.message.extendedTextMessage?.text || 
              msg.message.imageMessage?.caption || 
              "";
            const senderName = msg.pushName || `Client +${senderPhone}`;

            console.log(`[BAILEYS MSG · Org: ${session.organizationId}] From ${senderName} (+${senderPhone}): "${messageText}"`);

            if (onMessageCallback) {
              onMessageCallback({
                organizationId: session.organizationId,
                senderJid,
                senderPhone: `+${senderPhone}`,
                senderName,
                text: messageText,
                timestamp: new Date().toISOString(),
                rawMessage: msg
              });
            }
          }
        }
      }
    });

    return { 
      success: true, 
      status: session.connectionStatus, 
      qrDataUrl: session.currentQrDataUrl,
      organizationId: session.organizationId 
    };
  } catch (error) {
    console.error(`[BAILEYS] Error initializing Org ${organizationId}:`, error);
    session.connectionStatus = "disconnected";
    return { success: false, error: error.message };
  }
}

function getWhatsAppStatus(organizationId = "default") {
  const session = getOrCreateSessionState(organizationId);
  return {
    organizationId: session.organizationId,
    status: session.connectionStatus,
    qrDataUrl: session.currentQrDataUrl,
    user: session.connectedUser,
    isAuthenticated: session.connectionStatus === "connected"
  };
}

async function sendWhatsAppTextMessage(organizationId = "default", targetPhone, text) {
  const session = getOrCreateSessionState(organizationId);
  if (!session.sock || session.connectionStatus !== "connected") {
    throw new Error(`WhatsApp client is not connected for organization ${organizationId}`);
  }
  const cleanPhone = targetPhone.replace(/\D/g, "");
  const jid = `${cleanPhone}@s.whatsapp.net`;
  return await session.sock.sendMessage(jid, { text });
}

async function disconnectWhatsApp(organizationId = "default") {
  const session = getOrCreateSessionState(organizationId);
  if (session.sock) {
    try {
      await session.sock.logout();
    } catch (e) {}
    session.sock = null;
  }
  session.connectionStatus = "disconnected";
  session.currentQrDataUrl = null;
  session.connectedUser = null;
  const authDir = getOrgSessionPath(organizationId);
  try {
    fs.rmSync(authDir, { recursive: true, force: true });
  } catch (e) {}
  return { success: true, organizationId };
}

module.exports = {
  startWhatsAppSocket,
  getWhatsAppStatus,
  sendWhatsAppTextMessage,
  disconnectWhatsApp
};
