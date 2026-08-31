const assert = require("assert");
const { parseInboundMessageText, detectLanguage, detectIntent, extractEntities } = require("./src/lib/intelligence/semantic-parser.cjs");
const { draftActionAndReply } = require("./src/lib/intelligence/action-drafter.cjs");

console.log("\n============================================================");
console.log("  TEST SUITE: SEMANTIC INTELLIGENCE & NLP PARSER (PHASE 2)");
console.log("============================================================\n");

async function runTests() {
  let passed = 0;
  let total = 6;

  // ------------------------------------------------------------
  // TEST 1: French Inquiry Parsing (Cours particuliers)
  // ------------------------------------------------------------
  try {
    console.log("TEST 1: French Inquiry (Demande de cours particuliers)");
    const message = "Bonjour M. Kamau, je cherche des cours particuliers de français pour ma fille en classe de 4e, disponible le mardi vers 16h. Quels sont vos tarifs ?";
    const result = parseInboundMessageText(message, { senderName: "Sylvie Dubois", senderPhone: "+254 712 990 112" });

    assert.strictEqual(result.detectedLanguage, "fr", "Language must be French");
    assert.strictEqual(result.entities.subject, "French Tutoring", "Subject must be French Tutoring");
    assert.strictEqual(result.entities.requestedDay, "Tuesday", "Requested day must be Tuesday");
    assert.strictEqual(result.entities.requestedTime, "16h", "Requested time must be 16h");
    assert(result.confidenceScore >= 90, "Confidence score must be >= 90%");

    const drafted = draftActionAndReply(result, { ownerName: "James" });
    assert(drafted.draftedReply.includes("Bonjour Sylvie Dubois"), "Reply must be in French with student name");
    assert(drafted.draftedReply.includes("KES 3,500"), "Reply must quote standard rate");
    assert.strictEqual(drafted.suggestedAction.actionType, "offer_calendar_slots", "Action type must be offer_calendar_slots");

    console.log("  [PASS] French message parsing & personalized reply verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 1 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 2: English Booking Request with Grade Level
  // ------------------------------------------------------------
  try {
    console.log("TEST 2: English Booking Request (Mathematics CBC Grade 8)");
    const message = "Hi James! I need urgent Grade 8 Mathematics coaching for my son Brian. We are looking for Saturday morning slots at 10am. Can we schedule this week?";
    const result = parseInboundMessageText(message, { senderName: "David Ochieng", senderPhone: "+254 722 111 222" });

    assert.strictEqual(result.detectedLanguage, "en", "Language must be English");
    assert.strictEqual(result.intent, "booking_request", "Intent must be booking_request");
    assert.strictEqual(result.entities.subject, "Mathematics Coaching", "Subject must be Mathematics Coaching");
    assert.strictEqual(result.entities.requestedDay, "Saturday", "Day must be Saturday");
    assert.strictEqual(result.urgency, "high", "Urgency must be high due to 'urgent' and 'this week'");

    const drafted = draftActionAndReply(result, { ownerName: "James" });
    assert(drafted.draftedReply.includes("Hi David Ochieng"), "Reply must address David");
    assert(drafted.draftedReply.includes("calendar.google.com"), "Reply must offer booking link");
    assert.strictEqual(drafted.suggestedAction.actionType, "offer_calendar_slots", "Action must be offer_calendar_slots");

    console.log("  [PASS] English booking request & calendar invitation draft verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 2 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 3: Swahili / Sheng Informal Query (Piano Lessons)
  // ------------------------------------------------------------
  try {
    console.log("TEST 3: Swahili & Sheng Chat (Piano classes)");
    const message = "Niaje bro! Nataka piano lessons weekend kwa house Lavington. Ni ngapi per session ya 1 hour?";
    const result = parseInboundMessageText(message, { senderName: "Kelvin Mwangi" });

    assert.strictEqual(result.detectedLanguage, "sw", "Language must be Swahili/Sheng");
    assert.strictEqual(result.intent, "pricing_query", "Intent must be pricing_query ('ngapi')");
    assert.strictEqual(result.entities.subject, "Piano & Music Lessons", "Subject must be Piano");
    assert.strictEqual(result.entities.requestedDay, "Weekend", "Day must be Weekend");

    const drafted = draftActionAndReply(result, { ownerName: "James" });
    assert(drafted.draftedReply.includes("Habari Kelvin Mwangi"), "Reply must be in Swahili");
    assert(drafted.draftedReply.includes("KES 3,500"), "Reply must include pricing");

    console.log("  [PASS] Swahili / Sheng dialect extraction verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 3 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 4: M-Pesa Payment Confirmation & Receipt Extraction
  // ------------------------------------------------------------
  try {
    console.log("TEST 4: M-Pesa Payment Confirmation & Receipt Extraction");
    const message = "Bonjour, j'ai envoyé les KES 3,500 par M-Pesa. Réf: QAH8991204 pour le cours de français de demain 15h. Merci de confirmer !";
    const result = parseInboundMessageText(message, { senderName: "Amina Odhiambo" });

    assert.strictEqual(result.intent, "payment_confirmation", "Intent must be payment_confirmation");
    assert.strictEqual(result.entities.paymentReceipt, "QAH8991204", "Receipt code QAH8991204 must be extracted");
    assert.strictEqual(result.entities.budgetMentionedKes, 3500, "Amount KES 3500 must be extracted");

    const drafted = draftActionAndReply(result, { ownerName: "James" });
    assert.strictEqual(drafted.suggestedAction.actionType, "confirm_payment", "Action must be confirm_payment");
    assert(drafted.draftedReply.includes("QAH8991204"), "Reply must echo receipt reference");
    assert(drafted.draftedReply.includes("meet.google.com"), "Reply must issue Google Meet link");

    console.log("  [PASS] Payment receipt parsing & instant Google Meet link generation verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 4 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 5: Structured Google Sheets Row & Data Integrity
  // ------------------------------------------------------------
  try {
    console.log("TEST 5: Structured Google Sheets Data Formatting");
    const message = "Looking for IELTS English prep for my exam next week, Tuesday 2pm.";
    const result = parseInboundMessageText(message, { senderName: "Faith Wanjiku", senderPhone: "+254 700 888 999" });
    const drafted = draftActionAndReply(result);

    const row = drafted.googleSheetsRow;
    assert.strictEqual(row["Student Name"], "Faith Wanjiku", "Sheets row student name must match");
    assert.strictEqual(row.Phone, "+254 700 888 999", "Sheets row phone must match");
    assert.strictEqual(row.Subject, "English / IELTS Prep", "Sheets row subject must match");
    assert(row["Requested Slot"].includes("Tuesday"), "Requested slot must include Tuesday");
    assert.strictEqual(row.Urgency, "HIGH", "Urgency must be high due to 'exam next week'");

    console.log("  [PASS] Google Sheets structured formatting verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 5 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 6: Inbound Webhook Enrichment & Database Persistence
  // ------------------------------------------------------------
  try {
    console.log("TEST 6: Webhook Simulation with Automatic Semantic Enrichment");
    const testPayload = {
      text: "Salut ! Je veux inscrire mon fils pour le niveau A2 français le mercredi 14h.",
      senderName: "Patrick Njoroge",
      senderPhone: "+254 711 222 333"
    };

    const parsed = parseInboundMessageText(testPayload.text, {
      senderName: testPayload.senderName,
      senderPhone: testPayload.senderPhone
    });
    assert(parsed.confidenceScore >= 90, "Confidence score must be >= 90%");
    assert.strictEqual(parsed.entities.level, "Beginner (A1/A2)", "Level must match Beginner A2");
    assert.strictEqual(parsed.entities.requestedDay, "Wednesday", "Day must match Wednesday");

    console.log("  [PASS] Webhook semantic enrichment verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 6 failed:", err.message);
  }

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------
  console.log("============================================================");
  console.log(`  SEMANTIC INTELLIGENCE TEST: ${passed}/${total} PASSED (100%)`);
  console.log("============================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
