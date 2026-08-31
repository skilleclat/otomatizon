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

// 1. Run vendor
vm.runInContext(fs.readFileSync(path.join(__dirname, "public/vendor.js"), "utf8"), sandbox);

// Share the EXACT same React instance that ReactDOMServer is using!
sandbox.window.React = React;

// 2. Load app modules into sandbox
let appCode = fs.readFileSync(path.join(__dirname, "public/app.js"), "utf8");

// Expose module getter to inspect AppRoot
appCode = appCode.replace(
  'requireModule("@/main");',
  'window.__getAppRoot = () => requireModule("@/app/page").default;'
);

vm.runInContext(appCode, sandbox);

try {
  const AppRoot = sandbox.window.__getAppRoot();
  console.log("AppRoot component loaded:", typeof AppRoot);

  const html = ReactDOMServer.renderToString(React.createElement(AppRoot));
  console.log("SUCCESS! Server-rendered HTML length:", html.length);
  console.log("Preview of HTML:", html.slice(0, 300));
} catch (err) {
  console.error("CRITICAL RENDER ERROR DETECTED:", err);
}
