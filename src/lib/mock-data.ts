import {
  BusinessProfile,
  Integration,
  Lead,
  Appointment,
  Payment,
  Opportunity,
  Workflow,
  ActivityLog,
  PricingPlan,
  Organization,
  ConnectedApp,
  DataSource,
  OperationalEvent,
  IntelligenceInsight,
  OperationalMetric,
  DataProvenance,
  TeamMember
} from "@/types";

export const defaultOrganization: Organization = {
  id: "org_james_nairobi",
  name: "James Tutoring & Coaching",
  slug: "james-tutoring",
  currency: "KES",
  timezone: "Africa/Nairobi",
  planId: "starter",
  createdAt: "2026-01-15T08:00:00Z"
};

export const defaultBusinessProfile: BusinessProfile = {
  id: "prof_james_01",
  organizationId: "org_james_nairobi",
  businessType: "Private French Tutor & Exam Coach",
  name: "James Kamau",
  description: "Private one-on-one professional tutoring, language lessons, and DELF/DALF exam coaching in Nairobi.",
  location: "Kilimani, Nairobi",
  city: "Nairobi",
  country: "Kenya",
  clientType: "Individual learners, executives & university candidates",
  customerType: "Individual learners, executives & university candidates",
  goals: [
    "Reclaim 10+ hours lost to manual WhatsApp coordination",
    "Ensure 100% of lessons have confirmed tuition deposits before start",
    "Never let an inbound student inquiry go cold without a polite follow-up"
  ],
  currency: "KES",
  provenance: "INFERRED",
  createdAt: "2026-01-15T08:00:00Z",
  services: [
    "One-on-One Private Lesson (60 min)",
    "Executive Professional Exam Prep (90 min)",
    "Small Group Coaching Session (2 hours)"
  ],
  primaryChannels: ["whatsapp", "google_business", "referrals"],
  targetAudience: "Working professionals, university candidates, and expatriates in Nairobi",
  averageDealSizeKes: 3500,
  toolsUsed: ["WhatsApp Business", "Google Calendar", "Google Sheets", "Gmail", "M-Pesa"],
  biggestRepetitiveTask: "Reminding students to pay before lessons and manually following up on WhatsApp inquiries.",
  workflowSummary: "Customers inquire on WhatsApp -> syllabus is sent manually -> sessions booked on Google Calendar -> manual M-Pesa reminder before class.",
  manualTasks: [
    "Copy-pasting lesson schedules into WhatsApp messages",
    "Sending PDF brochures manually to prospective students",
    "Checking bank/M-Pesa SMS alerts against student attendance rosters",
    "Chasing payment on the morning of scheduled sessions"
  ],
  frictionPoints: [
    "Unanswered WhatsApp inquiries going cold after 24 hours",
    "Students attending lessons before completing payments",
    "Manual entry of session attendance into Google Sheets"
  ],
  workflowStages: [
    {
      id: "stg_01",
      order: 1,
      name: "Customer inquiry",
      sourceApp: "WhatsApp Business",
      actionDescription: "Prospective student reaches out asking for rates & availability",
      destinationApp: "WhatsApp Business",
      manualFriction: "Must be answered manually within hours or the lead contacts other tutors"
    },
    {
      id: "stg_02",
      order: 2,
      name: "Information & Syllabus",
      sourceApp: "WhatsApp Business",
      actionDescription: "Tutor sends DELF syllabus & lesson options",
      destinationApp: "Google Drive",
      manualFriction: "Manual file search and upload on mobile"
    },
    {
      id: "stg_03",
      order: 3,
      name: "Session booking",
      sourceApp: "Google Calendar",
      actionDescription: "Agreed lesson slot reserved on calendar with Google Meet link",
      destinationApp: "Google Calendar",
      manualFriction: "Checking calendar conflicts and typing student name manually"
    },
    {
      id: "stg_04",
      order: 4,
      name: "Payment verification",
      sourceApp: "M-Pesa",
      actionDescription: "Student sends KES 3,500 via Paybill 849201",
      destinationApp: "M-Pesa",
      manualFriction: "Matching SMS reference codes with student names in notebook"
    },
    {
      id: "stg_05",
      order: 5,
      name: "Lesson execution",
      sourceApp: "Google Meet",
      actionDescription: "Conducting 60-min coaching session",
      destinationApp: "Google Meet"
    },
    {
      id: "stg_06",
      order: 6,
      name: "Post-session follow-up",
      sourceApp: "Google Sheets",
      actionDescription: "Logging lesson completion and homework tasks in spreadsheet roster",
      destinationApp: "Google Sheets",
      manualFriction: "Manual copy-paste into student roster sheet"
    }
  ]
};

