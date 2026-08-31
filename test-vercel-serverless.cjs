const fs = require("fs");
const path = require("path");
const http = require("http");

async function runVercelServerlessAudit() {
  console.log("\n========================================================");
  console.log("🔍 OTOMATIZON — VERCEL SERVERLESS & PRODUCTION AUDIT");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, description) {
    if (condition) {
      console.log(`  ✅ [PASS] ${description}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${description}`);
      failed++;
    }
  }

  // 1. Verify framework isolation (No Next.js ghost files)
  const nextConfigExists = fs.existsSync(path.join(__dirname, "next.config.mjs")) || fs.existsSync(path.join(__dirname, "next.config.js"));
  assert(!nextConfigExists, "No ghost next.config files present in root (prevents Vercel Next.js framework hijacking)");

  // 2. Verify vercel.json configuration
  const vercelJsonPath = path.join(__dirname, "vercel.json");
  assert(fs.existsSync(vercelJsonPath), "vercel.json exists in root");
  const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, "utf8"));
  assert(vercelConfig.framework === null, "vercel.json explicitly defines framework: null");
  assert(vercelConfig.outputDirectory === "public", "vercel.json outputDirectory is 'public'");
  assert(vercelConfig.rewrites && vercelConfig.rewrites.length >= 2, "vercel.json contains API & SPA rewrites");

  // 3. Verify static production build artifacts in public/
  const requiredPublicFiles = ["index.html", "app.js", "vendor.js", "style.css", "logo.png"];
  for (const file of requiredPublicFiles) {
    const filePath = path.join(__dirname, "public", file);
    assert(fs.existsSync(filePath) && fs.statSync(filePath).size > 0, `public/${file} exists and is compiled (${fs.existsSync(filePath) ? (fs.statSync(filePath).size / 1024).toFixed(1) + " KB" : "missing"})`);
  }

  // 4. Verify Serverless API Entrypoints in api/
  const apiIndexPath = path.join(__dirname, "api/index.js");
  const apiPathCatchAll = path.join(__dirname, "api/[...path].js");
  assert(fs.existsSync(apiIndexPath), "api/index.js serverless entrypoint exists");
  assert(fs.existsSync(apiPathCatchAll), "api/[...path].js serverless catch-all exists");

  // 5. Test Vercel Serverless Function Invocation in Simulated Lambda Runtime
  process.env.VERCEL = "1";
  process.env.AWS_LAMBDA_FUNCTION_NAME = "otomatizon-serverless-function";

  const { default: serverlessHandler } = await import("./api/index.js");
  assert(typeof serverlessHandler === "function", "api/index.js default export is a callable async function");

  // Helper to simulate Vercel serverless request/response
  function invokeFunction(method, url, body = null, headers = {}) {
    return new Promise((resolve) => {
      const mockReq = {
        method,
        url,
        headers: {
          host: "otomatizon.vercel.app",
          "x-forwarded-for": "197.232.88.12",
          "content-type": "application/json",
          ...headers
        },
        body: body,
        socket: { remoteAddress: "197.232.88.12" },
        on: (event, cb) => {
          if (event === "data" && body) {
            cb(typeof body === "string" ? body : JSON.stringify(body));
          }
          if (event === "end") {
            cb();
          }
        }
      };

      let responseHeaders = {};
      let responseBody = "";
      let statusCode = 200;

      const mockRes = {
        statusCode: 200,
        headersSent: false,
        setHeader: (name, val) => {
          responseHeaders[name.toLowerCase()] = val;
        },
        writeHead: (status, hdrs = {}) => {
          statusCode = status;
          mockRes.statusCode = status;
          mockRes.headersSent = true;
          for (const [k, v] of Object.entries(hdrs)) {
            responseHeaders[k.toLowerCase()] = v;
          }
        },
        end: (chunk) => {
          if (chunk) {
            responseBody = Buffer.isBuffer(chunk) ? chunk : chunk.toString();
          }
          mockRes.headersSent = true;
          resolve({
            statusCode: mockRes.statusCode || statusCode,
            headers: responseHeaders,
            body: responseBody
          });
        }
      };

      serverlessHandler(mockReq, mockRes).catch((err) => {
        resolve({
          statusCode: 500,
          headers: responseHeaders,
          body: JSON.stringify({ error: err.message, stack: err.stack })
        });
      });
    });
  }

  // 6. Test GET /api/health
  console.log("\n  Testing Serverless Function Routes:");
  const healthRes = await invokeFunction("GET", "/api/health");
  assert(healthRes.statusCode === 200, `GET /api/health returns 200 OK (got ${healthRes.statusCode})`);
  const healthData = JSON.parse(healthRes.body);
  assert(healthData.status === "ok" && healthData.hub === "Nairobi (EAT)", "GET /api/health returns verified status & hub metadata");

  // 7. Test GET /api/state
  const stateRes = await invokeFunction("GET", "/api/state");
  assert(stateRes.statusCode === 200, `GET /api/state returns 200 OK (got ${stateRes.statusCode})`);
  const stateData = JSON.parse(stateRes.body);
  assert(stateData.organization && stateData.workflows && stateData.connections, "GET /api/state returns coherent database domain model");

  // 8. Test OPTIONS /api/state (CORS preflight)
  const optionsRes = await invokeFunction("OPTIONS", "/api/state");
  assert(optionsRes.statusCode === 204, `OPTIONS /api/state returns 204 No Content for CORS (got ${optionsRes.statusCode})`);

  // 9. Test POST /api/auth/signup
  const signupRes = await invokeFunction("POST", "/api/auth/signup", {
    fullName: "Faith Mutua",
    email: `faith.mutua.${Date.now()}@example.com`,
    phone: "+254 711 223 344",
    businessName: "Faith Tutoring Academy"
  });
  assert(signupRes.statusCode === 201, `POST /api/auth/signup handles body and creates account (status: ${signupRes.statusCode})`);

  // 10. Test GET /api/report
  const reportRes = await invokeFunction("GET", "/api/report");
  assert(reportRes.statusCode === 200, `GET /api/report returns 200 OK (got ${reportRes.statusCode})`);
  const reportPayload = JSON.parse(reportRes.body);
  assert(reportPayload.report && reportPayload.report.businessName, "GET /api/report returns structured executive business report");

  // 11. Test POST /api/workflows/wf_lead_autopilot/execute
  const execRes = await invokeFunction("POST", "/api/workflows/wf_lead_autopilot/execute", {});
  assert(execRes.statusCode === 200, `POST /api/workflows/:id/execute runs automation workflow cleanly (status: ${execRes.statusCode})`);

  // 12. Test GET /api/report/pdf
  const pdfRes = await invokeFunction("GET", "/api/report/pdf");
  assert(pdfRes.statusCode === 200, `GET /api/report/pdf returns 200 OK (got ${pdfRes.statusCode})`);
  assert(pdfRes.headers["content-type"] === "application/pdf", "GET /api/report/pdf returns application/pdf content type");

  // 13. Test 404 Route handling
  const notFoundRes = await invokeFunction("GET", "/api/non-existent-route-999");
  assert(notFoundRes.statusCode === 404, `Unknown API route returns 404 cleanly without crashing (got ${notFoundRes.statusCode})`);

  console.log("\n========================================================");
  console.log(`🏁 VERCEL SERVERLESS AUDIT: ${passed} Passed / ${failed} Failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runVercelServerlessAudit().catch((err) => {
  console.error("Fatal audit execution error:", err);
  process.exit(1);
});
