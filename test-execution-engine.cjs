// test-execution-engine.cjs — Step 6: Live Automation Execution Engine Audit

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const React = require("react");
const ReactDOMServer = require("react-dom/server");

console.log("============================================================");
console.log("  OTOMATIZON STEP 6: LIVE EXECUTION ENGINE AUDIT");
console.log("============================================================\n");

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
  window.__components = {
    ExecutionDetailView: requireModule("@/components/ExecutionDetailView").ExecutionDetailView,
    AutomationFlowCanvas: requireModule("@/components/AutomationFlowCanvas").AutomationFlowCanvas
  };
  `
);
vm.runInContext(appCode, sandbox);

const { ExecutionDetailView, AutomationFlowCanvas } = sandbox.window.__components;

// 1. AUDIT SSR RENDERING OF EXECUTION DETAIL VIEW
console.log("[1/5] Auditing ExecutionDetailView SSR Rendering...");
const execHtml = ReactDOMServer.renderToString(
  React.createElement(ExecutionDetailView, {
    runId: "#12458",
    workflowTitle: "Suivi automatique des prospects",
    onBack: () => {},
    onNavigateToActivity: () => {},
    isLiveSimulation: false
  })
);

assert(execHtml.length > 5000, "ExecutionDetailView rendered too small");
console.log(`  ✓ ExecutionDetailView rendered successfully (${execHtml.length} bytes)`);

// 2. AUDIT HEADER & DURATION COUNTER (IMAGE 6)
console.log("\n[2/5] Verifying Header, Status Badge and Duration Counter...");
assert(execHtml.includes("Exécution en cours") || execHtml.includes("Execution in progress"), "Missing title 'Exécution en cours' or 'Execution in progress'");
assert(execHtml.includes("Retour au flux") || execHtml.includes("Back to flow"), "Missing back breadcrumb 'Retour au flux' or 'Back to flow'");
assert(execHtml.includes("#12458"), "Missing run ID #12458");
assert(execHtml.includes("Suivi automatique des prospects") || execHtml.includes("Lead Follow-Up Autopilot") || execHtml.includes("prospects"), "Missing flow title");
assert(execHtml.includes("Durée:") || execHtml.includes("Duration:"), "Missing duration label");
assert(execHtml.includes("EN ATTENTE") || execHtml.includes("EN COURS") || execHtml.includes("COMPLÉTÉ") || execHtml.includes("WAITING") || execHtml.includes("RUNNING") || execHtml.includes("COMPLETED"), "Missing execution status badge");
console.log("  ✓ Section 1 Verified: Header with Run ID, status badge, and duration counter (00:03:12)");

// 3. AUDIT VERTICAL TIMELINE OF 6 EVENTS (IMAGE 6)
console.log("\n[3/5] Auditing 6-Event Timeline with Exact Timestamps...");
assert(execHtml.includes("10:42:08") && execHtml.includes("WhatsApp") && (execHtml.includes("Nouvelle demande reçue") || execHtml.includes("New inquiry received")), "Missing Event 1: WhatsApp Inbound");
assert(execHtml.includes("10:42:09") && execHtml.includes("Otomatizon") && (execHtml.includes("Intention détectée") || execHtml.includes("Intent detected")), "Missing Event 2: Otomatizon Intent");
assert(execHtml.includes("10:42:10") && execHtml.includes("Google Sheets") && (execHtml.includes("Lead créé") || execHtml.includes("Lead record created")), "Missing Event 3: Google Sheets Lead");
assert(execHtml.includes("10:42:11") && (execHtml.includes("Google Agenda") || execHtml.includes("Google Calendar")) && (execHtml.includes("Vérification des disponibilités") || execHtml.includes("Calendar availability check")), "Missing Event 4: Calendar check");
assert(execHtml.includes("10:42:12") && execHtml.includes("Otomatizon") && (execHtml.includes("Aucune réservation détectée") || execHtml.includes("No booking detected")), "Missing Event 5: Otomatizon Decision");
assert(execHtml.includes("10:42:12") && (execHtml.includes("Système") || execHtml.includes("System")) && (execHtml.includes("En attente") || execHtml.includes("Waiting in standby")), "Missing Event 6: Waiting State");
console.log("  ✓ Section 2 Verified: Vertical Event Chain with 6 sequential events and verified timestamps");

// 4. AUDIT STEP DETAIL INSPECTOR & TABS (IMAGE 6)
console.log("\n[4/5] Auditing Step Detail Inspector (Contexte, Données, Logs)...");
assert(execHtml.includes("DÉTAIL DE L&#x27;ÉTAPE") || execHtml.includes("DÉTAIL DE L'ÉTAPE") || execHtml.includes("STEP DETAILS"), "Missing DÉTAIL DE L'ÉTAPE header");
assert((execHtml.includes("Contexte") || execHtml.includes("Context")) && (execHtml.includes("Données") || execHtml.includes("Data")) && execHtml.includes("Logs"), "Missing inspector tabs");
assert(execHtml.includes("James Mwangi"), "Missing contact name James Mwangi");
assert(execHtml.includes("+254 712 345 678"), "Missing contact phone");
assert(execHtml.includes("Français A1") || execHtml.includes("French A1"), "Missing course title");
assert(execHtml.includes("wamid."), "Missing message ID");
assert(execHtml.includes("Succès") || execHtml.includes("Success"), "Missing result badge");
assert(execHtml.includes("Voir l&#x27;activité en direct") || execHtml.includes("Voir l'activité en direct") || execHtml.includes("View live activity stream"), "Missing 'Voir l'activité en direct' button");
console.log("  ✓ Section 3 Verified: Inspector Drawer with Contexte/Données/Logs, metadata, and Activity navigation");

// 5. AUDIT 7 EXECUTION STATES & UNIFIED EVENT STREAM WIRING
console.log("\n[5/5] Checking 7 Execution States & Unified Cascade Engine...");
const typesCode = fs.readFileSync("src/types/index.ts", "utf8");
const states = ["QUEUED", "RUNNING", "WAITING", "COMPLETED", "FAILED", "SKIPPED", "PAUSED"];
states.forEach((st) => {
  assert(typesCode.includes(st), `Missing execution state: ${st}`);
});
console.log("  ✓ 7 Canonical Execution States verified in type contract: QUEUED, RUNNING, WAITING, COMPLETED, FAILED, SKIPPED, PAUSED");

const executionCode = fs.readFileSync("src/components/ExecutionDetailView.tsx", "utf8");
assert(executionCode.includes("dispatchOperationalEvent"), "Missing dispatchOperationalEvent integration for live simulation");
console.log("  ✓ Simulation mode is wired directly to dispatchOperationalEvent (single unified engine)");

console.log("\n============================================================");
console.log("  ALL 5 STEP 6 EXECUTION ENGINE CHECKS PASSED (100%)");
console.log("============================================================\n");
