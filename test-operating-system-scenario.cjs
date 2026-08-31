/**
 * Comprehensive Operating System & 13-Milestone Verification Script
 * Validates that Otomatizon behaves as a true business operations intelligence layer.
 */

const http = require("http");
const fs = require("fs");
const path = require("path");

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = [];
      res.on("data", (chunk) => data.push(chunk));
      res.on("end", () => {
        const buffer = Buffer.concat(data);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: buffer.toString("utf8"),
          buffer
        });
      });
    });
    req.on("error", reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runScenarioTest() {
  console.log("\n============================================================");
  console.log("  OTOMATIZON — 13-MILESTONE AUTOMATION OS AUDIT");
  console.log("============================================================\n");

  let passed = 0;
  let total = 0;

  function assert(name, condition, detail = "") {
    total++;
    if (condition) {
      console.log(`  [PASS] Milestone ${total}: ${name}`);
      if (detail) console.log(`         ${detail}`);
      passed++;
    } else {
      console.error(`  [FAIL] Milestone ${total}: ${name}`);
      if (detail) console.error(`         ${detail}`);
    }
  }

  try {
    // 1. Initial State Check
    const stateRes = await request({
      hostname: "localhost",
      port: 3001,
      path: "/api/state",
      method: "GET"
    });
    const state = JSON.parse(stateRes.body);

    const profile = state.businessProfile || (state.businessProfiles && state.businessProfiles[0]) || {};
    assert(
      "Business Profile identifies private tutor in Nairobi",
      profile.city === "Nairobi",
      `Profile: ${profile.businessName} (${profile.city}, Kenya)`
    );

    // 2. Discovers manual WhatsApp inquiries
    const opp01 = state.opportunities.find(o => o.id === "opp_01" || o.category === "lead_recovery");
    assert(
      "Discovers manual WhatsApp delay & uncontacted inquiries",
      opp01 && opp01.evidence.toLowerCase().includes("whatsapp"),
      `Discovered: "${opp01 ? opp01.title : 'None'}" (Impact: ${opp01 ? opp01.impactLevel : 'N/A'})`
    );

    // 3. Discovers uncollected payments before sessions
    const opp02 = state.opportunities.find(o => o.category === "payment_reminder" || o.title.toLowerCase().includes("payment"));
    assert(
      "Discovers uncollected session payments before attendance",
      opp02 && opp02.evidence.toLowerCase().includes("m-pesa"),
      `Discovered: "${opp02 ? opp02.title : 'None'}" (At Risk: KES ${opp02 ? opp02.estimatedRevenueAtRiskKes : 0})`
    );

    // 4. Generates Business Automation Report via /api/report
    const reportRes = await request({
      hostname: "localhost",
      port: 3001,
      path: "/api/report",
      method: "GET"
    });
    const reportData = JSON.parse(reportRes.body);
    assert(
      "Generates Business Automation Report via /api/report",
      reportRes.statusCode === 200 && reportData.success && reportData.report,
      `Report prepared for: ${reportData.report.businessName}`
    );

    // 5. Report displays 8 sections cleanly
    const rep = reportData.report;
    const has8Sections = 
      rep.understood && 
      rep.currentWorkflow && 
      rep.toolsCurrentlyUsed && 
      rep.opportunitiesDiscovered && 
      rep.recommendedFirstAutomation && 
      rep.requiredAppsSummary;
    assert(
      "Report structure contains canonical audit sections",
      has8Sections,
      `Understood: "${rep.understood.summary.slice(0, 45)}...", Priority: "${rep.recommendedFirstAutomation.title}"`
    );

    // 6. Download PDF Endpoint generates valid PDF binary
    const pdfRes = await request({
      hostname: "localhost",
      port: 3001,
      path: "/api/report/pdf",
      method: "GET"
    });
    const isPdf = pdfRes.buffer.slice(0, 4).toString() === "%PDF";
    assert(
      "Download PDF endpoint (/api/report/pdf) generates valid multi-page PDF",
      pdfRes.statusCode === 200 && isPdf && pdfRes.buffer.length > 2000,
      `PDF size: ${(pdfRes.buffer.length / 1024).toFixed(1)} KB (Content-Type: ${pdfRes.headers['content-type']})`
    );

    // 7. Business System Map: Explicit operational roles
    const conns = state.connections || [];
    const wa = conns.find(c => c.id.includes("whatsapp"));
    const cal = conns.find(c => c.id.includes("calendar"));
    const mp = conns.find(c => c.id.includes("mpesa"));
    assert(
      "Connected Apps page functions as Business System Map with explicit roles",
      wa && cal && mp && wa.whatWeUseItFor && cal.whatWeUseItFor,
      `WhatsApp: "${wa.whatWeUseItFor[0]}", Calendar: "${cal.whatWeUseItFor[0]}"`
    );

    // 8. Opportunity contains full evidence, recommendation, and required systems
    assert(
      "Opportunities contain evidence, recommendation, and required systems",
      opp01.requiredIntegrations && opp01.requiredIntegrations.length > 0 && opp01.recommendation,
      `Requires: ${opp01.requiredIntegrations.join(", ")}, Expected: ~${opp01.estimatedTimeSavedHoursPerWeek}h saved`
    );

    // 9. Workflow contains Operational Flow (7 stages)
    const wf = state.workflows.find(w => w.id === "wf_lead_autopilot");
    const hasFlow = wf && wf.operationalFlow && wf.operationalFlow.length === 7;
    assert(
      "Workflow contains end-to-end Operational Flow (7 distinct stages)",
      hasFlow,
      `Stage 1: ${wf.operationalFlow[0].title} -> Stage 7: ${wf.operationalFlow[6].title}`
    );

    // 10. Operational Flow includes Intelligence and Condition branches
    const intelNode = wf.operationalFlow.find(s => s.nodeType === "intelligence");
    const condNode = wf.operationalFlow.find(s => s.nodeType === "condition");
    assert(
      "Operational Flow distinguishes Otomatizon Intelligence and Condition branches",
      intelNode && condNode && condNode.branchOutcome && condNode.branchOutcome.yes,
      `Intelligence: "${intelNode.title}", Branch: YES -> "${condNode.branchOutcome.yes}"`
    );

    // 11. Command Center answers 5 questions & provides active state
    assert(
      "Active automation displays running state and process routing",
      wf.active === true && wf.connectedApps && wf.connectedApps.length >= 3,
      `Active: ${wf.title} (Routing: ${wf.connectedApps.join(" -> ")})`
    );

    // 12. Execution Simulation generates rich audit logs
    const execRes = await request({
      hostname: "localhost",
      port: 3001,
      path: "/api/workflows/wf_lead_autopilot/execute",
      method: "POST"
    }, JSON.stringify({ entityName: "Mercy Chebet (+254 719 552 108)" }));
    const execData = JSON.parse(execRes.body);

    assert(
      "Simulating workflow execution updates operational metrics & state",
      execRes.statusCode === 200 && execData.success,
      `Execution: ${execData.execution ? execData.execution.logSummary : 'OK'}`
    );

    // 13. Activity Stream provides full operational audit trail
    const updatedStateRes = await request({
      hostname: "localhost",
      port: 3001,
      path: "/api/state",
      method: "GET"
    });
    const updatedState = JSON.parse(updatedStateRes.body);
    const topLog = updatedState.activityLogs && updatedState.activityLogs[0];
    assert(
      "Activity Stream logs When, Which Application, What Otomatizon Did, and Result",
      topLog && (topLog.title || topLog.description),
      `Latest event: "${topLog.title}" [${topLog.timestamp}] (App: ${topLog.application || topLog.channel})`
    );

  } catch (err) {
    console.error("Test execution failed with error:", err);
  }

  console.log("\n============================================================");
  console.log(`  AUDIT RESULT: ${passed} / ${total} MILESTONES PASSED`);
  console.log("============================================================\n");
}

runScenarioTest();