export const defaultIntegrations: Integration[] = [
  {
    id: "whatsapp_business",
    name: "WhatsApp Business",
    category: "messaging",
    description: "Inbound student messages, rate brochures, and 24h reminders.",
    icon: "message-square",
    connected: true,
    accountPhone: "+254 722 000 123",
    accountIdentifier: "WABA ID: 109284729104",
    lastSyncedAt: "2 mins ago",
    status: "connected",
    scopes: ["whatsapp_business_messaging", "whatsapp_business_management"],
    permissionsGranted: ["Send message templates", "Read incoming messages", "Manage contact profiles"],
    whatWeUseItFor: ["Delivering course brochures", "Sending automated 24h follow-ups", "Payment reminders via WhatsApp"],
    authType: "api_key"
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "google",
    description: "Inbound inquiries, invoice delivery, and official confirmations.",
    icon: "mail",
    connected: true,
    accountEmail: "james.kamau.nairobi@gmail.com",
    lastSyncedAt: "5 mins ago",
    status: "connected",
    scopes: ["https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.readonly"],
    permissionsGranted: ["Send emails on your behalf", "Read student inquiry emails"],
    whatWeUseItFor: ["Sending formal syllabus PDFs", "Delivering lesson confirmation emails"],
    authType: "oauth2"
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    category: "google",
    description: "Session scheduling, availability checks, and Google Meet generation.",
    icon: "calendar",
    connected: true,
    accountEmail: "james.kamau.nairobi@gmail.com",
    lastSyncedAt: "Just now",
    status: "connected",
    scopes: ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.readonly"],
    permissionsGranted: ["Create calendar events", "Generate Google Meet links", "Check schedule availability"],
    whatWeUseItFor: ["Creating lesson slots automatically", "Triggering pre-session reminders"],
    authType: "oauth2"
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    category: "google",
    description: "Recording student rosters, lesson logs, and payment records.",
    icon: "table",
    connected: true,
    accountEmail: "james.kamau.nairobi@gmail.com (Sheet: Student Roster 2026)",
    lastSyncedAt: "15 mins ago",
    status: "connected",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    permissionsGranted: ["Append student records", "Read existing roster rows"],
    whatWeUseItFor: ["Logging new student inquiries", "Updating lesson attendance and billing records"],
    authType: "oauth2"
  },
  {
    id: "google_drive",
    name: "Google Drive",
    category: "google",
    description: "Sharing worksheets, course materials and notes.",
    icon: "hard-drive",
    connected: false,
    accountEmail: "james.kamau.nairobi@gmail.com",
    lastSyncedAt: "Setup required",
    lastError: "Drive folder permission setup required for student syllabus folder",
    status: "needs_attention",
    scopes: ["https://www.googleapis.com/auth/drive.file"],
    permissionsGranted: [],
    whatWeUseItFor: ["Auto-sharing lesson worksheets and syllabus PDFs"],
    authType: "oauth2"
  },
  {
    id: "google_business",
    name: "Google Business Profile",
    category: "google",
    description: "Google Maps visibility and student review collection.",
    icon: "map-pin",
    connected: false,
    status: "coming_soon",
    scopes: [],
    permissionsGranted: [],
    whatWeUseItFor: ["Inviting happy students to leave Google reviews"],
    authType: "oauth2"
  },
  {
    id: "mpesa_safaricom",
    name: "Safaricom M-Pesa",
    category: "payments",
    description: "Automatic payment prompts and matching receipts.",
    icon: "credit-card",
    connected: true,
    accountIdentifier: "Paybill: 849201 (Sandbox Active)",
    lastSyncedAt: "Just now",
    status: "connected",
    scopes: ["mpesa_stk_push", "mpesa_c2b_validation"],
    permissionsGranted: ["Trigger STK Push prompts", "Receive instant confirmation callbacks"],
    whatWeUseItFor: ["Prompting students for session deposits", "Verifying payment before class starts"],
    authType: "daraja_b2c"
  },
  {
    id: "facebook_messenger",
    name: "Facebook Messenger",
    category: "messaging",
    description: "Inbound student messages from Facebook Business Page.",
    icon: "message-square",
    connected: false,
    status: "coming_soon",
    scopes: [],
    permissionsGranted: [],
    whatWeUseItFor: ["Receiving student inquiries from Facebook"],
    authType: "oauth2"
  },
  {
    id: "instagram",
    name: "Instagram Direct",
    category: "messaging",
    description: "Direct messages from Instagram coaching profile.",
    icon: "message-square",
    connected: false,
    status: "coming_soon",
    scopes: [],
    permissionsGranted: [],
    whatWeUseItFor: ["Capturing course inquiries from Instagram DMs"],
    authType: "oauth2"
  }
];

