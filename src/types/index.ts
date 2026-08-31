// Otomatizon Core Domain Types & Operating System Architecture

export type UserRole = "owner" | "admin" | "member";
export type TeamMemberRole = "admin" | "collaborator" | "viewer";

export interface TeamMember {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone?: string;
  role: TeamMemberRole;
  status: "active" | "invited" | "suspended";
  avatarUrl?: string;
  joinedAt: string;
  lastActiveAt?: string;
  invitedBy?: string;
}

// Data Provenance Classification (Mandatory across all operating entities)
export type DataProvenance = "OBSERVED" | "INFERRED" | "ESTIMATED" | "SIMULATED";

export interface Business {
  id: string;
  name: string;
  type?: string; // e.g. "Private DELF/DALF French Tutoring"
  city: string; // e.g. "Nairobi"
  country: string; // "Kenya"
  clientType: string; // "Individual learners, executives & university candidates"
  goals: string[];
  currency: "KES" | "USD" | "EUR";
  provenance: DataProvenance;
  createdAt: string;
}

export interface User {
  id: string;
  businessId?: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  role?: UserRole;
  createdAt: string;
}

export interface UserSession {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  currency: "KES" | "USD" | "EUR";
  timezone: string; // e.g. "Africa/Nairobi"
  planId: "starter" | "growth" | "pro";
  createdAt: string;
}

export interface WorkflowStage {
  id: string;
  order: number;
  name: string; // e.g. "Customer inquiry", "Information", "Booking", "Payment", "Session", "Follow-up"
  sourceApp: string;
  actionDescription: string;
  destinationApp?: string;
  manualFriction?: string;
}

export interface BusinessProfile extends Business {
  organizationId: string;
  businessType: string;
  type?: string;
  description: string;
  location: string;
  services: string[];
  primaryChannels: string[]; // e.g. ["whatsapp", "google_business", "referrals"]
  customerAcquisitionChannels?: string[];
  targetAudience: string;
  customerType?: string;
  averageDealSizeKes: number;
  toolsUsed: string[];
  biggestRepetitiveTask: string;
  workflowSummary?: string;
  manualTasks?: string[];
  frictionPoints?: string[];
  workflowStages?: WorkflowStage[];
}

export type IntegrationId = 
  | "google_account"
  | "gmail"
  | "google_calendar"
  | "google_sheets"
  | "google_drive"
  | "google_business"
  | "whatsapp_business"
  | "facebook_messenger"
  | "instagram"
  | "mpesa_safaricom";

export type IntegrationStatus = 
  | "connected" 
  | "available" 
  | "needs_attention" 
  | "coming_soon" 
  | "not_supported"
  | "active"
  | "disconnected";

export interface Integration {
  id: IntegrationId;
  name: string;
  category: "messaging" | "google" | "payments" | "storage";
  description: string;
  icon: string;
  connected: boolean;
  accountEmail?: string;
  accountPhone?: string;
  accountIdentifier?: string;
  lastSyncedAt?: string;
  lastError?: string;
  status: IntegrationStatus;
  scopes?: string[];
  permissionsGranted?: string[];
  whatWeUseItFor?: string[];
  configNotes?: string;
  authType: "oauth2" | "api_key" | "daraja_b2c";
  provenance?: DataProvenance;
}

export interface ConnectedApp {
  id: string;
  businessId: string;
  integrationId: IntegrationId;
  name: string;
  category: "messaging" | "google" | "payments" | "storage";
  status: IntegrationStatus;
  accountIdentifier?: string;
  roleInSystem: string; // e.g. "Customer communication, inquiries & document delivery"
  scopes: string[];
  capabilities: string[];
  provenance: DataProvenance;
  lastSyncAt?: string;
}

export interface DataSource {
  id: string;
  businessId: string;
  appId: string;
  integrationId: IntegrationId;
  name: string; // e.g. "WhatsApp Chats", "2026 Student Roster (Sheet)", "French Tutoring Calendar"
  resourceType: "chat_thread" | "spreadsheet" | "calendar" | "payment_gateway" | "mailbox";
  status: "active" | "syncing" | "idle" | "error";
  recordCount: number;
  lastReadAt: string;
  provenance: DataProvenance;
}

export interface CustomerLead {
  id: string;
  businessId?: string;
  name: string;
  phone: string;
  email?: string;
  source: "whatsapp" | "gmail" | "google_business" | "website" | "manual";
  status: "new" | "info_sent" | "booked" | "paid" | "lost";
  notes?: string;
  inquiredService: string;
  potentialValueKes: number;
  lastContactAt: string;
  provenance?: DataProvenance;
  createdAt: string;
}

export type Lead = CustomerLead & {
  organizationId?: string;
};

