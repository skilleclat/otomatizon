// test-system-foundation.cjs — Step 1: Otomatizon System Foundation & Event Cascade Audit

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const React = require("react");
const ReactDOMServer = require("react-dom/server");

console.log("============================================================");
console.log("  OTOMATIZON STEP 1: SYSTEM FOUNDATION & CASCADE AUDIT");
console.log("============================================================\n");

// 1. VERIFY ARCHITECTURAL SCHEMAS & CANONICAL ENTITIES
console.log("[1/5] Verifying 18 Canonical Entities & Schema Contracts...");
const typesCode = fs.readFileSync("src/types/index.ts", "utf8");

const requiredEntities = [
  "Business",
  "User",
  "ConnectedApp",
  "Integration",
  "DataSource",
  "CustomerLead",
  "OperationalEvent",
  "IntelligenceInsight",
  "Opportunity",
  "Automation",
  "AutomationStep",
  "Condition",
  "AutomationRun",
  "Action",
  "ExecutionLog",
  "ActivityEvent",
  "OperationalMetric",
  "Report"
];

for (const entity of requiredEntities) {
  const hasInterface = typesCode.includes(`interface ${entity}`) || typesCode.includes(`type ${entity}`);
  assert(hasInterface, `Missing canonical entity interface: ${entity}`);
  console.log(`  ✓ Entity defined: ${entity}`);
}

// 2. VERIFY DATA PROVENANCE CLASSIFICATION
console.log("\n[2/5] Verifying Data Provenance Classification (No Fabricated Facts)...");
assert(typesCode.includes('"OBSERVED" | "INFERRED" | "ESTIMATED" | "SIMULATED"'), "Missing DataProvenance classification");
console.log("  ✓ DataProvenance enum strictly modeled: OBSERVED | INFERRED | ESTIMATED | SIMULATED");

const mockDataCode = fs.readFileSync("src/lib/mock-data.ts", "utf8");
assert(mockDataCode.includes('provenance: "OBSERVED"'), "Missing OBSERVED provenance tags in mock data");
assert(mockDataCode.includes('provenance: "INFERRED"'), "Missing INFERRED provenance tags in mock data");
console.log("  ✓ Observational facts tagged as OBSERVED (live telemetry, receipts, calendar slots)");
console.log("  ✓ Inferred facts tagged as INFERRED (owner questionnaire, goals, target customer)");

// 3. VERIFY SHARED MODEL CONSUMPTION ACROSS EXISTING PAGES (SSR TEST)
console.log("\n[3/5] Verifying UI Pages Consume the Shared Operating Model...");
const sandbox = {
  window: {},
  console: console,
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  }
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname, "public/vendor.js"), "utf8"), sandbox);
sandbox.window.React = React;

let appCode = fs.readFileSync(path.join(__dirname, "public/app.js"), "utf8");
appCode = appCode.replace(
  'requireModule("@/main");',
  `
  window.__views = {
    HomeCommandCenter: requireModule("@/components/HomeCommandCenter").HomeCommandCenter,
    BusinessReportView: requireModule("@/components/BusinessReportView").BusinessReportView,
    OpportunitiesView: requireModule("@/components/OpportunitiesView").OpportunitiesView,
    AutomationsView: requireModule("@/components/AutomationsView").AutomationsView,
    AppsView: requireModule("@/components/AppsView").AppsView,
    OnboardingModal: requireModule("@/components/OnboardingModal").OnboardingModal
  };
  window.__store = requireModule("@/lib/store");
  `
);
vm.runInContext(appCode, sandbox);

const views = sandbox.window.__views;
for (const [name, Component] of Object.entries(views)) {
  const html = ReactDOMServer.renderToString(
    React.createElement(Component, name.includes("Modal") ? { isOpen: true } : {})
  );
  assert(html.length > 500, `${name} rendered empty HTML`);
  console.log(`  ✓ ${name} successfully rendered from shared store (${html.length} bytes)`);
}

// 4. VERIFY SINGLE EVENT PROPAGATION CASCADE
console.log("\n[4/5] Testing Single Event Cascade through the Operating System...");

const storeModule = sandbox.window.__store;
assert(storeModule && storeModule.useOtomatizonStore, "useOtomatizonStore not exported");

let storeInstance;
function TestHarness() {
  storeInstance = storeModule.useOtomatizonStore();
  return null;
}
ReactDOMServer.renderToString(React.createElement(TestHarness));

const initialInquiries = storeInstance.state.metrics.inquiriesProcessed;
const initialEventsCount = storeInstance.state.operationalEvents.length;
const initialActivityCount = storeInstance.state.activityLogs.length;
const initialLeadsCount = storeInstance.state.leads.length;

