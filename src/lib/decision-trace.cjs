const defaultPipelineTraces = [
  {
    stepNumber: 1,
    stageName: "Inbound Inquiry Captured",
    application: "WhatsApp Business",
    appIconKey: "whatsapp",
    event: "Incoming message received on WhatsApp Business API",
    action: "Ingest webhook payload & verify HMAC signature",
    status: "COMPLETED",
    timestamp: "10:42:10 AM",
    latencyMs: 38,
    trace: {
      detected: "Incoming text: 'Hi James, I need Mathematics CBC coaching for my son in Grade 8. Are you available on Saturday mornings around 10am? How much do you charge per lesson?'",
      understood: {
        intent: "booking_request",
        confidence: 98,
        entities: {
          studentName: "Dr. Patrick Mbugua",
          subject: "Mathematics CBC Coaching",
          level: "Primary / Junior Secondary (CBC Grade 8)",
          requestedSlot: "Saturday 10:00 AM",
          budgetKes: 3500
        }
      },
      decision: "Route message directly to Semantic NLP Parser for automated syllabus delivery & slot verification.",
      reasoning: "Parent explicitly asked for subject, level, availability on Saturday morning, and pricing. Immediate automated response increases conversion by 65%.",
      nextAction: "Otomatizon Intelligence → Parse multilingual intent & calculate confidence score.",
      verification: {
        idempotencyToken: "idemp_msg_10293847_sig_882",
        status: "SUCCESS",
        businessOutcome: "Customer lead captured without manual data entry."
      }
    }
  },
  {
    stepNumber: 2,
    stageName: "Semantic Understanding & NLP",
    application: "Otomatizon Intelligence",
    appIconKey: "otomatizon",
    event: "Multilingual semantic parser processed customer intent",
    action: "Extract subject, CBC grade level, time slot and fee tier",
    status: "COMPLETED",
    timestamp: "10:42:11 AM",
    latencyMs: 44,
    trace: {
      detected: "Raw customer query analyzed in English with CBC terminology.",
      understood: {
        intent: "booking_request",
        confidence: 98,
        entities: {
          studentName: "Dr. Patrick Mbugua",
          subject: "Mathematics CBC",
          level: "CBC Grade 8",
          requestedSlot: "Saturday 10:00 AM",
          budgetKes: 3500
        }
      },
      decision: "Draft personalized reply quoting standard KES 3,500 rate and initiate Google Calendar availability check for Saturday 10am.",
      reasoning: "Confidence is 98% (well above the 85% automation threshold). No human escalation required.",
      nextAction: "Google Sheets → Append structured lead record to Active Roster.",
      verification: {
        idempotencyToken: "idemp_nlp_eval_99812",
        status: "VERIFIED",
        businessOutcome: "Personalized syllabus payload generated in 44ms."
      }
    }
  },
  {
    stepNumber: 3,
    stageName: "Lead Roster Updated",
    application: "Google Sheets",
    appIconKey: "sheets",
    event: "Active Students roster synchronized",
    action: "Append row with date, student name, CBC level and status INQUIRY_CAPTURED",
    status: "COMPLETED",
    timestamp: "10:42:12 AM",
    latencyMs: 72,
    trace: {
      detected: "Lead record formatted for Google Sheets API.",
      understood: {
        intent: "roster_append",
        confidence: 100,
        entities: {
          studentName: "Dr. Patrick Mbugua",
          subject: "Mathematics Coaching (CBC)",
          budgetKes: 3500
        }
      },
      decision: "Insert row into '2026 Active Inquiries' tab without touching existing student records.",
      reasoning: "Ensures the tutor maintains a complete audit trail of all prospective students in Google Sheets.",
      nextAction: "Google Calendar → Query availability on Saturday 10:00 AM.",
      verification: {
        idempotencyToken: "idemp_sheets_row_18829",
        status: "SUCCESS",
        businessOutcome: "Row appended at row #142 in 'Active Inquiries' spreadsheet."
      }
    }
  },
  {
    stepNumber: 4,
    stageName: "Availability Verified",
    application: "Google Calendar",
    appIconKey: "calendar",
    event: "Calendar schedule checked for requested slot",
    action: "Verify 10:00 AM - 11:30 AM Saturday free & place tentative hold",
    status: "COMPLETED",
    timestamp: "10:42:13 AM",
    latencyMs: 56,
    trace: {
      detected: "Google Calendar API free/busy query for Saturday 10:00 AM.",
      understood: {
        intent: "calendar_check",
        confidence: 100,
        entities: {
          requestedSlot: "Saturday 10:00 AM"
        }
      },
      decision: "Confirm Saturday 10am slot is 100% free with zero schedule conflict.",
      reasoning: "Tutor has no conflicting appointments on Google Calendar at that time.",
      nextAction: "Otomatizon Decision Engine → Generate Google Meet lesson link and formulate final WhatsApp message.",
      verification: {
        idempotencyToken: "idemp_cal_freebusy_7719",
        status: "VERIFIED",
        businessOutcome: "Slot validated & Google Meet link (meet.google.com/otz-math-cbc) reserved."
      }
    }
  },
  {
    stepNumber: 5,
    stageName: "Personalized Response Delivered",
    application: "WhatsApp Business",
    appIconKey: "whatsapp",
    event: "Outbound WhatsApp message delivered to customer",
    action: "Send personalized brochure, rate notice (KES 3,500) and Google Calendar booking link",
    status: "COMPLETED",
    timestamp: "10:42:14 AM",
    latencyMs: 65,
    trace: {
      detected: "Customer phone +254 722 998 811 ready to receive outbound reply.",
      understood: {
        intent: "outbound_dispatch",
        confidence: 100,
        entities: {
          studentName: "Dr. Patrick Mbugua"
        }
      },
      decision: "Dispatch WhatsApp message with syllabus brochure and 1-click booking link.",
      reasoning: "Immediate response while the parent is still actively looking at WhatsApp maximizes conversion.",
      nextAction: "Worker Scheduler → Schedule +24h follow-up job with circuit breaker.",
      verification: {
        idempotencyToken: "idemp_wamid_HBgL1788078952340",
        status: "SUCCESS",
        businessOutcome: "Delivered to recipient with status 'delivered' (Message ID: wamid.HBgL1788078952340)."
      }
    }
  },
  {
    stepNumber: 6,
    stageName: "24h Follow-up & Anti-Spam Monitor",
    application: "Otomatizon Worker",
    appIconKey: "otomatizon",
    event: "Delayed task scheduled with real-time circuit breaker",
    action: "Monitor student booking or M-Pesa payment for 24 hours",
    status: "WAITING",
    timestamp: "10:42:15 AM",
    latencyMs: 15,
    trace: {
      detected: "Follow-up job scheduled for 24 hours from now (Tomorrow at 10:42 AM).",
      understood: {
        intent: "scheduled_monitoring",
        confidence: 100,
        entities: {
          studentName: "Dr. Patrick Mbugua",
          requestedSlot: "Saturday 10:00 AM"
        }
      },
      decision: "Arm anti-spam circuit breaker. If student books Google Meet or sends M-Pesa tuition payment, cancel follow-up automatically.",
      reasoning: "Prevents duplicate or annoying messages to students who have already converted.",
      nextAction: "Standby in persistent queue in data/otomatizon_db.json.",
      verification: {
        idempotencyToken: "idemp_job_1788078952351",
        status: "ACTIVE",
        businessOutcome: "Anti-spam circuit breaker armed. 0 duplicate messages guaranteed."
      }
    }
  }
];

