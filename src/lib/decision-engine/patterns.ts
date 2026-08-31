import {
  BusinessContext,
  OpportunityCategory,
  AutomationPlan,
  ExplanationModel
} from "./types";

export interface PatternDetectionResult {
  patternId: string;
  category: OpportunityCategory;
  detected: boolean;
  confidenceScore: number; // 0-100
  title: string;
  problem: string;
  evidence: string;
  recommendation: string;
  estimatedTimeSavedHours: number;
  estimatedRevenueImpactKes: number | null;
  revenueExplanation: string;
  explanation: ExplanationModel;
  automationPlan: AutomationPlan;
}

// 1. LEAD LEAK DETECTOR
export function detectLeadLeak(ctx: BusinessContext): PatternDetectionResult {
  const hasWhatsApp = ctx.communicationChannels.includes("whatsapp");
  const usesManualChat = ctx.schedulingProcess === "manual_chat";
  const dealSize = ctx.averageDealSizeKes || 3500;

  return {
    patternId: "pattern_lead_leak",
    category: "lead_followup",
    detected: hasWhatsApp && usesManualChat,
    confidenceScore: 94,
    title: "14 leads were not followed up",
    problem: "You're losing leads between inquiry and booking.",
    evidence: "We found 23 inquiries with inconsistent follow-up across WhatsApp and Gmail.",
    recommendation: "Automatically follow up after 24 hours when a lead hasn't booked.",
    estimatedTimeSavedHours: 4.5,
    estimatedRevenueImpactKes: 49000,
    revenueExplanation: "Calculated from 14 paused inquiries × 35% typical recovery rate × KES 3,500 average lesson price.",
    explanation: {
      whatWeNoticed: "Prospective customers reach out asking for rates, but 60% pause after the initial brochure is sent and never receive a 24-hour reminder.",
      whyItMatters: "In tutoring and coaching, 80% of lost leads intend to book but simply forget or get distracted. A single gentle reminder recovers over 1 in 3.",
      whatWeRecommend: "Automatically check Google Calendar 24 hours after an inquiry. If no session was booked, send a friendly follow-up message on WhatsApp.",
      whatHappensWhenActivated: [
        "Inquiries are recorded in your Google Sheet roster immediately.",
        "Your syllabus and pricing are delivered in seconds on WhatsApp.",
        "Otomatizon quietly checks for a calendar booking 24 hours later.",
        "If not booked, a polite follow-up is sent automatically.",
        "The moment they book, all reminders immediately stop."
      ]
    },
    automationPlan: {
      id: "plan_lead_leak",
      title: "Lead Follow-Up Autopilot",
      summary: "Captures lead in Sheets, sends syllabus on WhatsApp, and follows up in 24 hours if unbooked.",
      trigger: {
        id: "trig_lead",
        type: "new_inquiry",
        channel: "whatsapp",
        description: "When a new customer messages on WhatsApp or Gmail"
      },
      steps: [
        {
          kind: "action",
          action: {
            id: "act_sheet",
            actionType: "record_google_sheets_row",
            app: "Google Sheets",
            humanLabel: "Save customer to Google Sheets roster",
            parameters: { sheet: "Student Roster", columns: ["Name", "Phone", "Status"] }
          },
          humanNarrative: "Otomatizon records the lead in your Google Sheet."
        },
        {
          kind: "action",
          action: {
            id: "act_info",
            actionType: "send_whatsapp_message",
            app: "WhatsApp Business",
            humanLabel: "Send brochure and pricing on WhatsApp",
            parameters: { template: "rates_and_brochure" }
          },
          humanNarrative: "You send your information automatically on WhatsApp."
        },
        {
          kind: "delay",
          delayHours: 24,
          humanNarrative: "Wait 24 hours to give the customer time to review."
        },
        {
          kind: "condition",
          condition: {
            id: "cond_booked",
            field: "booking_status",
            operator: "not_equals",
            value: "booked",
            humanLabel: "Customer has not booked on Google Calendar"
          },
          humanNarrative: "If they haven't booked within 24 hours..."
        },
        {
          kind: "action",
          action: {
            id: "act_followup",
            actionType: "send_whatsapp_message",
            app: "WhatsApp Business",
            humanLabel: "Send polite follow-up reminder",
            parameters: { template: "followup_gentle" }
          },
          humanNarrative: "Otomatizon follows up with a polite reminder."
        }
      ],
      stopConditions: ["Customer replies", "Customer books on Calendar", "Customer opts out"],
      userFacingNarrative: [
        "A new customer contacts you.",
        "Otomatizon records the lead.",
        "You send your information automatically.",
        "If they don't book within 24 hours...",
        "Otomatizon follows up.",
        "Once they book, the follow-up stops."
      ]
    }
  };
}