export const defaultLeads: Lead[] = [
  {
    id: "lead_01",
    organizationId: "org_james_nairobi",
    name: "Mercy Chebet",
    phone: "+254 719 552 108",
    email: "mercy.chebet@gmail.com",
    source: "whatsapp",
    status: "new",
    inquiredService: "Executive Exam Prep (90 min)",
    potentialValueKes: 4500,
    notes: "Asked about weekend slots. Syllabus sent. Waiting for booking.",
    lastContactAt: "14 hours ago",
    createdAt: "2026-08-28T14:30:00Z"
  },
  {
    id: "lead_02",
    organizationId: "org_james_nairobi",
    name: "David Kimani",
    phone: "+254 722 891 004",
    email: "dkimani@equity.co.ke",
    source: "google_business",
    status: "new",
    inquiredService: "One-on-One Private Lesson (60 min)",
    potentialValueKes: 3500,
    notes: "Inquired via Google Maps call button yesterday evening.",
    lastContactAt: "22 hours ago",
    createdAt: "2026-08-28T18:45:00Z"
  },
  {
    id: "lead_03",
    organizationId: "org_james_nairobi",
    name: "Brian Otieno",
    phone: "+254 710 442 819",
    email: "brian.otieno@stanbic.ke",
    source: "whatsapp",
    status: "booked",
    inquiredService: "One-on-One Private Lesson (60 min)",
    potentialValueKes: 3500,
    notes: "Booked for Thursday 10:00 AM. M-Pesa confirmed.",
    lastContactAt: "Today at 09:15",
    createdAt: "2026-08-28T06:15:00Z"
  }
];

export const defaultOpportunities: Opportunity[] = [
  {
    id: "opp_lead_leakage",
    organizationId: "org_james_nairobi",
    title: "14 leads were not followed up",
    problem: "You're losing leads between inquiry and booking.",
    evidence: "We observed 23 WhatsApp inquiries in your roster without follow-ups sent after 24 hours.",
    evidenceType: "OBSERVED",
    impactScore: 94,
    impactLevel: "High impact",
    confidenceScore: 96,
    estimatedTimeSavedHoursPerWeek: 4.5,
    estimatedRevenueAtRiskKes: 49000,
    estimatedBusinessValueKes: 49000,
    recommendation: "Automatically follow up after 24 hours when a lead hasn't booked.",
    suggestedWorkflowTitle: "Lead Follow-Up Autopilot",
    suggestedWorkflowId: "wf_lead_autopilot",
    requiredIntegrations: ["whatsapp_business", "google_calendar"],
    optionalIntegrations: ["google_sheets"],
    status: "discovered",
    detectedAt: "2 hours ago",
    category: "lead_recovery"
  },
  {
    id: "opp_mpesa_friction",
    organizationId: "org_james_nairobi",
    title: "Unconfirmed bookings causing calendar gaps",
    problem: "Lessons are reserved on Google Calendar, but payments are chased manually.",
    evidence: "Based on what you told Otomatizon: students attend lessons before completing payment.",
    evidenceType: "INFERRED",
    impactScore: 88,
    impactLevel: "High impact",
    confidenceScore: 92,
    estimatedTimeSavedHoursPerWeek: 3.0,
    estimatedRevenueAtRiskKes: 21000,
    estimatedBusinessValueKes: 21000,
    recommendation: "Send an automated M-Pesa payment prompt 18 hours before lesson time.",
    suggestedWorkflowTitle: "Pre-Session Payment Follow-Up",
    suggestedWorkflowId: "wf_pre_payment",
    requiredIntegrations: ["google_calendar", "mpesa_safaricom", "whatsapp_business"],
    status: "discovered",
    detectedAt: "4 hours ago",
    category: "payment_reminder"
  },
  {
    id: "opp_review_leakage",
    organizationId: "org_james_nairobi",
    title: "Missing Google Reviews after completed lessons",
    problem: "Happy customers finish sessions, but you rarely ask for a review.",
    evidence: "Observed 18 completed sessions with zero review requests sent.",
    evidenceType: "OBSERVED",
    impactScore: 72,
    impactLevel: "Medium impact",
    confidenceScore: 90,
    estimatedTimeSavedHoursPerWeek: 1.5,
    estimatedRevenueAtRiskKes: 15000,
    estimatedBusinessValueKes: 15000,
    recommendation: "Send a polite 1-tap Google review link 2 hours after a lesson ends.",
    suggestedWorkflowTitle: "Post-Session Google Review Request",
    suggestedWorkflowId: "wf_google_review",
    requiredIntegrations: ["whatsapp_business", "google_calendar"],
    optionalIntegrations: ["google_business"],
    status: "discovered",
    detectedAt: "Yesterday",
    category: "retention"
  }
];

