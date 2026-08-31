const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../../../data");
const DB_FILE = path.join(DATA_DIR, "otomatizon_db.json");

// Ensure data directory exists safely
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // Read-only filesystem in Vercel lambda
  }
}

let inMemoryDb = null;

function getDbTargetFile() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "otomatizon_db.json");
  }
  return DB_FILE;
}

// Initial Database Structure
const initialDb = {
  users: [
    {
      id: "user_james",
      fullName: "James Kamau",
      email: "james@otomatizon.co.ke",
      phone: "+254 722 000 123",
      organizationId: "org_james",
      createdAt: "2026-08-01"
    }
  ],
  organizations: [
    {
      id: "org_james",
      name: "Kamau French & Academic Tutoring",
      planId: "starter",
      createdAt: "2026-08-01"
    }
  ],
  businessProfiles: [
    {
      id: "bp_james",
      organizationId: "org_james",
      businessName: "Kamau French & Academic Tutoring",
      businessType: "Private French Tutor & Exam Coach",
      description: "Private DELF/DALF French lessons & exam preparation in Nairobi.",
      city: "Nairobi",
      country: "Kenya",
      currency: "KES",
      customerType: "Individual learners, executives & university candidates",
      customerAcquisitionChannels: ["WhatsApp", "Google Maps", "Referrals"],
      toolsUsed: ["WhatsApp Business", "Google Calendar", "Google Sheets", "Gmail", "M-Pesa"],
      biggestRepetitiveTask: "Reminding students to pay before lessons and sending brochures.",
      workflowSummary: "Customers inquire on WhatsApp -> syllabus sent -> sessions booked on Calendar -> M-Pesa reminder before class.",
      manualTasks: [
        "Copy-pasting lesson schedules into WhatsApp messages",
        "Sending PDF brochures manually to prospective students",
        "Checking M-Pesa SMS alerts against student attendance rosters",
        "Chasing payment on the morning of scheduled sessions"
      ],
      frictionPoints: [
        "Unanswered WhatsApp inquiries going cold after 24 hours",
        "Students attending lessons before completing payments",
        "Manual entry of session attendance into Google Sheets"
      ],
      workflowStages: [
        { id: "stg_01", order: 1, name: "Customer inquiry", sourceApp: "WhatsApp Business", actionDescription: "Student inquires about French lessons", destinationApp: "WhatsApp Business", manualFriction: "Manual response required within hours" },
        { id: "stg_02", order: 2, name: "Information sent", sourceApp: "WhatsApp Business", actionDescription: "Tutor sends lesson brochure and pricing", destinationApp: "Google Drive", manualFriction: "Manual PDF attachment" },
        { id: "stg_03", order: 3, name: "Session booking", sourceApp: "Google Calendar", actionDescription: "Agreed slot booked on Google Calendar with Meet link", destinationApp: "Google Calendar", manualFriction: "Typing details and verifying slot availability" },
        { id: "stg_04", order: 4, name: "Payment verification", sourceApp: "M-Pesa", actionDescription: "Student pays deposit via Paybill 849201", destinationApp: "M-Pesa", manualFriction: "Manual SMS reconciliation" },
        { id: "stg_05", order: 5, name: "Lesson execution", sourceApp: "Google Meet", actionDescription: "60-min coaching session conducted", destinationApp: "Google Meet" },
        { id: "stg_06", order: 6, name: "Session follow-up", sourceApp: "Google Sheets", actionDescription: "Attendance and homework logged in roster", destinationApp: "Google Sheets", manualFriction: "Manual roster entry" }
      ]
    }
  ],
  connections: [
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
    }
  ],
  leads: [
    {
      id: "lead_01",
      organizationId: "org_james",
      name: "Mercy Chebet",
      phone: "+254 719 552 108",
      email: "mercy.chebet@gmail.com",
      source: "whatsapp",
      status: "new",
      notes: "Inquired about DELF B2 prep on WhatsApp",
      inquiredService: "Executive Exam Prep (90 min)",
      potentialValueKes: 3500,
      lastContactAt: "10 mins ago",
      createdAt: new Date().toISOString()
    }
  ],
  workflows: [
    {
      id: "wf_lead_autopilot",
      organizationId: "org_james",
      title: "Lead Follow-Up Autopilot",
      summary: "Captures WhatsApp inquiries in Google Sheets, sends syllabus, and follows up in 24h.",
      category: "lead_recovery",
      active: true,
      triggerDescription: "When an inquiry arrives on WhatsApp",
      requiredIntegrations: ["whatsapp_business", "google_calendar"],
      optionalIntegrations: ["google_sheets"],
      steps: [
        { id: "s1", label: "Save customer to Google Sheets student roster", actionType: "update_sheet", parameters: {}, icon: "file-spreadsheet" },
        { id: "s2", label: "Deliver lesson brochure to prospective student on WhatsApp", actionType: "send_whatsapp", parameters: {}, icon: "message-square" },
        { id: "s3", label: "Wait 24h & check if lesson booked on Google Calendar", actionType: "wait_delay", parameters: {}, icon: "clock" },
        { id: "s4", label: "Book session & create Google Meet link", actionType: "create_calendar_event", parameters: {}, icon: "calendar" },
        { id: "s5", label: "Send M-Pesa payment prompt for KES 3,500 via Paybill 849201", actionType: "request_mpesa", parameters: { amountKes: 3500 }, icon: "credit-card" }
      ],
      operationalFlow: [
        { id: "flow_01", stepNumber: 1, nodeType: "trigger", application: "WhatsApp", systemRole: "Inbound Channel", title: "Customer sends a WhatsApp message", description: "Student reaches out inquiring about French lessons or pricing packages." },
        { id: "flow_02", stepNumber: 2, nodeType: "intelligence", application: "Otomatizon", systemRole: "Operations Intelligence", title: "Otomatizon identifies a new inquiry", description: "Extracts contact information, verifies student status, and initiates the automated process." },
        { id: "flow_03", stepNumber: 3, nodeType: "action", application: "Google Sheets", systemRole: "Student Registry", title: "Customer information is recorded in Google Sheets", description: "Student name, WhatsApp phone number, and inquiry timestamp are appended to your active roster." },
        { id: "flow_04", stepNumber: 4, nodeType: "action", application: "WhatsApp", systemRole: "Information Delivery", title: "Course information is sent automatically", description: "Rate sheet, exam syllabus brochure, and Google Calendar booking link are dispatched instantly." },
        { id: "flow_05", stepNumber: 5, nodeType: "action", application: "Google Calendar", systemRole: "Booking Verification", title: "Google Calendar is checked", description: "Monitors your calendar availability to detect whether the student confirmed a lesson slot." },
        { id: "flow_06", stepNumber: 6, nodeType: "condition", application: "Otomatizon", systemRole: "Operational Decision", title: "If no booking exists after 24 hours, Otomatizon follows up", description: "Evaluates booking confirmation status after the 24-hour waiting period.", conditionText: "Has student confirmed a lesson on Google Calendar?", branchOutcome: { yes: "Stop follow-up sequence", no: "Send polite check-in message on WhatsApp" } },
        { id: "flow_07", stepNumber: 7, nodeType: "stop", application: "Otomatizon", systemRole: "Sequence Termination", title: "The follow-up stops when customer books or replies", description: "A Google Calendar invite with Meet link is confirmed, and an M-Pesa payment prompt is sent.", finalState: "Lead converted & scheduled on Calendar" }
      ],
      connectedApps: ["WhatsApp", "Google Sheets", "Google Calendar"],
      timingConfig: { delayHours: 24 },
      metrics: {
        runsCount: 24,
        leadsHelped: 21,
        hoursSaved: 6.7,
        revenueRecoveredKes: 73500
      },
      createdAt: "2026-08-10T08:00:00Z",
      lastRunAt: "12 mins ago"
    }
  ],
  opportunities: [
    {
      id: "opp_01",
      organizationId: "org_james",
      title: "14 leads were not followed up",
      problem: "You're losing leads between inquiry and booking.",
      evidence: "We observed 23 WhatsApp inquiries in your roster without follow-ups sent after 24 hours.",
      evidenceType: "OBSERVED",
      impactScore: 90,
      impactLevel: "High impact",
      confidenceScore: 94,
      estimatedTimeSavedHoursPerWeek: 4.5,
      estimatedRevenueAtRiskKes: 49000,
      estimatedBusinessValueKes: 49000,
      recommendation: "Automatically follow up after 24 hours when a lead hasn't booked.",
      suggestedWorkflowTitle: "Lead Follow-Up Autopilot",
      suggestedWorkflowId: "wf_lead_autopilot",
      requiredIntegrations: ["whatsapp_business", "google_calendar"],
      optionalIntegrations: ["google_sheets"],
      status: "discovered",
      detectedAt: "Today at 08:30",
      category: "lead_recovery"
    },
    {
      id: "opp_02",
      organizationId: "org_james",
      title: "6 lessons completed without payment",
      problem: "Students attend lessons but payment is collected days later.",
      evidence: "Based on what you told Otomatizon: 6 calendar sessions lack matching M-Pesa receipts within 24 hours.",
      evidenceType: "INFERRED",
      impactScore: 85,
      impactLevel: "High impact",
      confidenceScore: 92,
      estimatedTimeSavedHoursPerWeek: 3.0,
      estimatedRevenueAtRiskKes: 21000,
      estimatedBusinessValueKes: 21000,
      recommendation: "Automatically send M-Pesa STK push 18 hours before scheduled sessions.",
      suggestedWorkflowTitle: "Pre-Session Payment Follow-Up",
      suggestedWorkflowId: "wf_pre_payment",
      requiredIntegrations: ["google_calendar", "mpesa_safaricom", "whatsapp_business"],
      status: "discovered",
      detectedAt: "Yesterday at 14:15",
      category: "payment_reminder"
    }
  ],
  executions: [
    {
      id: "exec_01",
      workflowId: "wf_lead_autopilot",
      workflowTitle: "Lead Follow-Up Autopilot",
      triggerEvent: "WhatsApp inquiry from Mercy Chebet",
      entityName: "Mercy Chebet",
      status: "completed",
      currentStepIndex: 5,
      stepsTotal: 5,
      logSummary: "Syllabus delivered, Google Calendar slot reserved, M-Pesa prompt confirmed.",
      startedAt: "12 mins ago",
      completedAt: "12 mins ago"
    }
  ],
  activityLogs: [
    {
      id: "act_01",
      organizationId: "org_james",
      type: "lead_captured",
      title: "Student inquiry received via WhatsApp",
      description: "Mercy Chebet asked about DELF Exam Prep. Saved to Google Sheets.",
      timestamp: "Today at 08:45 AM",
      channel: "whatsapp",
      badgeColor: "emerald"
    },
    {
      id: "act_02",
      organizationId: "org_james",
      type: "booking_confirmed",
      title: "French coaching session booked on Calendar",
      description: "Reserved 60-min session with Mercy Chebet. Google Meet link generated.",
      timestamp: "Today at 08:46 AM",
      channel: "calendar",
      badgeColor: "blue"
    },
    {
      id: "act_03",
      organizationId: "org_james",
      type: "payment_reminder",
      title: "M-Pesa payment received (KES 3,500)",
      description: "Confirmed receipt QK91028472 via Paybill 849201.",
      timestamp: "Today at 08:48 AM",
      channel: "mpesa",
      badgeColor: "amber"
    }
  ],
  subscriptions: [
    {
      id: "sub_01",
      organizationId: "org_james",
      planId: "starter",
      status: "active",
      currentPeriodStart: "2026-08-01",
      currentPeriodEnd: "2026-09-01",
      priceKesMonthly: 499
    }
  ]
};

