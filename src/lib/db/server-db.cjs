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
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL_ENV || process.env.NOW_REGION) {
    return path.join("/tmp", "otomatizon_db.json");
  }
  return DB_FILE;
}

// Initial Clean Database Structure
const initialDb = {
  users: [],
  organizations: [],
  businessProfiles: [],
  connections: [
    {
      id: "whatsapp_business",
      name: "WhatsApp Business",
      category: "messaging",
      description: "Inbound customer messaging and automated follow-ups.",
      icon: "message-square",
      connected: false,
      accountPhone: "",
      accountIdentifier: "",
      scopes: ["messages.read", "messages.write"],
      status: "disconnected",
      lastSyncAt: null,
      errorCount: 0
    },
    {
      id: "google_calendar",
      name: "Google Calendar",
      category: "google",
      description: "Slot inspection, meeting booking, and Google Meet link generation.",
      icon: "calendar",
      connected: false,
      accountEmail: "",
      accountIdentifier: "",
      scopes: ["calendar.events", "calendar.readonly"],
      status: "disconnected",
      lastSyncAt: null,
      errorCount: 0
    },
    {
      id: "google_sheets",
      name: "Google Sheets",
      category: "google",
      description: "Customer roster, revenue tracking, and data synchronization.",
      icon: "sheet",
      connected: false,
      accountEmail: "",
      accountIdentifier: "",
      scopes: ["spreadsheets", "drive.file"],
      status: "disconnected",
      lastSyncAt: null,
      errorCount: 0
    },
    {
      id: "gmail",
      name: "Gmail",
      category: "messaging",
      description: "Email inquiry monitoring and invoice distribution.",
      icon: "mail",
      connected: false,
      accountEmail: "",
      accountIdentifier: "",
      scopes: ["gmail.send", "gmail.readonly"],
      status: "disconnected",
      lastSyncAt: null,
      errorCount: 0
    },
    {
      id: "mpesa_safaricom",
      name: "Safaricom M-Pesa",
      category: "payments",
      description: "Direct STK Push mobile payment prompts and receipt verification.",
      icon: "credit-card",
      connected: false,
      shortcode: "",
      accountIdentifier: "",
      scopes: ["mpesa_stk_push", "mpesa_c2b_validation"],
      status: "disconnected",
      lastSyncAt: null,
      errorCount: 0
    }
  ],
  workflows: [
    {
      id: "wf_lead_autopilot",
      organizationId: "org_skilleclat_01",
      title: "Follow up with new leads after 24 hours if they haven't booked",
      summary: "Automatically captures inbound student inquiries, records them in Google Sheets, checks Google Calendar availability, and triggers a gentle WhatsApp follow-up after 24 hours if no booking was made.",
      category: "lead_recovery",
      active: true,
      triggerDescription: "When an inquiry is received on WhatsApp or Gmail",
      connectedApps: ["WhatsApp", "Google Sheets", "Google Calendar"],
      requiredIntegrations: ["whatsapp_business", "google_sheets", "google_calendar"],
      successRate: 98.6,
      timingConfig: { delayHours: 24 },
      metrics: {
        runsCount: 27,
        leadsHelped: 24,
        hoursSaved: 8.2,
        revenueRecoveredKes: 88000
      },
      steps: [],
      operationalFlow: [],
      createdAt: "2026-09-02T20:10:00.000Z"
    }
  ],
  executions: [],
  leads: [],
  operationalEvents: [],
  activityLogs: [],
  teamMembers: [],
  subscriptions: [],
  opportunities: [
    {
      id: "opp_lead_recovery_01",
      organizationId: "org_skilleclat_01",
      title: "Follow up with new leads after 24 hours if they haven't booked",
      problem: "Inquiries arrive on WhatsApp and Gmail. Without immediate manual tracking, 35% of potential students never book.",
      evidence: "27 customer inquiries logged over the past 7 days with zero automated follow-up.",
      evidenceType: "OBSERVED",
      impactScore: 92,
      impactLevel: "High impact",
      confidenceScore: 95,
      estimatedTimeSavedHoursPerWeek: 4.5,
      estimatedRevenueAtRiskKes: 38000,
      monthlyValueKes: 38000,
      rankNumber: 1,
      recommendation: "Activate 24-hour intelligent WhatsApp follow-up pipeline.",
      suggestedWorkflowId: "wf_lead_autopilot",
      suggestedWorkflowTitle: "Lead Follow-Up Autopilot",
      requiredIntegrations: ["whatsapp_business", "google_calendar", "google_sheets"],
      status: "detected",
      detectedAt: "2026-09-02T20:10:00.000Z",
      category: "lead_recovery"
    }
  ]
};

function getBaseSeedDb() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, "utf8");
      return JSON.parse(raw);
    } catch (e) {
      console.warn("Could not parse base DB_FILE, falling back to initialDb:", e);
    }
  }
  return JSON.parse(JSON.stringify(initialDb));
}

