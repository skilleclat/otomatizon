// Vercel Serverless Entrypoint for Otomatizon Backend APIs (ESM Compatible)
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handleRequest = null;

try {
  const server = require("../server.cjs");
  if (server && typeof server.handleRequest === "function") {
    handleRequest = server.handleRequest;
  }
} catch (err) {
  try {
    const server = require(path.resolve(process.cwd(), "server.cjs"));
    if (server && typeof server.handleRequest === "function") {
      handleRequest = server.handleRequest;
    }
  } catch (err2) {
    console.error("FATAL: Failed to require server.cjs in Vercel Serverless Function:", err, err2);
  }
}

export default async function handler(req, res) {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    return res.end();
  }

  // Fast-path Direct Health Check
  const url = req.url || "/";
  const [urlPath] = url.split("?");
  if (urlPath === "/api/health" || urlPath === "/api/ping") {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    return res.end(JSON.stringify({
      status: "ok",
      service: "Otomatizon SaaS Engine",
      runtime: "vercel-serverless",
      hub: "Nairobi (EAT)",
      securityHardened: true,
      timestamp: new Date().toISOString()
    }));
  }

  try {
    if (!handleRequest) {
      const server = require("../server.cjs");
      handleRequest = server.handleRequest;
    }

    if (typeof handleRequest === "function") {
      return await handleRequest(req, res);
    }

    throw new Error("Otomatizon backend handleRequest function is unavailable");
  } catch (err) {
    console.error("Otomatizon Serverless Handler Error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-store");
      res.end(JSON.stringify({
        error: "Internal Server Error",
        message: err.message || "An unexpected error occurred in the serverless handler",
        code: "SERVERLESS_INVOCATION_FAILED",
        status: "error"
      }));
    }
  }
}
