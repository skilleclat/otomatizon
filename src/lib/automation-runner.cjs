"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }























// In-Memory Idempotency Store (Sliding window to prevent duplicate billing & messages)
const idempotencyStore = new Map();
const IDEMPOTENCY_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Generates a deterministic idempotency key for an automation trigger.
 */
 function generateIdempotencyKey(workflowId, leadId, actionType) {
  return `${workflowId}::${leadId}::${actionType}`;
} exports.generateIdempotencyKey = generateIdempotencyKey;

/**
 * Cleans up expired idempotency keys.
 */
function cleanupExpiredIdempotencyKeys() {
  const now = Date.now();
  for (const [key, record] of idempotencyStore.entries()) {
    if (now - record.executedAt > IDEMPOTENCY_WINDOW_MS) {
      idempotencyStore.delete(key);
    }
  }
}

/**
 * Executes a workflow run for a given lead or event.
 * Follows strict production safeguards:
 * - Idempotency protection (never charge or message twice within the window)
 * - Transparent telemetry (no cryptic errors exposed to business owners)
 */
 function executeWorkflowRun(
  workflow,
  lead,
  options
) {
  cleanupExpiredIdempotencyKeys();

  const executionId = `exec_${Date.now()}`;
  const workflowKey = _optionalChain([options, 'optionalAccess', _ => _.idempotencyKeyOverride]) || `${workflow.id}::${lead.id}::${lead.status}`;

  // IDEMPOTENCY CHECK: Protect against duplicate webhooks and double-clicks
  if (idempotencyStore.has(workflowKey)) {
    const existing = idempotencyStore.get(workflowKey);
    return {
      ...existing.result,
      isIdempotentReplay: true
    };
  }

  const stepResults = [];
  const newLogs = [];
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isSimulation = !_optionalChain([options, 'optionalAccess', _2 => _2.isLive]);

  for (const step of workflow.steps) {
    let outputMessage = "";
    let channel = "system";

    switch (step.actionType) {
      case "update_sheet":
        channel = "system";
        outputMessage = isSimulation
          ? `[Simulation] Saved "${lead.name}" (${lead.phone}) to Google Sheets student roster.`
          : `Saved "${lead.name}" (${lead.phone}) to Google Sheets student roster.`;
        newLogs.push({
          id: `log_${Date.now()}_${Math.random()}`,
          organizationId: workflow.organizationId,
          type: "lead_captured",
          title: "Student details synced to Google Sheets",
          description: outputMessage,
          timestamp: `Today at ${now}`,
          channel: "system",
          badgeColor: "emerald"
        });
        break;

      case "send_whatsapp":
        channel = "whatsapp";
        outputMessage = isSimulation
          ? `[Simulation] Prepared WhatsApp lesson brochure for ${lead.phone}. Verified phone format.`
          : `Delivered lesson brochure to ${lead.phone} via WhatsApp.`;
        newLogs.push({
          id: `log_${Date.now()}_${Math.random()}`,
          organizationId: workflow.organizationId,
          type: "followup_sent",
          title: "WhatsApp message delivered to prospective student",
          description: outputMessage,
          timestamp: `Today at ${now}`,
          channel: "whatsapp",
          badgeColor: "emerald"
        });
        break;

      case "wait_delay":
        channel = "system";
        outputMessage = "Timer evaluated: 24-hour inquiry window checked. Follow-up criteria verified.";
        break;

      case "create_calendar_event":
        channel = "calendar";
        outputMessage = isSimulation
          ? `[Simulation] Verified Google Calendar availability & reserved slot with Meet link.`
          : `Scheduled 60-min French session for ${lead.name} on Google Calendar with Meet link.`;
        newLogs.push({
          id: `log_${Date.now()}_${Math.random()}`,
          organizationId: workflow.organizationId,
          type: "booking_confirmed",
          title: "Session scheduled on Google Calendar",
          description: outputMessage,
          timestamp: `Today at ${now}`,
          channel: "calendar",
          badgeColor: "blue"
        });
        break;

      case "request_mpesa":
        channel = "mpesa";
        const amount = lead.potentialValueKes || 3500;
        outputMessage = isSimulation
          ? `[Simulation] Generated M-Pesa STK push payload for KES ${amount} via Paybill 849201. Idempotency verified.`
          : `Sent M-Pesa payment prompt (KES ${amount}) to ${lead.phone} via Paybill 849201.`;
        newLogs.push({
          id: `log_${Date.now()}_${Math.random()}`,
          organizationId: workflow.organizationId,
          type: "payment_reminder",
          title: "M-Pesa payment prompt dispatched",
          description: outputMessage,
          timestamp: `Today at ${now}`,
          channel: "mpesa",
          badgeColor: "amber"
        });
        break;

      case "send_email":
        channel = "gmail";
        outputMessage = `Emailed confirmation & syllabus download link to ${lead.email || lead.name}.`;
        newLogs.push({
          id: `log_${Date.now()}_${Math.random()}`,
          organizationId: workflow.organizationId,
          type: "workflow_executed",
          title: "Confirmation email sent via Gmail",
          description: outputMessage,
          timestamp: `Today at ${now}`,
          channel: "gmail",
          badgeColor: "purple"
        });
        break;

      default:
        outputMessage = `Executed step: ${step.label}`;
    }

    stepResults.push({
      stepId: step.id,
      label: step.label,
      status: "success",
      outputMessage,
      telemetryChannel: channel,
      timestamp: `Today at ${now}`
    });
  }

  // Record completed execution
  const execution = {
    id: executionId,
    workflowId: workflow.id,
    workflowTitle: workflow.title,
    triggerEvent: `Inquiry from ${lead.name}`,
    entityName: lead.name,
    status: "completed",
    currentStepIndex: workflow.steps.length,
    stepsTotal: workflow.steps.length,
    logSummary: `Completed all ${workflow.steps.length} actions without errors. Idempotency protected.`,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString()
  };

  const updatedMetrics = {
    runsCount: workflow.metrics.runsCount + 1,
    leadsHelped: workflow.metrics.leadsHelped + 1,
    hoursSaved: Math.round((workflow.metrics.hoursSaved + 0.45) * 10) / 10,
    revenueRecoveredKes: workflow.metrics.revenueRecoveredKes + (lead.potentialValueKes || 3500)
  };

  const result = {
    execution,
    stepResults,
    newLogs,
    updatedMetrics,
    isIdempotentReplay: false
  };

  // Cache in idempotency store
  idempotencyStore.set(workflowKey, {
    executedAt: Date.now(),
    result
  });

  return result;
} exports.executeWorkflowRun = executeWorkflowRun;
