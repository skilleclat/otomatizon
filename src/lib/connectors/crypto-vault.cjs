const crypto = require("crypto");

const ALGORITHM = "aes-256-gcm";
const DEFAULT_KEY_SOURCE = process.env.OTOMATIZON_SECRET_KEY || "otomatizon_super_secret_master_key_2026_eat_kenya";
// Derive a 32-byte key deterministically using SHA-256
const MASTER_KEY = crypto.createHash("sha256").update(DEFAULT_KEY_SOURCE).digest();

/**
 * Encrypts arbitrary JS object or string using AES-256-GCM.
 */
function encryptCredential(data) {
  const plaintext = typeof data === "string" ? data : JSON.stringify(data);
  const iv = crypto.randomBytes(12); // 96-bit IV for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);
  
  let ciphertext = cipher.update(plaintext, "utf8", "hex");
  ciphertext += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return {
    iv: iv.toString("hex"),
    tag: tag,
    ciphertext: ciphertext,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Decrypts an encrypted credential payload and returns the original string or parsed JSON object.
 */
function decryptCredential(encrypted) {
  if (!encrypted || !encrypted.iv || !encrypted.tag || !encrypted.ciphertext) {
    return null;
  }

  try {
    const iv = Buffer.from(encrypted.iv, "hex");
    const tag = Buffer.from(encrypted.tag, "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encrypted.ciphertext, "hex", "utf8");
    decrypted += decipher.final("utf8");

    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (err) {
    console.error("[CryptoVault] Decryption failed:", err.message);
    return null;
  }
}

module.exports = {
  encryptCredential,
  decryptCredential
};
