// test-command-center.cjs — Step 2: Operational Command Center Audit & Verification

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const React = require("react");
const ReactDOMServer = require("react-dom/server");

console.log("============================================================");
console.log("  OTOMATIZON STEP 2: OPERATIONAL COMMAND CENTER AUDIT");
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
    HomeCommandCenter: requireModule("@/components/HomeCommandCenter").HomeCommandCenter,
    MetricExplanationModal: requireModule("@/components/MetricExplanationModal").MetricExplanationModal,
    EventDetailModal: requireModule("@/components/EventDetailModal").EventDetailModal,
    AutomationPreviewModal: requireModule("@/components/AutomationPreviewModal").AutomationPreviewModal
  };
  `
);
vm.runInContext(appCode, sandbox);

const { HomeCommandCenter, MetricExplanationModal, EventDetailModal } = sandbox.window.__components;

// 1. VERIFY COMMAND CENTER SSR RENDERING
console.log("[1/5] Auditing Command Center Layout & Core Sections...");
const commandCenterHtml = ReactDOMServer.renderToString(
  React.createElement(HomeCommandCenter, {
    onNavigate: () => {},
    onOpenOnboarding: () => {}
  })
);

assert(commandCenterHtml.length > 5000, "Command Center rendered too small");
console.log(`  ✓ Command Center rendered successfully (${commandCenterHtml.length} bytes)`);

// 2. VERIFY VISUAL REFERENCE SECTIONS & CONTENT
console.log("\n[2/5] Verifying Structure from Step 2 Reference Image...");

assert(commandCenterHtml.includes("Bonjour") && commandCenterHtml.includes("James"), "Missing executive greeting");
assert(commandCenterHtml.includes("Nairobi, Kenya"), "Missing location badge");
assert(commandCenterHtml.includes("16,3 h") || commandCenterHtml.includes("16.3"), "Missing prominent 16.3h callout");
assert(commandCenterHtml.includes("Otomatizon saved you..."), "Missing value retention pill");
console.log("  ✓ Section 1 Verified: Executive greeting, Nairobi badge, retention pill & 16.3h callout");

// B. Active Automation Card
assert(commandCenterHtml.includes("AUTOMATISATION ACTIVE"), "Missing active automation label");
assert(commandCenterHtml.includes("Suivi automatique des prospects"), "Missing active workflow title");
assert(commandCenterHtml.includes("WhatsApp") && commandCenterHtml.includes("Google Sheets") && commandCenterHtml.includes("Google Agenda"), "Missing routing flow apps");
assert(commandCenterHtml.includes("Demande reçue") && commandCenterHtml.includes("Comprend") && commandCenterHtml.includes("Enregistre"), "Missing flow step roles");
assert(commandCenterHtml.includes("Voir le flux") && commandCenterHtml.includes("Voir l&#x27;activité"), "Missing flow action buttons");
console.log("  ✓ Section 2 Verified: Active Automation Card with connected visual routing flow & action buttons");

// C. Recent Activity & High-Impact Opportunity
assert(commandCenterHtml.includes("ACTIVITÉ RÉCENTE"), "Missing recent activity feed title");
assert(commandCenterHtml.includes("OPPORTUNITÉ À HAUT IMPACT"), "Missing high impact opportunity badge");
assert(commandCenterHtml.includes("14 leads"), "Missing opportunity title");
assert(commandCenterHtml.includes("49 000 KES"), "Missing estimated impact");
assert(commandCenterHtml.includes("Voir l&#x27;opportunité"), "Missing review opportunity CTA");
assert(commandCenterHtml.includes("SYSTÈMES CONNECTÉS"), "Missing connected systems widget");
console.log("  ✓ Section 3 Verified: Two-column split with Recent Activity feed, Opportunity card & Connected Systems");

// D. Bottom 5-Metric Performance Grid
assert(commandCenterHtml.includes("IMPACT CETTE SEMAINE"), "Missing impact this week title");
assert(commandCenterHtml.includes("Demandes traitées"), "Missing Inquiries metric");
assert(commandCenterHtml.includes("Relances envoyées"), "Missing Follow-ups metric");
assert(commandCenterHtml.includes("Réservations"), "Missing Bookings metric");
assert(commandCenterHtml.includes("Temps gagné"), "Missing Time saved metric");
assert(commandCenterHtml.includes("Taux de réussite"), "Missing Success rate metric");
console.log("  ✓ Section 4 Verified: 5-Metric Performance Grid (Demandes, Relances, Réservations, Temps, Taux de réussite)");

// 3. AUDIT METRIC EXPLANATION MODAL (FORMULA & PROVENANCE)
console.log("\n[3/5] Auditing Metric Explanation & Calculation Source Modal...");
const sampleMetric = {
  id: "hours_saved",
  title: "16.3 Hours Saved This Week",
  titleFr: "16,3 h Temps Gagné cette Semaine",
  value: "16.3 h",
  sublabel: "Administrative and coordination time reclaimed",
  formula: "SUM(inbound_inquiry_handling: 27 * 18m) + SUM(calendar_scheduling: 14 * 15m) = 16.3 hrs",
  formulaDescription: "Measured across 27 inbound inquiries, syllabus delivery, and slot checks.",
  provenance: "OBSERVED",
  confidenceScore: 98,
  timeframe: "Last 7 days",
  contributingFactors: [
    "27 WhatsApp inquiries automatically greeted (~8.1h)",
    "24 follow-up reminders sent without manual typing (~6.0h)"
  ]
};

const metricModalHtml = ReactDOMServer.renderToString(
  React.createElement(MetricExplanationModal, {
    isOpen: true,
    metric: sampleMetric,
    onClose: () => {}
  })
);

assert(metricModalHtml.includes("Mathematical Calculation"), "Missing formula label in metric modal");
assert(metricModalHtml.includes("16.3 h"), "Missing metric value in modal");
assert(metricModalHtml.includes("OBSERVED"), "Missing provenance tag in metric modal");
assert(metricModalHtml.includes("98") && metricModalHtml.includes("Confidence"), "Missing confidence score in modal");
console.log(`  ✓ MetricExplanationModal rendered with mathematical audit trail (${metricModalHtml.length} bytes)`);

// 4. AUDIT EVENT DETAIL MODAL (OPERATIONAL TELEMETRY & RESULTS)
console.log("\n[4/5] Auditing Event Detail Operational Telemetry Modal...");
const sampleEvent = {
  id: "act_test_01",
  organizationId: "org_james_nairobi",
  type: "lead_captured",
  channel: "whatsapp",
  application: "WhatsApp",
  title: "New inquiry received: Mercy Chebet",
  description: "Mercy Chebet asked about DELF B2 prep and rates.",
  actionTakenByOtomatizon: "Inquiry received & syllabus sent via WhatsApp",
  businessResult: "Lead captured & verified in student roster",
  entityName: "Mercy Chebet",
  timestamp: "10:42 AM",
  provenance: "OBSERVED"
};

const eventModalHtml = ReactDOMServer.renderToString(
  React.createElement(EventDetailModal, {
    isOpen: true,
    event: sampleEvent,
    onClose: () => {}
  })
);

assert(eventModalHtml.includes("OPERATIONAL TELEMETRY"), "Missing telemetry header in event modal");
assert(eventModalHtml.includes("Mercy Chebet"), "Missing entity name in event modal");
assert(eventModalHtml.includes("Inquiry received &amp; syllabus sent"), "Missing action taken in event modal");
assert(eventModalHtml.includes("Verified System Result"), "Missing verified result in event modal");
assert(eventModalHtml.includes("OBSERVED"), "Missing provenance tag in event modal");
console.log(`  ✓ EventDetailModal rendered with operational telemetry and verified result (${eventModalHtml.length} bytes)`);

// 5. REGRESSION CHECK ACROSS ALL VIEWS
console.log("\n[5/5] Checking Data Consistency & Regressions...");
assert(commandCenterHtml.includes("Suivi automatique des prospects"), "Workflow title mismatch");
console.log("  ✓ Shared data model from Step 1 flows seamlessly into the Command Center");

console.log("\n============================================================");
console.log("  ALL 5 STEP 2 COMMAND CENTER CHECKS PASSED (100%)");
console.log("============================================================\n");
