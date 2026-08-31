const fs = require("fs");
const path = require("path");
const sucrase = require("sucrase");

function bundleVendor() {
  console.log("Packaging vendor libraries (Scheduler, React, ReactDOM, ReactDOMClient, Lucide)...");
  const schedulerCode = fs.readFileSync(path.join(__dirname, "node_modules/scheduler/cjs/scheduler.production.js"), "utf8");
  const reactCode = fs.readFileSync(path.join(__dirname, "node_modules/react/cjs/react.production.js"), "utf8");
  const reactDomCode = fs.readFileSync(path.join(__dirname, "node_modules/react-dom/cjs/react-dom.production.js"), "utf8");
  const reactDomClientCode = fs.readFileSync(path.join(__dirname, "node_modules/react-dom/cjs/react-dom-client.production.js"), "utf8");
  const lucideCode = fs.readFileSync(path.join(__dirname, "node_modules/lucide-react/dist/cjs/lucide-react.js"), "utf8");

  const vendorBundle = `
// Otomatizon Vendor Bundle
(function(window) {
  // Global Browser Shims
  window.process = window.process || { env: { NODE_ENV: "production" } };
  window.global = window;

  function requireModule(id) {
    if (id === "react") return window.React;
    if (id === "scheduler") return window.Scheduler;
    if (id === "react-dom") return window.ReactDOM;
    if (id === "react-dom/client") return window.ReactDOMClient;
    return {};
  }

  // 1. Scheduler
  (function() {
    var exports = {};
    var module = { exports: exports };
    ${schedulerCode}
    window.Scheduler = module.exports;
  })();

  // 2. React
  (function() {
    var exports = {};
    var module = { exports: exports };
    ${reactCode}
    window.React = module.exports;
  })();

  // 3. ReactDOM
  (function(require) {
    var exports = {};
    var module = { exports: exports };
    ${reactDomCode}
    window.ReactDOM = module.exports;
  })(requireModule);

  // 4. ReactDOMClient
  (function(require) {
    var exports = {};
    var module = { exports: exports };
    ${reactDomClientCode}
    window.ReactDOMClient = module.exports;
    window.ReactDOM.createRoot = module.exports.createRoot;
  })(requireModule);

  // 5. Lucide Icons
  (function(require) {
    var exports = {};
    var module = { exports: exports };
    ${lucideCode}
    window.LucideIcons = module.exports;
  })(requireModule);
})(window);
`;

  fs.writeFileSync(path.join(__dirname, "public/vendor.js"), vendorBundle);
  console.log("Vendor bundle created at public/vendor.js");
}

function transpileFile(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const transformed = sucrase.transform(code, {
    transforms: ["jsx", "typescript", "imports"],
    production: true,
  });
  return transformed.code;
}

