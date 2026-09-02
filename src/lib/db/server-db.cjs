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
      id: "mpesa",
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
  workflows: [],
  executions: [],
  leads: [],
  operationalEvents: [],
  activityLogs: [],
  teamMembers: [],
  subscriptions: [],
  opportunities: []
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
    inMemoryDb = JSON.parse(JSON.stringify(initialDb));
    return inMemoryDb;
  }
  try {
    const raw = fs.readFileSync(targetFile, "utf8");
    const parsed = JSON.parse(raw);
    
    // Ensure connections array exists
    if (!parsed.connections || parsed.connections.length === 0) {
      parsed.connections = initialDb.connections || [];
    }
    // Ensure workflow stages exist in default business profile
    if (parsed.businessProfiles && parsed.businessProfiles[0]) {
      if (!parsed.businessProfiles[0].workflowStages) {
        parsed.businessProfiles[0].workflowStages = [];
      }
      if (!parsed.businessProfiles[0].manualTasks) {
        parsed.businessProfiles[0].manualTasks = [];
      }
      if (!parsed.businessProfiles[0].frictionPoints) {
        parsed.businessProfiles[0].frictionPoints = [];
      }
      if (!parsed.businessProfiles[0].customerType) {
        parsed.businessProfiles[0].customerType = "Direct clients";
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
    console.error("Error reading db file, restoring initialDb:", err);
    inMemoryDb = JSON.parse(JSON.stringify(initialDb));
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
}

module.exports = {
  readDb,
  writeDb,
  getDbFilePath: () => getDbTargetFile()
};
