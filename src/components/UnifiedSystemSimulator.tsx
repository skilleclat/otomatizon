"use client";

import React, { useState } from "react";
import { 
  Play, 
  Sparkles, 
  MessageSquare, 
  Calendar, 
  FileSpreadsheet, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  RotateCcw,
  Zap
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { DS } from "@/lib/design-system";

export const UnifiedSystemSimulator: React.FC = () => {
  const { state, simulateNewLead } = useOtomatizonStore();
  const [isRunning, setIsRunning] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = [
    {
      id: 1,
      app: "WhatsApp Business",
      role: "Inbound Channel",
      icon: MessageSquare,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-200",
      action: "New Prospective Student Inquiry Received",
      detail: "Wanjiku (+254 722 419 802): 'Hello, I need private French lessons for DELF B2 exam prep. What are your available slots?'"
    },
    {
      id: 2,
      app: "Otomatizon Intelligence",
      role: "Central Brain & Orchestration",
      icon: Sparkles,
      iconColor: "text-white",
      bgColor: "bg-[#15803D] border-[#15803D]",
      action: "Intent Understood & Pipeline Triggered",
      detail: "Extracted: Student = Wanjiku, Subject = DELF B2, Intent = Private Tutoring, Urgency = High. Dispatched automated workflow."
    },
    {
      id: 3,
      app: "Google Sheets",
      role: "Master Student Ledger",
      icon: FileSpreadsheet,
      iconColor: "text-emerald-700",
      bgColor: "bg-emerald-50 border-emerald-200",
      action: "Lead Recorded in Real Time",
      detail: "Row added to Student_Roster_2026.xlsx · Status: 'Qualified Lead' · Course: 'DELF Prep'."
    },
    {
      id: 4,
      app: "Google Calendar",
      role: "Availability & Links",
      icon: Calendar,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50 border-blue-200",
      action: "Slot Availability Verified",
      detail: "Confirmed open slots (Thu 4:00 PM / Sat 10:00 AM) · Reserved tentative slot with Google Meet link."
    },
    {
      id: 5,
      app: "WhatsApp Business",
      role: "Automated Fulfillment",
      icon: MessageSquare,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-200",
      action: "Instant Response & Syllabus Dispatched",
      detail: "Sent DELF B2 brochure PDF + direct booking link. 24-hour non-booking follow-up timer initialized."
    }
  ];

  const handleStartSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setIsCompleted(false);
    setActiveStep(1);

    // Step-by-step sequential animation
    setTimeout(() => setActiveStep(2), 900);
    setTimeout(() => setActiveStep(3), 1800);
    setTimeout(() => setActiveStep(4), 2700);
    setTimeout(() => {
      setActiveStep(5);
      simulateNewLead();
    }, 3600);
    setTimeout(() => {
      setIsRunning(false);
      setIsCompleted(true);
    }, 4500);
  };

  const handleReset = () => {
    setIsRunning(false);
    setActiveStep(0);
    setIsCompleted(false);
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              LIVE DEMONSTRATION
            </span>
            <span className="text-xs font-mono text-[#75777E]">
              &bull; Unified Business System
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-[#121316] tracking-tight">
            See your connected apps work together in real time
          </h3>
          <p className="text-xs text-[#4A4B50]">
            Click below to watch how Otomatizon coordinates your tools the second a new student contacts you.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isRunning && !isCompleted && (
            <button
              onClick={handleStartSimulation}
              className="px-5 py-2.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 group cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
              <span>Simulate WhatsApp Inquiry</span>
            </button>
          )}

          {isRunning && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-mono text-[#15803D] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
              <span>Coordinating systems ({activeStep}/5)...</span>
            </div>
          )}

          {isCompleted && (
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-full bg-[#FAF9F5] hover:bg-white border border-[#EAE7DF] text-xs font-bold text-[#121316] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#75777E]" />
              <span>Replay Simulation</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Process Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((s) => {
          const Icon = s.icon;
          const isStepActive = activeStep === s.id;
          const isStepDone = activeStep > s.id || isCompleted;
          const isStepPending = activeStep < s.id && !isCompleted;

          return (
            <div
              key={s.id}
              className={`p-4 rounded-2xl border transition-all duration-500 relative flex flex-col justify-between ${
                isStepActive
                  ? "bg-[#ECFDF5] border-[#15803D] ring-2 ring-[#15803D]/20 shadow-md scale-[1.02]"
                  : isStepDone
                  ? "bg-white border-[#A7F3D0] shadow-2xs"
                  : "bg-[#FAF9F5]/60 border-[#EAE7DF] opacity-60"
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 ${s.bgColor}`}>
                    <Icon className={`w-4 h-4 ${s.iconColor}`} />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#75777E]">
                    0{s.id}
                  </span>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-[#75777E] uppercase tracking-wider">
                    {s.role}
                  </div>
                  <div className="text-xs font-bold text-[#121316] mt-0.5">
                    {s.app}
                  </div>
                </div>

                <div className="text-[11px] font-medium text-[#121316] leading-tight">
                  {s.action}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#EAE7DF] text-[10px] text-[#4A4B50] font-mono line-clamp-3">
                {s.detail}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#15803D]">
                Result: 0 minutes of your time spent &middot; Complete client onboarding orchestrated
              </div>
              <div className="text-[11px] text-[#4A4B50]">
                Lead recorded, slots proposed, and automated 24h follow-up scheduled. All 4 apps synchronized perfectly.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#15803D] font-bold shrink-0">
            <Clock className="w-4 h-4" />
            <span>Saved ~18 minutes on this lead alone</span>
          </div>
        </div>
      )}

    </div>
  );
};