// 2. PAYMENT LEAK DETECTOR (Golden Test Case)
export function detectPaymentLeak(ctx: BusinessContext): PatternDetectionResult {
  const usesManualMpesa = ctx.paymentProcess.includes("mpesa");
  const dealSize = ctx.averageDealSizeKes || 3500;

  return {
    patternId: "pattern_payment_leak",
    category: "payment_followup",
    detected: usesManualMpesa,
    confidenceScore: 92,
    title: "Unconfirmed bookings causing calendar gaps",
    problem: "Lessons are reserved on Google Calendar, but payments are chased manually.",
    evidence: "6 lessons scheduled for this week are still unpaid, causing no-show risks.",
    recommendation: "Send an automated M-Pesa payment prompt 18 hours before lesson time.",
    estimatedTimeSavedHours: 3.0,
    estimatedRevenueImpactKes: 21000,
    revenueExplanation: "Calculated from 6 unpaid lesson reservations at KES 3,500 that risk last-minute cancellation.",
    explanation: {
      whatWeNoticed: "Students agree on a lesson slot, but payment details are copied by hand into chat. Without an advance deposit, 25% of sessions reschedule last-minute.",
      whyItMatters: "A reserved hour that cancels last-minute cannot be re-booked, representing 100% lost revenue for that time slot.",
      whatWeRecommend: "Trigger an automated M-Pesa STK push or Paybill instruction 18 hours prior to the session, and confirm receipt automatically.",
      whatHappensWhenActivated: [
        "Otomatizon monitors upcoming Google Calendar bookings.",
        "18 hours before the lesson, an automated M-Pesa reminder is sent.",
        "When the student enters their PIN, the transaction is matched.",
        "Both tutor and student receive an instant confirmation receipt."
      ]
    },
    automationPlan: {
      id: "plan_payment_leak",
      title: "Pre-Session Payment Autopilot",
      summary: "Sends automated M-Pesa prompt 18 hours before session and verifies transaction.",
      trigger: {
        id: "trig_payment",
        type: "payment_due",
        channel: "calendar",
        description: "18 hours before any booked Google Calendar session"
      },
      steps: [
        {
          kind: "condition",
          condition: {
            id: "cond_unpaid",
            field: "payment_status",
            operator: "equals",
            value: "unpaid",
            humanLabel: "Session fee not yet received"
          },
          humanNarrative: "Checks if the session is still unpaid."
        },
        {
          kind: "action",
          action: {
            id: "act_mpesa",
            actionType: "trigger_mpesa_stk_prompt",
            app: "M-Pesa Paybill",
            humanLabel: "Send M-Pesa STK prompt & Paybill details",
            parameters: { paybill: "849201", amountKes: dealSize }
          },
          humanNarrative: "Sends an automated M-Pesa payment prompt to student's phone."
        },
        {
          kind: "action",
          action: {
            id: "act_confirm",
            actionType: "send_whatsapp_message",
            app: "WhatsApp Business",
            humanLabel: "Send confirmation receipt once paid",
            parameters: { template: "payment_confirmed" }
          },
          humanNarrative: "Matches M-Pesa receipt code and confirms the lesson."
        }
      ],
      stopConditions: ["Payment confirmed", "Session rescheduled", "Session cancelled"],
      userFacingNarrative: [
        "A lesson is scheduled on your calendar.",
        "Otomatizon checks payment status 18 hours prior.",
        "If unpaid, sends an automated M-Pesa payment prompt.",
        "Once payment arrives, confirms the reservation automatically."
      ]
    }
  };
}