function bundleApp() {
  console.log("Bundling Otomatizon application modules...");

  const filesInOrder = [
    { name: "@/types", path: "src/types/index.ts" },
    { name: "@/lib/design-system", path: "src/lib/design-system.ts" },
    { name: "@/lib/billing/types", path: "src/lib/billing/types.ts" },
    { name: "@/lib/billing/config", path: "src/lib/billing/config.ts" },
    { name: "@/lib/analytics/funnel", path: "src/lib/analytics/funnel.ts" },
    { name: "@/lib/decision-engine/types", path: "src/lib/decision-engine/types.ts" },
    { name: "@/lib/decision-engine/patterns", path: "src/lib/decision-engine/patterns.ts" },
    { name: "@/lib/decision-engine/engine", path: "src/lib/decision-engine/engine.ts" },
    { name: "@/lib/decision-engine", path: "src/lib/decision-engine/index.ts" },
    { name: "@/lib/mock-data", path: "src/lib/mock-data.ts" },
    { name: "@/lib/pdf/generate-report-pdf", path: "src/lib/pdf/generate-report-pdf.ts" },
    { name: "@/lib/ai-engine", path: "src/lib/ai-engine.ts" },
    { name: "@/lib/automation-runner", path: "src/lib/automation-runner.ts" },
    { name: "@/lib/store", path: "src/lib/store.ts" },
    { name: "@/components/BrandLogo", path: "src/components/BrandLogo.tsx" },
    { name: "@/components/FeedbackCard", path: "src/components/FeedbackCard.tsx" },
    { name: "@/components/CheckoutModal", path: "src/components/CheckoutModal.tsx" },
    { name: "@/components/AutomationPreviewModal", path: "src/components/AutomationPreviewModal.tsx" },
    { name: "@/components/MetricExplanationModal", path: "src/components/MetricExplanationModal.tsx" },
    { name: "@/components/EventDetailModal", path: "src/components/EventDetailModal.tsx" },
    { name: "@/components/OperationalFlow", path: "src/components/OperationalFlow.tsx" },
    { name: "@/components/ExecutionDetailView", path: "src/components/ExecutionDetailView.tsx" },
    { name: "@/components/AutomationFlowCanvas", path: "src/components/AutomationFlowCanvas.tsx" },
    { name: "@/components/AutomationDetailView", path: "src/components/AutomationDetailView.tsx" },
    { name: "@/components/JourneyBanner", path: "src/components/JourneyBanner.tsx" },
    { name: "@/components/AuthModal", path: "src/components/AuthModal.tsx" },
    { name: "@/components/Navbar", path: "src/components/Navbar.tsx" },
    { name: "@/components/OnboardingModal", path: "src/components/OnboardingModal.tsx" },
    { name: "@/components/ResultsImpactView", path: "src/components/ResultsImpactView.tsx" },
    { name: "@/lib/connectors/types", path: "src/lib/connectors/types.ts" },
    { name: "@/lib/intelligence/types", path: "src/lib/intelligence/types.ts" },
    { name: "@/lib/worker/types", path: "src/lib/worker/types.ts" },
    { name: "@/lib/decision-trace", path: "src/lib/decision-trace.ts" },
    { name: "@/components/DecisionTraceDrawer", path: "src/components/DecisionTraceDrawer.tsx" },
    { name: "@/components/LiveAutomationPipeline", path: "src/components/LiveAutomationPipeline.tsx" },
    { name: "@/components/AttentionRequiredSection", path: "src/components/AttentionRequiredSection.tsx" },
    { name: "@/components/AppCollaborationMatrix", path: "src/components/AppCollaborationMatrix.tsx" },
    { name: "@/components/ConnectAppModal", path: "src/components/ConnectAppModal.tsx" },
    { name: "@/components/OpportunitiesView", path: "src/components/OpportunitiesView.tsx" },
    { name: "@/components/AutomationsView", path: "src/components/AutomationsView.tsx" },
    { name: "@/components/SystemHealthOverview", path: "src/components/SystemHealthOverview.tsx" },
    { name: "@/components/IntelligenceInspectorModal", path: "src/components/IntelligenceInspectorModal.tsx" },
    { name: "@/components/FollowUpQueueModal", path: "src/components/FollowUpQueueModal.tsx" },
    { name: "@/components/HomeCommandCenter", path: "src/components/HomeCommandCenter.tsx" },
    { name: "@/components/AppsView", path: "src/components/AppsView.tsx" },
    { name: "@/components/ActivityView", path: "src/components/ActivityView.tsx" },
    { name: "@/components/SettingsView", path: "src/components/SettingsView.tsx" },
    { name: "@/components/BusinessReportView", path: "src/components/BusinessReportView.tsx" },
    { name: "@/components/LandingPage", path: "src/components/LandingPage.tsx" },
    { name: "@/app/page", path: "src/app/page.tsx" },
    { name: "@/main", path: "src/main.tsx" }
  ];

  let bundleCode = `
// Otomatizon Application Bundle
(function() {
  const modules = {};
  function define(name, fn) {
    modules[name] = { fn, exports: null };
  }
  function requireModule(name) {
    if (name.endsWith(".css")) return {};
    if (name === "react") return window.React;
    if (name === "scheduler") return window.Scheduler;
    if (name === "react-dom") return window.ReactDOM;
    if (name === "react-dom/client") {
      const client = window.ReactDOMClient || window.ReactDOM;
      return { ...client, default: client, __esModule: true };
    }
    if (name === "lucide-react") {
      return { ...window.LucideIcons, default: window.LucideIcons, __esModule: true };
    }
    if (name === "clsx" || name === "tailwind-merge") {
      return { 
        default: (...args) => args.filter(Boolean).join(" "),
        clsx: (...args) => args.filter(Boolean).join(" "), 
        twMerge: (...args) => args.filter(Boolean).join(" ") 
      };
    }

    // Path resolution aliases
    let clean = name;
    if (clean === "./design-system" || clean === "@/lib/design-system") clean = "@/lib/design-system";
    if (clean === "./billing/config" || clean === "./config" || clean === "@/lib/billing/config") clean = "@/lib/billing/config";
    if (clean === "./billing/types" || clean === "@/lib/billing/types") clean = "@/lib/billing/types";
    if (clean === "./analytics/funnel" || clean === "@/lib/analytics/funnel") clean = "@/lib/analytics/funnel";
    if (clean === "./BrandLogo" || clean === "@/components/BrandLogo" || clean === "./components/BrandLogo") clean = "@/components/BrandLogo";
    if (clean === "./FeedbackCard" || clean === "@/components/FeedbackCard") clean = "@/components/FeedbackCard";
    if (clean === "./CheckoutModal" || clean === "@/components/CheckoutModal") clean = "@/components/CheckoutModal";
    if (clean === "./patterns" || clean === "./patterns.ts") clean = "@/lib/decision-engine/patterns";
    if (clean === "./types" || clean === "./types.ts") clean = "@/lib/decision-engine/types";
    if (clean === "./engine" || clean === "./engine.ts") clean = "@/lib/decision-engine/engine";
    if (clean.startsWith("./lib/decision-engine") || clean.startsWith("@/lib/decision-engine")) {
      if (clean.endsWith("/types")) clean = "@/lib/decision-engine/types";
      else if (clean.endsWith("/patterns")) clean = "@/lib/decision-engine/patterns";
      else if (clean.endsWith("/engine")) clean = "@/lib/decision-engine/engine";
      else clean = "@/lib/decision-engine";
    }
    if (clean === "./app/page") clean = "@/app/page";
    if (clean === "./components/Navbar" || clean === "./Navbar") clean = "@/components/Navbar";
    if (clean === "./components/AuthModal" || clean === "./AuthModal") clean = "@/components/AuthModal";
    if (clean === "./components/AutomationPreviewModal" || clean === "./AutomationPreviewModal") clean = "@/components/AutomationPreviewModal";
    if (clean === "./components/MetricExplanationModal" || clean === "./MetricExplanationModal" || clean === "@/components/MetricExplanationModal") clean = "@/components/MetricExplanationModal";
    if (clean === "./components/EventDetailModal" || clean === "./EventDetailModal" || clean === "@/components/EventDetailModal") clean = "@/components/EventDetailModal";
    if (clean === "./components/OperationalFlow" || clean === "./OperationalFlow" || clean === "@/components/OperationalFlow") clean = "@/components/OperationalFlow";
    if (clean === "./components/ExecutionDetailView" || clean === "./ExecutionDetailView" || clean === "@/components/ExecutionDetailView") clean = "@/components/ExecutionDetailView";
    if (clean === "./components/AutomationFlowCanvas" || clean === "./AutomationFlowCanvas" || clean === "@/components/AutomationFlowCanvas") clean = "@/components/AutomationFlowCanvas";
    if (clean === "./components/AutomationDetailView" || clean === "./AutomationDetailView" || clean === "@/components/AutomationDetailView") clean = "@/components/AutomationDetailView";
    if (clean === "./components/JourneyBanner" || clean === "./JourneyBanner" || clean === "@/components/JourneyBanner") clean = "@/components/JourneyBanner";
    if (clean === "./pdf/generate-report-pdf" || clean === "@/lib/pdf/generate-report-pdf") clean = "@/lib/pdf/generate-report-pdf";
    if (clean === "./components/LandingPage") clean = "@/components/LandingPage";
    if (clean === "./components/ResultsImpactView" || clean === "./ResultsImpactView" || clean === "@/components/ResultsImpactView") clean = "@/components/ResultsImpactView";
    if (clean === "./components/HomeCommandCenter") clean = "@/components/HomeCommandCenter";
    if (clean === "./components/OpportunitiesView") clean = "@/components/OpportunitiesView";
    if (clean === "./components/AutomationsView") clean = "@/components/AutomationsView";
    if (clean === "./components/SystemHealthOverview" || clean === "./SystemHealthOverview" || clean === "@/components/SystemHealthOverview") clean = "@/components/SystemHealthOverview";
    if (clean === "./components/UnifiedSystemSimulator" || clean === "./UnifiedSystemSimulator" || clean === "@/components/UnifiedSystemSimulator") clean = "@/components/UnifiedSystemSimulator";
    if (clean === "./components/ConnectAppModal" || clean === "./ConnectAppModal" || clean === "@/components/ConnectAppModal") clean = "@/components/ConnectAppModal";
    if (clean === "./components/IntelligenceInspectorModal" || clean === "./IntelligenceInspectorModal" || clean === "@/components/IntelligenceInspectorModal") clean = "@/components/IntelligenceInspectorModal";
    if (clean === "./components/FollowUpQueueModal" || clean === "./FollowUpQueueModal" || clean === "@/components/FollowUpQueueModal") clean = "@/components/FollowUpQueueModal";
    if (clean === "./components/DecisionTraceDrawer" || clean === "./DecisionTraceDrawer" || clean === "@/components/DecisionTraceDrawer") clean = "@/components/DecisionTraceDrawer";
    if (clean === "./components/LiveAutomationPipeline" || clean === "./LiveAutomationPipeline" || clean === "@/components/LiveAutomationPipeline") clean = "@/components/LiveAutomationPipeline";
    if (clean === "./components/AttentionRequiredSection" || clean === "./AttentionRequiredSection" || clean === "@/components/AttentionRequiredSection") clean = "@/components/AttentionRequiredSection";
    if (clean === "./components/AppCollaborationMatrix" || clean === "./AppCollaborationMatrix" || clean === "@/components/AppCollaborationMatrix") clean = "@/components/AppCollaborationMatrix";
    if (clean === "./lib/decision-trace" || clean === "@/lib/decision-trace") clean = "@/lib/decision-trace";
    if (clean === "./lib/connectors/types" || clean === "@/lib/connectors/types") clean = "@/lib/connectors/types";
    if (clean === "./lib/intelligence/types" || clean === "@/lib/intelligence/types") clean = "@/lib/intelligence/types";
    if (clean === "./lib/worker/types" || clean === "@/lib/worker/types") clean = "@/lib/worker/types";
    if (clean === "./components/AppsView") clean = "@/components/AppsView";
    if (clean === "./components/ActivityView") clean = "@/components/ActivityView";
    if (clean === "./components/SettingsView") clean = "@/components/SettingsView";
    if (clean === "./components/OnboardingModal") clean = "@/components/OnboardingModal";
    if (clean === "@/types") clean = "@/types";

    const mod = modules[clean] || modules[name];
    if (!mod) {
      console.warn("Module not found:", name, "cleaned:", clean);
      return {};
    }
    if (mod.exports) return mod.exports;
    const exports = {};
    mod.exports = exports;
    mod.fn(requireModule, exports);
    return exports;
  }
`;

  for (const file of filesInOrder) {
    const fullPath = path.join(__dirname, file.path);
    if (!fs.existsSync(fullPath)) {
      console.error("Missing file:", fullPath);
      continue;
    }
    // Log currently compiled file
    // console.log("Compiling:", file.path);
    let compiled;
    try {
      compiled = transpileFile(fullPath);
    } catch (err) {
      console.error("FAILED on file:", file.path);
      throw err;
    }
    bundleCode += `
  // Module: ${file.name}
  define("${file.name}", function(require, exports) {
    ${compiled}
  });
`;
  }

  bundleCode += `
  // Start Main Entry
  try {
    requireModule("@/main");
  } catch (err) {
    console.error("Failed to mount Otomatizon main entry:", err);
    if (typeof document !== "undefined") {
      var errBox = document.createElement("div");
      errBox.style.cssText = "position:fixed;inset:20px;z-index:999999;background:#18181b;color:#f87171;padding:24px;border-radius:16px;border:1px solid #ef4444;font-family:monospace;overflow:auto;";
      errBox.innerHTML = "<h2 style='color:#fff;margin-bottom:12px;'>⚠️ Otomatizon Runtime Exception</h2><pre>" + (err.stack || err.message) + "</pre>";
      document.body.appendChild(errBox);
    }
  }
})();
`;

  fs.writeFileSync(path.join(__dirname, "public/app.js"), bundleCode);
  console.log("App bundle created at public/app.js");
}

bundleVendor();
bundleApp();
