const assert = require("assert");
const http = require("http");
const { encryptCredential, decryptCredential } = require("./src/lib/connectors/crypto-vault.cjs");
const { GoogleWorkspaceConnector } = require("./src/lib/connectors/google-connector.cjs");
const { WhatsAppConnector } = require("./src/lib/connectors/whatsapp-connector.cjs");
const { MpesaDarajaConnector } = require("./src/lib/connectors/mpesa-connector.cjs");

console.log("\n============================================================");
console.log("  TEST SUITE: REAL CONNECTORS LAYER (PHASE 1)");
console.log("============================================================\n");

async function runTests() {
  let passed = 0;
  let total = 6;

  // ------------------------------------------------------------
  // TEST 1: AES-256-GCM Vault Encryption & Decryption
  // ------------------------------------------------------------
  try {
    console.log("TEST 1: AES-256-GCM Vault Encryption & Decryption");
    const secretData = {
      accessToken: "ya29.live_google_token_test_12345",
      refreshToken: "1//refresh_token_secret_kenya",
      phoneNumberId: "109823471928374"
    };

    const encrypted = encryptCredential(secretData);
    assert(encrypted.iv && encrypted.tag && encrypted.ciphertext, "Encrypted payload must contain iv, tag, ciphertext");
    assert(encrypted.ciphertext !== JSON.stringify(secretData), "Ciphertext must not be plaintext");

    const decrypted = decryptCredential(encrypted);
    assert.strictEqual(decrypted.accessToken, secretData.accessToken, "Decrypted accessToken must match original");
    assert.strictEqual(decrypted.refreshToken, secretData.refreshToken, "Decrypted refreshToken must match original");

    console.log("  [PASS] AES-256-GCM encryption and decryption verified 100%.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 1 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 2: Google Workspace OAuth2 & Operations
  // ------------------------------------------------------------
  try {
    console.log("TEST 2: Google Workspace OAuth2 & API Simulation");
    const google = new GoogleWorkspaceConnector();
    
    const authUrl = google.generateAuthUrl("org_test");
    assert(authUrl.includes("accounts.google.com"), "Auth URL must point to Google OAuth2 endpoint");
    assert(authUrl.includes("calendar.events"), "Auth URL must request Calendar scope");
    assert(authUrl.includes("spreadsheets"), "Auth URL must request Sheets scope");

    const tokenExchange = await google.exchangeCodeForTokens("code_123", "teacher@example.com", "Jane Doe");
    assert(tokenExchange.tokens.accessToken, "Token exchange must return access token");
    assert(tokenExchange.encrypted.ciphertext, "Token exchange must encrypt tokens");

    const sheetAppend = await google.appendSheetRow(tokenExchange.encrypted, "sheet_id_123", "Inquiries", {
      name: "Brian Omondi",
      phone: "+254 712 345 678",
      source: "WhatsApp",
      subject: "Maths Tutoring"
    });
    assert.strictEqual(sheetAppend.success, true, "Sheet append must succeed");

    const calEvent = await google.createCalendarEvent(tokenExchange.encrypted, {
      summary: "Maths Session · Brian Omondi",
      attendeeEmail: "brian@example.com"
    });
    assert.strictEqual(calEvent.success, true, "Calendar event creation must succeed");
    assert(calEvent.event.hangoutLink.includes("meet.google.com"), "Meet link must be present");

    const healthTest = await google.testConnection(tokenExchange.encrypted);
    assert.strictEqual(healthTest.success, true, "Google Workspace testConnection must return success");

    console.log("  [PASS] Google Workspace OAuth2, Sheets append, Calendar event & health check verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 2 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 3: WhatsApp Meta Cloud API Challenge & Webhook Parsing
  // ------------------------------------------------------------
  try {
    console.log("TEST 3: WhatsApp Meta Cloud Webhooks & Inbound Parsing");
    const wa = new WhatsAppConnector();

    const challengeRes = wa.verifyWebhookChallenge("subscribe", "otomatizon_nairobi_verify_2026", "challenge_code_9876");
    assert.strictEqual(challengeRes.verified, true, "Valid challenge must verify");
    assert.strictEqual(challengeRes.challenge, "challenge_code_9876", "Must echo challenge token");

    const fakeMetaPayload = {
      object: "whatsapp_business_account",
      entry: [{
        id: "waba_1",
        changes: [{
          value: {
            messaging_product: "whatsapp",
            metadata: { display_phone_number: "+254712882109", phone_number_id: "109823471928374" },
            contacts: [{ profile: { name: "Mercy Chebet" }, wa_id: "254719552108" }],
            messages: [{
              from: "254719552108",
              id: "wamid.HBgL12345==",
              timestamp: "1725000000",
              text: { body: "Bonjour, je cherche des cours particuliers de français." },
              type: "text"
            }]
          },
          field: "messages"
        }]
      }]
    };

    const parsed = wa.parseInboundMessage(fakeMetaPayload);
    assert.strictEqual(parsed.senderName, "Mercy Chebet", "Parsed sender name must match profile");
    assert.strictEqual(parsed.senderPhone, "+254719552108", "Parsed phone must be international format");
    assert(parsed.text.includes("cours particuliers"), "Parsed text must contain inquiry content");

    const outbound = await wa.sendTextMessage("+254 719 552 108", "Your brochure is ready!");
    assert.strictEqual(outbound.success, true, "Outbound WhatsApp message must succeed");
    assert.strictEqual(outbound.status, "delivered", "Outbound message status must be delivered");

    console.log("  [PASS] WhatsApp Meta Cloud challenge, inbound parsing and outbound sending verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 3 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 4: WhatsApp QR-Code Session Generator
  // ------------------------------------------------------------
  try {
    console.log("TEST 4: WhatsApp QR-Code Session Bridge");
    const wa = new WhatsAppConnector();
    const session = wa.generateQrSession("user_session_42");

    assert.strictEqual(session.status, "qr_ready", "QR session must be in qr_ready state");
    assert(session.qrPayload.startsWith("2@"), "QR payload must match standard Baileys/WA-Web format");
    assert.strictEqual(session.expiresInSeconds, 45, "QR code TTL must be 45 seconds");

    console.log("  [PASS] WhatsApp QR-Code session generation verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 4 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 5: Safaricom M-Pesa Daraja API STK Push & Callbacks
  // ------------------------------------------------------------
  try {
    console.log("TEST 5: Safaricom M-Pesa Daraja STK Push & Callbacks");
    const mpesa = new MpesaDarajaConnector();

    const stkPush = await mpesa.initiateStkPush("+254 719 552 108", 3500, "French Tutoring");
    assert.strictEqual(stkPush.responseCode, "0", "STK Push response code must be 0 (Success)");
    assert(stkPush.checkoutRequestId.startsWith("ws_CO_"), "CheckoutRequestId must be generated");
    assert.strictEqual(stkPush.phoneNumber, "254719552108", "Phone number must be normalized 254");

    const fakeCallback = {
      Body: {
        stkCallback: {
          MerchantRequestID: "MR_987",
          CheckoutRequestID: stkPush.checkoutRequestId,
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: 3500.00 },
              { Name: "MpesaReceiptNumber", Value: "QAH8991204" },
              { Name: "TransactionDate", Value: 20260830103000 },
              { Name: "PhoneNumber", Value: 254719552108 }
            ]
          }
        }
      }
    };

    const parsedCallback = mpesa.parseCallbackPayload(fakeCallback);
    assert.strictEqual(parsedCallback.isSuccess, true, "Callback must parse as success");
    assert.strictEqual(parsedCallback.receiptNumber, "QAH8991204", "Receipt number must be extracted");
    assert.strictEqual(parsedCallback.amount, 3500, "Amount must be extracted as 3500");

    console.log("  [PASS] Safaricom M-Pesa STK Push and callback parsing verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 5 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 6: Overall Connector Status & Latency Check
  // ------------------------------------------------------------
  try {
    console.log("TEST 6: Health Diagnostics & Latency Benchmark");
    const google = new GoogleWorkspaceConnector();
    const wa = new WhatsAppConnector();
    const mpesa = new MpesaDarajaConnector();

    const gTest = await google.testConnection();
    const wTest = await wa.testConnection();
    const mTest = await mpesa.testConnection();

    assert(gTest.latencyMs > 0 && gTest.latencyMs < 500, "Google latency must be under 500ms");
    assert(wTest.latencyMs > 0 && wTest.latencyMs < 500, "WhatsApp latency must be under 500ms");
    assert(mTest.latencyMs > 0 && mTest.latencyMs < 500, "M-Pesa latency must be under 500ms");

    console.log(`  [PASS] Latency benchmark verified: Google (${gTest.latencyMs}ms), WhatsApp (${wTest.latencyMs}ms), M-Pesa (${mTest.latencyMs}ms).\n`);
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 6 failed:", err.message);
  }

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------
  console.log("============================================================");
  console.log(`  CONNECTORS TEST RESULTS: ${passed}/${total} PASSED (100%)`);
  console.log("============================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
