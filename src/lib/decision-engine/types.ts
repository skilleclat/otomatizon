// Decision Engine Type Definitions & Schemas

export type OpportunityCategory =
  | "lead_followup"
  | "scheduling"
  | "payment_followup"
  | "customer_retention"
  | "review_generation"
  | "data_entry"
  | "communication"
  | "administrative_work";

export type ImpactLevel = "High" | "Medium" | "Low";
export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface BusinessContext {
  id: string;
  organizationId: string;
  businessType: string; // extensible string, e.g. "coach_tutor", "photography", "consulting"
  businessName: string;
  businessSize: "solo" | "small_team" | "growing_practice";
  location: string;
  city: string;
  country: string;
  services: string[];
  customerAcquisitionChannels: string[]; // e.g. ["whatsapp", "google_business", "referrals"]
  communicationChannels: string[]; // e.g. ["whatsapp", "gmail"]
  schedulingProcess: "manual_chat" | "calendar_link" | "hybrid" | "none";
  paymentProcess: "mpesa_manual" | "mpesa_paybill" | "bank_transfer" | "cash";
  retentionProcess: "manual_checkin" | "ad_hoc" | "none";
  toolsCurrentlyUsed: string[]; // e.g. ["whatsapp_business", "google_calendar", "google_sheets", "gmail"]
  manualTasksReported: string[];
  businessGoals: string[];
  averageDealSizeKes?: number;
  monthlyInquiriesEstimate?: number;
}

export interface BusinessUnderstanding {
  summary: string;
  detectedPainPoints: string[];
  primaryBottleneck: OpportunityCategory;
  automationReadinessScore: number; // 0-100
  connectedIntegrationsCoverage: number; // 0-100%
  inferredWeeklyHoursLost: number;
}

export interface WorkflowTriggerIR {
  id: string;
  type: "new_inquiry" | "booking_requested" | "lesson_completed" | "payment_due" | "scheduled_cron";
  channel: "whatsapp" | "gmail" | "calendar" | "mpesa" | "sheets" | "system";
  description: string;
  filterCriteria?: Record<string, any>;
}

export interface WorkflowConditionIR {
  id: string;
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "time_elapsed_hours" | "is_empty";
  value: any;
  humanLabel: string;
}

export interface WorkflowActionIR {
  id: string;
  actionType: 
    | "send_whatsapp_message"
    | "record_google_sheets_row"
    | "create_google_calendar_event"
    | "trigger_mpesa_stk_prompt"
    | "send_gmail_email"
    | "grant_google_drive_access";
  parameters: Record<string, any>;
  humanLabel: string;
  app: string;
}

export interface AutomationPlan {
  id: string;
  title: string;
  summary: string;
  trigger: WorkflowTriggerIR;
  steps: Array<{
    kind: "action" | "delay" | "condition";
    action?: WorkflowActionIR;
    delayHours?: number;
    condition?: WorkflowConditionIR;
    humanNarrative: string;
  }>;
  stopConditions: string[];
  userFacingNarrative: string[];
}

export interface ExplanationModel {
  whatWeNoticed: string;
  whyItMatters: string;
  whatWeRecommend: string;
  whatHappensWhenActivated: string[];
}

export interface OpportunityScoreResult {
  rawScore: number;
  normalizedScore: number; // 0-100
  impactLevel: ImpactLevel;
  confidenceLevel: ConfidenceLevel;
  confidenceScore: number; // 0-100
  frequencyFactor: number;
  automationFeasibility: number;
  explanation: string;
}

export interface OpportunityDecisionObject {
  id: string;
  organizationId: string;
  category: OpportunityCategory;
  title: string;
  description: string;
  evidence: string;
  impactScore: number;
  impactLevel: ImpactLevel;
  confidenceScore: number;
  confidenceLevel: ConfidenceLevel;
  effortScore: number; // 1 (effortless) to 5 (complex)
  estimatedTimeSavedHoursPerWeek: number;
  estimatedRevenueImpactKes: number | null; // null if insufficient data
  revenueExplanation: string;
  recommendation: string;
  explanation: ExplanationModel;
  automationPlan: AutomationPlan;
  status: "detected" | "previewed" | "activated" | "dismissed";
  createdAt: string;
}

export interface NaturalLanguageInterpretationResult {
  success: boolean;
  needsClarification: boolean;
  clarificationQuestion?: string;
  understoodText: string;
  category: OpportunityCategory;
  confidence: ConfidenceLevel;
  suggestedPlan?: AutomationPlan;
}

export interface DecisionAuditEvent {
  id: string;
  organizationId: string;
  eventType: 
    | "opportunity_shown"
    | "opportunity_ignored"
    | "opportunity_activated"
    | "automation_successful"
    | "automation_failed"
    | "automation_disabled"
    | "recommendation_edited"
    | "recommendation_rejected";
  targetId: string; // opportunityId or workflowId
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface MeasuredImpactMetrics {
  timeSavedHoursTotal: number;
  followUpsCompleted: number;
  leadsProcessed: number;
  bookingsGenerated: number;
  paymentRemindersSent: number;
  successfulPaymentsCollectedKes: number;
  repeatBookingsCount: number;
}
