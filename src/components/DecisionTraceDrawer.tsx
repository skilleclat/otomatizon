"use client";

import React from "react";
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  MessageSquare, 
  Calendar, 
  FileSpreadsheet, 
  CreditCard, 
  Cpu, 
  Layers,
  Lock,
  Zap,
  Info
} from "lucide-react";
import { DecisionTrace } from "@/lib/decision-trace";

interface DecisionTraceDrawerProps {
  trace: DecisionTrace | null;
  onClose: () => void;
}

export const DecisionTraceDrawer: React.FC<DecisionTraceDrawerProps> = ({
  trace,
  onClose
}) => {
  if (!trace) return null;

  const renderAppIcon = (key: string) => {
    switch (key) {
      case "whatsapp":
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case "calendar":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case "sheets":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-700" />;
      case "mpesa":
        return <CreditCard className="w-4 h-4 text-emerald-700" />;
      default:
        return <Cpu className="w-4 h-4 text-[#15803D]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#121316]/50 backdrop-blur-xs animate-fade-in" onClick={onClose}>
      <div 
        className="bg-[#FFFFFF] border-l border-[#EAE7DF] w-full max-w-xl h-full shadow-2xl overflow-y-auto flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#EAE7DF] bg-[#FAF9F5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                STAGE 0{trace.stepNumber} &middot; {trace.status}
              </span>
              <span className="text-xs font-mono text-[#75777E]">
                {trace.latencyMs}ms latency
              </span>
            </div>

            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#EAE7DF] text-[#75777E] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#75777E] mb-1">
              {renderAppIcon(trace.appIconKey)}
              <span>{trace.application}</span>
              <span>&bull;</span>
              <span>{trace.timestamp}</span>
            </div>
            <h2 className="text-lg font-bold text-[#121316] tracking-tight">
              {trace.stageName}
            </h2>
          </div>
        </div>

        {/* Body: The 5-Part Operational Reasoning Trace */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          
          {/* 1. WHAT WAS DETECTED */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#121316]" />
              1. WHAT WAS DETECTED (EVENT INGESTION)
            </span>
            <div className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#EAE7DF] text-[#121316] font-sans leading-relaxed">
              {trace.trace.detected}
            </div>
          </div>

          {/* 2. WHAT WAS UNDERSTOOD */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              2. WHAT OTOMATIZON UNDERSTOOD (SEMANTIC EXTRACTION)
            </span>
            <div className="p-3.5 bg-[#ECFDF5] rounded-2xl border border-[#A7F3D0] space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs font-bold text-[#15803D]">
                <span>Intent: {trace.trace.understood.intent}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white border border-[#A7F3D0]">
                  Confidence: {trace.trace.understood.confidence}%
                </span>
              </div>
              <div className="text-[11px] text-[#065F46] space-y-1 pt-1 border-t border-emerald-200">
                {trace.trace.understood.entities.studentName && (
                  <div>&bull; Contact: <strong>{trace.trace.understood.entities.studentName}</strong></div>
                )}
                {trace.trace.understood.entities.subject && (
                  <div>&bull; Subject: <strong>{trace.trace.understood.entities.subject}</strong></div>
                )}
                {trace.trace.understood.entities.level && (
                  <div>&bull; Level: <strong>{trace.trace.understood.entities.level}</strong></div>
                )}
                {trace.trace.understood.entities.requestedSlot && (
                  <div>&bull; Requested Slot: <strong>{trace.trace.understood.entities.requestedSlot}</strong></div>
                )}
              </div>
            </div>
          </div>

          {/* 3. THE DECISION MADE */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#121316] font-bold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#15803D]" />
              3. OTOMATIZON OPERATIONAL DECISION
            </span>
            <div className="p-3.5 bg-white rounded-2xl border border-[#121316] text-[#121316] font-bold leading-relaxed shadow-xs">
              {trace.trace.decision}
            </div>
          </div>

          {/* 4. BUSINESS REASONING (WHY) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#75777E]" />
              4. BUSINESS REASONING (WHY THIS DECISION)
            </span>
            <div className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#EAE7DF] text-[#4A4B50] leading-relaxed">
              {trace.trace.reasoning}
            </div>
          </div>

          {/* 5. NEXT ACTION & VERIFICATION */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
              5. ACTION EXECUTED &amp; IDEMPOTENT VERIFICATION
            </span>
            <div className="p-3.5 bg-[#FAF9F5] rounded-2xl border border-[#EAE7DF] space-y-2 font-mono text-[11px]">
              <div className="text-[#121316] font-bold">
                &rarr; {trace.trace.nextAction}
              </div>
              <div className="flex items-center justify-between text-[#75777E] pt-1.5 border-t border-[#EAE7DF]">
                <span>Token: {trace.trace.verification.idempotencyToken}</span>
                <span className="text-[#15803D] font-bold">{trace.trace.verification.status}</span>
              </div>
              <div className="text-[#065F46] bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                Outcome: {trace.trace.verification.businessOutcome}
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#EAE7DF] bg-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[#75777E] font-mono">
            <Lock className="w-3.5 h-3.5 text-[#15803D]" />
            Cryptographically signed audit trace
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#121316] hover:bg-[#002E25] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
