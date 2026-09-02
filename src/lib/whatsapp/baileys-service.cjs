const path = require("path");
const fs = require("fs");
let QRCode = null;
let makeWASocket = null;
let useMultiFileAuthState = null;
let DisconnectReason = null;
let pino = null;

const AUTH_DIR = path.resolve(process.cwd(), "data", "baileys_auth");

let sock = null;
let currentQrDataUrl = null;
let currentQrRaw = null;
let connectionStatus = "disconnected"; // 'disconnected' | 'connecting' | 'scan_required' | 'connected'
let connectedUser = null;
let isInitializing = false;

function loadDependencies() {
  if (!makeWASocket) {
    try {
      const baileys = require("@whiskeysockets/baileys");
      makeWASocket = baileys.default || baileys.makeWASocket || baileys;
      useMultiFileAuthState = baileys.useMultiFileAuthState;
      DisconnectReason = baileys.DisconnectReason;
      QRCode = require("qrcode");
      pino = require("pino");
      return true;
    } catch (e) {
      console.warn("[BAILEYS] Dependencies not fully ready yet:", e.message);
      return false;
    }
  }
  return true;
}

async function startWhatsAppSocket(onMessageCallback) {
  if (!loadDependencies()) {
    return { success: false, error: "Baileys dependencies not loaded yet" };
  }

  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  if (sock && connectionStatus === "connected") {
    return { success: true, status: "connected", user: connectedUser };
  }

  if (isInitializing) {
    return { success: true, status: connectionStatus, qr: currentQrDataUrl };
  }

  isInitializing = true;
  connectionStatus = "connecting";

  try {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    const logger = pino ? pino({ level: "silent" }) : undefined;

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: logger,
      browser: ["Otomatizon", "Chrome", "1.0.0"],
      syncFullHistory: false
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        currentQrRaw = qr;
        connectionStatus = "scan_required";
        try {
          currentQrDataUrl = await QRCode.toDataURL(qr, {
            margin: 2,
            width: 320,
            color: {
              dark: "#002E25",
              light: "#FFFFFF"
            }
          });
          console.log("[BAILEYS] Authentic WhatsApp Multi-Device QR Code generated successfully!");
        } catch (err) {
          console.error("[BAILEYS] Error generating QR data URL:", err);
        }
      }

      if (connection === "open") {
        connectionStatus = "connected";
        currentQrDataUrl = null;
        currentQrRaw = null;
        const jid = (sock && sock.user && sock.user.id) ? sock.user.id : (connectedUser?.jid || "");
        const rawPhone = jid ? (jid.split(":")[0] || jid.split("@")[0] || "") : "254770979109";
        connectedUser = {
          jid: jid,
          phone: `+${rawPhone}`,
          name: (sock && sock.user && sock.user.name) ? sock.user.name : "WhatsApp Business User",
          verifiedAt: new Date().toISOString()
        };
        console.log(`[BAILEYS] WhatsApp Multi-Device Authenticated! User Phone: +${rawPhone}`);
      }

      if (connection === "close") {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== (DisconnectReason ? DisconnectReason.loggedOut : 401);
        console.log(`[BAILEYS] Connection closed (status: ${statusCode}). Reconnecting? ${shouldReconnect}`);
        
        if (statusCode !== 401 && statusCode !== 403) {
          connectionStatus = connectedUser ? "connected" : "connecting";
        } else {
          connectionStatus = "disconnected";
          connectedUser = null;
        }
        
        isInitializing = false;

        if (shouldReconnect) {
          setTimeout(() => startWhatsAppSocket(onMessageCallback), 3000);
        } else {
          try {
            fs.rmSync(AUTH_DIR, { recursive: true, force: true });
          } catch (e) {}
        }
      }
    });

    // Handle Inbound Customer Messages in Real Time
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
            const senderName = msg.pushName || `Contact +${senderPhone}`;

            console.log(`[BAILEYS REAL MESSAGE] From: ${senderName} (+${senderPhone}): "${messageText}"`);

            if (onMessageCallback) {
              onMessageCallback({
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

    isInitializing = false;
    return { success: true, status: connectionStatus, qr: currentQrDataUrl };
  } catch (error) {
    console.error("[BAILEYS] Initialization error:", error);
    connectionStatus = "disconnected";
    isInitializing = false;
    return { success: false, error: error.message };
  }
}

function getWhatsAppStatus() {
  return {
    status: connectionStatus,
    qrDataUrl: currentQrDataUrl,
    user: connectedUser,
    isAuthenticated: connectionStatus === "connected"
  };
}

async function sendWhatsAppTextMessage(targetPhone, text) {
  if (!sock || connectionStatus !== "connected") {
    throw new Error("WhatsApp client is not connected");
  }
  const cleanPhone = targetPhone.replace(/\D/g, "");
  const jid = `${cleanPhone}@s.whatsapp.net`;
  return await sock.sendMessage(jid, { text });
}

async function disconnectWhatsApp() {
  if (sock) {
    try {
      await sock.logout();
    } catch (e) {}
    sock = null;
  }
  connectionStatus = "disconnected";
  currentQrDataUrl = null;
  connectedUser = null;
  try {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  } catch (e) {}
  return { success: true };
}

module.exports = {
  startWhatsAppSocket,
  getWhatsAppStatus,
  sendWhatsAppTextMessage,
  disconnectWhatsApp
};
