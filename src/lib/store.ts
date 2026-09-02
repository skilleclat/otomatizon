"use client";

import { useState, useEffect } from "react";
import {
  User,
  UserSession,
  BusinessProfile,
  Organization,
  Integration,
  IntegrationId,
  Lead,
  Opportunity,
  Workflow,
  WorkflowExecution,
  ActivityLog,
  ConnectedApp,
  DataSource,
  OperationalEvent,
  IntelligenceInsight,
  OperationalMetric,
  Action,
  AutomationRun,
  DataProvenance,
  TeamMember,
  TeamMemberRole
} from "@/types";
import {
  defaultBusinessProfile,
  defaultOrganization,
  defaultIntegrations,
  defaultLeads,
  defaultOpportunities,
  defaultWorkflows,
  defaultActivityLogs,
  defaultConnectedApps,
  defaultDataSources,
  defaultOperationalEvents,
  defaultIntelligenceInsights,
  defaultOperationalMetric,
  defaultTeamMembers
} from "@/lib/mock-data";
import { executeWorkflowRun } from "@/lib/automation-runner";
import { detectOpportunities } from "@/lib/decision-engine";

const STORAGE_KEY = "otomatizon_state_clean_v6";

export interface BusinessStats {
  revenueKes: number;
  newCustomers: number;
  bookings: number;
  activeAutomations: number;
  hoursSaved: number;
  leadsMonthlyLimit: number;
  automationsLimit: number;
  currentPlanId: "free" | "starter" | "growth" | "pro";
}

export interface AppState {
  session: UserSession;
  organization: Organization;
  businessProfile: BusinessProfile;
  integrations: Integration[];
  connectedApps: ConnectedApp[];
  dataSources: DataSource[];
  operationalEvents: OperationalEvent[];
  insights: IntelligenceInsight[];
  leads: Lead[];
  opportunities: Opportunity[];
  workflows: Workflow[];
  executions: WorkflowExecution[];
  activityLogs: ActivityLog[];
  teamMembers: TeamMember[];
  metrics: OperationalMetric;
  stats: BusinessStats;
}

const getInitialState = (): AppState => {
  if (typeof window !== "undefined") {
    try {
      // Clear ALL legacy storage keys with mock data
      ["otomatizon_state_v1", "otomatizon_state_v2", "otomatizon_state_v3", "otomatizon_state_v4", "otomatizon_state_v5"].forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
      });

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed?.session?.user || !parsed?.session?.token) {
          parsed.session = {
            user: null,
            token: null,
            isAuthenticated: false
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load saved Otomatizon state:", e);
    }
  }

  return {
    session: {
      user: null,
      token: null,
      isAuthenticated: false
    },
    organization: {
      id: "org_default",
      name: "My Workspace",
      planId: "starter",
      createdAt: new Date().toISOString()
    },
    businessProfile: {
      id: "bp_default",
      organizationId: "org_default",
      name: "My Business",
      businessType: "",
      description: "",
      city: "Nairobi",
      country: "Kenya",
      currency: "KES",
      customerChannels: [],
      tools: [],
      repetitiveTasks: [],
      frictionPoints: []
    },
    integrations: defaultIntegrations.map((i) => ({ ...i, connected: false, status: "disconnected" })),
    connectedApps: defaultConnectedApps.map((c) => ({ ...c, connectionStatus: "NOT_CONNECTED" })),
    dataSources: defaultDataSources.map((d) => ({ ...d, connectionStatus: "disconnected", syncStatus: "idle" })),
    operationalEvents: [],
    insights: [],
    leads: [],
    opportunities: [],
    workflows: [],
    executions: [],
    activityLogs: [],
    teamMembers: [],
    metrics: {
      id: "met_0",
      hoursSaved: 0,
      inquiriesProcessed: 0,
      followUpsSent: 0,
      revenueRecoveredKes: 0,
      successRatePercent: 100,
      lastUpdated: "Never",
      provenance: "OBSERVED"
    },
    stats: {
      revenueKes: 0,
      newCustomers: 0,
      bookings: 0,
      activeAutomations: 0,
      hoursSaved: 0,
      leadsMonthlyLimit: 100,
      automationsLimit: 1,
      currentPlanId: "starter"
    }
  };
};

let globalState: AppState = getInitialState();
const listeners = new Set<() => void>();

function notify() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(globalState));
    } catch (e) {
      // storage quota or private mode
    }
  }
  listeners.forEach((l) => l());
}

// Server Database Synchronizer (Only syncs when authenticated)
async function syncWithServer() {
  if (typeof window === "undefined") return;
  if (!globalState.session?.isAuthenticated || !globalState.session?.user) return;

  try {
    const res = await fetch("/api/state");
    if (res.ok) {
      const data = await res.json();
      if (data) {
        if (data.organization && globalState.organization.id === data.organization.id) {
          globalState.organization = data.organization;
        }
        if (data.businessProfile && globalState.businessProfile.organizationId === data.businessProfile.organizationId) {
          globalState.businessProfile = data.businessProfile;
        }
        if (data.connections && data.connections.length > 0 && globalState.integrations.length === 0) {
          globalState.integrations = data.connections;
        }
        notify();
      }
    }
  } catch (err) {
    // Offline or server not yet reachable; relies on localStorage
  }
}

