// Vercel Serverless Entrypoint for Otomatizon Backend APIs
const { handleRequest } = require("../server.cjs");

module.exports = async (req, res) => {
  return handleRequest(req, res);
};
