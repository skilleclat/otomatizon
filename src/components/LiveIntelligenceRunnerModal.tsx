"use client";

import React, { useState } from "react";
import { 
  X, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  MessageSquare, 
  Calendar, 
  FileSpreadsheet, 
  Mail, 
  CreditCard, 
  Video, 
  ArrowRight, 
  ShieldCheck, 
  ExternalLink,
  Play
} from "lucide-react";

interface LiveIntelligenceRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectedEmail?: string;
  connectedPhone?: string;
}

interface StepDetail {
  step: number;
  system: string;
  action: string;
  detail: string;
  status: "SUCCESS" | "ACTIVE_WATCH" | "PENDING";
}

export const LiveIntelligenceRunnerModal: React.FC<LiveIntelligenceRunnerModalProps> = ({
  isOpen,
  onClose,
  connectedEmail = "heritiermaliyabwana1@gmail.com",
  connectedPhone = "+254 770 979 109"
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [executedSteps, setExecutedSteps] = useState<StepDetail[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [meetLink, setMeetLink] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleRunLiveTest = async () => {
    setIsRunning(true);
    setExecutedSteps([]);
    setCurrentStepIndex(0);
    setIsCompleted(false);

    try {
      const res = await fetch("/api/orchestration/test-live-flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: "Mercy Chebet",
          customerPhone: "+254 719 552 108",
          inquiryText: "Hello! I saw your tutoring page. Could you share your fees and schedule a trial session?"
        })
      });

      const data = await res.json();
      if (data.success && data.steps) {
        setMeetLink(data.meetLink);

        // Step by step animation reveal
        for (let i = 0; i < data.steps.length; i++) {
          await new Promise((r) => setTimeout(r, 650));
          setCurrentStepIndex(i + 1);
          setExecutedSteps((prev) => [...prev, data.steps[i]]);
        }

        setIsCompleted(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const getSystemIcon = (systemName: string) => {
    if (systemName.includes("WhatsApp")) return <MessageSquare className="w-4 h-4 text-emerald-600" />;
    if (systemName.includes("Sheets")) return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    if (systemName.includes("Calendar") || systemName.includes("Meet")) return <Video className="w-4 h-4 text-blue-600" />;
    if (systemName.includes("Gmail")) return <Mail className="w-4 h-4 text-red-600" />;
    if (systemName.includes("M-Pesa")) return <CreditCard className="w-4 h-4 text-emerald-700" />;
    return <Sparkles className="w-4 h-4 text-[#15803D]" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121316]/50 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white border border-[#EAE7DF] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-[#EAE7DF] relative bg-[#FAF9F5]">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-[#75777E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#15803D] animate-pulse" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              LIVE ORCHESTRATION PIPELINE
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-[#121316] mt-2">
            Otomatizon Autonomous AI Engine in Action
          </h2>
          <p className="text-xs text-[#4A4B50] mt-1 leading-relaxed">
            Connected to your Google Workspace (<strong className="text-[#121316]">{connectedEmail}</strong>) &amp; WhatsApp (<strong className="text-[#121316]">{connectedPhone}</strong>).
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Action Trigger Card */}
          <div className="p-5 bg-[#FAF9F5] border border-[#EAE7DF] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#121316] block">
                Trigger Real Inbound Inquiry Simulation
              </span>
              <p className="text-[11px] text-[#75777E]">
                Simulate a live student inquiry and watch Otomatizon log the lead into Sheets, generate a Google Meet link on Calendar, and send responses.
              </p>
            </div>

            <button
              type="button"
              onClick={handleRunLiveTest}
              disabled={isRunning}
              className="px-5 py-2.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-xs disabled:opacity-50"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Orchestrating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Pipeline Live</span>
                </>
              )}
            </button>
          </div>

          {/* Pipeline Step Execution Stream */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold">
                Real-Time Execution Trace ({executedSteps.length} of 6 steps)
              </span>
              {isCompleted && (
                <span className="text-[10px] font-mono text-[#15803D] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Workflow Completed
                </span>
              )}
            </div>

            {executedSteps.length === 0 && !isRunning && (
              <div className="p-8 border border-dashed border-[#EAE7DF] rounded-2xl text-center space-y-2 bg-[#FAF9F5]/50">
                <Sparkles className="w-6 h-6 text-[#15803D] mx-auto opacity-60" />
                <p className="text-xs text-[#75777E] font-mono">
                  Click &ldquo;Execute Pipeline Live&rdquo; above to observe real-time communication between WhatsApp, Google Sheets, Google Meet &amp; Gmail.
                </p>
              </div>
            )}

            <div className="space-y-2.5">
              {executedSteps.map((step) => (
                <div 
                  key={step.step}
                  className="p-4 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-start gap-3.5 animate-fadeIn"
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] shrink-0">
                    {getSystemIcon(step.system)}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#121316] font-mono">
                          Step {step.step}: {step.system}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] font-bold">
                          {step.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-[#75777E]">Just now</span>
                    </div>

                    <p className="text-xs font-medium text-[#121316]">
                      {step.action}
                    </p>
                    <p className="text-[11px] text-[#4A4B50] font-mono leading-relaxed bg-[#FAF9F5] p-2 rounded-lg border border-[#EAE7DF]">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Generated Google Meet Link Box if completed */}
            {meetLink && (
              <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-[#15803D] shrink-0" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#121316]">Live Google Meet Session Created</div>
                    <div className="text-[11px] font-mono text-[#15803D]">{meetLink}</div>
                  </div>
                </div>
                <a
                  href={meetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-full bg-[#15803D] text-white text-[11px] font-mono font-bold hover:bg-[#002E25] transition-colors flex items-center gap-1 shrink-0"
                >
                  <span>Open Meet</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#EAE7DF] bg-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[#75777E] font-mono">
            <ShieldCheck className="w-4 h-4 text-[#15803D]" />
            <span>Bank-grade encryption &middot; Multi-Tenant Isolation Verified</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full bg-[#121316] hover:bg-black text-white text-xs font-mono font-bold cursor-pointer"
          >
            Close Trace
          </button>
        </div>

      </div>
    </div>
  );
};
