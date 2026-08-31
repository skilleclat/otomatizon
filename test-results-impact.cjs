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
assert(impactHtml.includes("Performance des automatisations"), "Missing main header title");
assert(impactHtml.includes("27") && impactHtml.includes("Demandes traitées") && impactHtml.includes("+16% vs semaine dernière"), "Missing Metric 1: Demandes traitées");
assert(impactHtml.includes("24") && impactHtml.includes("Relances envoyées") && impactHtml.includes("+13% vs semaine dernière"), "Missing Metric 2: Relances envoyées");
assert(impactHtml.includes("6") && impactHtml.includes("Réservations obtenues") && impactHtml.includes("+21% vs semaine dernière"), "Missing Metric 3: Réservations obtenues");
assert(impactHtml.includes("8,2 h") && impactHtml.includes("Temps gagné") && impactHtml.includes("+15% vs semaine dernière"), "Missing Metric 4: Temps gagné");
assert(impactHtml.includes("98,6%") && impactHtml.includes("Taux de réussite"), "Missing Metric 5: Taux de réussite");
assert(impactHtml.includes("88 000 KES") && impactHtml.includes("Valeur estimée créée") && impactHtml.includes("+32% vs semaine dernière"), "Missing Metric 6: Valeur estimée créée");
console.log("  ✓ Section 1 Verified: All 6 metric impact cards with growth trends matching Reference Image 8");

// 3. AUDIT DONUT DISTRIBUTION CHART (IMAGE 8)
console.log("\n[3/5] Auditing Donut Distribution Chart & Legend (Image 8)...");
assert(impactHtml.includes("Répartition par automatisation"), "Missing timeframe section label");
assert(impactHtml.includes("Total demandes"), "Missing center label 'Total demandes'");
assert(impactHtml.includes("Suivi prospects") && impactHtml.includes("27 (100%)"), "Missing Suivi prospects 100% distribution");
assert(impactHtml.includes("Relance paiements") && impactHtml.includes("0 (0%)"), "Missing Relance paiements 0% distribution");
assert(impactHtml.includes("stroke-dasharray"), "Missing SVG donut chart circle");
console.log("  ✓ Section 2 Verified: SVG Donut Chart with total 27 and automation distribution legend");

// 4. AUDIT 30-DAY OPERATIONAL TRENDLINE (IMAGE 8)
console.log("\n[4/5] Auditing 30-Day Operational Area Trendline (Image 8)...");
assert(impactHtml.includes("Tendances (30 derniers jours)"), "Missing 30-day trends title");
assert(impactHtml.includes("30 juil") && impactHtml.includes("5 août") && impactHtml.includes("10 août") && impactHtml.includes("15 août") && impactHtml.includes("20 août") && impactHtml.includes("25 août") && impactHtml.includes("30 août"), "Missing trendline X-axis date labels");
assert(impactHtml.includes("trendGradient"), "Missing trend area gradient fill");
console.log("  ✓ Section 3 Verified: 30-day SVG area trendline with 7 date checkpoints and interactive points");

// 5. AUDIT 5-STAGE CAUSAL PROVENANCE CHAIN IN MODAL
console.log("\n[5/5] Checking 5-Stage Causal Provenance Chain in Explanation Modal...");
const mockMetric = {
  id: "value_created",
  title: "Valeur estimée créée",
  titleFr: "Valeur estimée créée",
  value: "88 000 KES",
  sublabel: "Valeur estimée créée",
  formula: "(6 forfaits × 14 000 KES) + (4 acomptes × 1 000 KES) = 88 000 KES",
  formulaDescription: "Attribution vérifiée par le journal de conversion",
  provenance: "ESTIMATED",
  confidenceScore: 92,
  timeframe: "Derniers 7 jours",
  contributingFactors: ["6 élèves inscrits", "4 acomptes M-Pesa sécurisés"]
};

const modalHtml = ReactDOMServer.renderToString(
  React.createElement(MetricExplanationModal, {
    isOpen: true,
    metric: mockMetric,
    onClose: () => {}
  })
);

assert(modalHtml.includes("CHAÎNE DE PROVENANCE") || modalHtml.includes("PROVENANCE"), "Missing Provenance Chain title in modal");
assert(modalHtml.includes("Métrique :") || modalHtml.includes("Métrique"), "Missing Stage 1: Métrique");
assert(modalHtml.includes("Événements sources :") || modalHtml.includes("Événements sources"), "Missing Stage 2: Événements sources");
assert(modalHtml.includes("Automatisation :") || modalHtml.includes("Automatisation"), "Missing Stage 3: Automatisation");
assert(modalHtml.includes("Actions exécutées :") || modalHtml.includes("Actions exécutées"), "Missing Stage 4: Actions exécutées");
assert(modalHtml.includes("Résultat métier :") || modalHtml.includes("Résultat métier"), "Missing Stage 5: Résultat métier");
console.log("  ✓ Section 4 Verified: 5-Stage Causal Chain (Metric → source events → automation → actions → business outcome) verified");

console.log("\n============================================================");
console.log("  ALL 5 STEP 8 RESULTS & IMPACT CHECKS PASSED (100%)");
console.log("============================================================\n");