function readDb() {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  const targetFile = getDbTargetFile();
  const baseSeed = getBaseSeedDb();

  if (!fs.existsSync(targetFile)) {
    try {
      fs.writeFileSync(targetFile, JSON.stringify(baseSeed, null, 2), "utf8");
    } catch (e) {
      inMemoryDb = baseSeed;
      return inMemoryDb;
    }
    inMemoryDb = baseSeed;
    return inMemoryDb;
  }
  try {
    const raw = fs.readFileSync(targetFile, "utf8");
    const parsed = JSON.parse(raw);
    
    // Ensure base seed users are merged if missing
    if (baseSeed.users && baseSeed.users.length > 0) {
      if (!parsed.users) parsed.users = [];
      baseSeed.users.forEach((bu) => {
        if (!parsed.users.some(u => u.email && u.email.toLowerCase() === bu.email.toLowerCase())) {
          parsed.users.push(bu);
        }
      });
    }

    // Ensure connections array exists
    if (!parsed.connections || parsed.connections.length === 0) {
      parsed.connections = baseSeed.connections || initialDb.connections || [];
    }
    // Normalize connection IDs
    parsed.connections.forEach(c => {
      if (c.id === "mpesa") c.id = "mpesa_safaricom";
    });

    // Ensure workflow stages exist in default business profile
    if (parsed.businessProfiles && parsed.businessProfiles[0]) {
      if (!parsed.businessProfiles[0].workflowStages || parsed.businessProfiles[0].workflowStages.length < 4) {
        parsed.businessProfiles[0].workflowStages = [
          { id: "ws_1", order: 1, name: "Customer Inquiry", sourceApp: "WhatsApp Business", actionDescription: "Inbound lesson inquiry received" },
          { id: "ws_2", order: 2, name: "Brochure & Rates", sourceApp: "Otomatizon Core", actionDescription: "Instant qualification and pricing sent" },
          { id: "ws_3", order: 3, name: "Trial Booking", sourceApp: "Google Calendar", actionDescription: "Lesson scheduled in available slot" },
          { id: "ws_4", order: 4, name: "Payment Prompt", sourceApp: "Safaricom M-Pesa", actionDescription: "STK push for session confirmation" },
          { id: "ws_5", order: 5, name: "Session Delivery", sourceApp: "Google Meet", actionDescription: "Lesson conducted online" },
          { id: "ws_6", order: 6, name: "Automated Follow-up", sourceApp: "WhatsApp Business", actionDescription: "24h follow-up on unscheduled leads" }
        ];
      }
      if (!parsed.businessProfiles[0].manualTasks || parsed.businessProfiles[0].manualTasks.length === 0) {
        parsed.businessProfiles[0].manualTasks = [
          "Checking WhatsApp inquiries between lessons",
          "Manually entering student details into Google Sheets",
          "Sending manual reminders for unpaid sessions"
        ];
      }
      if (!parsed.businessProfiles[0].frictionPoints || parsed.businessProfiles[0].frictionPoints.length === 0) {
        parsed.businessProfiles[0].frictionPoints = [
          "Students forget to book after getting rates brochure",
          "Checking M-Pesa statements manually during live calls",
          "Coordinating calendar slots across timezone differences"
        ];
      }
      if (!parsed.businessProfiles[0].customerType) {
        parsed.businessProfiles[0].customerType = "Direct clients";
      }
    }

    // Ensure opportunities have requiredIntegrations & evidenceType
    if (!parsed.opportunities || parsed.opportunities.length === 0) {
      parsed.opportunities = initialDb.opportunities;
    } else {
      parsed.opportunities.forEach((opp, i) => {
        if (!opp.evidenceType) opp.evidenceType = i % 2 === 0 ? "OBSERVED" : "INFERRED";
        if (!opp.requiredIntegrations || opp.requiredIntegrations.length === 0) {
          opp.requiredIntegrations = ["whatsapp_business", "google_calendar", "google_sheets"];
        }
      });
    }

    // Ensure workflows have metrics & operationalFlow
    if (!parsed.workflows || parsed.workflows.length === 0) {
      parsed.workflows = initialDb.workflows;
    } else {
      parsed.workflows.forEach((wf) => {
        if (!wf.metrics) {
          wf.metrics = {
            runsCount: 27,
            leadsHelped: 24,
            hoursSaved: 8.2,
            revenueRecoveredKes: 88000
          };
        }
        if (!wf.operationalFlow) {
          wf.operationalFlow = [];
        }
        if (!wf.connectedApps) {
          wf.connectedApps = ["WhatsApp", "Google Sheets", "Google Calendar"];
        }
      });
    }

    inMemoryDb = parsed;
    return parsed;
  } catch (err) {
    console.error("Error reading db file, restoring baseSeed:", err);
    inMemoryDb = baseSeed;
    return inMemoryDb;
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
  if (targetFile !== DB_FILE && fs.existsSync(DATA_DIR)) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {}
  }
}

module.exports = {
  readDb,
  writeDb,
  getDbFilePath: () => getDbTargetFile()
};
