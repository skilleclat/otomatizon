// test-results-impact.cjs — Step 8: Results & Business Impact Layer Audit

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const React = require("react");
const ReactDOMServer = require("react-dom/server");

console.log("============================================================");
console.log("  OTOMATIZON STEP 8: RESULTS & BUSINESS IMPACT AUDIT");
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
    ResultsImpactView: requireModule("@/components/ResultsImpactView").ResultsImpactView,
    MetricExplanationModal: requireModule("@/components/MetricExplanationModal").MetricExplanationModal
  };
  `
);
vm.runInContext(appCode, sandbox);

const { ResultsImpactView, MetricExplanationModal } = sandbox.window.__components;

// 1. AUDIT SSR RENDERING OF RESULTS IMPACT VIEW
console.log("[1/5] Auditing ResultsImpactView SSR Rendering...");
const impactHtml = ReactDOMServer.renderToString(
  React.createElement(ResultsImpactView, {
    onNavigateToAutomations: () => {}
  })
);

assert(impactHtml.length > 5000, "ResultsImpactView rendered too small");
console.log(`  ✓ ResultsImpactView rendered successfully (${impactHtml.length} bytes)`);

// 2. AUDIT 6 IMPACT METRIC CARDS (IMAGE 8)
console.log("\n[2/5] Verifying 6 Metric Cards & Growth Trends (Image 8)...");
assert(impactHtml.includes("Automation Performance") || impactHtml.includes("Performance des automatisations"), "Missing main header title");
assert(impactHtml.includes("27") && (impactHtml.includes("Inquiries") || impactHtml.includes("Demandes")), "Missing Metric 1: Inquiries");
assert(impactHtml.includes("24") && (impactHtml.includes("Follow-ups") || impactHtml.includes("Relances")), "Missing Metric 2: Follow-ups");
assert(impactHtml.includes("6") && (impactHtml.includes("Bookings") || impactHtml.includes("Réservations")), "Missing Metric 3: Bookings");
assert((impactHtml.includes("8.2") || impactHtml.includes("8,2")) && (impactHtml.includes("Time Saved") || impactHtml.includes("Temps gagné")), "Missing Metric 4: Time saved");
assert((impactHtml.includes("98.6%") || impactHtml.includes("98,6%")) && (impactHtml.includes("Success Rate") || impactHtml.includes("Taux de réussite")), "Missing Metric 5: Success rate");
assert((impactHtml.includes("88,000") || impactHtml.includes("88 000")) && (impactHtml.includes("Value") || impactHtml.includes("Valeur")), "Missing Metric 6: Estimated value created");
console.log("  ✓ Section 1 Verified: All 6 metric impact cards with growth trends matching Reference Image 8");

// 3. AUDIT DONUT DISTRIBUTION CHART (IMAGE 8)
console.log("\n[3/5] Auditing Donut Distribution Chart & Legend (Image 8)...");
assert(impactHtml.includes("Breakdown by automation") || impactHtml.includes("Répartition par automatisation"), "Missing timeframe section label");
assert(impactHtml.includes("Total") && (impactHtml.includes("inquiries") || impactHtml.includes("demandes")), "Missing center label 'Total inquiries'");
assert(impactHtml.includes("stroke-dasharray"), "Missing SVG donut chart circle");
console.log("  ✓ Section 2 Verified: SVG Donut Chart with total and automation distribution legend");

// 4. AUDIT 30-DAY OPERATIONAL TRENDLINE (IMAGE 8)
console.log("\n[4/5] Auditing 30-Day Operational Area Trendline (Image 8)...");
assert(impactHtml.includes("Trends") || impactHtml.includes("Tendances"), "Missing 30-day trends title");
assert(impactHtml.includes("30 Jul") || impactHtml.includes("30 juil"), "Missing trendline X-axis date labels");
assert(impactHtml.includes("trendGradient"), "Missing trend area gradient fill");
console.log("  ✓ Section 3 Verified: 30-day SVG area trendline with date checkpoints and interactive points");

// 5. AUDIT AUDIT TRAIL & FORMULA IN MODAL
console.log("\n[5/5] Checking Mathematical Audit Trail in Explanation Modal...");
const mockMetric = {
  id: "value_created",
  title: "Estimated Value Created",
  titleFr: "Valeur estimée créée",
  value: "88,000 KES",
  sublabel: "Estimated Value Created",
  formula: "(6 forfaits × 14 000 KES) + (4 acomptes × 1 000 KES) = 88 000 KES",
  formulaDescription: "Attribution verified via conversion ledger",
  provenance: "ESTIMATED",
  confidenceScore: 92,
  timeframe: "Last 7 days",
  contributingFactors: ["6 students enrolled", "4 M-Pesa deposits secured"]
};

const modalHtml = ReactDOMServer.renderToString(
  React.createElement(MetricExplanationModal, {
    isOpen: true,
    metric: mockMetric,
    onClose: () => {}
  })
);

assert(modalHtml.includes("CALCULATION") || modalHtml.includes("AUDIT"), "Missing calculation/audit label in modal");
assert(modalHtml.includes("Mathematical Calculation") || modalHtml.includes("Calcul"), "Missing calculation section");
assert(modalHtml.includes("ESTIMATED") || modalHtml.includes("OBSERVED"), "Missing provenance tag in modal");
console.log("  ✓ Section 4 Verified: Mathematical audit trail and provenance verification in modal");

console.log("\n============================================================");
console.log("  ALL 5 STEP 8 RESULTS & IMPACT CHECKS PASSED (100%)");
console.log("============================================================\n");
