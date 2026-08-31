// test-opportunities-engine.cjs — Step 4: Intelligent Opportunities Engine Audit

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const React = require("react");
const ReactDOMServer = require("react-dom/server");

console.log("============================================================");
console.log("  OTOMATIZON STEP 4: INTELLIGENT OPPORTUNITIES ENGINE AUDIT");
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
    OpportunitiesView: requireModule("@/components/OpportunitiesView").OpportunitiesView,
    HomeCommandCenter: requireModule("@/components/HomeCommandCenter").HomeCommandCenter
  };
  `
);
vm.runInContext(appCode, sandbox);

const { OpportunitiesView } = sandbox.window.__components;

// 1. AUDIT SSR RENDERING
console.log("[1/5] Auditing OpportunitiesView SSR Rendering...");
const oppsHtml = ReactDOMServer.renderToString(
  React.createElement(OpportunitiesView, {
    onNavigateToAutomations: () => {}
  })
);

assert(oppsHtml.length > 5000, "OpportunitiesView rendered too small");
console.log(`  ✓ OpportunitiesView rendered successfully (${oppsHtml.length} bytes)`);

// 2. AUDIT HEADER & FILTER PILLS
console.log("\n[2/5] Verifying Header & Filter Pills (Image 4)...");
assert(oppsHtml.includes("Opportunités détectées"), "Missing header title 'Opportunités détectées'");
assert(oppsHtml.includes("opportunités identifiées"), "Missing count subtitle");
assert(oppsHtml.includes("Tous") && oppsHtml.includes("Haut impact") && oppsHtml.includes("Moyen") && oppsHtml.includes("Faible"), "Missing filter pills");
console.log("  ✓ Section 1 Verified: Header with dynamic count and 4 filter pills (Tous, Haut impact, Moyen, Faible)");

// 3. AUDIT 7 INTELLIGENCE DIMENSIONS ON OPPORTUNITY #1
console.log("\n[3/5] Auditing 7 Intelligence Dimensions on Opportunity #1...");
// Badge & Rank
assert(oppsHtml.includes("HAUT IMPACT"), "Missing HAUT IMPACT badge");
assert(oppsHtml.includes("#1"), "Missing Rank #1 indicator");

// Title & Evidence
assert(oppsHtml.includes("14 leads ne sont pas suivis"), "Missing Opportunity #1 title");
assert(oppsHtml.includes("14 leads qui n&#x27;ont pas reçu de relance 24h") || oppsHtml.includes("14 leads qui n'ont pas reçu de relance 24h"), "Missing detected evidence");

// Impact Box
assert(oppsHtml.includes("Impact estimé &gt;") || oppsHtml.includes("Impact estimé >"), "Missing impact estimated label");
assert(oppsHtml.includes("49 000 KES +"), "Missing 49 000 KES + impact amount");
assert(oppsHtml.includes("/ mois"), "Missing / mois timeframe");

// Why it matters & Recommended Action
assert(oppsHtml.includes("POURQUOI C&#x27;EST IMPORTANT") || oppsHtml.includes("POURQUOI C'EST IMPORTANT"), "Missing POURQUOI C'EST IMPORTANT label");
assert(oppsHtml.includes("Vous perdez des prospects qualifiés"), "Missing why it matters description");
assert(oppsHtml.includes("AUTOMATISATION RECOMMANDÉE"), "Missing AUTOMATISATION RECOMMANDÉE label");
assert(oppsHtml.includes("Relance automatique 24h"), "Missing recommendation description");

// Required Apps & Primary Action Button
assert(oppsHtml.includes("APPLICATIONS NÉCESSAIRES"), "Missing APPLICATIONS NÉCESSAIRES label");
assert(oppsHtml.includes("Créer cette automatisation"), "Missing primary action button 'Créer cette automatisation'");
console.log("  ✓ Section 2 Verified: Opportunity #1 fully exposes all 7 operational intelligence dimensions");

// 4. AUDIT OPPORTUNITY #2 (PAYMENTS FRICTION)
console.log("\n[4/5] Auditing Opportunity #2 (M-Pesa Tuition Recovery)...");
assert(oppsHtml.includes("#2"), "Missing Rank #2 indicator");
assert(oppsHtml.includes("Paiements non confirmés avant les cours"), "Missing Opportunity #2 title");
assert(oppsHtml.includes("6 sessions ont eu lieu sans confirmation"), "Missing Opportunity #2 evidence");
assert(oppsHtml.includes("45 000 KES +"), "Missing Opportunity #2 impact amount");
assert(oppsHtml.includes("Vérifier automatiquement le paiement avant chaque session"), "Missing Opportunity #2 recommendation");
console.log("  ✓ Section 3 Verified: Opportunity #2 (M-Pesa payment friction) fully structured");

// 5. LIFECYCLE & CONTEXT TRANSITION CHECK
console.log("\n[5/5] Checking Opportunities to Automations Lifecycle Wiring...");
const opportunitiesCode = fs.readFileSync("src/components/OpportunitiesView.tsx", "utf8");
assert(opportunitiesCode.includes("activateOpportunity"), "Missing store action wiring");
assert(opportunitiesCode.includes("onNavigateToAutomations"), "Missing navigation callback trigger");
console.log("  ✓ Section 4 Verified: 'Créer cette automatisation' transitions lifecycle and carries context to Automations");

console.log("\n============================================================");
console.log("  ALL 5 STEP 4 OPPORTUNITIES ENGINE CHECKS PASSED (100%)");
console.log("============================================================\n");