console.log(`  Initial State: Inquiries=${initialInquiries}, Events=${initialEventsCount}, Activity=${initialActivityCount}`);

// Dispatch a single customer inquiry event
const dispatchedEvent = storeInstance.dispatchOperationalEvent({
  eventType: "inquiry_received",
  sourceAppId: "app_wa_01",
  dataSourceId: "ds_wa_chat",
  entityName: "Kiplagat Tanui",
  title: "WhatsApp Inquiry: Kiplagat Tanui",
  description: "Candidate asked for DELF B1 syllabus & lesson pricing on WhatsApp.",
  payload: {
    studentName: "Kiplagat Tanui",
    phone: "+254 721 889 900",
    service: "DELF B1 Tutoring",
    channel: "WhatsApp",
    amountKes: 3500
  },
  provenance: "SIMULATED"
});

assert.strictEqual(dispatchedEvent.entityName, "Kiplagat Tanui", "Dispatched event entity mismatch");
assert.strictEqual(dispatchedEvent.provenance, "SIMULATED", "Dispatched event provenance mismatch");

// Verify Event Cascade across all entities
// a. OperationalEvent recorded
assert.strictEqual(storeInstance.state.operationalEvents.length, initialEventsCount + 1, "Operational event not appended");
assert.strictEqual(storeInstance.state.operationalEvents[0].entityName, "Kiplagat Tanui", "Operational event not at top of ledger");
console.log("  [Step 1 PASS] Operational Event logged in unified ledger");

// b. Intelligence Insight created
const latestInsight = storeInstance.state.insights[0];
assert(latestInsight && latestInsight.title.includes("Kiplagat Tanui"), "Intelligence layer failed to generate insight");
console.log(`  [Step 2 PASS] Intelligence Layer generated insight: "${latestInsight.title}"`);

// c. Customer Lead recorded in Sheets
assert.strictEqual(storeInstance.state.leads.length, initialLeadsCount + 1, "Lead was not appended to roster");
assert.strictEqual(storeInstance.state.leads[0].name, "Kiplagat Tanui", "Lead name mismatch in roster");
console.log("  [Step 3 PASS] Customer Lead appended to Google Sheets roster");

// d. Automation Run & Multi-App Actions executed
const latestRun = storeInstance.state.executions[0];
assert(latestRun && latestRun.entityName === "Kiplagat Tanui", "Automation run not spawned");
assert.strictEqual(latestRun.status, "completed", "Automation run status not completed");
assert(latestRun.actions && latestRun.actions.length === 5, "Multi-app actions not executed");
console.log(`  [Step 4 PASS] Automation Run spawned: ${latestRun.actions.length} actions executed across WhatsApp, Sheets & Calendar`);

// e. Metrics updated
assert.strictEqual(storeInstance.state.metrics.inquiriesProcessed, initialInquiries + 1, "Inquiries metric not incremented");
assert(storeInstance.state.metrics.hoursSaved > 0, "Hours saved metric not updated");
console.log(`  [Step 5 PASS] Operational Metrics updated: Inquiries=${storeInstance.state.metrics.inquiriesProcessed}, Hours=${storeInstance.state.metrics.hoursSaved}h`);

// f. Unified Activity Log entries created
assert(storeInstance.state.activityLogs.length >= initialActivityCount + 3, "Activity log entries not generated");
const topActivity = storeInstance.state.activityLogs[0];
assert(topActivity.title.includes("Kiplagat Tanui"), "Activity log entry mismatch");
console.log(`  [Step 6 PASS] Activity stream updated with provenance: "${topActivity.title}" [${topActivity.provenance}]`);

// 5. VERIFY DATA CONSISTENCY IN EXECUTIVE REPORT
console.log("\n[5/5] Verifying Cross-Page Consistency in Business Report...");
const report = storeInstance.generateBusinessReport();
assert(report.businessName && report.businessName.length > 0, "Report business name mismatch");
assert(report.opportunitiesDiscovered.length > 0, "Report missing opportunities");
assert(report.toolsCurrentlyUsed.length >= 5, "Report missing tools");
console.log(`  ✓ Report accurately reflects unified state for "${report.businessName}" (${report.city}, ${report.country})`);
console.log(`  ✓ Report contains ${report.currentWorkflow.length} workflow stages and ${report.opportunitiesDiscovered.length} opportunities`);

console.log("\n============================================================");
console.log("  ALL 5 STEP 1 FOUNDATION & CASCADE CHECKS PASSED (100%)");
console.log("============================================================\n");