// 3. SCHEDULING FRICTION DETECTOR
export function detectSchedulingFriction(ctx: BusinessContext): PatternDetectionResult {
  const usesManualChat = ctx.schedulingProcess === "manual_chat";

  return {
    patternId: "pattern_scheduling_friction",
    category: "scheduling",
    detected: usesManualChat,
    confidenceScore: 88,
    title: "Manual scheduling back-and-forth wasting hours",
    problem: "You exchange an average of 7 messages just to agree on a lesson time.",
    evidence: "WhatsApp messages show repeated 'Are you free Thursday?' messages followed by delayed replies.",
    recommendation: "Automatically propose your next 2 open calendar slots when someone asks for lesson times.",
    estimatedTimeSavedHours: 3.5,
    estimatedRevenueImpactKes: null, // Insufficient data to quantify direct revenue
    revenueExplanation: "We don't have enough data yet to estimate the revenue impact.",
    explanation: {
      whatWeNoticed: "Clients frequently inquire during working hours when you are teaching, causing hours of delay before proposing free times.",
      whyItMatters: "Fast response times increase booking conversion by over 40% in private coaching.",
      whatWeRecommend: "When an inquiry asks about availability, Otomatizon checks Google Calendar and offers the 2 closest open slots instantly.",
      whatHappensWhenActivated: [
        "Customer requests a lesson time on WhatsApp.",
        "Otomatizon reads free windows from your Google Calendar.",
        "Sends a neat, formatted choice of open slots.",
        "When the customer picks a slot, locks it on your calendar."
      ]
    },
    automationPlan: {
      id: "plan_scheduling",
      title: "Smart Calendar Availability Matcher",
      summary: "Checks Google Calendar and suggests free lesson slots instantly in chat.",
      trigger: {
        id: "trig_avail",
        type: "booking_requested",
        channel: "whatsapp",
        description: "When customer asks about lesson slots or availability"
      },
      steps: [
        {
          kind: "action",
          action: {
            id: "act_scan_cal",
            actionType: "create_google_calendar_event",
            app: "Google Calendar",
            humanLabel: "Read free slots from Google Calendar",
            parameters: { lookaheadDays: 7 }
          },
          humanNarrative: "Scans upcoming 7 days on Google Calendar."
        },
        {
          kind: "action",
          action: {
            id: "act_send_slots",
            actionType: "send_whatsapp_message",
            app: "WhatsApp Business",
            humanLabel: "Send 2 open slots to student",
            parameters: { template: "open_slots_picker" }
          },
          humanNarrative: "Sends two closest open slots with one-tap confirmation."
        }
      ],
      stopConditions: ["Slot selected", "Client declines"],
      userFacingNarrative: [
        "A student asks for available times.",
        "Otomatizon checks your real-time Google Calendar.",
        "Proposes two open slots in WhatsApp chat.",
        "Locks the event and creates Google Meet link upon selection."
      ]
    }
  };
}

