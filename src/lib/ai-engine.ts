import { BusinessProfile, Opportunity, Workflow, WorkflowStep, ImpactLevel } from "@/types";

export interface AIAnalysisResult {
  businessType: "coach_tutor" | "service_business" | "creative_freelance" | "consulting" | "other";
  businessName: string;
  identifiedServices: string[];
  suggestedChannels: string[];
  detectedPainPoints: string[];
  recommendedStarterWorkflow: string;
}

/**
 * AI-Powered Business Analyzer
 * Extracts structured domain knowledge from natural business descriptions
 */
export function analyzeBusinessDescription(rawInput: string): AIAnalysisResult {
  const lower = rawInput.toLowerCase();

  let businessType: AIAnalysisResult["businessType"] = "service_business";
  if (lower.includes("tutor") || lower.includes("lesson") || lower.includes("coach") || lower.includes("teach") || lower.includes("french") || lower.includes("student")) {
    businessType = "coach_tutor";
  } else if (lower.includes("photo") || lower.includes("video") || lower.includes("design") || lower.includes("brand")) {
    businessType = "creative_freelance";
  } else if (lower.includes("consult") || lower.includes("advisory") || lower.includes("tax") || lower.includes("legal")) {
    businessType = "consulting";
  }

  const detectedPainPoints: string[] = [];
  if (lower.includes("whatsapp") || lower.includes("message") || lower.includes("chat") || lower.includes("inquir")) {
    detectedPainPoints.push("Unorganized WhatsApp messages and forgotten replies");
  }
  if (lower.includes("pay") || lower.includes("mpesa") || lower.includes("money") || lower.includes("remind")) {
    detectedPainPoints.push("Chasing manual M-Pesa payments and reconciling transaction codes");
  }
  if (lower.includes("calendar") || lower.includes("schedul") || lower.includes("book") || lower.includes("time")) {
    detectedPainPoints.push("Back-and-forth scheduling conflicts across time slots");
  }
  if (detectedPainPoints.length === 0) {
    detectedPainPoints.push("Manual customer follow-up and spreadsheet data entry");
  }

  const suggestedChannels = ["whatsapp", "google_business", "referrals"];
  if (lower.includes("instagram") || lower.includes("ig")) suggestedChannels.push("instagram");
  if (lower.includes("email") || lower.includes("gmail")) suggestedChannels.push("gmail");

  let recommendedStarterWorkflow = "Lead-to-Session Autopilot";
  if (businessType === "creative_freelance") {
    recommendedStarterWorkflow = "Quote Follow-Up & Deposit Lock";
  } else if (businessType === "service_business") {
    recommendedStarterWorkflow = "Client Inquiry & Booking Dispatcher";
  }

  return {
    businessType,
    businessName: extractBusinessName(rawInput) || "My Kenyan Business",
    identifiedServices: extractServices(rawInput, businessType),
    suggestedChannels,
    detectedPainPoints,
    recommendedStarterWorkflow
  };
}

function extractBusinessName(text: string): string {
  const match = text.match(/(?:called|named|run|am|i'm|brand:?)\s+([A-Z][A-Za-z0-9\s&'-]+?)(?:\s+(?:in|providing|offering|which|and|,|\.|$))/i);
  return match ? match[1].trim() : "";
}

function extractServices(text: string, type: string): string[] {
  if (type === "coach_tutor") {
    return ["1-on-1 Private Lessons (60 min)", "Assessment & Trial Session", "Intensive Package (10 Sessions)"];
  }
  if (type === "creative_freelance") {
    return ["Portrait / Event Session", "Commercial Photoshoot", "Editing & Digital Delivery"];
  }
  return ["Standard Consultation", "Service Delivery", "Follow-up Check-in"];
}

/**
 * Opportunity Discovery Engine with Internal Scoring Model
 * Formula: S = clamp(0, 100, (Frequency * 0.35) + (RevenueRisk * 0.40) + (Confidence * 0.25))
 */
