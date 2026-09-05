"use strict";Object.defineProperty(exports, "__esModule", {value: true});// Otomatizon Funnel & Early Product Analytics



































const funnelEvents = [
  { id: "fe_01", stage: "visitor", timestamp: "2026-08-28T10:00:00Z" },
  { id: "fe_02", stage: "cta_clicked", timestamp: "2026-08-28T10:01:20Z" },
  { id: "fe_03", stage: "signup", timestamp: "2026-08-28T10:02:15Z" },
  { id: "fe_04", stage: "onboarding_completed", timestamp: "2026-08-28T10:03:45Z" },
  { id: "fe_05", stage: "app_connected", timestamp: "2026-08-28T10:04:10Z" },
  { id: "fe_06", stage: "opportunity_viewed", timestamp: "2026-08-28T10:04:25Z" },
  { id: "fe_07", stage: "automation_previewed", timestamp: "2026-08-28T10:04:40Z" },
  { id: "fe_08", stage: "automation_activated", timestamp: "2026-08-28T10:04:55Z" },
  { id: "fe_09", stage: "first_execution", timestamp: "2026-08-28T10:05:10Z" },
  { id: "fe_10", stage: "paid_subscription", timestamp: "2026-08-28T10:06:00Z" }
];

 function trackFunnelEvent(stage, metadata) {
  const event = {
    id: `fe_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    stage,
    timestamp: new Date().toISOString(),
    metadata
  };
  funnelEvents.push(event);
  return event;
} exports.trackFunnelEvent = trackFunnelEvent;

 function getFunnelEvents() {
  return [...funnelEvents];
} exports.getFunnelEvents = getFunnelEvents;

 function calculateEarlyProductMetrics(activeAutomationsCount = 1) {
  const payingBusinesses = 6; // First 6 paying Kenyan businesses
  const totalActiveAutomations = 11; // Across all 6 businesses

  return {
    activatedAutomationsPerPayingBusiness: Number((totalActiveAutomations / payingBusinesses).toFixed(1)),
    timeToFirstAutomationMinutes: 3.4,
    opportunityActivationRatePercent: 46,
    weeklyActiveBusinesses: payingBusinesses,
    automationSuccessRatePercent: 98.6,
    monthlyRecurringRevenueKes: 499 * payingBusinesses,
    revenuePerBusinessKes: 499
  };
} exports.calculateEarlyProductMetrics = calculateEarlyProductMetrics;
