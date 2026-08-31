"use client";

import React, { useState } from "react";
import { 
  ArrowDown, 
  ArrowRight, 
  Check, 
  MessageSquare, 
  FileSpreadsheet, 
  Calendar, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  CornerDownRight, 
  GitBranch, 
  Play, 
  Pause, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  X,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Copy,
  Power,
  ChevronLeft,
  Mail,
  MapPin,
  Settings,
  History,
  FileCode,
  Terminal,
  Layers
} from "lucide-react";
import { OperationalFlowStep } from "@/types";
import { ExecutionDetailView } from "./ExecutionDetailView";

export interface CanvasNode {
  id: string;
  stepNumber: number;
  type: "trigger" | "intelligence" | "action" | "condition" | "wait" | "stop";
  typeLabel: string;
  name: string;
  subtitle: string;
  iconName: "whatsapp" | "otomatizon" | "sheets" | "calendar" | "clock" | "check";
  action: string;
  inputs: string[];
  outputs: string[];
  status: string;
  executions: number;
  technicalEndpoint?: string;
  technicalPayload?: Record<string, any>;
}

interface AutomationFlowCanvasProps {
  workflowTitle?: string;
  isActive?: boolean;
  onToggleActive?: () => void;
  onRunTest?: () => void;
  isRunningTest?: boolean;
  onBack?: () => void;
  onNavigateToActivity?: () => void;
  flow?: OperationalFlowStep[];
}

