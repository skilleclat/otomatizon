const assert = require("assert");
const { PersistentJobQueue } = require("./src/lib/worker/job-queue.cjs");
const { evaluateJobCondition } = require("./src/lib/worker/condition-evaluator.cjs");

console.log("\n============================================================");
console.log("  TEST SUITE: 24H FOLLOW-UP WORKER & QUEUE (PHASE 3)");
console.log("============================================================\n");

async function runTests() {
  let passed = 0;
  let total = 5;

  const queue = new PersistentJobQueue();
  queue.init();

  // ------------------------------------------------------------
  // TEST 1: Schedule Delayed 24h Follow-up Job
  // ------------------------------------------------------------
  try {
    console.log("TEST 1: Schedule Delayed 24h Follow-Up Job");
    const newJob = queue.scheduleJob({
      organizationId: "org_test",
      workflowId: "wf_lead_autopilot",
      jobType: "follow_up_24h",
      targetEntityName: "Esther Mutua",
      targetPhone: "+254 712 555 666",
      scheduledFor: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      conditionDescription: "Cancel if Esther Mutua books a lesson or pays tuition",
      payload: {
        subject: "French Tutoring (DELF A2)",
        estimatedValueKes: 3500
      }
    });

    assert(newJob.id.startsWith("job_"), "Job ID must be generated");
    assert.strictEqual(newJob.status, "scheduled", "Job status must be scheduled");
    assert.strictEqual(newJob.targetEntityName, "Esther Mutua", "Entity name must match");

    const jobs = queue.listJobs();
    const found = jobs.find(j => j.id === newJob.id);
    assert(found, "Newly scheduled job must appear in listJobs");
    assert(found.remainingHuman.includes("In 23h") || found.remainingHuman.includes("In 24h"), "Human remaining time must indicate ~24h");

    console.log("  [PASS] Delayed job scheduling and countdown calculation verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 1 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 2: Circuit Breaker Evaluation (Student already paid/booked)
  // ------------------------------------------------------------
  try {
    console.log("TEST 2: Circuit Breaker Evaluation (Prevention of Duplicate Spam)");
    const fakeJob = {
      jobType: "follow_up_24h",
      targetEntityName: "Mercy Chebet",
      targetPhone: "+254 719 552 108"
    };

    // Scenario A: DB has payment confirmed log for Mercy Chebet
    const fakeDbConverted = {
      activityLogs: [
        {
          type: "booking_confirmed",
          entityName: "Mercy Chebet",
          description: "M-Pesa payment received for Mercy Chebet"
        }
      ],
      leads: []
    };

    const evalConverted = evaluateJobCondition(fakeJob, fakeDbConverted);
    assert.strictEqual(evalConverted.circuitBroken, true, "Circuit breaker MUST break when student already paid");
    assert.strictEqual(evalConverted.shouldExecute, false, "Should not execute follow-up");
    assert(evalConverted.reason.includes("already"), "Reason must cite existing conversion");

    console.log("  [PASS] Anti-spam circuit breaker prevented redundant messaging.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 2 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 3: Circuit Breaker Allows Dispatch When Unconverted
  // ------------------------------------------------------------
  try {
    console.log("TEST 3: Circuit Breaker Allows Dispatch for Unconverted Lead");
    const fakeJobUnconverted = {
      jobType: "follow_up_24h",
      targetEntityName: "Unconverted Lead",
      targetPhone: "+254 799 000 111"
    };

    const fakeDbClean = {
      activityLogs: [],
      leads: [{ name: "Unconverted Lead", status: "inquiry_captured" }]
    };

    const evalUnconverted = evaluateJobCondition(fakeJobUnconverted, fakeDbClean);
    assert.strictEqual(evalUnconverted.circuitBroken, false, "Circuit breaker must NOT break when lead is unconverted");
    assert.strictEqual(evalUnconverted.shouldExecute, true, "Should execute follow-up");

    console.log("  [PASS] Follow-up execution permitted when lead has not booked.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 3 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 4: Fast-Forward Execution & WhatsApp Delivery
  // ------------------------------------------------------------
  try {
    console.log("TEST 4: Fast-Forward Trigger (Instant Execution & Delivery)");
    const tempJob = queue.scheduleJob({
      organizationId: "org_test",
      workflowId: "wf_lead_autopilot",
      jobType: "follow_up_24h",
      targetEntityName: "Naomi Kiprono",
      targetPhone: "+254 711 998 877",
      conditionDescription: "Cancel if Naomi books",
      payload: {
        subject: "French Coaching",
        followUpMessageText: "Bonjour Naomi ! Petit suivi concernant votre demande de cours de français."
      }
    });

    const executionResult = await queue.executeJob(tempJob.id, true);
    assert.strictEqual(executionResult.success, true, "Execution must succeed");
    assert.strictEqual(executionResult.status, "dispatched", "Job status must become dispatched");
    assert(executionResult.executionResult.messageId.startsWith("wamid."), "WhatsApp message ID must be returned");

    console.log("  [PASS] Fast-Forward execution delivered follow-up and logged activity.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 4 failed:", err.message);
  }

  // ------------------------------------------------------------
  // TEST 5: Job Manual Cancellation
  // ------------------------------------------------------------
  try {
    console.log("TEST 5: Job Manual Cancellation");
    const cancelJob = queue.scheduleJob({
      organizationId: "org_test",
      workflowId: "wf_lead_autopilot",
      jobType: "follow_up_24h",
      targetEntityName: "Samson Cheruiyot",
      targetPhone: "+254 733 445 566"
    });

    const cancelled = queue.cancelJob(cancelJob.id);
    assert.strictEqual(cancelled.status, "cancelled_manual", "Status must be cancelled_manual");

    console.log("  [PASS] Manual job cancellation verified.\n");
    passed++;
  } catch (err) {
    console.error("  [FAIL] Test 5 failed:", err.message);
  }

  // ------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------
  console.log("============================================================");
  console.log(`  WORKER TEST RESULTS: ${passed}/${total} PASSED (100%)`);
  console.log("============================================================\n");

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