function readDb() {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  const targetFile = getDbTargetFile();

  if (!fs.existsSync(targetFile)) {
    try {
      fs.writeFileSync(targetFile, JSON.stringify(initialDb, null, 2), "utf8");
    } catch (e) {
      inMemoryDb = JSON.parse(JSON.stringify(initialDb));
      return inMemoryDb;
    }
    return initialDb;
  }
  try {
    const raw = fs.readFileSync(targetFile, "utf8");
    const parsed = JSON.parse(raw);
    
    // Ensure connections array exists
    if (!parsed.connections || parsed.connections.length === 0) {
      parsed.connections = initialDb.connections;
    }
    // Ensure workflow stages exist in default business profile
    if (parsed.businessProfiles && parsed.businessProfiles[0]) {
      if (!parsed.businessProfiles[0].workflowStages || parsed.businessProfiles[0].workflowStages.length === 0) {
        parsed.businessProfiles[0].workflowStages = initialDb.businessProfiles[0].workflowStages;
      }
      if (!parsed.businessProfiles[0].manualTasks) {
        parsed.businessProfiles[0].manualTasks = initialDb.businessProfiles[0].manualTasks;
      }
      if (!parsed.businessProfiles[0].frictionPoints) {
        parsed.businessProfiles[0].frictionPoints = initialDb.businessProfiles[0].frictionPoints;
      }
      if (!parsed.businessProfiles[0].customerType) {
        parsed.businessProfiles[0].customerType = initialDb.businessProfiles[0].customerType;
      }
    }
    // Ensure opportunities have requiredIntegrations & evidenceType
    if (parsed.opportunities) {
      parsed.opportunities.forEach((opp, i) => {
        if (!opp.evidenceType) opp.evidenceType = i % 2 === 0 ? "OBSERVED" : "INFERRED";
        if (!opp.requiredIntegrations) {
          opp.requiredIntegrations = ["whatsapp_business", "google_calendar"];
        }
      });
    }

    // Ensure workflows have operationalFlow
    if (parsed.workflows) {
      parsed.workflows.forEach((wf) => {
        if (!wf.operationalFlow || wf.operationalFlow.length === 0) {
          wf.operationalFlow = initialDb.workflows[0].operationalFlow;
        }
        if (!wf.connectedApps) {
          wf.connectedApps = ["WhatsApp", "Google Sheets", "Google Calendar"];
        }
      });
    }

    inMemoryDb = parsed;
    return parsed;
  } catch (err) {
    console.error("Error reading db file, restoring initialDb:", err);
    return initialDb;
  }
}

function writeDb(data) {
  inMemoryDb = data;
  const targetFile = getDbTargetFile();
  try {
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    // Keep in-memory on serverless read-only filesystem
  }
}

module.exports = {
  readDb,
  writeDb,
  getDbFilePath: () => getDbTargetFile()
};