export const AutomationFlowCanvas: React.FC<AutomationFlowCanvasProps> = ({
  workflowTitle = "Lead Follow-Up Autopilot",
  isActive = true,
  onToggleActive,
  onRunTest,
  isRunningTest = false,
  onBack,
  onNavigateToActivity,
  flow
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node_whatsapp_info");
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeSubTab, setActiveSubTab] = useState<"flow" | "settings" | "history" | "versions">("flow");
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [delayHours, setDelayHours] = useState<number>(24);
  const [duplicateNotice, setDuplicateNotice] = useState<string | null>(null);
  const [activeExecutionRun, setActiveExecutionRun] = useState<{ id: string; isLive: boolean } | null>(null);

  if (activeExecutionRun) {
    return (
      <ExecutionDetailView
        runId={activeExecutionRun.id}
        workflowTitle={workflowTitle}
        onBack={() => setActiveExecutionRun(null)}
        onNavigateToActivity={onNavigateToActivity}
        isLiveSimulation={activeExecutionRun.isLive}
      />
    );
  }

  // Nodes for the signature Lead Follow-Up Autopilot matching Reference Image 5
  const pipelineNodes: CanvasNode[] = [
    {
      id: "node_whatsapp_in",
      stepNumber: 1,
      type: "trigger",
      typeLabel: "TRIGGER",
      name: "New WhatsApp message",
      subtitle: "Someone sends you a message",
      iconName: "whatsapp",
      action: "Detects incoming prospective student message on WhatsApp Business",
      inputs: ["Phone number", "Message text", "Timestamp"],
      outputs: ["Inquiry received event dispatched"],
      status: "Active",
      executions: 27,
      technicalEndpoint: "POST /webhooks/whatsapp/messages (Meta Cloud API)",
      technicalPayload: {
        channel: "whatsapp",
        event: "messages.upsert",
        from: "+254719552108",
        message: "Hello, I want to inquire about French tutoring rates."
      }
    },
    {
      id: "node_otomatizon_intel",
      stepNumber: 2,
      type: "intelligence",
      typeLabel: "INTELLIGENCE",
      name: "Otomatizon",
      subtitle: "Understands and classifies inquiry",
      iconName: "otomatizon",
      action: "Analyzes intent, extracts requested course (DELF/DALF), and qualifies lead",
      inputs: ["Inquiry text", "Contact history"],
      outputs: ["Qualified Intent: Course Inquiry", "Structured student profile"],
      status: "Active",
      executions: 27,
      technicalEndpoint: "INTERNAL /decision-engine/classify",
      technicalPayload: {
        intent: "inquire_course_rates",
        confidence: 0.96,
        courseType: "DELF B2 Prep",
        urgency: "normal"
      }
    },
    {
      id: "node_sheets_save",
      stepNumber: 3,
      type: "action",
      typeLabel: "ACTION",
      name: "Google Sheets",
      subtitle: "Create / update lead record",
      iconName: "sheets",
      action: "Inserts or updates row in master Student_Roster_2026 spreadsheet",
      inputs: ["Full name", "Phone number", "Course requested", "Inquiry date"],
      outputs: ["Row created with unique ID", "Status initialized to 'New'"],
      status: "Active",
      executions: 24,
      technicalEndpoint: "POST /v4/spreadsheets/{id}/values/A1:append",
      technicalPayload: {
        spreadsheetId: "1e8_Nairobi_French_Registry",
        range: "Leads!A2:E2",
        values: [["Mercy Chebet", "+254719552108", "Executive Exam Prep", "New", "2026-08-29"]]
      }
    },
    {
      id: "node_whatsapp_info",
      stepNumber: 4,
      type: "action",
      typeLabel: "ACTION",
      name: "WhatsApp",
      subtitle: "Send course information & syllabus",
      iconName: "whatsapp",
      action: "Delivers official syllabus brochure, fee structure, and available lesson slots",
      inputs: ["Phone number", "Requested course curriculum"],
      outputs: ["Message delivered", "Syllabus PDF attached"],
      status: "Active",
      executions: 24,
      technicalEndpoint: "POST /v18.0/{phone-number-id}/messages",
      technicalPayload: {
        messaging_product: "whatsapp",
        to: "+254719552108",
        type: "template",
        template: { name: "french_course_brochure_v1", language: { code: "en" } }
      }
    },
    {
      id: "node_calendar_check",
      stepNumber: 5,
      type: "action",
      typeLabel: "ACTION",
      name: "Google Calendar",
      subtitle: "Check lesson booking status",
      iconName: "calendar",
      action: "Inspects tutor's calendar to verify if student has booked an evaluation session",
      inputs: ["Tutor Calendar ID", "24h Window", "Student Phone Number"],
      outputs: ["Booking status: Confirmed or Absent"],
      status: "Active",
      executions: 24,
      technicalEndpoint: "GET /calendar/v3/calendars/primary/events?q=+254719552108",
      technicalPayload: {
        calendarId: "kamau.french.tutor@gmail.com",
        hasBookingConfirmed: false
      }
    }
  ];

  // Secondary Branch Nodes (Decision NO -> Wait 24h -> WhatsApp Follow-up)
  const waitNode: CanvasNode = {
    id: "node_wait_delay",
    stepNumber: 6,
    type: "wait",
    typeLabel: "WAIT",
    name: "Otomatizon",
    subtitle: `Wait ${delayHours} hours`,
    iconName: "clock",
    action: `Non-blocking timer monitoring student booking activity (${delayHours}h)`,
    inputs: [`Configured delay: ${delayHours}h`],
    outputs: ["Timer expired without calendar booking"],
    status: "Active",
    executions: 21,
    technicalEndpoint: "INTERNAL /scheduler/timer",
    technicalPayload: {
      delayMs: delayHours * 3600 * 1000,
      condition: "has_no_calendar_event"
    }
  };

  const followUpNode: CanvasNode = {
    id: "node_whatsapp_followup",
    stepNumber: 7,
    type: "action",
    typeLabel: "ACTION",
    name: "WhatsApp",
    subtitle: "Send follow-up check-in",
    iconName: "whatsapp",
    action: "Sends a polite check-in offering to reserve an introductory evaluation lesson",
    inputs: ["Student phone number", "24h follow-up template"],
    outputs: ["WhatsApp follow-up delivered successfully"],
    status: "Active",
    executions: 21,
    technicalEndpoint: "POST /v18.0/{phone-number-id}/messages",
    technicalPayload: {
      messaging_product: "whatsapp",
      template: { name: "followup_checkin_24h" }
    }
  };

  const allNodes = [...pipelineNodes, waitNode, followUpNode];
  const selectedNode = allNodes.find((n) => n.id === selectedNodeId) || pipelineNodes[3];

  const getNodeIcon = (iconName: string) => {
    switch (iconName) {
      case "whatsapp":
        return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case "otomatizon":
        return <Sparkles className="w-5 h-5 text-[#15803D]" />;
      case "sheets":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case "calendar":
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case "clock":
        return <Clock className="w-5 h-5 text-amber-700" />;
      case "check":
        return <CheckCircle2 className="w-5 h-5 text-[#15803D]" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#15803D]" />;
    }
  };

  const handleDuplicate = () => {
    setDuplicateNotice("Flow duplicated under 'Copy of Lead Follow-Up Autopilot'");
    setTimeout(() => setDuplicateNotice(null), 4000);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm overflow-hidden flex flex-col animate-fadeIn">
      
      {/* 1. TOP HEADER & SUB-TABS matching Reference Image 5 */}
      <div className="p-5 sm:p-6 border-b border-[#EAE7DF] space-y-4">
        
        {/* Top Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-1 text-xs font-mono text-[#75777E] hover:text-[#121316] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Flows</span>
                </button>
              )}

              <h1 className="text-xl sm:text-2xl font-extrabold text-[#121316] tracking-tight">
                {workflowTitle}
              </h1>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 ${
                isActive 
                  ? "bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]"
                  : "bg-stone-100 text-stone-600 border border-stone-200"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#15803D] animate-pulse" : "bg-stone-400"}`} />
                {isActive ? "ACTIVE" : "PAUSED"}
              </span>
            </div>

            {duplicateNotice && (
              <div className="text-xs text-[#15803D] font-mono flex items-center gap-1.5 animate-fadeIn">
                <Check className="w-3.5 h-3.5" />
                <span>{duplicateNotice}</span>
              </div>
            )}
          </div>

          {/* Top Right Action Buttons matching Image 5 */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onRunTest && (
              <button
                onClick={() => {
                  onRunTest();
                  setActiveExecutionRun({ id: "#12458", isLive: true });
                }}
                disabled={isRunningTest}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#FAF9F5] border border-[#EAE7DF] text-xs font-bold text-[#121316] transition-all shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                title="Test flow execution"
              >
                <Play className={`w-3.5 h-3.5 text-[#15803D] ${isRunningTest ? "animate-spin" : ""}`} />
                <span>{isRunningTest ? "Running..." : "Test Run"}</span>
              </button>
            )}

            <button
              onClick={handleDuplicate}
              className="px-4 py-2 rounded-full bg-white hover:bg-[#FAF9F5] border border-[#EAE7DF] text-xs font-bold text-[#121316] transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5 text-[#75777E]" />
              <span>Duplicate</span>
            </button>

            {onToggleActive && (
              <button
                onClick={onToggleActive}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 border ${
                  isActive 
                    ? "bg-white hover:bg-rose-50 text-[#BE123C] border-rose-200"
                    : "bg-[#15803D] hover:bg-[#166534] text-white border-transparent"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isActive ? "Deactivate" : "Activate"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tabs Row matching Reference Image 5 */}
        <div className="flex items-center gap-6 border-t border-[#EAE7DF] pt-3 text-xs font-mono">
          <button
            onClick={() => setActiveSubTab("flow")}
            className={`pb-1 border-b-2 font-bold transition-colors ${
              activeSubTab === "flow"
                ? "border-[#15803D] text-[#121316]"
                : "border-transparent text-[#75777E] hover:text-[#121316]"
            }`}
          >
            Flow
          </button>
          <button
            onClick={() => setActiveSubTab("settings")}
            className={`pb-1 border-b-2 font-bold transition-colors ${
              activeSubTab === "settings"
                ? "border-[#15803D] text-[#121316]"
                : "border-transparent text-[#75777E] hover:text-[#121316]"
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveSubTab("history")}
            className={`pb-1 border-b-2 font-bold transition-colors ${
              activeSubTab === "history"
                ? "border-[#15803D] text-[#121316]"
                : "border-transparent text-[#75777E] hover:text-[#121316]"
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveSubTab("versions")}
            className={`pb-1 border-b-2 font-bold transition-colors ${
              activeSubTab === "versions"
                ? "border-[#15803D] text-[#121316]"
                : "border-transparent text-[#75777E] hover:text-[#121316]"
            }`}
          >
            Versions
          </button>
        </div>

      </div>

      {/* 2. TAB: SETTINGS (Timing & Delay Configurations) */}
      {activeSubTab === "settings" && (
        <div className="p-6 sm:p-8 space-y-6 text-xs animate-fadeIn">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#121316]">
              Timing &amp; Follow-up Rules Configuration
            </h3>
            <p className="text-xs text-[#75777E]">
              Set the waiting period before Otomatizon sends a polite follow-up reminder.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#121316]">
                Wait delay before WhatsApp follow-up
              </span>
              <div className="flex items-center gap-1.5 font-mono">
                {[12, 24, 48].map((hrs) => (
                  <button
                    key={hrs}
                    onClick={() => setDelayHours(hrs)}
                    className={`px-3 py-1 rounded-full transition-all ${
                      delayHours === hrs
                        ? "bg-[#002E25] text-white font-bold shadow-2xs"
                        : "bg-white text-[#75777E] hover:text-[#121316] border border-[#EAE7DF]"
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#4A4B50]">
              If the student has not confirmed a session slot on Google Calendar within {delayHours} hours, the follow-up message is automatically dispatched.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1.5 text-[#15803D] font-mono text-[11px]">
            <div className="font-bold uppercase tracking-wider">Immediate Stop Condition</div>
            <div>&bull; The follow-up sequence stops immediately as soon as the student books or replies on WhatsApp.</div>
          </div>
        </div>
      )}

      {/* 3. TAB: HISTORY (Execution Runs Log) */}
      {activeSubTab === "history" && (
        <div className="p-6 sm:p-8 space-y-4 text-xs animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#121316]">
              Real Execution History
            </h3>
            <span className="text-xs font-mono text-[#75777E]">27 completed executions</span>
          </div>

          <div className="divide-y divide-[#EAE7DF] border border-[#EAE7DF] rounded-2xl overflow-hidden bg-white shadow-2xs">
            <div className="p-3.5 bg-[#FAF9F5] flex items-center justify-between font-mono text-[10px] text-[#75777E] uppercase">
              <span>Date &amp; Time</span>
              <span>Trigger &amp; Student</span>
              <span>Actions Executed</span>
              <span>Status</span>
            </div>
            <div 
              onClick={() => setActiveExecutionRun({ id: "#12458", isLive: false })}
              className="p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            >
              <span className="font-mono text-[#75777E]">Today 10:42</span>
              <span className="font-bold text-[#121316]">Mercy Chebet (WhatsApp)</span>
              <span className="text-[#4A4B50]">Sheets + Brochure WhatsApp + Calendar 24h</span>
              <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] font-mono text-[10px] font-bold">Completed</span>
            </div>
            <div 
              onClick={() => setActiveExecutionRun({ id: "#12457", isLive: false })}
              className="p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            >
              <span className="font-mono text-[#75777E]">Yesterday 18:15</span>
              <span className="font-bold text-[#121316]">David Kimani (Maps / WhatsApp)</span>
              <span className="text-[#4A4B50]">Lead recorded + Follow-up sent</span>
              <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] font-mono text-[10px] font-bold">Completed</span>
            </div>
            <div 
              onClick={() => setActiveExecutionRun({ id: "#12456", isLive: false })}
              className="p-3.5 flex items-center justify-between hover:bg-[#FAF9F5] transition-colors cursor-pointer"
            >
              <span className="font-mono text-[#75777E]">28 Aug 14:30</span>
              <span className="font-bold text-[#121316]">Brian Otieno (WhatsApp)</span>
              <span className="text-[#4A4B50]">Converted &middot; Google Calendar booking verified</span>
              <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] font-mono text-[10px] font-bold">Converted</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: VERSIONS (Release Checkpoints) */}
      {activeSubTab === "versions" && (
        <div className="p-6 sm:p-8 space-y-4 text-xs animate-fadeIn">
          <h3 className="text-base font-bold text-[#121316]">
            Flow Versions
          </h3>
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-bold text-[#121316]">Version 1.2 (Active Production)</div>
              <p className="text-[#75777E] text-[11px]">Includes decision diamond with automatic stop upon confirmed calendar booking.</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] font-mono text-[10px] font-bold">Current</span>
          </div>
        </div>
      )}

      {/* 5. MAIN TAB: FLOW — THE 3-PANE OPERATIONAL WORKBENCH matching Reference Image 5 */}
      {activeSubTab === "flow" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] divide-y lg:divide-y-0 lg:divide-x divide-[#EAE7DF]">
          
          {/* PANE 1: STEP PALETTE (Left 3 Cols) matching Image 5 */}
          <div className="lg:col-span-3 p-4 sm:p-5 bg-white space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-2">
              <span className="font-mono uppercase tracking-widest text-[#75777E] text-[10px] font-bold">
                STEPS
              </span>
              <span className="text-[10px] font-mono text-[#15803D]">
                Library
              </span>
            </div>

            {/* Group 1: Triggers */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold block">
                Triggers
              </span>
              <div className="space-y-1.5">
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2 text-[#121316] cursor-grab hover:border-[#15803D] transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-[#15803D]" />
                  <span className="text-[11px] font-medium">New WhatsApp message</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2 text-[#121316] cursor-grab hover:border-[#15803D] transition-colors">
                  <Mail className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-[11px] font-medium">New Gmail email</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2 text-[#121316] cursor-grab hover:border-[#15803D] transition-colors">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-medium">New Google Sheets row</span>
                </div>
              </div>
            </div>

            {/* Group 2: Actions */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold block">
                Actions
              </span>
              <div className="space-y-1.5">
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2 text-[#121316] cursor-grab hover:border-[#15803D] transition-colors">
                  <MessageSquare className="w-3.5 h-3.5 text-[#15803D]" />
                  <span className="text-[11px] font-medium">Send WhatsApp message</span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-200 flex items-center gap-2 text-[#121316] cursor-grab">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-[11px] font-bold text-emerald-900">Create Google Sheets row</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2 text-[#121316] cursor-grab hover:border-[#15803D] transition-colors">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-medium">Check Calendar event</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2 text-[#121316] cursor-grab hover:border-[#15803D] transition-colors">
                  <Mail className="w-3.5 h-3.5 text-red-600" />
                  <span className="text-[11px] font-medium">Send Gmail email</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2 text-[#121316] cursor-grab hover:border-[#15803D] transition-colors">
                  <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-[11px] font-medium">Verify M-Pesa payment</span>
                </div>
              </div>
            </div>

            {/* Group 3: Conditions */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold block">
                Conditions
              </span>
              <div className="space-y-1.5">
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2 text-[#121316] cursor-grab hover:border-[#15803D] transition-colors">
                  <GitBranch className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px] font-medium">If / Else</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2 text-[#121316] cursor-grab hover:border-[#15803D] transition-colors">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span className="text-[11px] font-medium">Wait Delay</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-2 text-[#121316] cursor-grab hover:border-[#15803D] transition-colors">
                  <Calendar className="w-3.5 h-3.5 text-[#75777E]" />
                  <span className="text-[11px] font-medium">Date / Time</span>
                </div>
              </div>
            </div>

          </div>

          {/* PANE 2: PIPELINE ORCHESTRATION CANVAS (Center 6 Cols) matching Image 5 */}
          <div className="lg:col-span-6 p-4 sm:p-6 bg-[#FAF9F5]/60 flex flex-col justify-between relative overflow-x-auto">
            
            {/* The Interactive Visual Pipeline */}
            <div 
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
              className="transition-transform duration-200 py-4 max-w-lg mx-auto w-full space-y-3"
            >
              
              {/* Sequential Nodes 1 to 5 */}
              {pipelineNodes.map((node, i) => {
                const isSelected = selectedNodeId === node.id;

                return (
                  <React.Fragment key={node.id}>
                    {/* Node Card */}
                    <div 
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-3.5 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs hover:border-[#15803D] flex items-center gap-3.5 ${
                        isSelected 
                          ? "border-[#15803D] ring-2 ring-[#15803D]/20 shadow-sm" 
                          : "border-[#EAE7DF]"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-center shrink-0">
                        {getNodeIcon(node.iconName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[9px] font-mono uppercase tracking-widest text-[#75777E] font-bold">
                          {node.typeLabel}
                        </div>
                        <div className="text-xs font-bold text-[#121316] truncate">
                          {node.name}
                        </div>
                        <div className="text-[11px] text-[#4A4B50] truncate">
                          {node.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Connector Arrow Down */}
                    {i < pipelineNodes.length - 1 && (
                      <div className="w-0.5 h-4 bg-[#D5D1C6] mx-auto rounded-full" />
                    )}
                  </React.Fragment>
                );
              })}

              {/* Branch Connector Line to Decision Diamond */}
              <div className="w-0.5 h-4 bg-[#D5D1C6] mx-auto rounded-full" />

              {/* Decision Diamond + Branches matching Reference Image 5 */}
              <div className="p-4 rounded-3xl bg-white border border-[#EAE7DF] shadow-2xs space-y-4">
                
                {/* Diamond Header */}
                <div className="flex items-center justify-center gap-2">
                  <div className="w-7 h-7 rotate-45 bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="-rotate-45 text-[9px] font-bold text-amber-900 font-mono">?</span>
                  </div>
                  <span className="font-bold text-xs text-[#121316] font-mono">
                    Booked or confirmed?
                  </span>
                </div>

                {/* Two Branch Outlets (YES vs NO) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  
                  {/* Branch YES (YES -> Stop) */}
                  <div className="p-3 rounded-2xl bg-[#ECFDF5]/60 border border-[#A7F3D0] text-center space-y-2">
                    <span className="text-[10px] font-mono font-bold text-[#15803D] uppercase block">
                      YES
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#15803D] text-white flex items-center justify-center mx-auto shadow-xs">
                      <Check className="w-4 h-4" />
                    </div>
                    <div className="text-[10px] font-mono text-[#15803D] font-bold">
                      Flow Complete
                    </div>
                  </div>

                  {/* Branch NO (NO -> Wait 24h -> WhatsApp Followup) */}
                  <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-center space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">
                      NO
                    </span>
                    
                    {/* Wait Node */}
                    <div 
                      onClick={() => setSelectedNodeId(waitNode.id)}
                      className={`p-2 rounded-xl bg-white border transition-all cursor-pointer text-left space-y-0.5 ${
                        selectedNodeId === waitNode.id ? "border-[#15803D] ring-1 ring-[#15803D]" : "border-[#EAE7DF]"
                      }`}
                    >
                      <div className="text-[8px] font-mono text-[#75777E] uppercase font-bold">WAIT</div>
                      <div className="text-[10px] font-bold text-[#121316] truncate">Wait {delayHours} hours</div>
                    </div>

                    {/* Arrow */}
                    <div className="w-0.5 h-2 bg-[#D5D1C6] mx-auto rounded-full" />

                    {/* Follow-up Node */}
                    <div 
                      onClick={() => setSelectedNodeId(followUpNode.id)}
                      className={`p-2 rounded-xl bg-white border transition-all cursor-pointer text-left space-y-0.5 ${
                        selectedNodeId === followUpNode.id ? "border-[#15803D] ring-1 ring-[#15803D]" : "border-[#EAE7DF]"
                      }`}
                    >
                      <div className="text-[8px] font-mono text-[#75777E] uppercase font-bold">ACTION</div>
                      <div className="text-[10px] font-bold text-[#121316] truncate">Send follow-up</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Bottom Right Canvas Controls matching Reference Image 5 */}
            <div className="pt-4 flex items-center justify-between text-xs font-mono text-[#75777E]">
              <span className="text-[10px]">
                {selectedNode ? `Step ${selectedNode.stepNumber} selected` : "Click any step to inspect"}
              </span>

              <div className="flex items-center gap-1.5 bg-white border border-[#EAE7DF] rounded-xl px-2 py-1 shadow-2xs">
                <button 
                  onClick={() => setZoomLevel(Math.max(70, zoomLevel - 10))}
                  className="px-1 hover:text-[#121316]"
                  title="Zoom Out"
                >
                  -
                </button>
                <span className="text-[11px] font-bold text-[#121316]">{zoomLevel}%</span>
                <button 
                  onClick={() => setZoomLevel(Math.min(130, zoomLevel + 10))}
                  className="px-1 hover:text-[#121316]"
                  title="Zoom In"
                >
                  +
                </button>
                <button 
                  onClick={() => setZoomLevel(100)}
                  className="pl-1 border-l border-[#EAE7DF] hover:text-[#121316]"
                  title="Reset Zoom"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

          {/* PANE 3: SELECTED STEP INSPECTION DRAWER (Right 3 Cols) matching Image 5 */}
          <div className="lg:col-span-3 p-4 sm:p-5 bg-white space-y-5 text-xs flex flex-col justify-between">
            
            <div className="space-y-4">
              
              {/* Header */}
              <div className="border-b border-[#EAE7DF] pb-3 space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
                  SELECTED STEP
                </span>

                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-center shrink-0">
                    {getNodeIcon(selectedNode.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#121316]">
                      {selectedNode.name}
                    </h3>
                    <p className="text-[11px] text-[#75777E]">
                      {selectedNode.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              {/* INPUT */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
                  INPUT
                </span>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] text-[11px] font-mono text-[#121316]">
                  {selectedNode.inputs.join(", ")}
                </div>
              </div>

              {/* ACTION */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
                  ACTION
                </span>
                <div className="p-2.5 rounded-xl bg-white border border-[#EAE7DF] text-[11px] text-[#4A4B50] leading-relaxed shadow-2xs">
                  {selectedNode.action}
                </div>
              </div>

              {/* OUTPUT */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
                  OUTPUT
                </span>
                <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] text-[11px] font-mono text-[#15803D] font-bold">
                  {selectedNode.outputs.join(", ")}
                </div>
              </div>

              {/* STATUS */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
                  STATUS
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#15803D] font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                  <span>{selectedNode.status} &middot; {selectedNode.executions} executions</span>
                </div>
              </div>

              {/* Technical Details Accordion */}
              {selectedNode.technicalEndpoint && (
                <div className="pt-2 border-t border-[#EAE7DF]">
                  <button
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                    className="text-[10px] font-mono text-[#75777E] hover:text-[#121316] flex items-center gap-1"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>{showTechnicalDetails ? "Hide technical details" : "Technical details"}</span>
                  </button>

                  {showTechnicalDetails && (
                    <div className="mt-2 space-y-2 text-[10px] font-mono animate-fadeIn">
                      <div className="p-2 rounded bg-stone-900 text-emerald-400 select-all overflow-x-auto">
                        {selectedNode.technicalEndpoint}
                      </div>
                      {selectedNode.technicalPayload && (
                        <pre className="p-2 rounded bg-stone-900 text-stone-300 select-all overflow-x-auto max-h-32 text-[9px]">
                          {JSON.stringify(selectedNode.technicalPayload, null, 2)}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Configure / Edit Button matching Reference Image 5 */}
            <div className="pt-3 border-t border-[#EAE7DF]">
              <button
                onClick={() => setActiveSubTab("settings")}
                className="w-full py-2.5 rounded-full bg-white hover:bg-[#FAF9F5] border border-[#EAE7DF] text-xs font-bold text-[#121316] transition-all shadow-2xs text-center"
              >
                Configure / Edit
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
