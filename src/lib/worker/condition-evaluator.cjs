/**
 * Otomatizon Anti-Spam Circuit Breaker & Condition Evaluator
 * Evaluates whether a scheduled follow-up or reminder is still necessary.
 */

function evaluateJobCondition(job, dbContext) {
  const { jobType, targetEntityName, targetPhone, payload } = job;
  const activityLogs = dbContext.activityLogs || [];
  const leads = dbContext.leads || [];

  // Check 1: Find lead in DB
  const matchingLead = leads.find(
    l => l.name?.toLowerCase() === targetEntityName?.toLowerCase() || l.phone === targetPhone
  );

  // Check 2: Check for any recent payment or booking confirmed for this person
  const hasPaidOrBooked = activityLogs.some(log => {
    const isTarget = (log.entityName && log.entityName.toLowerCase().includes(targetEntityName.toLowerCase())) ||
                     (log.description && log.description.toLowerCase().includes(targetEntityName.toLowerCase())) ||
                     (targetPhone && log.description && log.description.includes(targetPhone));
    const isPositiveOutcome = log.type === "booking_confirmed" || log.type === "payment_received" || log.type === "class_booked";
    return isTarget && isPositiveOutcome;
  });

  if (jobType === "follow_up_24h") {
    if (matchingLead && (matchingLead.status === "booked" || matchingLead.status === "paid")) {
      return {
        shouldExecute: false,
        circuitBroken: true,
        reason: `Student ${targetEntityName} already booked their lesson. Follow-up stopped to prevent duplicate messaging.`
      };
    }

    if (hasPaidOrBooked) {
      return {
        shouldExecute: false,
        circuitBroken: true,
        reason: `Verified M-Pesa payment or Google Calendar booking already found for ${targetEntityName}. Follow-up suppressed.`
      };
    }

    return {
      shouldExecute: true,
      circuitBroken: false,
      reason: `No lesson booking or payment detected for ${targetEntityName} within 24 hours. Automated follow-up required.`
    };
  }

  if (jobType === "payment_reminder_12h") {
    if (hasPaidOrBooked) {
      return {
        shouldExecute: false,
        circuitBroken: true,
        reason: `Tuition already settled by ${targetEntityName}. Payment reminder cancelled.`
      };
    }
    return {
      shouldExecute: true,
      circuitBroken: false,
      reason: `Tuition remains unpaid 12 hours before scheduled session for ${targetEntityName}.`
    };
  }

  return {
    shouldExecute: true,
    circuitBroken: false,
    reason: "Standard automation criteria satisfied."
  };
}

module.exports = {
  evaluateJobCondition
};
