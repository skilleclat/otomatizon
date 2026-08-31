const { 
  understandBusiness, 
  detectOpportunities, 
  interpretNaturalLanguage,
  scoreOpportunity,
  calculateBusinessImpact
} = require("./src/lib/decision-engine/engine.cjs");

console.log("=== RUNNING DECISION ENGINE COMPREHENSIVE TEST ===");

// Sample Business Context (Extensible, not hardcoded)
const sampleContext = {
  id: "ctx_james",
  organizationId: "org_james_nairobi",
  businessType: "Private French Tutor & Language Coach",
  businessName: "James Tutoring & Coaching",
  businessSize: "solo",
  location: "Kilimani, Nairobi",
  city: "Nairobi",
  country: "Kenya",
  services: ["Private DELF Coaching (60 min)", "Executive Business French (90 min)"],
  customerAcquisitionChannels: ["whatsapp", "google_business", "referrals"],
  communicationChannels: ["whatsapp", "gmail"],
  schedulingProcess: "manual_chat",
  paymentProcess: "mpesa_manual",
  retentionProcess: "ad_hoc",
  toolsCurrentlyUsed: ["whatsapp_business", "google_calendar", "google_sheets", "gmail", "mpesa_safaricom"],
  manualTasksReported: ["Following up leads", "Chasing M-Pesa payments", "Transcribing attendance into Sheets"],
  businessGoals: ["Recover lost inquiries", "Eliminate last-minute unpaid cancellations"],
  averageDealSizeKes: 3500,
  monthlyInquiriesEstimate: 30
};

// TEST 1: UNDERSTAND
console.log("\n[TEST 1] Understand Business Context...");
const understanding = understandBusiness(sampleContext);
console.log("✓ Understanding Summary:", understanding.summary);
console.log("✓ Primary Bottleneck:", understanding.primaryBottleneck);
console.log("✓ Readiness Score:", understanding.automationReadinessScore);
console.log("✓ Inferred Weekly Hours Lost:", understanding.inferredWeeklyHoursLost);
if (!understanding.primaryBottleneck) throw new Error("Understanding failed");

// TEST 2: DETECT & PRIORITIZE & SCORE
console.log("\n[TEST 2] Detect & Prioritize Opportunities...");
const opps = detectOpportunities(sampleContext);
console.log(`✓ Detected ${opps.length} ranked opportunities:`);
opps.forEach((o, i) => {
  console.log(`  #${i + 1} [${o.impactLevel}] [${o.category}] ${o.title}`);
  console.log(`      Score: ${o.impactScore}/100 | Conf: ${o.confidenceLevel} | Time Saved: ~${o.estimatedTimeSavedHoursPerWeek}h/wk`);
  console.log(`      Revenue Impact: ${o.estimatedRevenueImpactKes ? 'KES ' + o.estimatedRevenueImpactKes.toLocaleString() : 'Not enough data yet'}`);
  console.log(`      Revenue Note: ${o.revenueExplanation}`);
});
if (opps.length < 3) throw new Error("Expected at least 3 detected opportunities");

// TEST 3: GOLDEN TEST CASE
console.log("\n[TEST 3] Golden Test Case (Tutor with unpaid students)...");
const goldenInput = "Students find me through WhatsApp. I send them my course information, we agree on a time, then I send my payment details. Sometimes they forget to pay.";
const goldenResult = interpretNaturalLanguage(goldenInput, sampleContext);
console.log("✓ Category:", goldenResult.category);
console.log("✓ Confidence:", goldenResult.confidence);
console.log("✓ Understood Text:", goldenResult.understoodText);
console.log("✓ Plan Title:", goldenResult.suggestedPlan.title);
console.log("✓ User-Facing Narrative:", goldenResult.suggestedPlan.userFacingNarrative);

if (goldenResult.category !== "payment_followup") {
  throw new Error(`Golden test case failed: expected 'payment_followup' but got '${goldenResult.category}'`);
}
if (goldenResult.needsClarification) {
  throw new Error("Golden test case should not need clarification");
}

// TEST 4: AMBIGUITY HANDLING
console.log("\n[TEST 4] Ambiguity Handling...");
const vagueInput = "Automate it";
const vagueResult = interpretNaturalLanguage(vagueInput, sampleContext);
console.log("✓ Needs clarification:", vagueResult.needsClarification);
console.log("✓ Question:", vagueResult.clarificationQuestion);

if (!vagueResult.needsClarification || !vagueResult.clarificationQuestion) {
  throw new Error("Ambiguity test failed: expected clarification question");
}

// TEST 5: MEASURED VS ESTIMATED IMPACT
console.log("\n[TEST 5] Measured vs Estimated Impact...");
const impact = calculateBusinessImpact(15, 3500);
console.log("✓ Measured Time Saved:", impact.measured.timeSavedHoursTotal, "hours");
console.log("✓ Measured Payments Collected: KES", impact.measured.successfulPaymentsCollectedKes.toLocaleString());
console.log("✓ Estimated Weekly Hours:", impact.estimatedWeeklyHours, "hours");
console.log("✓ Estimated Weekly Revenue: KES", impact.estimatedWeeklyRevenueKes.toLocaleString());

console.log("\n=== ALL DECISION ENGINE TESTS PASSED! ===");
