// Vercel Serverless Entrypoint for Otomatizon Backend APIs (ESM Compatible)
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);

let serverModule = null;
let handleRequest = null;

function loadServerModule() {
  if (handleRequest) return handleRequest;
  
  const candidatePaths = [
    path.join(__dirname || process.cwd(), "../server.cjs"),
    path.join(process.cwd(), "server.cjs"),
    path.resolve("./server.cjs"),
    "../server.cjs"
  ];

  for (const candidate of candidatePaths) {
    try {
      serverModule = require(candidate);
      if (serverModule && typeof serverModule.handleRequest === "function") {
        handleRequest = serverModule.handleRequest;
        return handleRequest;
      }
    } catch (e) {
      // Continue to next candidate
    }
  }

  throw new Error("Unable to locate server.cjs in serverless runtime environment");
}

export default async function handler(req, res) {
  try {
    const handlerFn = loadServerModule();
    return await handlerFn(req, res);
  } catch (err) {
    console.error("Vercel Serverless Function Error:", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ 
        error: "Internal Server Error", 
        message: err.message || "An unexpected error occurred in the serverless handler",
        code: "SERVERLESS_INVOCATION_FAILED"
      }));
    }
  }
}
