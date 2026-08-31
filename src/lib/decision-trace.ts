export interface DecisionTrace {
  stepNumber: number;
  stageName: string;
  application: string;
  appIconKey: "whatsapp" | "otomatizon" | "sheets" | "calendar" | "mpesa" | "gmail";
  event: string;
  action: string;
  status: "COMPLETED" | "RUNNING" | "WAITING" | "PENDING" | "NEEDS_ATTENTION" | "CIRCUIT_BROKEN";
  timestamp: string;
  latencyMs: number;
  
  // The Core 5-Part Operational Reasoning Trace
  trace: {
    detected: string;
    understood: {
      intent: string;
      confidence: number;
      entities: {
        studentName?: string;
        subject?: string;
        level?: string;
        requestedSlot?: string;
        budgetKes?: number;
        paymentReceipt?: string;
      };
    };
    decision: string;
    reasoning: string;
    nextAction: string;
    verification: {
      idempotencyToken: string;
      status: "SUCCESS" | "VERIFIED" | "ACTIVE";
      businessOutcome: string;
    };
  };
}

export interface AttentionItem {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  application: string;
  appIconKey: "whatsapp" | "calendar" | "mpesa" | "sheets";
  timestamp: string;
  whatHappened: string;
  why: string;
  whatOtomatizonTried: string;
  whatItNeedsFromUser: string;
  suggestedActions: {
    id: string;
    label: string;
    isPrimary?: boolean;
  }[];
}