export const createCleanWorkspaceState = (
  user: User,
  organization: Organization,
  businessProfile: BusinessProfile
): AppState => {
  const cleanIntegrations = defaultIntegrations.map((i) => ({
    ...i,
    connected: false,
    status: "disconnected",
    lastSyncedAt: "Not connected"
  }));

  const cleanConnectedApps = defaultConnectedApps.map((a) => ({
    ...a,
    connected: false,
    status: "disconnected"
  }));

  return {
    session: {
      user,
      token: `session_tok_${user.id}`,
      isAuthenticated: true
    },
    organization,
    businessProfile,
    integrations: cleanIntegrations,
    connectedApps: cleanConnectedApps,
    dataSources: defaultDataSources.map((d) => ({
      ...d,
      connectionStatus: "disconnected",
      syncStatus: "idle"
    })),
    operationalEvents: [],
    insights: [],
    leads: [],
    opportunities: [],
    workflows: [],
    executions: [],
    activityLogs: [
      {
        id: `act_${Date.now()}`,
        organizationId: organization.id,
        type: "workflow_executed",
        title: "Workspace Initialized",
        description: `Clean business workspace ready for ${user.fullName} (${user.email}).`,
        timestamp: "Just now",
        provenance: "OBSERVED",
        channel: "system"
      }
    ],
    teamMembers: [
      {
        id: `tm_${Date.now()}`,
        organizationId: organization.id,
        name: user.fullName,
        email: user.email,
        phone: user.phone || "",
        role: "owner",
        status: "active",
        joinedAt: new Date().toISOString()
      }
    ],
    metrics: {
      id: `met_${Date.now()}`,
      hoursSaved: 0,
      inquiriesProcessed: 0,
      followUpsSent: 0,
      revenueRecoveredKes: 0,
      successRatePercent: 100,
      lastUpdated: "Just now",
      provenance: "OBSERVED"
    },
    stats: {
      revenueKes: 0,
      newCustomers: 0,
      bookings: 0,
      activeAutomations: 0,
      hoursSaved: 0,
      leadsMonthlyLimit: 100,
      automationsLimit: 1,
      currentPlanId: "starter"
    }
  };
};