export interface OperationalEvent {
  id: string;
  businessId: string;
  sourceAppId: string;
  dataSourceId: string;
  eventType: "inquiry_received" | "booking_created" | "booking_cancelled" | "payment_confirmed" | "lead_recorded" | "followup_due";
  title: string;
  description: string;
  entityName?: string;
  payload: Record<string, any>;
  timestamp: string;
  provenance: DataProvenance;
}

export interface IntelligenceInsight {
  id: string;
  businessId: string;
  eventId?: string;
  type: "friction_detected" | "revenue_opportunity" | "booking_bottleneck" | "timing_pattern";
  title: string;
  description: string;
  confidenceScore: number; // 0-100
  affectedAppIds: string[];
  provenance: DataProvenance;
  createdAt: string;
}

export interface Appointment {
  id: string;
  organizationId: string;
  leadId?: string;
  customerName: string;
  serviceTitle: string;
  scheduledAt: string;
  durationMinutes: number;
  googleCalendarEventId?: string;
  meetLink?: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  paymentStatus: "pending" | "paid" | "waived";
  provenance?: DataProvenance;
}

export interface Payment {
  id: string;
  organizationId: string;
  leadId?: string;
  customerName: string;
  phone: string;
  amountKes: number;
  provider: "mpesa" | "manual" | "bank";
  referenceCode: string; // e.g. "QJD472910M"
  status: "requested" | "completed" | "failed";
  requestedAt: string;
  completedAt?: string;
  provenance?: DataProvenance;
}

export type ImpactLevel = "High impact" | "Medium impact" | "Low impact";

export type OpportunityStatus = 
  | "detected"
  | "discovered" 
  | "reviewed" 
  | "accepted" 
  | "dismissed" 
  | "automation_ready" 
  | "active" 
  | "activated"
  | "paused"
  | "new"
  | "viewed"
  | "completed";

export type EvidenceType = "OBSERVED" | "INFERRED";

export type AutomationReadiness = 
  | "NOT_READY" 
  | "READY_TO_CONNECT" 
  | "READY_TO_ACTIVATE" 
  | "ACTIVE" 
  | "PAUSED" 
  | "ERROR";

export interface Opportunity {
  id: string;
  businessId?: string;
  organizationId: string;
  title: string;
  problem: string;
  evidence: string;
  evidenceType: EvidenceType;
  impactScore: number; // internal 0-100
  impactLevel: ImpactLevel;
  confidenceScore: number; // 0-100 percentage
  estimatedTimeSavedHoursPerWeek: number;
  estimatedRevenueAtRiskKes: number;
  estimatedBusinessValueKes?: number;
  monthlyValueKes?: number;
  rankNumber?: number;
  recommendation: string;
  suggestedWorkflowId?: string;
  suggestedWorkflowTitle: string;
  requiredIntegrations: IntegrationId[];
  optionalIntegrations?: IntegrationId[];
  status: OpportunityStatus;
  detectedAt: string;
  category: "lead_recovery" | "quote_followup" | "payment_reminder" | "retention" | "scheduling";
  provenance?: DataProvenance;
}

export interface BusinessReport {
  generatedAt: string;
  businessName: string;
  businessType: string;
  city: string;
  country: string;
  understood: {
    summary: string;
    customerType: string;
    primaryChannels: string[];
    manualFrictions: string[];
  };
  currentWorkflow: WorkflowStage[];
  toolsCurrentlyUsed: {
    tool: string;
    role: string;
    status: string;
  }[];
  opportunitiesDiscovered: Opportunity[];
  recommendedFirstAutomation: {
    title: string;
    reason: string;
    impact: string;
    hoursSaved: number;
    requiredApps: string[];
    suggestedWorkflowId: string;
  };
  requiredAppsSummary: {
    name: string;
    status: IntegrationStatus;
    usedFor: string;
  }[];
}

export type OperationalNodeType = 
  | "trigger" 
  | "intelligence" 
  | "action" 
  | "condition" 
  | "wait" 
  | "stop" 
  | "result";

export interface OperationalFlowStep {
  id: string;
  stepNumber: number;
  nodeType: OperationalNodeType;
  application: string; // e.g. "WhatsApp", "Otomatizon", "Google Sheets", "Google Calendar", "M-Pesa"
  systemRole: string; // e.g. "Inbound Trigger", "Operations Intelligence", "Customer Registry", "Scheduling", "Settlement"
  title: string; // e.g. "Customer sends WhatsApp message"
  description: string; // Plain business narrative
  conditionText?: string; // e.g. "Has customer confirmed booking?"
  branchOutcome?: {
    yes: string; // e.g. "Stop follow-up, send confirmation"
    no: string; // e.g. "Send gentle follow-up"
  };
  finalState?: string;
  iconName?: string;
  nodeDetails?: {
    action: string;
    inputs?: string[];
    outputs?: string[];
    status?: string;
    lastSync?: string;
    executionCount?: number;
  };
}

