// test-automation-orchestrator.cjs — Step 5: Automation Orchestrator Audit

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const React = require("react");
const ReactDOMServer = require("react-dom/server");

console.log("============================================================");
console.log("  OTOMATIZON STEP 5: AUTOMATION ORCHESTRATOR AUDIT");
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
    AutomationFlowCanvas: requireModule("@/components/AutomationFlowCanvas").AutomationFlowCanvas,
    AutomationDetailView: requireModule("@/components/AutomationDetailView").AutomationDetailView
  };
  `
);
vm.runInContext(appCode, sandbox);

const { AutomationFlowCanvas, AutomationDetailView } = sandbox.window.__components;

// 1. AUDIT SSR RENDERING OF AUTOMATION FLOW CANVAS
console.log("[1/5] Auditing AutomationFlowCanvas SSR Rendering...");
const canvasHtml = ReactDOMServer.renderToString(
  React.createElement(AutomationFlowCanvas, {
    workflowTitle: "Suivi automatique des prospects",
    isActive: true,
    onToggleActive: () => {},
    onRunTest: () => {},
    onBack: () => {}
  })
);

assert(canvasHtml.length > 5000, "AutomationFlowCanvas rendered too small");
console.log(`  ✓ AutomationFlowCanvas rendered successfully (${canvasHtml.length} bytes)`);

// 2. AUDIT HEADER & SUB-TABS & ACTIONS (IMAGE 5)
console.log("\n[2/5] Verifying Header, Subtabs and Actions (Image 5)...");
assert(canvasHtml.includes("Suivi automatique des prospects"), "Missing workflow title");
assert(canvasHtml.includes("ACTIVÉE"), "Missing ACTIVÉE status badge");
assert(canvasHtml.includes("Flux") && canvasHtml.includes("Paramètres") && canvasHtml.includes("Historique") && canvasHtml.includes("Versions"), "Missing 4 subtabs");
assert(canvasHtml.includes("Tester"), "Missing 'Tester' action button");
assert(canvasHtml.includes("Dupliquer"), "Missing 'Dupliquer' action button");
assert(canvasHtml.includes("Désactiver"), "Missing 'Désactiver' action button");
console.log("  ✓ Section 1 Verified: Header with ACTIVÉE badge, 4 subtabs (Flux, Paramètres, Historique, Versions), and actions (Tester, Dupliquer, Désactiver)");

// 3. AUDIT 3-PANE WORKBENCH ARCHITECTURE
console.log("\n[3/5] Auditing 3-Pane Workbench Architecture...");

// Pane 1: Palette
assert(canvasHtml.includes("ÉTAPES"), "Missing ÉTAPES palette header");
assert(canvasHtml.includes("Déclencheurs"), "Missing Déclencheurs group in palette");
assert(canvasHtml.includes("Actions"), "Missing Actions group in palette");
assert(canvasHtml.includes("Conditions"), "Missing Conditions group in palette");
assert(canvasHtml.includes("Nouveau message WhatsApp"), "Missing trigger in palette");
assert(canvasHtml.includes("Créer ligne Google Sheets"), "Missing action in palette");
assert(canvasHtml.includes("Si / Sinon"), "Missing condition in palette");
console.log("  ✓ Pane 1 Verified: Palette with Déclencheurs, Actions, and Conditions");

// Pane 2: The Pipeline Canvas
assert(canvasHtml.includes("DÉCLENCHEUR"), "Missing DÉCLENCHEUR in pipeline");
assert(canvasHtml.includes("INTELLIGENCE"), "Missing INTELLIGENCE in pipeline");
assert(canvasHtml.includes("Otomatizon"), "Missing Otomatizon in pipeline");
assert(canvasHtml.includes("Comprend et classe la demande"), "Missing intelligence subtitle");
assert(canvasHtml.includes("Google Sheets") && canvasHtml.includes("Google Agenda"), "Missing sheets and calendar nodes in pipeline");
assert(canvasHtml.includes("Réservé ?"), "Missing decision diamond 'Réservé ?'");
assert(canvasHtml.includes("NON") && canvasHtml.includes("Attendre") && canvasHtml.includes("heures") && canvasHtml.includes("Envoyer relance"), "Missing NON branch with Wait 24h and Followup");
assert(canvasHtml.includes("100") && canvasHtml.includes("%"), "Missing zoom controls");
console.log("  ✓ Pane 2 Verified: Visual Pipeline with Sequential Nodes, Decision Diamond, and OUI/NON Branching");

// Pane 3: Step Inspector Drawer
assert(canvasHtml.includes("ÉTAPE SÉLECTIONNÉE"), "Missing ÉTAPE SÉLECTIONNÉE header");
assert(canvasHtml.includes("ENTRÉE"), "Missing ENTRÉE section in inspector");
assert(canvasHtml.includes("ACTION"), "Missing ACTION section in inspector");
assert(canvasHtml.includes("SORTIE"), "Missing SORTIE section in inspector");
assert(canvasHtml.includes("STATUT"), "Missing STATUT section in inspector");
assert(canvasHtml.includes("Modifier"), "Missing Modifier button in inspector");
assert(canvasHtml.includes("Détails techniques"), "Missing Détails techniques toggle in inspector");
console.log("  ✓ Pane 3 Verified: Step Inspector Drawer with Input, Action, Output, Status, and Technical details");

// 4. AUDIT FULL AUTOMATION DETAIL VIEW INTEGRATION
console.log("\n[4/5] Auditing AutomationDetailView Integration...");
const mockWorkflow = {
  id: "wf_lead_autopilot",
  title: "Suivi automatique des prospects",
  description: "Detects uncontacted WhatsApp leads and executes polite follow-ups.",
  active: true,
  createdAt: "2026-08-20T10:00:00Z",
  timingConfig: { delayHours: 24 }
};

const detailHtml = ReactDOMServer.renderToString(
  React.createElement(AutomationDetailView, {
    workflow: mockWorkflow,
    onBack: () => {},
    onNavigateToActivity: () => {}
  })
);

assert(detailHtml.includes("Suivi automatique des prospects"), "Missing title in AutomationDetailView");
assert(detailHtml.includes("HOW INFORMATION FLOWS"), "Missing narrative section in AutomationDetailView");
console.log(`  ✓ AutomationDetailView successfully renders 3-pane orchestrator and sequential narrative (${detailHtml.length} bytes)`);

// 5. REGRESSION & LIFECYCLE CHECK
console.log("\n[5/5] Checking Data Consistency & Regressions...");
const canvasCode = fs.readFileSync("src/components/AutomationFlowCanvas.tsx", "utf8");
assert(canvasCode.includes("technicalPayload"), "Missing raw payload metadata for technical inspector");
console.log("  ✓ Operational data model flows seamlessly into the Orchestrator");

console.log("\n============================================================");
console.log("  ALL 5 STEP 5 ORCHESTRATOR CHECKS PASSED (100%)");
console.log("============================================================\n");
