"use client";

import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Check, 
  Clock, 
  Sparkles, 
  MessageSquare, 
  FileSpreadsheet, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Terminal, 
  Code, 
  ExternalLink,
  ChevronRight,
  Play,
  RotateCw,
  Cpu,
  Layers
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { ExecutionState, DataProvenance } from "@/types";

export interface ExecutionEventStep {
  stepIndex: number;
  timestamp: string;
  app: "WhatsApp" | "Otomatizon" | "Google Sheets" | "Google Agenda" | "Système";
  actionTitle: string;
  contextText: string;
  status: "COMPLETED" | "RUNNING" | "WAITING" | "QUEUED";
  details: {
    contact: string;
    phone: string;
    course: string;
    dateFormatted: string;
    source: string;
    messageId: string;
    resultLabel: string;
  };
  dataPayload: Record<string, any>;
  logs: { timestamp: string; level: string; message: string }[];
}

interface ExecutionDetailViewProps {
  runId?: string;
  workflowTitle?: string;
  onBack: () => void;
  onNavigateToActivity?: () => void;
  isLiveSimulation?: boolean;
}

export const ExecutionDetailView: React.FC<ExecutionDetailViewProps> = ({
  runId = "#12458",
  workflowTitle = "Lead Follow-Up Autopilot",
  onBack,
  onNavigateToActivity,
  isLiveSimulation = false
}) => {
  const { state, dispatchOperationalEvent } = useOtomatizonStore();
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);
  const [activeInspectorTab, setActiveInspectorTab] = useState<"context" | "data" | "logs">("context");
  const [visibleStepCount, setVisibleStepCount] = useState<number>(isLiveSimulation ? 1 : 6);
  const [overallState, setOverallState] = useState<ExecutionState>(isLiveSimulation ? "RUNNING" : "WAITING");
  const [durationSeconds, setDurationSeconds] = useState<number>(192); // 00:03:12

  // 6 Sequential Events matching Reference Image 6
  const executionSteps: ExecutionEventStep[] = [
    {
      stepIndex: 0,
      timestamp: "10:42:08",
      app: "WhatsApp",
      actionTitle: "New inquiry received",
      contextText: 'James: "Hello, how much do French classes cost?"',
      status: "COMPLETED",
      details: {
        contact: "James Mwangi",
        phone: "+254 712 345 678",
        course: "French A1",
        dateFormatted: "29 Aug 2026 10:42:08",
        source: "WhatsApp Business",
        messageId: "wamid.HBgMtzI0OTEyMzQ1Njc4FQIAEhggQ0RERTFGMzg3NkE=",
        resultLabel: "Success"
      },
      dataPayload: {
        messaging_product: "whatsapp",
        from: "+254712345678",
        profile: { name: "James Mwangi" },
        text: { body: "Hello, how much do French classes cost?" },
        timestamp: "1788040928"
      },
      logs: [
        { timestamp: "10:42:08.102", level: "INFO", message: "Incoming webhook payload verified via HMAC-SHA256" },
        { timestamp: "10:42:08.125", level: "INFO", message: "Idempotency key generated: idemp_wa_254712345678_1788040928" },
        { timestamp: "10:42:08.140", level: "INFO", message: "Dispatched to operational pipeline with status QUEUED -> RUNNING" }
      ]
    },
    {
      stepIndex: 1,
      timestamp: "10:42:09",
      app: "Otomatizon",
      actionTitle: "Intent detected",
      contextText: "Type: Course Inquiry",
      status: "COMPLETED",
      details: {
        contact: "James Mwangi",
        phone: "+254 712 345 678",
        course: "French A1 / Beginner",
        dateFormatted: "29 Aug 2026 10:42:09",
        source: "Otomatizon Intelligence Layer",
        messageId: "int_classify_9941a",
        resultLabel: "Intent qualified (96% confidence)"
      },
      dataPayload: {
        classifier: "intent_extraction_engine",
        detectedIntent: "inquire_course_rates",
        targetLanguage: "French",
        levelEstimate: "A1 Beginner",
        confidence: 0.962,
        actionRequired: "send_brochure_and_rates"
      },
      logs: [
        { timestamp: "10:42:09.041", level: "INFO", message: "Otomatizon Intelligence parsed message semantics" },
        { timestamp: "10:42:09.088", level: "INFO", message: "Confidence threshold passed (96.2% >= 85.0%)" },
        { timestamp: "10:42:09.112", level: "INFO", message: "Routing decision: Initiate customer qualification" }
      ]
    },
    {
      stepIndex: 2,
      timestamp: "10:42:10",
      app: "Google Sheets",
      actionTitle: "Lead record created",
      contextText: 'James Mwangi added to "Leads" sheet',
      status: "COMPLETED",
      details: {
        contact: "James Mwangi",
        phone: "+254 712 345 678",
        course: "French A1",
        dateFormatted: "29 Aug 2026 10:42:10",
        source: "Google Sheets API v4",
        messageId: "row_append_2881",
        resultLabel: "Row 24 appended successfully"
      },
      dataPayload: {
        spreadsheetId: "1e8_Nairobi_French_Registry",
        sheetName: "Leads",
        appendedRow: ["James Mwangi", "+254 712 345 678", "French A1", "New", "2026-08-29 10:42:10"],
        updatedRange: "Leads!A24:E24"
      },
      logs: [
        { timestamp: "10:42:10.210", level: "INFO", message: "Connecting to Google Sheets via OAuth2 token" },
        { timestamp: "10:42:10.450", level: "INFO", message: "Appended 1 row to Leads!A24:E24 (Status: 200 OK)" }
      ]
    },
    {
      stepIndex: 3,
      timestamp: "10:42:11",
      app: "Google Calendar",
      actionTitle: "Calendar availability check",
      contextText: "3 available slots found",
      status: "COMPLETED",
      details: {
        contact: "James Mwangi",
        phone: "+254 712 345 678",
        course: "French A1",
        dateFormatted: "29 Aug 2026 10:42:11",
        source: "Google Calendar API v3",
        messageId: "cal_freebusy_check_88",
        resultLabel: "Available slots identified"
      },
      dataPayload: {
        calendarId: "kamau.french.tutor@gmail.com",
        timeMin: "2026-08-30T09:00:00Z",
        timeMax: "2026-09-02T18:00:00Z",
        slotsAvailable: ["2026-08-30 14:00", "2026-08-31 10:00", "2026-09-01 16:00"]
      },
      logs: [
        { timestamp: "10:42:11.115", level: "INFO", message: "Querying teacher free/busy windows" },
        { timestamp: "10:42:11.320", level: "INFO", message: "Found 3 available slots within 72h window" }
      ]
    },
    {
      stepIndex: 4,
      timestamp: "10:42:12",
      app: "Otomatizon",
      actionTitle: "No booking detected",
      contextText: "Follow-up scheduled in 24h",
      status: "WAITING",
      details: {
        contact: "James Mwangi",
        phone: "+254 712 345 678",
        course: "French A1",
        dateFormatted: "29 Aug 2026 10:42:12",
        source: "Otomatizon Decision Engine",
        messageId: "dec_followup_timer_24h",
        resultLabel: "24h timer activated"
      },
      dataPayload: {
        decisionCondition: "is_booked_in_calendar",
        evaluatedValue: false,
        scheduledDelayHours: 24,
        nextActionAt: "2026-08-30T10:42:12Z",
        actionToExecute: "send_whatsapp_polite_followup"
      },
      logs: [
        { timestamp: "10:42:12.010", level: "INFO", message: "Evaluating Decision Gate: [Booked or Replied?]" },
        { timestamp: "10:42:12.035", level: "INFO", message: "Branch taken: NO -> Enqueue timer for 24h follow-up" }
      ]
    },
    {
      stepIndex: 5,
      timestamp: "10:42:12",
      app: "System",
      actionTitle: "Waiting in standby",
      contextText: "Next action: WhatsApp follow-up",
      status: "WAITING",
      details: {
        contact: "James Mwangi",
        phone: "+254 712 345 678",
        course: "French A1",
        dateFormatted: "29 Aug 2026 10:42:12",
        source: "Automation Background Scheduler",
        messageId: "sched_task_7719a",
        resultLabel: "Active standby"
      },
      dataPayload: {
        scheduledTaskId: "task_whatsapp_followup_mwangi",
        state: "WAITING",
        cancellationTrigger: "calendar_booking_or_student_reply"
      },
      logs: [
        { timestamp: "10:42:12.050", level: "INFO", message: "State transitioned to WAITING" },
        { timestamp: "10:42:12.080", level: "INFO", message: "Heartbeat check scheduled every 15 minutes" }
      ]
    }
  ];

  // Simulation progressive animation effect if isLiveSimulation
  useEffect(() => {
    if (isLiveSimulation && visibleStepCount < executionSteps.length) {
      const timer = setTimeout(() => {
        setVisibleStepCount((prev) => prev + 1);
        setSelectedStepIndex(visibleStepCount);
        if (visibleStepCount + 1 >= executionSteps.length) {
          setOverallState("COMPLETED");
          // Dispatch canonical operational event to update Command Center, Activity, and Report metrics!
          dispatchOperationalEvent({
            sourceAppId: "whatsapp_business",
            dataSourceId: "ds_whatsapp_inbound",
            eventType: "inquiry_received",
            title: "Inquiry received: James Mwangi",
            description: "James Mwangi requested rates and slots for French A1 course.",
            entityName: "James Mwangi",
            payload: {
              phone: "+254 712 345 678",
              course: "French A1",
              channel: "WhatsApp Business"
            },
            provenance: "SIMULATED"
          });
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isLiveSimulation, visibleStepCount]);

  const currentStep = executionSteps[selectedStepIndex] || executionSteps[0];

  const formatDuration = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const getAppIcon = (app: string) => {
    switch (app) {
      case "WhatsApp":
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case "Otomatizon":
        return <Sparkles className="w-4 h-4 text-[#15803D]" />;
      case "Google Sheets":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
      case "Google Calendar":
      case "Google Agenda":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      default:
        return <Cpu className="w-4 h-4 text-[#75777E]" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* 1. TOP HEADER matching Reference Image 6 */}
      <div className="border-b border-[#EAE7DF] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-mono text-[#75777E] hover:text-[#121316] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to flow</span>
          </button>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121316] tracking-tight">
              Execution in progress
            </h1>

            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 ${
              overallState === "COMPLETED"
                ? "bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]"
                : overallState === "WAITING"
                ? "bg-amber-50 text-amber-800 border border-amber-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-300"
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                overallState === "RUNNING" ? "bg-emerald-600 animate-pulse" : "bg-[#15803D]"
              }`} />
              {overallState === "WAITING" ? "WAITING (24H)" : overallState === "COMPLETED" ? "COMPLETED" : "RUNNING"}
            </span>
          </div>

          <p className="text-xs font-mono text-[#75777E]">
            Execution {runId} &middot; Flow: {workflowTitle}
          </p>
        </div>

        {/* Top Right Duration Counter matching Image 6 */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#FAF9F5] border border-[#EAE7DF] px-3.5 py-1.5 rounded-2xl text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-[#75777E]" />
          <span className="text-[#75777E]">Duration:</span>
          <strong className="text-[#121316]">{formatDuration(durationSeconds)}</strong>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN REAL-TIME EXECUTION WORKBENCH matching Reference Image 6 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (7 Cols): VERTICAL EVENT CHAIN TIMELINE */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-7 space-y-6">
          <div className="relative">
            
            {/* Vertical Connecting Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-emerald-500/30 rounded-full" />

            <div className="space-y-6">
              {executionSteps.slice(0, visibleStepCount).map((step, i) => {
                const isSelected = selectedStepIndex === i;
                const isStepCompleted = step.status === "COMPLETED";

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedStepIndex(i)}
                    className={`relative flex items-start gap-4 p-3 rounded-2xl transition-all cursor-pointer ${
                      isSelected 
                        ? "bg-[#FAF9F5] ring-1 ring-[#15803D] shadow-2xs" 
                        : "hover:bg-[#FAF9F5]/60"
                    }`}
                  >
                    {/* Node Dot / Status Icon on the line */}
                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-2xs border ${
                      isStepCompleted 
                        ? "bg-[#15803D] text-white border-[#15803D]" 
                        : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {isStepCompleted ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Clock className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>

                    {/* Event Row Body matching Reference Image 6 */}
                    <div className="min-w-0 flex-1 pt-0.5 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#121316]">
                          {step.timestamp}
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-xs text-[#121316]">
                          {getAppIcon(step.app)}
                          <span>{step.app}</span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-[#15803D]">
                        {step.actionTitle}
                      </div>

                      <div className="text-[11px] text-[#4A4B50] font-mono bg-white p-1.5 rounded-lg border border-[#EAE7DF]/80 shadow-2xs">
                        {step.contextText}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): STEP DETAIL INSPECTOR matching Reference Image 6 */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-7 space-y-5">
          
          {/* Header & Tabs matching Image 6 */}
          <div className="space-y-3 border-b border-[#EAE7DF] pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
              STEP DETAILS
            </span>

            <div className="flex items-center gap-1 bg-[#F4F2EB] p-1 rounded-full border border-[#EAE7DF] text-xs font-mono">
              <button
                onClick={() => setActiveInspectorTab("context")}
                className={`flex-1 py-1 rounded-full text-center transition-all ${
                  activeInspectorTab === "context"
                    ? "bg-white text-[#121316] font-bold shadow-2xs"
                    : "text-[#75777E] hover:text-[#121316]"
                }`}
              >
                Context
              </button>
              <button
                onClick={() => setActiveInspectorTab("data")}
                className={`flex-1 py-1 rounded-full text-center transition-all ${
                  activeInspectorTab === "data"
                    ? "bg-white text-[#121316] font-bold shadow-2xs"
                    : "text-[#75777E] hover:text-[#121316]"
                }`}
              >
                Data
              </button>
              <button
                onClick={() => setActiveInspectorTab("logs")}
                className={`flex-1 py-1 rounded-full text-center transition-all ${
                  activeInspectorTab === "logs"
                    ? "bg-white text-[#121316] font-bold shadow-2xs"
                    : "text-[#75777E] hover:text-[#121316]"
                }`}
              >
                Logs
              </button>
            </div>
          </div>

          {/* TAB 1: CONTEXT matching Reference Image 6 */}
          {activeInspectorTab === "context" && (
            <div className="space-y-5 animate-fadeIn">
              <h2 className="text-base font-bold text-[#121316]">
                {currentStep.app} &mdash; {currentStep.actionTitle}
              </h2>

              <div className="space-y-2.5 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
                  DETAILS
                </span>

                <div className="space-y-2 border border-[#EAE7DF] p-3.5 rounded-2xl bg-[#FAF9F5] text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#75777E]">Contact:</span>
                    <strong className="text-[#121316]">{currentStep.details.contact}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777E]">Phone:</span>
                    <strong className="text-[#121316]">{currentStep.details.phone}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777E]">Requested course:</span>
                    <strong className="text-[#121316]">{currentStep.details.course}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777E]">Date:</span>
                    <span className="text-[#121316]">{currentStep.details.dateFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#75777E]">Source:</span>
                    <span className="text-[#121316]">{currentStep.details.source}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-[#75777E]">Message ID:</span>
                    <span className="text-[#121316] truncate max-w-[160px]" title={currentStep.details.messageId}>
                      {currentStep.details.messageId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Result Box matching Image 6 */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
                  RESULT
                </span>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  <span>{currentStep.details.resultLabel}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATA (Structured JSON Payload) */}
          {activeInspectorTab === "data" && (
            <div className="space-y-3 animate-fadeIn text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
                STRUCTURED JSON PAYLOAD
              </span>
              <pre className="p-3.5 rounded-2xl bg-stone-900 text-stone-200 overflow-x-auto text-[10px] font-mono leading-relaxed select-all max-h-72">
                {JSON.stringify(currentStep.dataPayload, null, 2)}
              </pre>
            </div>
          )}

          {/* TAB 3: LOGS (Machine Audit Logs) */}
          {activeInspectorTab === "logs" && (
            <div className="space-y-3 animate-fadeIn text-xs">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
                MACHINE EXECUTION LOG
              </span>
              <div className="p-3 rounded-2xl bg-stone-900 text-stone-300 font-mono text-[10px] space-y-2 max-h-72 overflow-y-auto">
                {currentStep.logs.map((log, lIdx) => (
                  <div key={lIdx} className="leading-normal">
                    <span className="text-[#75777E]">{log.timestamp}</span>{" "}
                    <span className="text-emerald-400">[{log.level}]</span>{" "}
                    <span>{log.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Link matching Reference Image 6 */}
          {onNavigateToActivity && (
            <div className="pt-4 border-t border-[#EAE7DF]">
              <button
                onClick={onNavigateToActivity}
                className="w-full py-3 rounded-2xl bg-[#FAF9F5] hover:bg-[#F4F2EB] border border-[#EAE7DF] text-xs font-bold text-[#121316] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>View live activity stream</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