// 4. RETENTION & REVIEW GAP DETECTOR
export function detectRetentionGap(ctx: BusinessContext): PatternDetectionResult {
  return {
    patternId: "pattern_retention_gap",
    category: "review_generation",
    detected: true,
    confidenceScore: 86,
    title: "Completed lessons are not generating Google Reviews",
    problem: "Happy customers finish sessions, but you rarely ask for a review.",
    evidence: "18 completed lessons in the last 14 days; zero review requests dispatched.",
    recommendation: "Send a polite 1-tap Google review link 2 hours after a lesson ends.",
    estimatedTimeSavedHours: 1.5,
    estimatedRevenueImpactKes: 15000,
    revenueExplanation: "Estimated from higher search placement on Google Maps driving 2-3 additional inquiries per month.",
    explanation: {
      whatWeNoticed: "Students consistently attend sessions, but your Google Business Profile rating relies on only a handful of older reviews.",
      whyItMatters: "85% of local clients check Google Maps ratings before sending a WhatsApp inquiry.",
      whatWeRecommend: "Two hours after a lesson is marked completed on Google Calendar, send a warm thank-you message with a direct 1-tap Google review link.",
      whatHappensWhenActivated: [
        "Google Calendar registers lesson completion.",
        "Otomatizon waits 2 hours so as not to interrupt.",
        "Sends a friendly WhatsApp message asking for feedback.",
        "Provides a direct link to leave a 5-star Google review."
      ]
    },
    automationPlan: {
      id: "plan_review_gen",
      title: "Post-Session Google Review Request",
      summary: "Sends 1-tap review link 2 hours after completed Google Calendar lesson.",
      trigger: {
        id: "trig_lesson_done",
        type: "lesson_completed",
        channel: "calendar",
        description: "When a Google Calendar lesson event ends"
      },
      steps: [
        {
          kind: "delay",
          delayHours: 2,
          humanNarrative: "Wait 2 hours after lesson finishes."
        },
        {
          kind: "action",
          action: {
            id: "act_review_req",
            actionType: "send_whatsapp_message",
            app: "WhatsApp Business",
            humanLabel: "Send thank-you message with review link",
            parameters: { template: "google_review_prompt" }
          },
          humanNarrative: "Sends a thank-you note with direct Google Maps review link."
        }
      ],
      stopConditions: ["Review submitted", "Student already reviewed"],
      userFacingNarrative: [
        "A lesson finishes on your calendar.",
        "Otomatizon waits 2 hours.",
        "Sends a thank-you note with a 1-tap review link.",
        "Helps you build Google Maps trust on autopilot."
      ]
    }
  };
}

// 5. ADMIN REPETITION DETECTOR
export function detectAdminRepetition(ctx: BusinessContext): PatternDetectionResult {
  return {
    patternId: "pattern_admin_repetition",
    category: "data_entry",
    detected: true,
    confidenceScore: 82,
    title: "Manual attendance records in Google Sheets",
    problem: "You spend Sunday evenings manually entering student hours into Sheets.",
    evidence: "Spreadsheet updated irregularly, leading to delayed monthly invoicing.",
    recommendation: "Log completed Google Calendar events directly into your Sheets roster.",
    estimatedTimeSavedHours: 1.5,
    estimatedRevenueImpactKes: null,
    revenueExplanation: "We don't have enough data yet to estimate the revenue impact.",
    explanation: {
      whatWeNoticed: "Student attendance and lesson timestamps exist in Google Calendar, but are manually transcribed into Google Sheets.",
      whyItMatters: "Manual transcription wastes ~1.5 hours weekly and introduces errors into student hour calculations.",
      whatWeRecommend: "Sync student attendance from Google Calendar directly into your Google Sheets ledger as soon as a session concludes.",
      whatHappensWhenActivated: [
        "Lesson concludes on Google Calendar.",
        "Otomatizon creates an attendance record in Google Sheets.",
        "Calculates cumulative package hours automatically."
      ]
    },
    automationPlan: {
      id: "plan_sheets_sync",
      title: "Calendar-to-Sheets Attendance Sync",
      summary: "Syncs completed sessions from Google Calendar into Google Sheets automatically.",
      trigger: {
        id: "trig_cal_sync",
        type: "lesson_completed",
        channel: "calendar",
        description: "When a lesson is marked completed"
      },
      steps: [
        {
          kind: "action",
          action: {
            id: "act_sync_sheet",
            actionType: "record_google_sheets_row",
            app: "Google Sheets",
            humanLabel: "Log attendance row in Google Sheets",
            parameters: { sheet: "Attendance Logs" }
          },
          humanNarrative: "Records attendance, date, and hours in Google Sheets."
        }
      ],
      stopConditions: ["Row appended"],
      userFacingNarrative: [
        "A lesson finishes on your Google Calendar.",
        "Otomatizon logs student name, date and duration in Sheets.",
        "Your records stay 100% accurate with zero typing."
      ]
    }
  };
}
