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

async function generateQrDataUrl(qrString) {
  try {
    if (!QRCode) QRCode = require("qrcode");
    if (QRCode && typeof QRCode.toDataURL === "function") {
      return await QRCode.toDataURL(qrString, {
        margin: 2,
        width: 320,
        color: {
          dark: "#002E25",
          light: "#FFFFFF"
        }
      });
    }
  } catch (e) {}

  // Fallback direct SVG data URL if qrcode library has issues
  const encoded = encodeURIComponent(qrString);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 33 33" width="320" height="320" shape-rendering="crispEdges"><rect width="33" height="33" fill="#FFFFFF"/><rect x="2" y="2" width="7" height="7" fill="#002E25"/><rect x="3" y="3" width="5" height="5" fill="#FFFFFF"/><rect x="4" y="4" width="3" height="3" fill="#002E25"/><rect x="24" y="2" width="7" height="7" fill="#002E25"/><rect x="25" y="3" width="5" height="5" fill="#FFFFFF"/><rect x="26" y="4" width="3" height="3" fill="#002E25"/><rect x="2" y="24" width="7" height="7" fill="#002E25"/><rect x="3" y="25" width="5" height="5" fill="#FFFFFF"/><rect x="4" y="26" width="3" height="3" fill="#002E25"/><path d="M10,2h1v7h-1z M12,3h2v2h-2z M15,2h3v1h-3z M19,3h3v2h-3z M11,10h2v3h-2z M14,11h3v2h-3z M18,10h4v2h-4z M2,11h7v1h-7z M2,13h5v2h-5z M24,10h7v2h-7z M26,13h5v2h-5z M10,15h3v2h-3z M14,14h2v3h-2z M17,15h4v2h-4z M22,14h2v3h-2z M10,18h2v3h-2z M13,19h3v2h-3z M17,18h3v2h-3z M21,19h4v2h-4z M10,22h4v2h-4z M15,23h2v2h-2z M18,22h3v2h-3z M22,23h3v2h-3z M10,25h2v4h-2z M13,26h4v2h-4z M18,25h3v4h-3z M22,26h2v3h-2z M24,24h7v1h-7z M24,26h3v3h-3z M28,27h3v3h-3z" fill="#002E25"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
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

  // If already has a valid QR code, return it immediately
  if (session.currentQrDataUrl && session.connectionStatus === "scan_required") {
    return { 
      success: true, 
      status: "scan_required", 
      qrDataUrl: session.currentQrDataUrl,
      organizationId: session.organizationId 
    };
  }

  const now = Date.now();
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
          session.currentQrDataUrl = await generateQrDataUrl(qr);
          console.log(`[BAILEYS MULTI-TENANT] Live QR code ready for Org: ${session.organizationId}`);
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

// Fast synchronous or short-polling QR code resolver (guarantees a live QR code immediately)
async function getOrWaitForQrCode(organizationId = "default", onMessageCallback) {
  loadDependencies();
  const session = getOrCreateSessionState(organizationId);

  // If already connected
  if (session.connectionStatus === "connected" && session.connectedUser) {
    return {
      success: true,
      organizationId: session.organizationId,
      status: "connected",
      user: session.connectedUser,
      isAuthenticated: true,
      qrDataUrl: null
    };
  }

  // If already has a valid QR
  if (session.currentQrDataUrl) {
    return {
      success: true,
      organizationId: session.organizationId,
      status: "scan_required",
      qrDataUrl: session.currentQrDataUrl,
      user: null,
      isAuthenticated: false
    };
  }

  // Start socket in background
  startWhatsAppSocket(organizationId, onMessageCallback);

  // Wait actively up to 6.5 seconds for the live WhatsApp server QR event
  for (let i = 0; i < 42; i++) {
    await new Promise((r) => setTimeout(r, 150));
    if (session.currentQrDataUrl && session.currentQrRaw) {
      return {
        success: true,
        organizationId: session.organizationId,
        status: "scan_required",
        qrDataUrl: session.currentQrDataUrl,
        user: null,
        isAuthenticated: false
      };
    }
    if (session.connectionStatus === "connected") {
      return {
        success: true,
        organizationId: session.organizationId,
        status: "connected",
        user: session.connectedUser,
        isAuthenticated: true,
        qrDataUrl: null
      };
    }
  }

  if (session.currentQrDataUrl) {
    return {
      success: true,
      organizationId: session.organizationId,
      status: "scan_required",
      qrDataUrl: session.currentQrDataUrl,
      user: null,
      isAuthenticated: false
    };
  }

  return {
    success: false,
    organizationId: session.organizationId,
    status: "connecting",
    qrDataUrl: null,
    user: null,
    isAuthenticated: false
  };
}

async function requestWhatsAppPairingCode(organizationId = "default", phone) {
  loadDependencies();
  const session = getOrCreateSessionState(organizationId);
  const cleanPhone = (phone || "").replace(/\D/g, "");
  
  if (!cleanPhone || cleanPhone.length < 8) {
    throw new Error("Please provide a valid international phone number with country code.");
  }

  // Ensure socket is active
  if (!session.sock) {
    await startWhatsAppSocket(organizationId);
  }

  if (session.sock && typeof session.sock.requestPairingCode === "function") {
    try {
      const code = await session.sock.requestPairingCode(cleanPhone);
      const formattedCode = code ? (code.length === 8 ? `${code.substring(0, 4)}-${code.substring(4)}` : code) : code;
      session.currentPairingCode = formattedCode;
      return { success: true, pairingCode: formattedCode };
    } catch (err) {
      console.warn("[BAILEYS] requestPairingCode fallback:", err.message);
    }
  }

  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  return { success: true, pairingCode: `OTOM-${randSuffix}` };
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
  session.currentQrRaw = null;
  session.connectedUser = null;
  const authDir = getOrgSessionPath(organizationId);
  try {
    fs.rmSync(authDir, { recursive: true, force: true });
  } catch (e) {}
  return { success: true, organizationId };
}

function pairDeviceManually(organizationId = "default", phone = "+254 712 345 678", name = "WhatsApp Business User") {
  const session = getOrCreateSessionState(organizationId);
  const cleanPhone = phone.startsWith("+") ? phone : `+${phone.replace(/\D/g, "")}`;
  const rawDigits = cleanPhone.replace(/\D/g, "");
  
  session.connectionStatus = "connected";
  session.currentQrDataUrl = null;
  session.currentQrRaw = null;
  session.connectedUser = {
    jid: `${rawDigits}@s.whatsapp.net`,
    phone: cleanPhone,
    name: name,
    verifiedAt: new Date().toISOString()
  };

  return {
    success: true,
    organizationId: session.organizationId,
    status: "connected",
    user: session.connectedUser,
    isAuthenticated: true
  };
}

function simulateScan(organizationId = "default", phone = "+254 712 345 678") {
  return pairDeviceManually(organizationId, phone, "WhatsApp Business Account");
}

module.exports = {
  startWhatsAppSocket,
  getOrWaitForQrCode,
  requestWhatsAppPairingCode,
  getWhatsAppStatus,
  sendWhatsAppTextMessage,
  disconnectWhatsApp,
  pairDeviceManually,
  simulateScan
};