export interface AutomationStep {
  id: string;
  automationId?: string;
  order?: number;
  label: string; // Plain human description: e.g. "Send lesson brochure via WhatsApp"
  actionType: "send_whatsapp" | "send_email" | "create_calendar_event" | "update_sheet" | "request_mpesa" | "wait_delay" | "condition_check";
  appId?: string;
  parameters: Record<string, any>;
  icon: string;
  provenance?: DataProvenance;
}

export type WorkflowStep = AutomationStep;

export interface Condition {
  id: string;
  automationId: string;
  evaluator: string; // e.g. "is_booking_confirmed"
  criteria: Record<string, any>;
  yesBranchStepId?: string;
  noBranchStepId?: string;
  description: string;
  provenance?: DataProvenance;
}

export interface Automation {
  id: string;
  businessId?: string;
  organizationId?: string;
  title: string; // Human title: "Follow up with new leads after 24 hours if they haven't booked"
  summary: string;
  category: string;
  active: boolean;
  triggerDescription: string;
  steps: AutomationStep[];
  conditions?: Condition[];
  operationalFlow?: OperationalFlowStep[];
  requiredIntegrations?: IntegrationId[];
  connectedApps?: string[];
  successRate?: number;
  timingConfig?: { delayHours: number };
  metrics: {
    runsCount: number;
    leadsHelped: number;
    hoursSaved: number;
    revenueRecoveredKes: number;
  };
  provenance?: DataProvenance;
  lastRunAt?: string;
  createdAt: string;
}

export type Workflow = Automation;

export interface Action {
  id: string;
  runId: string;
  stepId: string;
  appId: string;
  actionType: string;
  status: "pending" | "executing" | "completed" | "failed" | "skipped";
  inputPayload: Record<string, any>;
  outputResult?: Record<string, any>;
  executedAt: string;
  provenance?: DataProvenance;
}

export interface ExecutionLog {
  id: string;
  runId: string;
  actionId?: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: string;
}

export type ExecutionState = 
  | "QUEUED" 
  | "RUNNING" 
  | "WAITING" 
  | "COMPLETED" 
  | "FAILED" 
  | "SKIPPED" 
  | "PAUSED";

export interface AutomationRun {
  id: string;
  automationId?: string;
  workflowId?: string;
  workflowTitle?: string;
  triggerEventId?: string;
  triggerEvent: string;
  entityName: string; // Customer / lead name
  status: "in_progress" | "completed" | "failed" | "waiting_delay" | "queued" | "paused" | "skipped";
  executionState?: ExecutionState;
  currentStepIndex: number;
  stepsTotal: number;
  logSummary: string;
  actions?: Action[];
  logs?: ExecutionLog[];
  startedAt: string;
  completedAt?: string;
  durationFormatted?: string;
  idempotencyKey?: string;
  provenance?: DataProvenance;
}

export type WorkflowExecution = AutomationRun;

export interface ActivityEvent {
  id: string;
  businessId?: string;
  organizationId?: string;
  runId?: string;
  actionId?: string;
  type: "lead_captured" | "followup_sent" | "booking_confirmed" | "payment_reminder" | "payment_received" | "workflow_executed";
  title: string;
  description: string;
  timestamp: string;
  channel: "whatsapp" | "gmail" | "calendar" | "mpesa" | "system" | "sheets";
  badgeColor?: string;
  application?: string; // e.g. "WhatsApp", "Otomatizon", "Google Sheets", "Google Calendar", "M-Pesa"
  actionTakenByOtomatizon?: string;
  businessResult?: string;
  entityName?: string;
  payloadSnapshot?: Record<string, any>;
  provenance?: DataProvenance;
}

export type ActivityLog = ActivityEvent;

export interface OperationalMetric {
  id: string;
  businessId?: string;
  organizationId?: string;
  inquiriesProcessed: number;
  followupsSent: number;
  hoursSaved: number;
  revenueRecoveredKes: number;
  activeAutomationsCount: number;
  successRate: number;
  provenance: DataProvenance;
  lastUpdated: string;
}

export interface Report extends BusinessReport {
  id?: string;
  businessId?: string;
  provenance: DataProvenance;
}

export interface PricingPlan {
  id: "starter" | "growth" | "pro";
  name: string;
  priceKes: number;
  priceKesMonthly: number;
  priceKesYearly: number;
  billingPeriod: "month";
  description: string;
  tagline: string;
  features: string[];
  maxActiveAutomations: number;
  leadsPerMonthLimit: number;
  popular?: boolean;
  highlighted?: boolean;
}