export const defaultPipelineTraces: DecisionTrace[] = [
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

export const packageRenewalTraces: DecisionTrace[] = [
  {
    stepNumber: 1,
    stageName: "Session Completion Detected",
    application: "Google Calendar",
    appIconKey: "calendar",
    event: "60-min coaching session ended on tutor calendar",
    action: "Ingest Google Calendar event status & verify attendee email",
    status: "COMPLETED",
    timestamp: "11:00:02 AM",
    latencyMs: 32,
    trace: {
      detected: "Calendar Event: 'DELF B1 Coaching - Emmanuel Kiprono' marked completed at 11:00 AM.",
      understood: {
        intent: "session_completed",
        confidence: 99,
        entities: {
          studentName: "Emmanuel Kiprono",
          subject: "DELF B1 French Coaching",
          level: "Intermediate B1"
        }
      },
      decision: "Trigger credit deduction in student balance ledger.",
      reasoning: "Session took place successfully with 0 cancellations.",
      nextAction: "Google Sheets → Decrement remaining prepaid hours.",
      verification: {
        idempotencyToken: "idemp_cal_ev_10294819_emmanuel",
        status: "SUCCESS",
        businessOutcome: "Session attendance confirmed."
      }
    }
  },
  {
    stepNumber: 2,
    stageName: "Credit Ledger Decrement",
    application: "Google Sheets",
    appIconKey: "sheets",
    event: "Student balance updated in Google Sheets",
    action: "Decremented student credit from 2.0h to 1.0h",
    status: "COMPLETED",
    timestamp: "11:00:03 AM",
    latencyMs: 46,
    trace: {
      detected: "Updated row #14 in 'Student Credit Balance' sheet for Emmanuel Kiprono.",
      understood: {
        intent: "balance_updated",
        confidence: 100,
        entities: {
          studentName: "Emmanuel Kiprono",
          budgetKes: 28000
        }
      },
      decision: "Evaluate package renewal threshold.",
      reasoning: "Hours remaining is now 1.0 hour (threshold is ≤ 1.0h). Package renewal required.",
      nextAction: "Otomatizon Intelligence → Generate 10-hour package invoice & M-Pesa prompt.",
      verification: {
        idempotencyToken: "idemp_sheet_bal_emmanuel_1029",
        status: "SUCCESS",
        businessOutcome: "Credit balance successfully reduced to 1h."
      }
    }
  },
  {
    stepNumber: 3,
    stageName: "Renewal Decision & Pricing",
    application: "Otomatizon Intelligence",
    appIconKey: "otomatizon",
    event: "Otomatizon Decision Engine triggered renewal workflow",
    action: "Drafted 10-hour package renewal (KES 28,000)",
    status: "COMPLETED",
    timestamp: "11:00:04 AM",
    latencyMs: 25,
    trace: {
      detected: "Credit threshold breached: Student has 1 session remaining before lessons stop.",
      understood: {
        intent: "package_renewal_eligible",
        confidence: 97,
        entities: {
          studentName: "Emmanuel Kiprono",
          budgetKes: 28000
        }
      },
      decision: "Prepare friendly WhatsApp renewal invoice with progress summary.",
      reasoning: "Proactive renewal notification 1 session before depletion avoids awkward payment interruptions.",
      nextAction: "WhatsApp Business → Deliver friendly renewal invoice & payment link.",
      verification: {
        idempotencyToken: "idemp_renew_dec_emmanuel_882",
        status: "VERIFIED",
        businessOutcome: "KES 28,000 renewal opportunity activated."
      }
    }
  },
  {
    stepNumber: 4,
    stageName: "WhatsApp Invoice Dispatched",
    application: "WhatsApp Business",
    appIconKey: "whatsapp",
    event: "Delivered personalized package renewal message",
    action: "Dispatched WhatsApp message with M-Pesa STK link",
    status: "COMPLETED",
    timestamp: "11:00:05 AM",
    latencyMs: 51,
    trace: {
      detected: "Sent: 'Hi Emmanuel! Great progress on your DELF B1 listening comprehension today. You have 1 lesson left in your 10-pack. Tap here to renew for your next 10 hours.'",
      understood: {
        intent: "invoice_delivered",
        confidence: 100,
        entities: {
          studentName: "Emmanuel Kiprono",
          budgetKes: 28000
        }
      },
      decision: "Standby for Safaricom M-Pesa Paybill payment callback.",
      reasoning: "Message delivered directly to student's phone with 1-tap payment prompt.",
      nextAction: "M-Pesa Webhook → Awaiting transaction callback.",
      verification: {
        idempotencyToken: "idemp_wa_renew_msg_991823",
        status: "SUCCESS",
        businessOutcome: "Delivered to recipient with status 'read'."
      }
    }
  },
  {
    stepNumber: 5,
    stageName: "Payment Reconciliation & Top-Up",
    application: "Safaricom M-Pesa & Sheets",
    appIconKey: "mpesa",
    event: "Payment received & package credited (+10h)",
    action: "Matched M-Pesa receipt QKP829104M and credited +10h in Sheets",
    status: "COMPLETED",
    timestamp: "11:05:12 AM",
    latencyMs: 39,
    trace: {
      detected: "M-Pesa transaction QKP829104M received: KES 28,000 from Emmanuel Kiprono.",
      understood: {
        intent: "payment_reconciled",
        confidence: 100,
        entities: {
          studentName: "Emmanuel Kiprono",
          budgetKes: 28000,
          paymentReceipt: "QKP829104M"
        }
      },
      decision: "Credit +10 hours to Google Sheets and deliver official receipt.",
      reasoning: "Payment verified cryptographically via Safaricom Daraja callback.",
      nextAction: "Workflow completed. Roster updated to 11.0 hours.",
      verification: {
        idempotencyToken: "idemp_mpesa_QKP829104M",
        status: "SUCCESS",
        businessOutcome: "KES 28,000 secured. 10 hours added to student account."
      }
    }
  }
];

export const googleReviewTraces: DecisionTrace[] = [
  {
    stepNumber: 1,
    stageName: "Session Completed",
    application: "Google Calendar",
    appIconKey: "calendar",
    event: "Coaching session ended on Google Calendar",
    action: "Calendar event recorded with status completed",
    status: "COMPLETED",
    timestamp: "02:00:00 PM",
    latencyMs: 28,
    trace: {
      detected: "Google Meet session ended with Clara Wambui.",
      understood: {
        intent: "session_finished",
        confidence: 99,
        entities: {
          studentName: "Clara Wambui",
          subject: "French DELF A2 Exam Prep"
        }
      },
      decision: "Arm 2-hour courtesy delay window before requesting review.",
      reasoning: "Waiting 2 hours post-session ensures student is back home and ready to leave feedback.",
      nextAction: "Worker Scheduler → Schedule courtesy delay timer.",
      verification: {
        idempotencyToken: "idemp_cal_clara_rev_001",
        status: "SUCCESS",
        businessOutcome: "2-hour courtesy timer started."
      }
    }
  },
  {
    stepNumber: 2,
    stageName: "2-Hour Courtesy Delay",
    application: "Otomatizon Worker",
    appIconKey: "otomatizon",
    event: "Courtesy delay elapsed smoothly",
    action: "Verified student has completed ≥ 2 sessions with zero complaints",
    status: "COMPLETED",
    timestamp: "04:00:00 PM",
    latencyMs: 19,
    trace: {
      detected: "2 hours elapsed since 2:00 PM session completion.",
      understood: {
        intent: "delay_completed",
        confidence: 100,
        entities: {
          studentName: "Clara Wambui"
        }
      },
      decision: "Verify student eligibility in Google Sheets roster.",
      reasoning: "Clara has completed 3 sessions, has active package, and has never been sent a review request before.",
      nextAction: "Otomatizon Intelligence → Generate 1-tap review link template.",
      verification: {
        idempotencyToken: "idemp_worker_delay_clara_4pm",
        status: "SUCCESS",
        businessOutcome: "Eligibility criteria met (100% qualified)."
      }
    }
  },
  {
    stepNumber: 3,
    stageName: "Review Request Dispatched",
    application: "WhatsApp Business",
    appIconKey: "whatsapp",
    event: "Delivered friendly satisfaction message & 1-tap Google Maps review link",
    action: "Dispatched WhatsApp template with direct Google Business Profile URL",
    status: "COMPLETED",
    timestamp: "04:00:02 PM",
    latencyMs: 47,
    trace: {
      detected: "Dispatched WhatsApp review invitation to +254 722 443 219.",
      understood: {
        intent: "review_request_sent",
        confidence: 98,
        entities: {
          studentName: "Clara Wambui"
        }
      },
      decision: "Log outreach status in Google Sheets student roster.",
      reasoning: "1-tap Google link removes friction and yields 4x more 5-star Google Maps reviews.",
      nextAction: "Google Sheets → Mark 'ReviewSent = YES'.",
      verification: {
        idempotencyToken: "idemp_wa_rev_clara_wamid_009",
        status: "SUCCESS",
        businessOutcome: "Message delivered and opened by recipient."
      }
    }
  },
  {
    stepNumber: 4,
    stageName: "5-Star Review Captured",
    application: "Google Business Profile",
    appIconKey: "otomatizon",
    event: "5-Star Google Maps review published & logged",
    action: "Recorded review attribution in local SEO dashboard",
    status: "COMPLETED",
    timestamp: "04:14:30 PM",
    latencyMs: 33,
    trace: {
      detected: "New 5-star review from Clara Wambui: 'James is the best French tutor in Nairobi! Passed my DELF A2 with 88%!'",
      understood: {
        intent: "review_published",
        confidence: 100,
        entities: {
          studentName: "Clara Wambui"
        }
      },
      decision: "Log completion and update local business SEO metrics.",
      reasoning: "Increases Organic Google Maps ranking for 'French classes Nairobi'.",
      nextAction: "Sequence successfully terminated.",
      verification: {
        idempotencyToken: "idemp_gmaps_clara_rev_5star",
        status: "SUCCESS",
        businessOutcome: "5-Star review secured on Google Maps."
      }
    }
  }
];

export function getTracesForWorkflow(workflowId: string): DecisionTrace[] {
  if (workflowId === "wf_package_renewal") {
    return packageRenewalTraces;
  }
  if (workflowId === "wf_google_reviews") {
    return googleReviewTraces;
  }
  return defaultPipelineTraces;
}

export const sampleAttentionItems: AttentionItem[] = [
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

