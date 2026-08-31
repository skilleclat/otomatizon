const fs = require("fs");
const path = require("path");
const vm = require("vm");
const React = require("react");
const ReactDOMServer = require("react-dom/server");

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
  `
);
vm.runInContext(appCode, sandbox);

const views = sandbox.window.__views;

for (const [name, Component] of Object.entries(views)) {
  try {
    const html = ReactDOMServer.renderToString(
      React.createElement(Component, { 
        isOpen: true, 
        onNavigate: () => {}, 
        onOpenOnboarding: () => {}, 
        onClose: () => {}, 
        onComplete: () => {}, 
        onNavigateToAutomations: () => {},
        onNavigateToActivity: () => {}
      })
    );
    console.log(`✓ ${name} rendered successfully! (${html.length} bytes)`);
  } catch (err) {
    console.error(`✗ FAILED to render ${name}:`, err);
  }
}
