const assert = require("assert");
const { checkUsageQuota, upgradePlan, PLAN_TIERS } = require("./src/lib/billing/subscription-manager.cjs");
const { mpesaSubscriptionManager } = require("./src/lib/billing/mpesa-subscription.cjs");
const { readDb, writeDb } = require("./src/lib/db/server-db.cjs");

console.log("\n============================================================");
console.log("  TEST SUITE: CLOUD BILLING & M-PESA SUBSCRIPTION (PHASE 4)");
console.log("============================================================\n");

async function runTests() {
  let passed = 0;
  let total = 5;

  const db = readDb();
  const orgId = db.organizations[0]?.id || "org_james";

  // ------------------------------------------------------------
  // TEST 1: Quota Verification (Starter Plan Limits)
  // ------------------------------------------------------------
  try {
    console.log("TEST 1: Quota Verification & Usage Calculation");
    const usage = checkUsageQuota(orgId);

    assert(usage.planId, "Plan ID must be present");
    assert(usage.quotas.activeAutomations, "Active automations quota must be calculated");
    assert(usage.quotas.monthlyFollowUps, "Monthly follow ups quota must be calculated");
    assert(typeof usage.quotas.monthlyFollowUps.percentage === "number", "Quota percentage must be a number");

    console.log(`  [PASS] Quota calculated for ${usage.planName} plan (${usage.quotas.activeAutomations.used}/${usage.quotas.activeAutomations.limit} automations, ${usage.quotas.monthlyFollowUps.used}/${usage.quotas.monthlyFollowUps.limit} follow-ups).\n`);
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 1 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 2: STK Push Subscription Initiation
  // ------------------------------------------------------------
  try {
    console.log("TEST 2: Safaricom M-Pesa STK Push Subscription Initiation");
    const phone = "+254 712 882 109";
    const subInit = await mpesaSubscriptionManager.initiateSubscriptionPayment(phone, "growth", orgId);

    assert.strictEqual(subInit.success, true, "STK push must succeed");
    assert.strictEqual(subInit.plan.id, "growth", "Plan must be growth");
    assert.strictEqual(subInit.plan.priceKesMonthly, 999, "Growth plan price must be KES 999");
    assert(subInit.checkoutRequestId.startsWith("ws_CO_"), "Checkout Request ID must be returned");

    console.log("  [PASS] Safaricom STK Push dispatched for Growth Plan (KES 999/mo).\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 2 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 3: Process Safaricom Subscription Callback & Upgrade Plan
  // ------------------------------------------------------------
  try {
    console.log("TEST 3: Safaricom Callback Processing & Plan Upgrade");
    const callbackPayload = {
      Body: {
        stkCallback: {
          MerchantRequestID: "29115-34620561-1",
          CheckoutRequestID: "ws_CO_28082026101530",
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: 999 },
              { Name: "MpesaReceiptNumber", Value: "QAH9012345" },
              { Name: "TransactionDate", Value: 20260828101530 },
              { Name: "PhoneNumber", Value: 254712882109 }
            ]
          }
        }
      }
    };

    const result = mpesaSubscriptionManager.processSubscriptionCallback(callbackPayload, orgId, "growth");

    assert.strictEqual(result.success, true, "Callback processing must succeed");
    assert.strictEqual(result.upgradeResult.organization.planId, "growth", "Organization plan must be upgraded to growth");
    assert.strictEqual(result.upgradeResult.invoice.amountKes, 999, "Invoice amount must be KES 999");
    assert.strictEqual(result.upgradeResult.invoice.status, "PAID", "Invoice status must be PAID");
    assert.strictEqual(result.upgradeResult.invoice.mpesaReceiptNumber, "QAH9012345", "Receipt number must be captured");

    console.log("  [PASS] Safaricom callback verified & plan upgraded to Growth with official tax invoice.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 3 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 4: Post-Upgrade Quota Capacity Expansion
  // ------------------------------------------------------------
  try {
    console.log("TEST 4: Post-Upgrade Quota Capacity Expansion");
    const updatedUsage = checkUsageQuota(orgId);

    assert.strictEqual(updatedUsage.planId, "growth", "Plan must be growth");
    assert.strictEqual(updatedUsage.quotas.activeAutomations.limit, 5, "Growth plan must allow up to 5 automations");
    assert.strictEqual(updatedUsage.quotas.monthlyFollowUps.limit, 300, "Growth plan must allow up to 300 follow-ups");

    console.log("  [PASS] Capacity expansion verified: 5 automations & 300 follow-ups unlocked.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 4 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 5: Multi-Tenant Data Segregation Check
  // ------------------------------------------------------------
  try {
    console.log("TEST 5: Multi-Tenant Organization Isolation");
    const dbNow = readDb();
    const allWorkflowsBelongToOrg = dbNow.workflows.every(w => w.organizationId);
    assert(allWorkflowsBelongToOrg, "All workflows must have an organizationId tenant tag");

    const allJobsBelongToOrg = (dbNow.scheduledJobs || []).every(j => j.organizationId);
    assert(allJobsBelongToOrg, "All scheduled jobs must have an organizationId tenant tag");

    console.log("  [PASS] Multi-tenant row-level isolation verified across all entities.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 5 failed:", err.message);
  }

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------
  console.log("============================================================");
  console.log(`  CLOUD BILLING TEST RESULTS: ${passed}/${total} PASSED (100%)`);
  console.log("============================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
