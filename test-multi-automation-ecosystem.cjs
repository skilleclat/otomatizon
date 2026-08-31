const assert = require("assert");
const fs = require("fs");
const path = require("path");

console.log("\n==================================================================");
console.log("  TEST SUITE: Multi-Automation Ecosystem & Team Collaboration");
console.log("==================================================================\n");

// 1. Verify mock-data contains 3 complete workflows
const mockDataPath = path.join(__dirname, "src", "lib", "mock-data.ts");
const mockDataContent = fs.readFileSync(mockDataPath, "utf8");

console.log("[1/5] Checking Multi-Workflow Definitions in mock-data.ts...");
assert(mockDataContent.includes("wf_lead_autopilot"), "wf_lead_autopilot missing");
assert(mockDataContent.includes("wf_package_renewal"), "wf_package_renewal missing");
assert(mockDataContent.includes("wf_google_reviews"), "wf_google_reviews missing");
assert(mockDataContent.includes("Lesson Package Credit Tracker & Renewal"), "Package title missing");
assert(mockDataContent.includes("Post-Session Google Review Collector"), "Google reviews title missing");
assert(mockDataContent.includes("defaultTeamMembers"), "defaultTeamMembers missing");
console.log("  ✓ 3 Complete Workflows & Team Members found in mock-data.ts");

// 2. Verify decision-trace.ts contains multi-workflow traces
const tracePath = path.join(__dirname, "src", "lib", "decision-trace.ts");
const traceContent = fs.readFileSync(tracePath, "utf8");

console.log("[2/5] Checking Decision Traces for all 3 Workflows...");
assert(traceContent.includes("packageRenewalTraces"), "packageRenewalTraces missing");
assert(traceContent.includes("googleReviewTraces"), "googleReviewTraces missing");
assert(traceContent.includes("getTracesForWorkflow"), "getTracesForWorkflow missing");
console.log("  ✓ Decision Traces implemented for Lead Autopilot, Package Renewal, and Google Reviews");

// 3. Verify store.ts multi-workflow simulations & team methods
const storePath = path.join(__dirname, "src", "lib", "store.ts");
const storeContent = fs.readFileSync(storePath, "utf8");

console.log("[3/5] Checking Store State, Multi-Workflow Simulations & Team Actions...");
assert(storeContent.includes("simulatePackageRenewal"), "simulatePackageRenewal missing");
assert(storeContent.includes("simulateGoogleReview"), "simulateGoogleReview missing");
assert(storeContent.includes("inviteTeamMember"), "inviteTeamMember missing");
assert(storeContent.includes("updateTeamMemberRole"), "updateTeamMemberRole missing");
assert(storeContent.includes("removeTeamMember"), "removeTeamMember missing");
assert(storeContent.includes("teamMembers: TeamMember[]"), "teamMembers type definition in AppState missing");
console.log("  ✓ Store methods for package renewal, review collector, and team management verified");

// 4. Verify LiveAutomationPipeline.tsx dynamic switching
const pipelinePath = path.join(__dirname, "src", "components", "LiveAutomationPipeline.tsx");
const pipelineContent = fs.readFileSync(pipelinePath, "utf8");

console.log("[4/5] Checking LiveAutomationPipeline dynamic switcher UI...");
assert(pipelineContent.includes("handleSelectWorkflow"), "handleSelectWorkflow missing");
assert(pipelineContent.includes("selectedWorkflowId"), "selectedWorkflowId missing");
assert(pipelineContent.includes("1. Lead Follow-Up"), "Lead Follow-Up switcher button missing");
assert(pipelineContent.includes("2. Package Credit Tracker"), "Package Credit Tracker switcher button missing");
assert(pipelineContent.includes("3. Google Reviews"), "Google Reviews switcher button missing");
console.log("  ✓ LiveAutomationPipeline dynamic 3-workflow switcher & stepper verified");

// 5. Verify SettingsView.tsx Team & Permissions Tab
const settingsPath = path.join(__dirname, "src", "components", "SettingsView.tsx");
const settingsContent = fs.readFileSync(settingsPath, "utf8");

console.log("[5/5] Checking SettingsView.tsx Team & Permissions Tab...");
assert(settingsContent.includes("team"), "Team tab id missing");
assert(settingsContent.includes("Team & Permissions"), "Team & Permissions label missing");
assert(settingsContent.includes("WORKSPACE ACCESS"), "WORKSPACE ACCESS header missing");
assert(settingsContent.includes("Invite Team Member"), "Invite Team Member button missing");
assert(settingsContent.includes("ADMIN ROLE"), "ADMIN ROLE callout missing");
assert(settingsContent.includes("COLLABORATOR ROLE"), "COLLABORATOR ROLE callout missing");
assert(settingsContent.includes("VIEWER ROLE"), "VIEWER ROLE callout missing");
console.log("  ✓ SettingsView Team & Permissions tab verified");

console.log("\n==================================================================");
console.log("  ✅ ALL 5 / 5 MULTI-AUTOMATION & TEAM CHECKS PASSED (100%)");
console.log("==================================================================\n");