export const defaultWorkflows: Workflow[] = [
  {
    id: "wf_lead_autopilot",
    organizationId: "org_james_nairobi",
    title: "Lead Follow-Up Autopilot",
    summary: "When a new lead contacts you, records them in Sheets, sends syllabus, and follows up if they haven't booked in 24 hours.",
    category: "lead_management",
    active: true,
    triggerDescription: "When a new customer contacts you on WhatsApp or Gmail",
    connectedApps: ["WhatsApp", "Google Sheets", "Google Calendar"],
    requiredIntegrations: ["whatsapp_business", "google_calendar"],
    successRate: 98.6,
    timingConfig: { delayHours: 24 },
    steps: [
      {
        id: "step_1",
        label: "Record customer in Google Sheets roster",
        actionType: "update_sheet",
        parameters: { sheetName: "2026 Student Roster", columns: ["Name", "Phone", "Status", "Date"] },
        icon: "table"
      },
      {
        id: "step_2",
        label: "Send syllabus & rates on WhatsApp automatically",
        actionType: "send_whatsapp",
        parameters: { template: "rates_and_brochure", attachPdf: true },
        icon: "message-square"
      },
      {
        id: "step_3",
        label: "Wait 24 hours to check if customer booked",
        actionType: "condition_check",
        parameters: { delayHours: 24, checkStatus: "booked" },
        icon: "clock"
      },
      {
        id: "step_4",
        label: "If not booked, send polite follow-up message",
        actionType: "send_whatsapp",
        parameters: { template: "followup_gentle" },
        icon: "message-square"
      },
      {
        id: "step_5",
        label: "Once booked, reserve slot on Google Calendar & create Google Meet",
        actionType: "create_calendar_event",
        parameters: { durationMinutes: 60, sendMeetLink: true },
        icon: "calendar"
      },
      {
        id: "step_6",
        label: "Send M-Pesa STK payment prompt for lesson fee",
        actionType: "request_mpesa",
        parameters: { amountKes: 3500, paybill: "849201" },
        icon: "credit-card"
      }
    ],
    operationalFlow: [
      {
        id: "flow_01",
        stepNumber: 1,
        nodeType: "trigger",
        application: "WhatsApp",
        systemRole: "Inbound Channel",
        title: "Customer sends a WhatsApp message",
        description: "Student reaches out inquiring about DELF/DALF French lessons or pricing packages."
      },
      {
        id: "flow_02",
        stepNumber: 2,
        nodeType: "intelligence",
        application: "Otomatizon",
        systemRole: "Operations Intelligence",
        title: "Otomatizon identifies a new inquiry",
        description: "Extracts contact information, verifies student status, and initiates the automated process."
      },
      {
        id: "flow_03",
        stepNumber: 3,
        nodeType: "action",
        application: "Google Sheets",
        systemRole: "Student Registry",
        title: "Customer information is recorded in Google Sheets",
        description: "Student name, WhatsApp phone number, and inquiry timestamp are appended to your active roster."
      },
      {
        id: "flow_04",
        stepNumber: 4,
        nodeType: "action",
        application: "WhatsApp",
        systemRole: "Information Delivery",
        title: "Course information is sent automatically",
        description: "Rate sheet, exam syllabus brochure, and Google Calendar booking link are dispatched instantly."
      },
      {
        id: "flow_05",
        stepNumber: 5,
        nodeType: "action",
        application: "Google Calendar",
        systemRole: "Booking Verification",
        title: "Google Calendar is checked",
        description: "Monitors your calendar availability to detect whether the student confirmed a lesson slot."
      },
      {
        id: "flow_06",
        stepNumber: 6,
        nodeType: "condition",
        application: "Otomatizon",
        systemRole: "Operational Decision",
        title: "If no booking exists after 24 hours, Otomatizon follows up",
        description: "Evaluates booking confirmation status after the 24-hour waiting period.",
        conditionText: "Has student confirmed a lesson on Google Calendar?",
        branchOutcome: {
          yes: "Stop follow-up sequence",
          no: "Send polite check-in message on WhatsApp"
        }
      },
      {
        id: "flow_07",
        stepNumber: 7,
        nodeType: "stop",
        application: "Otomatizon",
        systemRole: "Sequence Termination",
        title: "The follow-up stops when customer books or replies",
        description: "A Google Calendar invite with Meet link is confirmed, and an M-Pesa payment prompt is sent.",
        finalState: "Lead converted & scheduled on Calendar"
      }
    ],
    metrics: {
      runsCount: 24,
      leadsHelped: 21,
      hoursSaved: 6.7,
      revenueRecoveredKes: 73500
    },
    lastRunAt: "10 mins ago",
    createdAt: "2026-08-20T08:00:00Z"
  },
  {
    id: "wf_package_renewal",
    organizationId: "org_james_nairobi",
    title: "Lesson Package Credit Tracker & Renewal",
    summary: "Automatically counts down student lesson credits in Sheets after each session. When 1 lesson remains, sends a friendly renewal invoice with M-Pesa STK link.",
    category: "billing_and_renewal",
    active: true,
    triggerDescription: "When a scheduled coaching session completes on Google Calendar",
    connectedApps: ["Google Calendar", "Google Sheets", "WhatsApp", "M-Pesa"],
    requiredIntegrations: ["google_calendar", "google_sheets", "whatsapp_business", "mpesa_safaricom"],
    successRate: 100.0,
    timingConfig: { delayHours: 0 },
    steps: [
      {
        id: "step_pr_1",
        label: "Detect completed session on Google Calendar",
        actionType: "calendar_check",
        parameters: { eventType: "coaching_session", status: "completed" },
        icon: "calendar"
      },
      {
        id: "step_pr_2",
        label: "Decrement student remaining credits in Google Sheets",
        actionType: "update_sheet",
        parameters: { sheetName: "Student Credit Balance", column: "HoursRemaining", decrement: 1 },
        icon: "table"
      },
      {
        id: "step_pr_3",
        label: "Check if remaining balance is 1 hour or less",
        actionType: "condition_check",
        parameters: { threshold: 1, condition: "less_equal" },
        icon: "clock"
      },
      {
        id: "step_pr_4",
        label: "Send WhatsApp renewal alert with M-Pesa STK prompt",
        actionType: "send_whatsapp",
        parameters: { template: "package_renewal_friendly", amountKes: 28000 },
        icon: "message-square"
      },
      {
        id: "step_pr_5",
        label: "Top up 10 hours upon M-Pesa receipt verification",
        actionType: "request_mpesa",
        parameters: { amountKes: 28000, creditsAdded: 10 },
        icon: "credit-card"
      }
    ],
    operationalFlow: [
      {
        id: "flow_pr_01",
        stepNumber: 1,
        nodeType: "trigger",
        application: "Google Calendar",
        systemRole: "Session Completion",
        title: "Google Calendar session ends",
        description: "60-minute DELF coaching session completes on tutor calendar."
      },
      {
        id: "flow_pr_02",
        stepNumber: 2,
        nodeType: "action",
        application: "Google Sheets",
        systemRole: "Credit Ledger",
        title: "Lesson credit decremented",
        description: "Remaining balance reduced from 2 to 1 hour in student credit tracking sheet."
      },
      {
        id: "flow_pr_03",
        stepNumber: 3,
        nodeType: "intelligence",
        application: "Otomatizon",
        systemRole: "Renewal Threshold Detection",
        title: "Otomatizon detects low balance (1 hr)",
        description: "Evaluates student package quota and prepares 10-hour renewal invoice (KES 28,000)."
      },
      {
        id: "flow_pr_04",
        stepNumber: 4,
        nodeType: "action",
        application: "WhatsApp",
        systemRole: "Renewal Delivery",
        title: "WhatsApp renewal message dispatched",
        description: "Sends progress summary and 1-tap M-Pesa renewal invoice to the student."
      },
      {
        id: "flow_pr_05",
        stepNumber: 5,
        nodeType: "stop",
        application: "M-Pesa",
        systemRole: "Payment Reconciliation",
        title: "Payment received & package refreshed",
        description: "Receipt confirmed, +10 hours added to Google Sheets, and official tax receipt delivered.",
        finalState: "10-hour package renewed & balance updated"
      }
    ],
    metrics: {
      runsCount: 18,
      leadsHelped: 14,
      hoursSaved: 4.8,
      revenueRecoveredKes: 112000
    },
    lastRunAt: "2 hours ago",
    createdAt: "2026-08-22T08:00:00Z"
  },
  {
    id: "wf_google_reviews",
    organizationId: "org_james_nairobi",
    title: "Post-Session Google Review Collector",
    summary: "Delivers a gentle satisfaction check on WhatsApp 2 hours after a lesson. Directs happy students directly to your Google Business Profile with a 1-tap review link.",
    category: "reputation_management",
    active: true,
    triggerDescription: "2 hours after a completed coaching session",
    connectedApps: ["Google Calendar", "WhatsApp", "Google Business Profile"],
    requiredIntegrations: ["google_calendar", "whatsapp_business", "google_business"],
    successRate: 97.4,
    timingConfig: { delayHours: 2 },
    steps: [
      {
        id: "step_gr_1",
        label: "Wait 2 hours after Google Calendar session completes",
        actionType: "condition_check",
        parameters: { delayHours: 2 },
        icon: "clock"
      },
      {
        id: "step_gr_2",
        label: "Check student attendance & previous feedback",
        actionType: "calendar_check",
        parameters: { minCompletedSessions: 2 },
        icon: "calendar"
      },
      {
        id: "step_gr_3",
        label: "Send polite WhatsApp message with 1-tap Google Maps review link",
        actionType: "send_whatsapp",
        parameters: { template: "google_review_request", mapsUrl: "https://g.page/r/james-french-nairobi/review" },
        icon: "message-square"
      },
      {
        id: "step_gr_4",
        label: "Log review request in Google Sheets and flag completed",
        actionType: "update_sheet",
        parameters: { sheetName: "Student Roster", column: "ReviewSent", value: "YES" },
        icon: "table"
      }
    ],
    operationalFlow: [
      {
        id: "flow_gr_01",
        stepNumber: 1,
        nodeType: "trigger",
        application: "Google Calendar",
        systemRole: "Session Completion",
        title: "Session completes on Google Calendar",
        description: "Student completes session without issues or rescheduling."
      },
      {
        id: "flow_gr_02",
        stepNumber: 2,
        nodeType: "condition",
        application: "Otomatizon",
        systemRole: "Timing Buffer",
        title: "2-hour courtesy delay window",
        description: "Waits 2 hours post-session to ensure student is settled before reaching out."
      },
      {
        id: "flow_gr_03",
        stepNumber: 3,
        nodeType: "intelligence",
        application: "Otomatizon",
        systemRole: "Candidate Eligibility Check",
        title: "Eligibility verified (≥ 2 sessions attended)",
        description: "Confirms student has attended multiple classes and has not reviewed yet."
      },
      {
        id: "flow_gr_04",
        stepNumber: 4,
        nodeType: "action",
        application: "WhatsApp",
        systemRole: "Direct Review Dispatch",
        title: "1-tap Google Maps review link sent on WhatsApp",
        description: "Student receives personalized praise and 1-tap direct link to Google Business Profile."
      },
      {
        id: "flow_gr_05",
        stepNumber: 5,
        nodeType: "stop",
        application: "Google Business Profile",
        systemRole: "Reputation Boost",
        title: "5-Star Google review captured",
        description: "Increases local SEO ranking in Nairobi for 'French tutor near me'.",
        finalState: "5-Star review collected & logged in Sheets"
      }
    ],
    metrics: {
      runsCount: 12,
      leadsHelped: 10,
      hoursSaved: 2.5,
      revenueRecoveredKes: 35000
    },
    lastRunAt: "5 hours ago",
    createdAt: "2026-08-25T08:00:00Z"
  }
];