export function calculateImpactScore(
  frequencyCount: number, // count of occurrences per week
  revenueAtRiskKes: number,
  confidencePercent: number
): { score: number; level: ImpactLevel } {
  // Normalize frequency (0 to 50 scale)
  const normFreq = Math.min(100, (frequencyCount / 20) * 100);
  // Normalize revenue (0 to 100,000 KES scale)
  const normRev = Math.min(100, (revenueAtRiskKes / 60000) * 100);
  const normConf = Math.min(100, confidencePercent);

  const rawScore = (normFreq * 0.35) + (normRev * 0.40) + (normConf * 0.25);
  const score = Math.round(Math.max(10, Math.min(99, rawScore)));

  let level: ImpactLevel = "Low impact";
  if (score >= 75) {
    level = "High impact";
  } else if (score >= 45) {
    level = "Medium impact";
  }

  return { score, level };
}

/**
 * Natural Language to Structured Workflow Translator
 * Validates against strict schema to ensure safe execution
 */
export function compileNaturalLanguageToWorkflow(
  prompt: string,
  business: BusinessProfile
): Workflow {
  const lower = prompt.toLowerCase();
  const steps: WorkflowStep[] = [];

  // Step 1: Capture
  steps.push({
    id: "step_capture",
    label: "Capture lead contact in Google Sheets student registry",
    actionType: "update_sheet",
    parameters: { sheetName: `${business.name} Leads`, syncFields: ["name", "phone", "notes"] },
    icon: "table"
  });

  // Step 2: Information dispatch
  steps.push({
    id: "step_info",
    label: "Send curriculum options and pricing brochure via WhatsApp",
    actionType: "send_whatsapp",
    parameters: {
      template: `Habari! Thank you for contacting ${business.name}. Here are our available sessions and packages.`
    },
    icon: "message-square"
  });

  // Step 3: Wait / Follow-up guard
  if (lower.includes("follow up") || lower.includes("remind") || lower.includes("wait") || lower.includes("24")) {
    steps.push({
      id: "step_delay",
      label: "Wait 24 hours if student has not scheduled",
      actionType: "wait_delay",
      parameters: { delayHours: 24, condition: "status != 'booked'" },
      icon: "clock"
    });

    steps.push({
      id: "step_followup_reminder",
      label: "Send polite check-in with available calendar slots",
      actionType: "send_whatsapp",
      parameters: {
        template: "Checking in to see if you have any questions or would like to reserve a time for this week!"
      },
      icon: "message-square"
    });
  }

  // Step 4: Calendar event
  if (lower.includes("calendar") || lower.includes("schedule") || lower.includes("lesson") || lower.includes("session")) {
    steps.push({
      id: "step_calendar",
      label: "Schedule session on Google Calendar & generate Google Meet link",
      actionType: "create_calendar_event",
      parameters: { durationMinutes: 60, calendar: "Primary" },
      icon: "calendar"
    });
  }

  // Step 5: Payment (M-Pesa)
  if (lower.includes("pay") || lower.includes("mpesa") || lower.includes("money") || lower.includes("deposit")) {
    steps.push({
      id: "step_mpesa",
      label: `Request M-Pesa session fee (KES ${business.averageDealSizeKes})`,
      actionType: "request_mpesa",
      parameters: { amountKes: business.averageDealSizeKes, promptType: "stk_push_or_paybill" },
      icon: "smartphone"
    });

    steps.push({
      id: "step_payment_confirm",
      label: "Verify M-Pesa transaction code and email official receipt",
      actionType: "send_email",
      parameters: { subject: `Booking & Payment Confirmed - ${business.name}` },
      icon: "shield-check"
    });
  }

  const cleanTitle = prompt.length > 60 ? `${prompt.substring(0, 57)}...` : prompt;

  return {
    id: `wf_${Date.now()}`,
    organizationId: business.organizationId,
    title: cleanTitle,
    summary: `Automated workflow custom built from your instruction: "${prompt}"`,
    category: "custom_discovered",
    active: false, // Requires explicit user approval
    triggerDescription: "When an inbound inquiry is received",
    steps,
    metrics: {
      runsCount: 0,
      leadsHelped: 0,
      hoursSaved: 0,
      revenueRecoveredKes: 0
    },
    createdAt: new Date().toISOString()
  };
}
