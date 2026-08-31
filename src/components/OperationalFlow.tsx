"use client";

import React from "react";
import { 
  ArrowDown, 
  Check, 
  MessageSquare, 
  FileSpreadsheet, 
  Calendar, 
  CreditCard, 
  Clock, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  GitBranch,
  CornerDownRight,
  HardDrive
} from "lucide-react";
import { OperationalFlowStep } from "@/types";
import { BrandLogo } from "@/components/BrandLogo";

interface OperationalFlowProps {
  flow?: OperationalFlowStep[];
  interactive?: boolean;
  compact?: boolean;
}

export const OperationalFlow: React.FC<OperationalFlowProps> = ({
  flow,
  interactive = false,
  compact = false
}) => {
  // Fallback default operational flow
  const steps: OperationalFlowStep[] = flow && flow.length > 0 ? flow : [
    {
      id: "flow_01",
      stepNumber: 1,
      nodeType: "trigger",
      application: "WhatsApp",
      systemRole: "Inbound Source",
      title: "Customer sends a WhatsApp message",
      description: "Student reaches out inquiring about lessons, rates, or syllabus details."
    },
    {
      id: "flow_02",
      stepNumber: 2,
      nodeType: "intelligence",
      application: "Otomatizon",
      systemRole: "Operations Intelligence",
      title: "Otomatizon identifies a new inquiry",
      description: "Extracts contact details, verifies student history, and orchestrates the response."
    },
    {
      id: "flow_03",
      stepNumber: 3,
      nodeType: "action",
      application: "Google Sheets",
      systemRole: "Customer Registry",
      title: "Customer information is recorded in Google Sheets",
      description: "Appends student name, WhatsApp phone number, and inquiry timestamp into your roster."
    },
    {
      id: "flow_04",
      stepNumber: 4,
      nodeType: "action",
      application: "WhatsApp",
      systemRole: "Delivery Channel",
      title: "Course information is sent automatically",
      description: "Rate sheet, syllabus brochure, and Google Calendar booking link are delivered instantly."
    },
    {
      id: "flow_05",
      stepNumber: 5,
      nodeType: "action",
      application: "Google Calendar",
      systemRole: "Scheduling System",
      title: "Google Calendar is checked",
      description: "Monitors tutor's agenda to verify if the student booked an introductory slot."
    },
    {
      id: "flow_06",
      stepNumber: 6,
      nodeType: "condition",
      application: "Otomatizon",
      systemRole: "Operational Decision",
      title: "If no booking exists after 24 hours, Otomatizon follows up",
      description: "Waits 24 hours and evaluates whether calendar confirmation occurred.",
      conditionText: "Booking detected on Google Calendar?",
      branchOutcome: {
        yes: "Stop sequence — session scheduled",
        no: "Send courteous WhatsApp follow-up"
      }
    },
    {
      id: "flow_07",
      stepNumber: 7,
      nodeType: "stop",
      application: "Otomatizon",
      systemRole: "Final Outcome",
      title: "The follow-up stops when customer books or replies",
      description: "A Google Meet calendar invite is confirmed and M-Pesa tuition prompt is sent.",
      finalState: "Lead converted & tuition secured"
    }
  ];

  const getAppBadge = (appName: string, isIntelligence: boolean) => {
    const name = appName.toLowerCase();
    
    if (isIntelligence) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] font-mono text-[10px] uppercase font-bold tracking-wider">
          <img src="/intelligence-core-logo.png" alt="Intelligence Layer" className="w-3.5 h-3.5 rounded-md object-contain" />
          OTOMATIZON &middot; INTELLIGENCE LAYER
        </span>
      );
    }

    if (name.includes("whatsapp")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#EAE7DF] text-[#121316] font-mono text-[10px]">
          <MessageSquare className="w-3 h-3 text-[#15803D]" />
          WhatsApp Business
        </span>
      );
    }
    if (name.includes("calendar")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#EAE7DF] text-[#121316] font-mono text-[10px]">
          <Calendar className="w-3 h-3 text-blue-600" />
          Google Calendar
        </span>
      );
    }
    if (name.includes("sheet")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#EAE7DF] text-[#121316] font-mono text-[10px]">
          <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
          Google Sheets
        </span>
      );
    }
    if (name.includes("mpesa") || name.includes("payment")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#EAE7DF] text-[#121316] font-mono text-[10px]">
          <CreditCard className="w-3 h-3 text-emerald-700" />
          Safaricom M-Pesa
        </span>
      );
    }
    if (name.includes("drive")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#EAE7DF] text-[#121316] font-mono text-[10px]">
          <HardDrive className="w-3 h-3 text-amber-600" />
          Google Drive
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-[#EAE7DF] text-[#121316] font-mono text-[10px]">
        {appName}
      </span>
    );
  };

  return (
    <div className="w-full space-y-3">
      {/* Top Architecture Banner */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[#75777E] px-2 pb-1 border-b border-[#EAE7DF]">
        <span>HOW INFORMATION MOVES THROUGH YOUR SYSTEMS</span>
        <span className="text-[#15803D] font-semibold">{steps.length} OPERATIONAL STAGES</span>
      </div>

      {/* Sequential Flow Diagram */}
      <div className="relative pt-2 pb-4">
        {steps.map((step, idx) => {
          const isIntelligence = step.nodeType === "intelligence" || step.application.toLowerCase().includes("otomatizon");
          const isCondition = step.nodeType === "condition";
          const isStop = step.nodeType === "stop";

          return (
            <div key={step.id || idx} className="relative group">
              {/* Connector line between steps */}
              {idx < steps.length - 1 && (
                <div 
                  className="absolute left-6 top-12 bottom-0 w-[2px] bg-[#EAE7DF] -mb-4 z-0 group-hover:bg-[#D5D1C6] transition-colors"
                  aria-hidden="true"
                />
              )}

              {/* Step Node Card */}
              <div 
                className={`relative z-10 mb-4 p-4 sm:p-5 rounded-2xl border transition-all ${
                  isIntelligence
                    ? "bg-[#FAF9F5] border-[#15803D]/30 shadow-sm"
                    : isCondition
                    ? "bg-[#FAF9F5] border-amber-300 shadow-sm"
                    : isStop
                    ? "bg-white border-[#A7F3D0] shadow-sm"
                    : "bg-white border-[#EAE7DF] shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  
                  {/* Step Number Circle */}
                  <div 
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-mono font-bold shrink-0 shadow-xs border ${
                      isIntelligence
                        ? "bg-[#15803D] text-white border-[#15803D]"
                        : isCondition
                        ? "bg-amber-100 text-amber-900 border-amber-300"
                        : isStop
                        ? "bg-[#ECFDF5] text-[#15803D] border-[#A7F3D0]"
                        : "bg-[#FAF9F5] text-[#121316] border-[#EAE7DF]"
                    }`}
                  >
                    {step.stepNumber < 10 ? `0${step.stepNumber}` : step.stepNumber}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getAppBadge(step.application, isIntelligence)}
                        <span className="text-[10px] font-mono text-[#75777E]">
                          {step.systemRole}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono uppercase text-[#75777E]">
                        STAGE {step.stepNumber}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#121316] leading-snug">
                      {step.title}
                    </h4>

                    <p className="text-xs text-[#4A4B50] leading-relaxed">
                      {step.description}
                    </p>

                    {/* Condition Branch Representation */}
                    {isCondition && step.branchOutcome && (
                      <div className="mt-3 pt-2.5 border-t border-amber-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                        <div className="p-2.5 rounded-xl bg-white border border-[#A7F3D0] space-y-0.5">
                          <span className="text-[10px] font-bold text-[#15803D] uppercase flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            YES &mdash; Booking Confirmed
                          </span>
                          <p className="text-[11px] text-[#4A4B50]">
                            {step.branchOutcome.yes}
                          </p>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-amber-200 space-y-0.5">
                          <span className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            NO &mdash; Still Unbooked (24h)
                          </span>
                          <p className="text-[11px] text-[#4A4B50]">
                            {step.branchOutcome.no}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Terminal Outcome */}
                    {isStop && step.finalState && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between text-xs font-mono">
                        <span className="text-[#15803D] font-bold">
                          FINAL STATE:
                        </span>
                        <span className="text-[#121316] font-medium">
                          {step.finalState}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Downward connecting indicator */}
              {idx < steps.length - 1 && (
                <div className="flex justify-center -mt-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-white border border-[#EAE7DF] flex items-center justify-center text-[#75777E] shadow-2xs">
                    <ArrowDown className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* System Architecture Summary Footnote */}
      <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] text-xs text-[#4A4B50] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
          <span>
            <strong>Orchestrated by Otomatizon:</strong> Applications handle messaging, storage, and calendars. Otomatizon directs the operational timing and logic.
          </span>
        </div>
      </div>
    </div>
  );
};