export const defaultActivityLogs: ActivityLog[] = [
  {
    id: "act_01",
    organizationId: "org_james_nairobi",
    type: "lead_captured",
    channel: "whatsapp",
    application: "WhatsApp",
    title: "New inquiry received from Mercy Chebet",
    description: "Mercy asked about DELF B2 preparation packages on WhatsApp.",
    actionTakenByOtomatizon: "Captured contact details and initiated onboarding routine",
    businessResult: "Added to Google Sheets roster; syllabus PDF delivered",
    entityName: "Mercy Chebet (+254 719 552 108)",
    timestamp: "12 mins ago"
  },
  {
    id: "act_02",
    organizationId: "org_james_nairobi",
    type: "followup_sent",
    channel: "whatsapp",
    application: "WhatsApp",
    title: "Course brochure & booking link sent to Mercy Chebet",
    description: "Delivered standard rate card and calendar link automatically.",
    actionTakenByOtomatizon: "Dispatched rates via WhatsApp Business Cloud API",
    businessResult: "Waiting 24h condition before follow-up check",
    entityName: "Mercy Chebet",
    timestamp: "12 mins ago"
  },
  {
    id: "act_03",
    organizationId: "org_james_nairobi",
    type: "booking_confirmed",
    channel: "calendar",
    application: "Google Calendar",
    title: "Lesson scheduled with Brian Otieno",
    description: "Private DELF B1 Lesson reserved for Thursday 10:00 AM.",
    actionTakenByOtomatizon: "Created Google Meet link & updated Google Sheets",
    businessResult: "Follow-up sequence stopped cleanly",
    entityName: "Brian Otieno",
    timestamp: "45 mins ago"
  },
  {
    id: "act_04",
    organizationId: "org_james_nairobi",
    type: "payment_received",
    channel: "mpesa",
    application: "M-Pesa",
    title: "M-Pesa payment confirmed (KES 3,500)",
    description: "Transaction QJD472910M validated for Brian Otieno.",
    actionTakenByOtomatizon: "Matched M-Pesa receipt with Calendar booking",
    businessResult: "Tuition secured before session starts",
    entityName: "Brian Otieno",
    timestamp: "1 hour ago"
  },
  {
    id: "act_05",
    organizationId: "org_james_nairobi",
    type: "followup_sent",
    channel: "whatsapp",
    application: "Otomatizon",
    title: "24-hour polite follow-up sent to Faith Achieng",
    description: "Inquiry from yesterday had no booking confirmed after 24h.",
    actionTakenByOtomatizon: "Triggered gentle check-in template on WhatsApp",
    businessResult: "Candidate engaged; responded requesting weekend slots",
    entityName: "Faith Achieng",
    timestamp: "3 hours ago",
    provenance: "OBSERVED"
  }
];

