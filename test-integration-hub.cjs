// test-integration-hub.cjs — Step 3: Connected Business Systems Map Audit

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const React = require("react");
const ReactDOMServer = require("react-dom/server");

console.log("============================================================");
console.log("  OTOMATIZON STEP 3: INTEGRATION HUB & SYSTEM MAP AUDIT");
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
    AppsView: requireModule("@/components/AppsView").AppsView,
    HomeCommandCenter: requireModule("@/components/HomeCommandCenter").HomeCommandCenter
  };
  `
);
vm.runInContext(appCode, sandbox);

const { AppsView } = sandbox.window.__components;

// 1. AUDIT SSR RENDERING
console.log("[1/5] Auditing AppsView SSR Rendering...");
const appsHtml = ReactDOMServer.renderToString(
  React.createElement(AppsView, {
    onNavigateToAutomations: () => {}
  })
);

assert(appsHtml.length > 5000, "AppsView rendered too small");
console.log(`  ✓ AppsView rendered successfully (${appsHtml.length} bytes)`);

// 2. AUDIT HEADER & INTENT
console.log("\n[2/5] Verifying Header & Executive Positioning...");
assert(appsHtml.includes("Systèmes d&#x27;entreprise connectés") || appsHtml.includes("Systèmes d'entreprise connectés"), "Missing main title");
assert(appsHtml.includes("Otomatizon connecte vos outils"), "Missing subtitle positioning Otomatizon");
assert(appsHtml.includes("Chiffrement AES-256") || appsHtml.includes("OAuth"), "Missing security trust badge");
console.log("  ✓ Section 1 Verified: Connected Business Systems header and AES-256 security guarantee");

// 3. AUDIT CENTRAL SYSTEM MAP (6 APPS + OTOMATIZON INTELLIGENCE LAYER)
console.log("\n[3/5] Verifying Visual System Architecture Map...");
// Center Hub
assert(appsHtml.includes("OTOMATIZON"), "Missing Otomatizon center label");
assert(appsHtml.includes("Intelligence Layer"), "Missing Intelligence Layer label");
assert(appsHtml.includes("Comprend, décide et orchestre"), "Missing intelligence tagline");

// Left Inbound Tools
assert(appsHtml.includes("WhatsApp Business"), "Missing WhatsApp Business in map");
assert(appsHtml.includes("Communication clients"), "Missing WhatsApp subtitle");
assert(appsHtml.includes("Gmail"), "Missing Gmail in map");
assert(appsHtml.includes("E-mails &amp; notifications"), "Missing Gmail subtitle");
assert(appsHtml.includes("Google Business Profile"), "Missing Google Business Profile in map");

// Right Outbound Tools
assert(appsHtml.includes("Google Agenda"), "Missing Google Agenda in map");
assert(appsHtml.includes("Planification &amp; réservations"), "Missing Google Agenda subtitle");
assert(appsHtml.includes("Google Sheets"), "Missing Google Sheets in map");
assert(appsHtml.includes("Données &amp; leads"), "Missing Google Sheets subtitle");
assert(appsHtml.includes("M-Pesa"), "Missing M-Pesa in map");
assert(appsHtml.includes("Paiements &amp; vérification"), "Missing M-Pesa subtitle");
console.log("  ✓ Section 2 Verified: Central Otomatizon Intelligence Layer with 6 connected channel nodes");

// 4. AUDIT APPLICATION DEEP INSPECTION CARD (DÉTAIL D'UNE APPLICATION)
console.log("\n[4/5] Auditing Selected Application Deep Inspection Card...");
assert(appsHtml.includes("DÉTAIL D&#x27;UNE APPLICATION") || appsHtml.includes("DÉTAIL D'UNE APPLICATION"), "Missing inspection section title");
assert(appsHtml.includes("CONNECTÉ"), "Missing connected status badge");
assert(appsHtml.includes("Compte lié:"), "Missing linked account identifier");
assert(appsHtml.includes("RÔLE DANS VOTRE SYSTÈME"), "Missing role section");
assert(appsHtml.includes("CAPACITÉS EXÉCUTÉES PAR OTOMATIZON"), "Missing capabilities section");
assert(appsHtml.includes("Lire les messages entrants"), "Missing specific WhatsApp capability");
assert(appsHtml.includes("PERMISSIONS ACCORDÉES (SCOPES OAUTH2)"), "Missing permissions scope section");
assert(appsHtml.includes("UTILISÉ PAR (AUTOMATISATIONS)"), "Missing automations using it section");
assert(appsHtml.includes("Suivi automatique des prospects"), "Missing active automation link");
assert(appsHtml.includes("Gérer la connexion"), "Missing manage connection button");
console.log("  ✓ Section 3 Verified: Application Deep Inspection Card with Role, Capabilities, Scopes, and Automations");

// 5. AUDIT FOOTER STATUS BAR
console.log("\n[5/5] Auditing Footer Status Bar...");
assert(appsHtml.includes("6 systèmes connectés") && appsHtml.includes("Tous les systèmes sont opérationnels"), "Missing systems health status");
assert(appsHtml.includes("Voir l&#x27;architecture complète") || appsHtml.includes("Voir l'architecture complète"), "Missing architecture link");
console.log("  ✓ Section 4 Verified: Footer status bar with 6 systems connected guarantee");

console.log("\n============================================================");
console.log("  ALL 5 STEP 3 INTEGRATION HUB CHECKS PASSED (100%)");
console.log("============================================================\n");