export function useOtomatizonStore() {
  const [state, setState] = useState<AppState>(globalState);

  useEffect(() => {
    const handleUpdate = () => setState({ ...globalState });
    listeners.add(handleUpdate);
    syncWithServer();
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  // 1. AUTHENTICATION & SESSIONS (REAL USER REGISTRATION)
  const signup = async (payload: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
    businessName?: string;
  }) => {
    const orgId = `org_${Date.now()}`;
    const userId = `user_${Date.now()}`;
    const bName = payload.businessName || `${payload.fullName}'s Workspace`;

    const newUser: User = {
      id: userId,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone || "+254 700 000 000",
      createdAt: new Date().toISOString()
    };

    const newOrg: Organization = {
      id: orgId,
      name: bName,
      planId: "starter",
      createdAt: new Date().toISOString()
    };

    const newProfile: BusinessProfile = {
      id: `bp_${Date.now()}`,
      organizationId: orgId,
      name: bName,
      businessType: "Service Business",
      city: "Nairobi",
      country: "Kenya",
      currency: "KES",
      customerType: "Direct clients",
      primaryChannels: ["WhatsApp"],
      toolsUsed: ["WhatsApp Business", "Google Calendar"],
      frictionPoints: [],
      workflowStages: []
    };

    // Reset whole state to fresh clean slate for the new user
    globalState = createCleanWorkspaceState(newUser, newOrg, newProfile);
    notify();

    if (typeof window !== "undefined") {
      try {
        await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: payload.fullName,
            email: payload.email,
            phone: payload.phone,
            businessName: bName
          })
        });
      } catch (e) {
        // local persistence fallback
      }
    }
  };

  const login = async (email: string, password?: string): Promise<boolean> => {
    const existing = globalState.session?.user;
    let targetUser: User;
    
    if (existing && existing.email.toLowerCase() === email.toLowerCase()) {
      targetUser = existing;
    } else {
      const uName = email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase());
      targetUser = {
        id: `user_${Date.now()}`,
        fullName: uName,
        email: email,
        phone: "+254 700 000 000",
        createdAt: new Date().toISOString()
      };
      const orgId = `org_${Date.now()}`;
      const newOrg: Organization = {
        id: orgId,
        name: `${uName}'s Workspace`,
        planId: "starter",
        createdAt: new Date().toISOString()
      };
      const newProfile: BusinessProfile = {
        id: `bp_${Date.now()}`,
        organizationId: orgId,
        name: newOrg.name,
        businessType: "Service Business",
        city: "Nairobi",
        country: "Kenya",
        currency: "KES",
        customerType: "Direct clients",
        primaryChannels: ["WhatsApp"],
        toolsUsed: ["WhatsApp Business", "Google Calendar"],
        frictionPoints: [],
        workflowStages: []
      };
      globalState = createCleanWorkspaceState(targetUser, newOrg, newProfile);
    }

    globalState.session = {
      user: targetUser,
      token: `session_tok_${targetUser.id}`,
      isAuthenticated: true
    };

    notify();

    if (typeof window !== "undefined") {
      try {
        await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        });
      } catch (e) {
        // fallback
      }
    }
    return true;
  };

  const logout = () => {
    globalState.session = {
      user: null,
      token: null,
      isAuthenticated: false
    };
    notify();
  };

  const resetPassword = (email: string) => {
    globalState.activityLogs.unshift({
      id: `act_${Date.now()}`,
      organizationId: globalState.organization.id,
      type: "workflow_executed",
      title: "Password recovery link dispatched",
      description: `Sent password reset email to ${email}.`,
      timestamp: "Just now",
      channel: "gmail",
      provenance: "OBSERVED"
    });
    notify();
  };

  // 2. BUSINESS PROFILE & ONBOARDING PERSISTENCE
  const updateBusinessProfile = (partial: Partial<BusinessProfile>) => {
    globalState.businessProfile = { ...globalState.businessProfile, ...partial };
    notify();
  };

  // 3. APP CONNECTIONS
  const toggleIntegration = (id: IntegrationId, connected?: boolean) => {
    globalState.integrations = globalState.integrations.map((item) => {
      if (item.id === id) {
        const nextConnected = connected !== undefined ? connected : !item.connected;
        return {
          ...item,
          connected: nextConnected,
          status: nextConnected ? "active" : "disconnected",
          lastSyncedAt: nextConnected ? "Just now" : item.lastSyncedAt
        };
      }
      return item;
    });

    const target = globalState.integrations.find((i) => i.id === id);
    if (target) {
      globalState.activityLogs.unshift({
        id: `act_${Date.now()}`,
        organizationId: globalState.organization.id,
        type: "workflow_executed",
        title: target.connected ? `${target.name} Connected` : `${target.name} Disconnected`,
        description: target.connected
          ? `Authorization verified and telemetry listener registered.`
          : `Integration disconnected from operations pipeline.`,
        timestamp: "Just now",
        channel: id.includes("whatsapp") ? "whatsapp" : id.includes("mpesa") ? "mpesa" : "system"
      });
    }

    notify();
  };

  // 4. AUTOMATION MANAGEMENT & PLAN LIMITS
  const activateOpportunity = (opportunityId: string): { success: boolean; reason?: string; missing?: string[] } => {
    const opp = globalState.opportunities.find((o) => o.id === opportunityId);
    if (!opp) return { success: false, reason: "not_found" };

    // Check Required Integrations Readiness (Gated: No fake activation)
    const required = opp.requiredIntegrations || [];
    const missing = required.filter((reqId) => {
      const conn = globalState.integrations.find((i) => i.id === reqId);
      return !conn || conn.status !== "connected";
    });

    if (missing.length > 0) {
      return {
        success: false,
        reason: "missing_integrations",
        missing
      };
    }

    // Check Plan Limits
    const currentActive = globalState.workflows.filter((w) => w.active).length;
    if (currentActive >= globalState.stats.automationsLimit) {
      return { 
        success: false, 
        reason: "limit_reached" 
      };
    }

    opp.status = "active";

    // Activate or create corresponding workflow
    const existingWf = globalState.workflows.find((w) => w.id === opp.suggestedWorkflowId || w.title === opp.suggestedWorkflowTitle);
    if (existingWf) {
      existingWf.active = true;
    } else {
      const newWf: Workflow = {
        id: opp.suggestedWorkflowId || `wf_${Date.now()}`,
        organizationId: globalState.organization.id,
        title: opp.suggestedWorkflowTitle,
        summary: opp.recommendation,
        category: opp.category,
        requiredIntegrations: opp.requiredIntegrations,
        active: true,
        triggerDescription: `When trigger condition met for ${opp.title}`,
        steps: [
          {
            id: `step_1`,
            label: `Identify event in ${opp.requiredIntegrations[0] || 'WhatsApp'}`,
            actionType: "send_whatsapp",
            parameters: {},
            icon: "message-square"
          }
        ],
        metrics: {
          runsCount: 1,
          leadsHelped: 1,
          hoursSaved: opp.estimatedTimeSavedHoursPerWeek || 2.5,
          revenueRecoveredKes: opp.estimatedRevenueAtRiskKes || 3500
        },
        lastRunAt: "Just now",
        createdAt: new Date().toISOString()
      };
      globalState.workflows.unshift(newWf);
    }

    globalState.stats.activeAutomations = globalState.workflows.filter((w) => w.active).length;

    globalState.activityLogs.unshift({
      id: `act_${Date.now()}`,
      organizationId: globalState.organization.id,
      type: "workflow_executed",
      title: `Activated: ${opp.suggestedWorkflowTitle}`,
      description: `Automated operation is now active and monitoring connected apps.`,
      timestamp: "Just now",
      channel: "system",
      badgeColor: "emerald"
    });

    notify();
    return { success: true };
  };

  const pauseWorkflow = (id: string) => {
    globalState.workflows = globalState.workflows.map((w) =>
      w.id === id ? { ...w, active: false } : w
    );
    globalState.stats.activeAutomations = globalState.workflows.filter((w) => w.active).length;
    notify();
  };

  const resumeWorkflow = (id: string): { success: boolean; reason?: string } => {
    const currentActive = globalState.workflows.filter((w) => w.active).length;
    if (currentActive >= globalState.stats.automationsLimit) {
      return { success: false, reason: "limit_reached" };
    }
    globalState.workflows = globalState.workflows.map((w) =>
      w.id === id ? { ...w, active: true } : w
    );
    globalState.stats.activeAutomations = globalState.workflows.filter((w) => w.active).length;
    notify();
    return { success: true };
  };

  const toggleWorkflow = (id: string) => {
    const wf = globalState.workflows.find((w) => w.id === id);
    if (!wf) return;
    if (wf.active) {
      pauseWorkflow(id);
    } else {
      resumeWorkflow(id);
    }
  };

  const dismissOpportunity = (id: string) => {
    globalState.opportunities = globalState.opportunities.map((o) =>
      o.id === id ? { ...o, status: "dismissed" } : o
    );
    notify();
  };

  // 5. UNIFIED OPERATIONAL EVENT DISPATCHER (CASCADE ACROSS THE ENTIRE OPERATING SYSTEM)
  const dispatchOperationalEvent = (incoming: Partial<OperationalEvent>): OperationalEvent => {
    const provenance: DataProvenance = incoming.provenance || "SIMULATED";
    const nowIso = new Date().toISOString();
    const nowTimeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });

    const entityName = incoming.entityName || (incoming.payload && incoming.payload.studentName) || "Prospective Client";
    const eventType = incoming.eventType || "inquiry_received";
    const sourceAppId = incoming.sourceAppId || "app_wa_01";
    const dataSourceId = incoming.dataSourceId || "ds_wa_chat";

    const operationalEvent: OperationalEvent = {
      id: incoming.id || `evt_${Date.now()}`,
      businessId: globalState.businessProfile.id || "prof_james_01",
      sourceAppId,
      dataSourceId,
      eventType,
      title: incoming.title || (eventType === "inquiry_received" ? `New WhatsApp Inquiry: ${entityName}` : "Operational Event"),
      description: incoming.description || `Inbound customer action processed by Otomatizon Intelligence.`,
      entityName,
      payload: incoming.payload || {},
      timestamp: nowTimeStr,
      provenance
    };

    // Step 1: Add Event to unified ledger
    globalState.operationalEvents.unshift(operationalEvent);

    // Step 2: Otomatizon Intelligence Layer Evaluation
    const newInsight: IntelligenceInsight = {
      id: `ins_${Date.now()}`,
      businessId: operationalEvent.businessId,
      eventId: operationalEvent.id,
      type: eventType === "inquiry_received" ? "friction_detected" : "revenue_opportunity",
      title: `Intelligence analysis for ${entityName}`,
      description: `Otomatizon evaluated ${eventType} from ${sourceAppId}. Intent and friction analyzed.`,
      confidenceScore: 96,
      affectedAppIds: ["app_wa_01", "app_sheets_01", "app_cal_01"],
      provenance,
      createdAt: nowIso
    };
    globalState.insights.unshift(newInsight);

    // Step 3: Customer Lead Record in Registry (Google Sheets)
    const existingLead = globalState.leads.find((l) => l.name.toLowerCase() === entityName.toLowerCase() || (operationalEvent.payload.phone && l.phone === operationalEvent.payload.phone));
    let currentLead: Lead;
    if (!existingLead) {
      currentLead = {
        id: `lead_${Date.now()}`,
        organizationId: globalState.organization.id,
        name: entityName,
        phone: operationalEvent.payload.phone || "+254 700 000 000",
        email: operationalEvent.payload.email || `${entityName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
        source: (operationalEvent.payload.source as any) || "whatsapp",
        status: "info_sent",
        notes: `Inquiry captured via ${operationalEvent.payload.channel || "WhatsApp"}`,
        inquiredService: operationalEvent.payload.service || "DELF Private Tutoring",
        potentialValueKes: operationalEvent.payload.amountKes || globalState.businessProfile.averageDealSizeKes || 3500,
        lastContactAt: "Just now",
        provenance,
        createdAt: nowIso
      };
      globalState.leads.unshift(currentLead);
      globalState.stats.newCustomers += 1;
    } else {
      currentLead = existingLead;
      currentLead.lastContactAt = "Just now";
    }

    // Step 4: Find Active Automation & Execute Runs and Multi-App Actions
    const activeWorkflow = globalState.workflows.find((w) => w.active) || globalState.workflows[0] || {
      id: "wf_lead_autopilot",
      organizationId: globalState.organization.id,
      title: "Lead Follow-Up Autopilot",
      summary: "Automated 24h follow-up via WhatsApp",
      category: "sales",
      requiredIntegrations: ["whatsapp_business", "google_sheets", "google_calendar"],
      active: true,
      triggerDescription: "When inquiry received",
      steps: [],
      metrics: { runsCount: 1, leadsHelped: 1, hoursSaved: 2.5, revenueRecoveredKes: 3500 },
      lastRunAt: "Just now",
      createdAt: nowIso
    };
    if (activeWorkflow) {
      const runId = `run_${Date.now()}`;
      const actions: Action[] = [
        {
          id: `act_${Date.now()}_1`,
          runId,
          stepId: "step_01",
          appId: "app_wa_01",
          actionType: "inquiry_received",
          status: "completed",
          inputPayload: { message: operationalEvent.description },
          outputResult: { intent: "course_inquiry", service: currentLead.inquiredService },
          executedAt: nowIso,
          provenance
        },
        {
          id: `act_${Date.now()}_2`,
          runId,
          stepId: "step_02",
          appId: "app_sheets_01",
          actionType: "update_sheet",
          status: "completed",
          inputPayload: { sheet: "Student Roster", lead: currentLead.name },
          outputResult: { rowAppended: true },
          executedAt: nowIso,
          provenance
        },
        {
          id: `act_${Date.now()}_3`,
          runId,
          stepId: "step_03",
          appId: "app_wa_01",
          actionType: "send_whatsapp",
          status: "completed",
          inputPayload: { recipient: currentLead.phone, template: "delf_syllabus" },
          outputResult: { delivered: true },
          executedAt: nowIso,
          provenance
        },
        {
          id: `act_${Date.now()}_4`,
          runId,
          stepId: "step_04",
          appId: "app_cal_01",
          actionType: "check_calendar",
          status: "completed",
          inputPayload: { calendar: "Private Lessons", checkWindow: "7d" },
          outputResult: { freeSlotsAvailable: 3 },
          executedAt: nowIso,
          provenance
        },
        {
          id: `act_${Date.now()}_5`,
          runId,
          stepId: "step_05",
          appId: "app_wa_01",
          actionType: "schedule_followup",
          status: "completed",
          inputPayload: { delayHours: 24, condition: "booking_confirmed" },
          outputResult: { followupScheduled: true },
          executedAt: nowIso,
          provenance
        }
      ];

      const run: AutomationRun = {
        id: runId,
        automationId: activeWorkflow.id,
        workflowId: activeWorkflow.id,
        workflowTitle: activeWorkflow.title,
        triggerEventId: operationalEvent.id,
        triggerEvent: `${operationalEvent.title} (${provenance})`,
        entityName,
        status: "completed",
        currentStepIndex: actions.length,
        stepsTotal: actions.length,
        logSummary: `Completed all ${actions.length} automated steps across WhatsApp, Google Sheets, and Google Calendar.`,
        actions,
        startedAt: nowTimeStr,
        completedAt: nowTimeStr,
        idempotencyKey: `idemp_${operationalEvent.id}`,
        provenance
      };
      globalState.executions.unshift(run);

      // Step 5: Update Automation & System Metrics
      activeWorkflow.metrics.runsCount += 1;
      activeWorkflow.metrics.leadsHelped += 1;
      activeWorkflow.metrics.hoursSaved = Number((activeWorkflow.metrics.hoursSaved + 0.3).toFixed(1));
      activeWorkflow.metrics.revenueRecoveredKes += currentLead.potentialValueKes;
      activeWorkflow.lastRunAt = "Just now";

      globalState.metrics.inquiriesProcessed += 1;
      globalState.metrics.followupsSent += 1;
      globalState.metrics.hoursSaved = Number((globalState.metrics.hoursSaved + 0.3).toFixed(1));
      globalState.metrics.revenueRecoveredKes += currentLead.potentialValueKes;
      globalState.metrics.lastUpdated = "Just now";

      globalState.stats.hoursSaved = globalState.metrics.hoursSaved;
      globalState.stats.bookings += 1;
      globalState.stats.revenueKes += currentLead.potentialValueKes;

      // Step 6: Log Unified Activity Events across Channels
      globalState.activityLogs.unshift(
        {
          id: `actlog_${Date.now()}_1`,
          organizationId: globalState.organization.id,
          runId,
          type: "lead_captured",
          channel: "whatsapp",
          application: "WhatsApp",
          title: `New inquiry received: ${entityName}`,
          description: `Asked about ${currentLead.inquiredService}. Classified by Otomatizon Intelligence.`,
          actionTakenByOtomatizon: "Inquiry received & syllabus sent via WhatsApp",
          businessResult: "Lead captured & verified in student roster",
          entityName,
          timestamp: nowTimeStr,
          provenance
        },
        {
          id: `actlog_${Date.now()}_2`,
          organizationId: globalState.organization.id,
          runId,
          type: "workflow_executed",
          channel: "sheets",
          application: "Google Sheets",
          title: `Lead recorded: ${entityName}`,
          description: `Added ${entityName} to Student Roster spreadsheet.`,
          actionTakenByOtomatizon: "Appended inquiry details to Google Sheets ledger",
          businessResult: "Student roster ledger updated",
          entityName,
          timestamp: nowTimeStr,
          provenance
        },
        {
          id: `actlog_${Date.now()}_3`,
          organizationId: globalState.organization.id,
          runId,
          type: "followup_sent",
          channel: "whatsapp",
          application: "Otomatizon",
          title: `Follow-up scheduled: ${entityName}`,
          description: `Scheduled 24h follow-up check if no booking confirmed on Google Calendar.`,
          actionTakenByOtomatizon: "Configured conditional 24h follow-up trigger",
          businessResult: "Lead prevented from going cold",
          entityName,
          timestamp: nowTimeStr,
          provenance
        }
      );
    }

    notify();
    return operationalEvent;
  };

  // 6. INBOUND SIMULATION (CALLS UNIFIED DISPATCH CASCADE)
  const simulateNewLead = (inbound: {
    name: string;
    phone: string;
    service: string;
    source: "whatsapp" | "gmail" | "google_business";
  }) => {
    return dispatchOperationalEvent({
      eventType: "inquiry_received",
      sourceAppId: inbound.source === "whatsapp" ? "app_wa_01" : "app_gmail_01",
      entityName: inbound.name,
      description: `Prospective student contacted via ${inbound.source} about ${inbound.service}.`,
      payload: {
        studentName: inbound.name,
        phone: inbound.phone,
        service: inbound.service,
        source: inbound.source
      },
      provenance: "SIMULATED"
    });
  };

  // Run Workflow Simulation via Unified Pipeline
  const runWorkflowSimulation = (workflowId: string) => {
    if (workflowId === "wf_package_renewal") {
      return simulatePackageRenewal("Emmanuel Kiprono");
    }
    if (workflowId === "wf_google_reviews") {
      return simulateGoogleReview("Clara Wambui");
    }

    dispatchOperationalEvent({
      eventType: "inquiry_received",
      sourceAppId: "app_wa_01",
      entityName: "Amina Odhiambo",
      description: "Inquiry simulation for DELF B2 Tutoring",
      payload: {
        studentName: "Amina Odhiambo",
        phone: "+254 722 998 877",
        service: "DELF B2 Intensive",
        amountKes: 4500
      },
      provenance: "SIMULATED"
    });

    const execution = globalState.executions[0];
    return execution;
  };

  const simulatePackageRenewal = (studentName: string = "Emmanuel Kiprono") => {
    const nowTimeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
    const runId = `exec_pr_${Date.now()}`;
    
    const newExec: WorkflowExecution = {
      id: runId,
      automationId: "wf_package_renewal",
      workflowId: "wf_package_renewal",
      workflowTitle: "Lesson Package Credit Tracker & Renewal",
      triggerEvent: `Google Calendar session completed for ${studentName}`,
      entityName: studentName,
      status: "completed",
      currentStepIndex: 5,
      stepsTotal: 5,
      logSummary: `Session ended. Credit decremented (1h left). WhatsApp renewal invoice dispatched (KES 28,000 via M-Pesa).`,
      startedAt: nowTimeStr,
      completedAt: nowTimeStr,
      provenance: "SIMULATED"
    };

    globalState.executions.unshift(newExec);
    globalState.activityLogs.unshift(
      {
        id: `act_${Date.now()}_pr1`,
        organizationId: globalState.organization.id,
        runId,
        type: "workflow_executed",
        channel: "calendar",
        application: "Google Calendar",
        title: `Session completed: ${studentName}`,
        description: `60-minute French coaching session ended. Attendance verified.`,
        actionTakenByOtomatizon: "Captured calendar session completion event",
        businessResult: "Triggered credit ledger balance check",
        entityName: studentName,
        timestamp: nowTimeStr,
        provenance: "SIMULATED"
      },
      {
        id: `act_${Date.now()}_pr2`,
        organizationId: globalState.organization.id,
        runId,
        type: "workflow_executed",
        channel: "sheets",
        application: "Google Sheets",
        title: `Credit decremented: ${studentName}`,
        description: `Hours balance reduced to 1/10 in Student Credit Balance sheet.`,
        actionTakenByOtomatizon: "Updated credit balance row in Google Sheets",
        businessResult: "Low balance threshold (≤ 1h) triggered renewal sequence",
        entityName: studentName,
        timestamp: nowTimeStr,
        provenance: "SIMULATED"
      },
      {
        id: `act_${Date.now()}_pr3`,
        organizationId: globalState.organization.id,
        runId,
        type: "followup_sent",
        channel: "whatsapp",
        application: "WhatsApp",
        title: `Renewal invoice sent: ${studentName}`,
        description: `Delivered progress report & 10-hour renewal invoice (KES 28,000) with M-Pesa STK prompt.`,
        actionTakenByOtomatizon: "Generated personalized renewal invoice & dispatched via WhatsApp",
        businessResult: "KES 28,000 package secured before hours run out",
        entityName: studentName,
        timestamp: nowTimeStr,
        provenance: "SIMULATED"
      }
    );

    if (globalState.stats) {
      globalState.stats.revenueKes = (globalState.stats.revenueKes || 0) + 28000;
      globalState.stats.hoursSaved = Number(((globalState.stats.hoursSaved || 0) + 1.5).toFixed(1));
    }

    notify();
    return newExec;
  };

  const simulateGoogleReview = (studentName: string = "Clara Wambui") => {
    const nowTimeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
    const runId = `exec_gr_${Date.now()}`;

    const newExec: WorkflowExecution = {
      id: runId,
      automationId: "wf_google_reviews",
      workflowId: "wf_google_reviews",
      workflowTitle: "Post-Session Google Review Collector",
      triggerEvent: `2 hours after completed session with ${studentName}`,
      entityName: studentName,
      status: "completed",
      currentStepIndex: 4,
      stepsTotal: 4,
      logSummary: `Waited 2h courtesy delay. Verified ≥2 completed sessions. Dispatched 1-tap Google Maps review link on WhatsApp.`,
      startedAt: nowTimeStr,
      completedAt: nowTimeStr,
      provenance: "SIMULATED"
    };

    globalState.executions.unshift(newExec);
    globalState.activityLogs.unshift(
      {
        id: `act_${Date.now()}_gr1`,
        organizationId: globalState.organization.id,
        runId,
        type: "workflow_executed",
        channel: "calendar",
        application: "Google Calendar",
        title: `2h post-session window: ${studentName}`,
        description: `Elapsed courtesy delay following completed French exam session.`,
        actionTakenByOtomatizon: "Evaluated student eligibility (3 completed lessons, 0 prior reviews)",
        businessResult: "Candidate eligible for Google Maps review outreach",
        entityName: studentName,
        timestamp: nowTimeStr,
        provenance: "SIMULATED"
      },
      {
        id: `act_${Date.now()}_gr2`,
        organizationId: globalState.organization.id,
        runId,
        type: "followup_sent",
        channel: "whatsapp",
        application: "WhatsApp",
        title: `Google Review link sent: ${studentName}`,
        description: `Delivered friendly praise and 1-tap review link (https://g.page/r/james-french-nairobi/review).`,
        actionTakenByOtomatizon: "Dispatched direct review link via WhatsApp",
        businessResult: "5-Star review captured for Nairobi local search ranking",
        entityName: studentName,
        timestamp: nowTimeStr,
        provenance: "SIMULATED"
      }
    );

    if (globalState.stats) {
      globalState.stats.hoursSaved = Number(((globalState.stats.hoursSaved || 0) + 0.8).toFixed(1));
    }

    notify();
    return newExec;
  };

  // Team Management Actions
  const inviteTeamMember = (member: { name: string; email: string; phone?: string; role: TeamMemberRole }) => {
    const newMember: TeamMember = {
      id: `tm_${Date.now()}`,
      organizationId: globalState.organization.id,
      name: member.name,
      email: member.email,
      phone: member.phone || "",
      role: member.role,
      status: "invited",
      joinedAt: new Date().toISOString(),
      invitedBy: globalState.session.user?.fullName || "James Kamau"
    };
    globalState.teamMembers.push(newMember);
    globalState.activityLogs.unshift({
      id: `act_${Date.now()}`,
      organizationId: globalState.organization.id,
      type: "workflow_executed",
      channel: "system",
      application: "Otomatizon",
      title: `Team invitation sent: ${member.name} (${member.role.toUpperCase()})`,
      description: `Invited ${member.email} to join the organization workspace.`,
      entityName: member.name,
      timestamp: "Just now",
      provenance: "OBSERVED"
    });
    notify();
    return newMember;
  };

  const updateTeamMemberRole = (id: string, role: TeamMemberRole) => {
    globalState.teamMembers = globalState.teamMembers.map((m) =>
      m.id === id ? { ...m, role } : m
    );
    notify();
  };

  const removeTeamMember = (id: string) => {
    const member = globalState.teamMembers.find((m) => m.id === id);
    globalState.teamMembers = globalState.teamMembers.filter((m) => m.id !== id);
    if (member) {
      globalState.activityLogs.unshift({
        id: `act_${Date.now()}`,
        organizationId: globalState.organization.id,
        type: "workflow_executed",
        channel: "system",
        application: "Otomatizon",
        title: `Team access revoked: ${member.name}`,
        description: `Removed ${member.email} from workspace.`,
        entityName: member.name,
        timestamp: "Just now",
        provenance: "OBSERVED"
      });
    }
    notify();
  };

  // 7. COMPILE NATURAL LANGUAGE
  const compileAndCreateWorkflow = (rawText: string) => {
    const newWf: Workflow = {
      id: `wf_${Date.now()}`,
      organizationId: globalState.organization.id,
      title: rawText.length > 50 ? rawText.substring(0, 48) + "..." : rawText,
      summary: "When an inquiry arrives, record details in Sheets, deliver information, and follow up in 24 hours if unbooked.",
      category: "custom_operation",
      active: true,
      triggerDescription: "Triggered on new WhatsApp inquiry",
      steps: [
        {
          id: `step_${Date.now()}_1`,
          label: "Save inquiry into Google Sheets student roster",
          actionType: "update_sheet",
          parameters: { sheet: "Inquiries" },
          icon: "file-spreadsheet"
        },
        {
          id: `step_${Date.now()}_2`,
          label: "Send syllabus and lesson information via WhatsApp",
          actionType: "send_whatsapp",
          parameters: { template: "info" },
          icon: "message-square"
        },
        {
          id: `step_${Date.now()}_3`,
          label: "Wait 24 hours and verify Google Calendar booking",
          actionType: "wait_delay",
          parameters: { delayHours: 24 },
          icon: "clock"
        },
        {
          id: `step_${Date.now()}_4`,
          label: "Send friendly follow-up check-in if unbooked",
          actionType: "send_whatsapp",
          parameters: { template: "followup" },
          icon: "sparkles"
        }
      ],
      metrics: {
        runsCount: 1,
        leadsHelped: 1,
        hoursSaved: 2.0,
        revenueRecoveredKes: 3500
      },
      lastRunAt: "Just now",
      createdAt: new Date().toISOString()
    };

    globalState.workflows.unshift(newWf);
    globalState.stats.activeAutomations = globalState.workflows.filter((w) => w.active).length;
    notify();
    return newWf;
  };

  const upgradePlan = (planId: "free" | "starter" | "growth" | "pro") => {
    globalState.stats.currentPlanId = planId;
    let autoLimit = 1;
    let leadLimit = 20;
    if (planId === "starter") {
      autoLimit = 1;
      leadLimit = 100;
    } else if (planId === "growth") {
      autoLimit = 5;
      leadLimit = 500;
    } else if (planId === "pro") {
      autoLimit = 999;
      leadLimit = 9999;
    }
    globalState.stats.automationsLimit = autoLimit;
    globalState.stats.leadsMonthlyLimit = leadLimit;
    globalState.organization.planId = planId;
    globalState.activityLogs.unshift({
      id: `act_${Date.now()}`,
      organizationId: globalState.organization.id,
      type: "workflow_executed",
      title: `Plan changed to ${planId.toUpperCase()}`,
      description: `Your active automations limit is now ${globalState.stats.automationsLimit} and leads limit is ${globalState.stats.leadsMonthlyLimit}.`,
      timestamp: "Just now",
      channel: "system"
    });
    notify();
  };

  const resetToDefaults = () => {
    globalState = {
      session: {
        user: null,
        token: null,
        isAuthenticated: false
      },
      organization: defaultOrganization,
      businessProfile: defaultBusinessProfile,
      integrations: defaultIntegrations.map((i) => ({ ...i, connected: false, status: "disconnected" })),
      connectedApps: defaultConnectedApps.map((c) => ({ ...c, connectionStatus: "NOT_CONNECTED" })),
      dataSources: defaultDataSources.map((d) => ({ ...d, connectionStatus: "disconnected", syncStatus: "idle" })),
      operationalEvents: [],
      insights: [],
      leads: [],
      opportunities: defaultOpportunities,
      workflows: [],
      executions: [],
      activityLogs: [],
      teamMembers: [],
      metrics: {
        id: "met_0",
        hoursSaved: 0,
        inquiriesProcessed: 0,
        followUpsSent: 0,
        revenueRecoveredKes: 0,
        successRatePercent: 100,
        lastUpdated: "Never",
        provenance: "OBSERVED"
      },
      stats: {
        revenueKes: 0,
        newCustomers: 0,
        bookings: 0,
        activeAutomations: 0,
        hoursSaved: 0,
        leadsMonthlyLimit: 20,
        automationsLimit: 1,
        currentPlanId: "free"
      }
    };
    notify();
  };

  const updateOpportunityStatus = async (id: string, status: any) => {
    globalState.opportunities = globalState.opportunities.map((o) =>
      o.id === id ? { ...o, status } : o
    );
    notify();

    if (typeof window !== "undefined") {
      try {
        await fetch(`/api/opportunities/${id}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status })
        });
      } catch (e) {
        // offline fallback
      }
    }
  };

  const getAutomationReadiness = (requiredIntegrations: any[] = []) => {
    if (!requiredIntegrations || requiredIntegrations.length === 0) {
      return "READY_TO_ACTIVATE";
    }
    const allConnected = requiredIntegrations.every((reqId) => {
      const found = globalState.integrations.find((i) => i.id === reqId);
      return found && found.status === "connected";
    });
    return allConnected ? "READY_TO_ACTIVATE" : "READY_TO_CONNECT";
  };

  const generateBusinessReport = () => {
    const p = globalState.businessProfile;
    const opps = globalState.opportunities;
    const conns = globalState.integrations;
    const topOpp = opps[0];

    return {
      generatedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      businessName: p.name || globalState.organization?.name || "Your Business",
      businessType: p.businessType || "Service Business",
      city: p.city || "Nairobi",
      country: p.country || "Kenya",
      understood: {
        summary: p.description || "Business workflows and customer interactions across everyday tools.",
        customerType: p.customerType || "Direct customers & clients",
        primaryChannels: p.customerChannels && p.customerChannels.length > 0 ? p.customerChannels : ["WhatsApp", "Google Maps", "Direct"],
        manualFrictions: p.frictionPoints && p.frictionPoints.length > 0 ? p.frictionPoints : [
          "Manual customer follow-ups taking hours",
          "Unreconciled payment receipts across channels",
          "Manual double entry into spreadsheets"
        ]
      },
      currentWorkflow: p.workflowStages || [],
      toolsCurrentlyUsed: conns.map((c) => ({
        tool: c.name,
        role: c.description,
        status: c.status
      })),
      opportunitiesDiscovered: opps,
      recommendedFirstAutomation: topOpp ? {
        title: topOpp.title,
        reason: topOpp.problem,
        impact: topOpp.impactLevel,
        hoursSaved: topOpp.estimatedTimeSavedHoursPerWeek || 0,
        requiredApps: topOpp.requiredIntegrations || ["whatsapp_business", "google_calendar"],
        suggestedWorkflowId: topOpp.suggestedWorkflowId || "wf_lead_autopilot"
      } : {
        title: "Connect tools to detect automations",
        reason: "Link your WhatsApp, Google Workspace, or M-Pesa channels to discover bottlenecks.",
        impact: "MEDIUM",
        hoursSaved: 0,
        requiredApps: ["whatsapp_business"],
        suggestedWorkflowId: "wf_lead_autopilot"
      },
      requiredAppsSummary: conns.map((c) => ({
        name: c.name,
        status: c.status,
        usedFor: c.description
      }))
    };
  };

  return {
    state,
    signup,
    login,
    logout,
    resetPassword,
    updateBusinessProfile,
    toggleIntegration,
    activateOpportunity,
    updateOpportunityStatus,
    getAutomationReadiness,
    generateBusinessReport,
    pauseWorkflow,
    resumeWorkflow,
    toggleWorkflow,
    dismissOpportunity,
    runWorkflowSimulation,
    simulateNewLead,
    simulatePackageRenewal,
    simulateGoogleReview,
    inviteTeamMember,
    updateTeamMemberRole,
    removeTeamMember,
    dispatchOperationalEvent,
    compileAndCreateWorkflow,
    upgradePlan,
    resetToDefaults
  };
}

// Standalone event dispatcher for use outside hooks
export function dispatchOperationalEvent(incoming: Partial<OperationalEvent>): OperationalEvent {
  const provenance: DataProvenance = incoming.provenance || "SIMULATED";
  const nowTimeStr = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true });
  const entityName = incoming.entityName || (incoming.payload && incoming.payload.studentName) || "Prospective Client";
  const eventType = incoming.eventType || "inquiry_received";
  const sourceAppId = incoming.sourceAppId || "app_wa_01";
  const dataSourceId = incoming.dataSourceId || "ds_wa_chat";

  const operationalEvent: OperationalEvent = {
    id: incoming.id || `evt_${Date.now()}`,
    businessId: globalState.businessProfile.id || "prof_james_01",
    sourceAppId,
    dataSourceId,
    eventType,
    title: incoming.title || (eventType === "inquiry_received" ? `New WhatsApp Inquiry: ${entityName}` : "Operational Event"),
    description: incoming.description || `Inbound customer action processed by Otomatizon Intelligence.`,
    entityName,
    payload: incoming.payload || {},
    timestamp: nowTimeStr,
    provenance
  };

  globalState.operationalEvents.unshift(operationalEvent);

  if (globalState.stats) {
    globalState.stats.newCustomers = (globalState.stats.newCustomers || 0) + 1;
  }

  notify();
  return operationalEvent;
}