export const defaultConnectedApps: ConnectedApp[] = [
  {
    id: "app_wa_01",
    businessId: "prof_james_01",
    integrationId: "whatsapp_business",
    name: "WhatsApp Business",
    category: "messaging",
    status: "connected",
    accountIdentifier: "+254 712 345 678 (James French Coaching)",
    roleInSystem: "Student inquiries, automated syllabus distribution, and 24h follow-up check-ins",
    scopes: ["messages_read", "messages_write", "templates_send"],
    capabilities: ["inbound_webhooks", "automated_replies", "template_messaging"],
    provenance: "OBSERVED",
    lastSyncAt: "Just now"
  },
  {
    id: "app_cal_01",
    businessId: "prof_james_01",
    integrationId: "google_calendar",
    name: "Google Calendar",
    category: "google",
    status: "connected",
    accountIdentifier: "james.kamau.french@gmail.com",
    roleInSystem: "Checking lesson availability and booking Google Meet tutoring sessions",
    scopes: ["calendar.events.readonly", "calendar.events"],
    capabilities: ["free_busy_query", "event_creation", "meet_link_generation"],
    provenance: "OBSERVED",
    lastSyncAt: "1 min ago"
  },
  {
    id: "app_sheets_01",
    businessId: "prof_james_01",
    integrationId: "google_sheets",
    name: "Google Sheets",
    category: "google",
    status: "connected",
    accountIdentifier: "2026 Active Student Roster & Pipeline",
    roleInSystem: "Instant logging of student inquiries, lesson attendance, and billing statuses",
    scopes: ["spreadsheets.readonly", "spreadsheets"],
    capabilities: ["row_append", "row_read", "status_sync"],
    provenance: "OBSERVED",
    lastSyncAt: "Just now"
  },
  {
    id: "app_mpesa_01",
    businessId: "prof_james_01",
    integrationId: "mpesa_safaricom",
    name: "Safaricom M-Pesa",
    category: "payments",
    status: "connected",
    accountIdentifier: "Paybill: 849201 (Sandbox Active)",
    roleInSystem: "Prompting students for session deposits and verifying M-Pesa transaction codes",
    scopes: ["mpesa_stk_push", "mpesa_c2b_validation"],
    capabilities: ["stk_push_prompt", "c2b_instant_reconciliation"],
    provenance: "OBSERVED",
    lastSyncAt: "Just now"
  },
  {
    id: "app_gmail_01",
    businessId: "prof_james_01",
    integrationId: "gmail",
    name: "Gmail Workspace",
    category: "google",
    status: "connected",
    accountIdentifier: "james.kamau.french@gmail.com",
    roleInSystem: "Sending formal calendar invites, tuition receipts, and diagnostic assessments",
    scopes: ["gmail.send", "gmail.readonly"],
    capabilities: ["email_delivery", "attachment_delivery"],
    provenance: "OBSERVED",
    lastSyncAt: "2 mins ago"
  }
];

