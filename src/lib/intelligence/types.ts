export type InboundIntent = 
  | "booking_request"
  | "pricing_query"
  | "course_inquiry"
  | "payment_confirmation"
  | "cancellation"
  | "general_faq";

export type InboundLanguage = "fr" | "en" | "sw" | "mixed";

export interface ExtractedEntities {
  studentName?: string;
  contactName?: string;
  phone?: string;
  subject?: string;
  level?: string;
  requestedDay?: string;
  requestedTime?: string;
  targetExam?: string;
  budgetMentionedKes?: number;
  paymentReceipt?: string;
}

export interface SemanticAnalysisResult {
  rawMessage: string;
  detectedLanguage: InboundLanguage;
  intent: InboundIntent;
  confidenceScore: number;
  urgency: "high" | "normal" | "low";
  entities: ExtractedEntities;
  sentiment: "positive" | "neutral" | "urgent";
  suggestedAction: {
    actionType: "deliver_brochure" | "offer_calendar_slots" | "confirm_payment" | "escalate_to_owner";
    title: string;
    description: string;
  };
  draftedReply: string;
  googleSheetsRow: Record<string, any>;
  suggestedCalendarEvent?: {
    summary: string;
    description: string;
    proposedSlot?: string;
  };
}
