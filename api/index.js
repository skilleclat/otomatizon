// Vercel Serverless Entrypoint for Otomatizon Backend APIs (ESM Compatible)
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const { handleRequest } = require("../server.cjs");

export default async function handler(req, res) {
  try {
    return await handleRequest(req, res);
  } catch (err) {
    console.error("Vercel Serverless Function Error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal Server Error", message: err.message }));
  }
}