export const defaultDataSources: DataSource[] = [
  {
    id: "ds_wa_chat",
    businessId: "prof_james_01",
    appId: "app_wa_01",
    integrationId: "whatsapp_business",
    name: "WhatsApp Student Chat Stream",
    resourceType: "chat_thread",
    status: "active",
    recordCount: 47,
    lastReadAt: "Just now",
    provenance: "OBSERVED"
  },
  {
    id: "ds_sheets_roster",
    businessId: "prof_james_01",
    appId: "app_sheets_01",
    integrationId: "google_sheets",
    name: "Student Roster & Inquiry Ledger",
    resourceType: "spreadsheet",
    status: "active",
    recordCount: 38,
    lastReadAt: "Just now",
    provenance: "OBSERVED"
  },
  {
    id: "ds_cal_schedule",
    businessId: "prof_james_01",
    appId: "app_cal_01",
    integrationId: "google_calendar",
    name: "Private Lessons & Exam Prep Calendar",
    resourceType: "calendar",
    status: "active",
    recordCount: 29,
    lastReadAt: "1 min ago",
    provenance: "OBSERVED"
  },
  {
    id: "ds_mpesa_tx",
    businessId: "prof_james_01",
    appId: "app_mpesa_01",
    integrationId: "mpesa_safaricom",
    name: "M-Pesa STK Receipt Ledger",
    resourceType: "payment_gateway",
    status: "active",
    recordCount: 22,
    lastReadAt: "Just now",
    provenance: "OBSERVED"
  }
];

export const defaultOperationalEvents: OperationalEvent[] = [
  {
    id: "evt_01",
    businessId: "prof_james_01",
    sourceAppId: "app_wa_01",
    dataSourceId: "ds_wa_chat",
    eventType: "inquiry_received",
    title: "New WhatsApp Inquiry Received",
    description: "Mercy Chebet asked about DELF B2 prep and rates",
    entityName: "Mercy Chebet",
    payload: {
      studentName: "Mercy Chebet",
      phone: "+254 719 552 108",
      service: "DELF B2 Preparation",
      channel: "WhatsApp"
    },
    timestamp: "10:42:10 AM",
    provenance: "OBSERVED"
  },
  {
    id: "evt_02",
    businessId: "prof_james_01",
    sourceAppId: "app_sheets_01",
    dataSourceId: "ds_sheets_roster",
    eventType: "lead_recorded",
    title: "Lead Appended to Student Roster",
    description: "Added Mercy Chebet to Google Sheets pipeline",
    entityName: "Mercy Chebet",
    payload: {
      studentName: "Mercy Chebet",
      status: "info_sent",
      sheet: "Student Roster"
    },
    timestamp: "10:42:15 AM",
    provenance: "OBSERVED"
  },
  {
    id: "evt_03",
    businessId: "prof_james_01",
    sourceAppId: "app_mpesa_01",
    dataSourceId: "ds_mpesa_tx",
    eventType: "payment_confirmed",
    title: "M-Pesa Tuition Receipt Received",
    description: "Transaction QJD472910M validated for Brian Otieno",
    entityName: "Brian Otieno",
    payload: {
      studentName: "Brian Otieno",
      amountKes: 3500,
      ref: "QJD472910M"
    },
    timestamp: "09:15:00 AM",
    provenance: "OBSERVED"
  }
];

