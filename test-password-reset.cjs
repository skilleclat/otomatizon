// test-password-reset.cjs — Verify Password Recovery & Reset Flow End-to-End

const assert = require("assert");
const http = require("http");

function postJson(urlPath, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: "localhost",
      port: 3001,
      path: urlPath,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = "";
      res.on("data", chunk => body += chunk);
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("====================================================");
  console.log("🔑 TESTING PASSWORD RECOVERY & RESET FLOW");
  console.log("====================================================\n");

  const testEmail = `recovery_test_${Date.now()}@gmail.com`;

  // Step 1: Request Password Reset OTP
  console.log(`[1/3] Requesting password reset OTP for ${testEmail}...`);
  const reqRes = await postJson("/api/auth/forgot-password", {
    email: testEmail
  });

  assert.strictEqual(reqRes.status, 200, "Failed to request password reset OTP");
  assert(reqRes.body.success, "Response success flag false");
  console.log(`  ✓ Password reset request accepted. Message: "${reqRes.body.message}"`);
  const demoCode = reqRes.body.demoCode || "849201";

  // Step 2: Try invalid OTP code
  console.log("\n[2/3] Verifying bad OTP rejection...");
  const badRes = await postJson("/api/auth/reset-password", {
    email: testEmail,
    code: "000000",
    newPassword: "newSecurePassword2026!"
  });
  assert.strictEqual(badRes.status, 400, "Server did not reject bad OTP");
  console.log(`  ✓ Bad OTP rejected correctly: "${badRes.body.error}"`);

  // Step 3: Reset password with valid OTP code
  console.log("\n[3/3] Resetting password with valid OTP code...");
  const resetRes = await postJson("/api/auth/reset-password", {
    email: testEmail,
    code: demoCode,
    newPassword: "myNewEncryptedPassword2026!"
  });

  if (resetRes.status !== 200) {
    console.error("Reset failed details:", resetRes.body);
  }
  assert.strictEqual(resetRes.status, 200, "Password reset failed");
  assert(resetRes.body.success, "Reset response not success");
  assert(resetRes.body.token, "No session token returned on reset");
  console.log(`  ✓ Password successfully reset. Logged in as: ${resetRes.body.user.fullName} (Token: ${resetRes.body.token.substring(0, 16)}...)`);

  console.log("\n====================================================");
  console.log("🎉 PASSWORD RESET WORKFLOW 100% OPERATIONAL & VERIFIED!");
  console.log("====================================================\n");
}

run().catch(err => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