const sampleAttentionItems = [
  {
    id: "att_01",
    severity: "medium",
    title: "Custom Time Request Requires Confirmation",
    application: "WhatsApp Business & Calendar",
    appIconKey: "calendar",
    timestamp: "12 mins ago",
    whatHappened: "Parent requested Sunday 7:30 PM, which is outside standard tutoring hours (9am - 6pm).",
    why: "Otomatizon detected a valid inquiry but identified a policy constraint on late-evening sessions.",
    whatOtomatizonTried: "Proposed closest available daytime slot (Sunday 4:00 PM). Parent asked if 7:30 PM is strictly impossible.",
    whatItNeedsFromUser: "Confirm if you wish to open an exceptional Sunday 7:30 PM slot, or decline politely.",
    suggestedActions: [
      { id: "accept_custom_slot", label: "Accept 7:30 PM Slot", isPrimary: true },
      { id: "propose_alternate", label: "Keep 4:00 PM Only" },
      { id: "dismiss", label: "Dismiss" }
    ]
  },
  {
    id: "att_02",
    severity: "low",
    title: "M-Pesa Payment Unmatched with Existing Student",
    application: "Safaricom M-Pesa",
    appIconKey: "mpesa",
    timestamp: "35 mins ago",
    whatHappened: "Received KES 3,500 from +254 711 002 991 (Account: 'Math Lesson') with no matching lead name.",
    why: "The payment phone number differs from the WhatsApp contact used during initial inquiry.",
    whatOtomatizonTried: "Queried Google Sheets for phone match, found 2 possible matches (Alice Wambui or Kevin Ochieng).",
    whatItNeedsFromUser: "Select which student this KES 3,500 receipt (QAH8819203) belongs to.",
    suggestedActions: [
      { id: "match_alice", label: "Assign to Alice Wambui", isPrimary: true },
      { id: "match_kevin", label: "Assign to Kevin Ochieng" },
      { id: "create_new_student", label: "Create New Student" }
    ]
  }
];

module.exports = {
  defaultPipelineTraces,
  sampleAttentionItems
};