export const defaultIntelligenceInsights: IntelligenceInsight[] = [
  {
    id: "ins_01",
    businessId: "prof_james_01",
    eventId: "evt_01",
    type: "friction_detected",
    title: "14 WhatsApp inquiries went cold without a booking",
    description: "Inquiries took over 24 hours to receive follow-up information, reducing conversion by 45%.",
    confidenceScore: 94,
    affectedAppIds: ["app_wa_01", "app_sheets_01", "app_cal_01"],
    provenance: "OBSERVED",
    createdAt: "2026-08-29T10:00:00Z"
  },
  {
    id: "ins_02",
    businessId: "prof_james_01",
    eventId: "evt_03",
    type: "revenue_opportunity",
    title: "6 lessons completed before tuition was verified",
    description: "Students attended coaching before payment confirmation, risking KES 21,000 in delayed revenue.",
    confidenceScore: 98,
    affectedAppIds: ["app_cal_01", "app_mpesa_01"],
    provenance: "OBSERVED",
    createdAt: "2026-08-29T11:00:00Z"
  }
];

export const defaultOperationalMetric: OperationalMetric = {
  id: "met_01",
  businessId: "prof_james_01",
  organizationId: "org_james_nairobi",
  inquiriesProcessed: 27,
  followupsSent: 24,
  hoursSaved: 8.2,
  revenueRecoveredKes: 88000,
  activeAutomationsCount: 1,
  successRate: 98.6,
  provenance: "OBSERVED",
  lastUpdated: "Just now"
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    priceKes: 499,
    priceKesMonthly: 499,
    priceKesYearly: 4990,
    billingPeriod: "month",
    description: "For solo tutors and coaches starting to automate",
    tagline: "For solo tutors and coaches starting to automate",
    features: [
      "1 active automation",
      "Up to 100 customer leads / month",
      "WhatsApp & Google Calendar sync",
      "Manual M-Pesa receipt verification",
      "Email support"
    ],
    maxActiveAutomations: 1,
    leadsPerMonthLimit: 100
  },
  {
    id: "growth",
    name: "Growth",
    priceKes: 999,
    priceKesMonthly: 999,
    priceKesYearly: 9990,
    billingPeriod: "month",
    description: "For busy businesses losing leads and time",
    tagline: "For busy businesses losing leads and time",
    popular: true,
    highlighted: true,
    features: [
      "Up to 5 active automations",
      "Up to 500 customer leads / month",
      "Full Google Suite (Calendar, Gmail, Sheets, Drive)",
      "Automated M-Pesa STK prompts",
      "Opportunity Discovery Engine",
      "Priority WhatsApp support"
    ],
    maxActiveAutomations: 5,
    leadsPerMonthLimit: 500
  },
  {
    id: "pro",
    name: "Pro",
    priceKes: 1999,
    priceKesMonthly: 1999,
    priceKesYearly: 19990,
    billingPeriod: "month",
    description: "For high-volume academies and multi-service practices",
    tagline: "For high-volume academies and multi-service practices",
    features: [
      "Unlimited active automations",
      "Unlimited leads & appointments",
      "Multi-staff calendar routing",
      "Custom WhatsApp message templates",
      "Dedicated Nairobi account manager",
      "Instant phone support"
    ],
    maxActiveAutomations: 999,
    leadsPerMonthLimit: 9999
  }
];

export const defaultTeamMembers: TeamMember[] = [
  {
    id: "tm_01",
    organizationId: "org_james_nairobi",
    name: "James Kamau",
    email: "james@otomatizon.co.ke",
    phone: "+254 722 000 123",
    role: "admin",
    status: "active",
    avatarUrl: "",
    joinedAt: "2026-01-15T08:00:00Z",
    lastActiveAt: "Just now"
  },
  {
    id: "tm_02",
    organizationId: "org_james_nairobi",
    name: "Sarah Njeri",
    email: "sarah.njeri@otomatizon.co.ke",
    phone: "+254 718 234 567",
    role: "collaborator",
    status: "active",
    avatarUrl: "",
    joinedAt: "2026-04-10T10:30:00Z",
    lastActiveAt: "2 hours ago",
    invitedBy: "James Kamau"
  },
  {
    id: "tm_03",
    organizationId: "org_james_nairobi",
    name: "David Omondi, CPA",
    email: "david.omondi@cpa.co.ke",
    phone: "+254 733 987 654",
    role: "viewer",
    status: "active",
    avatarUrl: "",
    joinedAt: "2026-06-01T14:00:00Z",
    lastActiveAt: "Yesterday",
    invitedBy: "James Kamau"
  }
];

