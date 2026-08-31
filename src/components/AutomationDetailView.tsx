"use client";

import React, { useState } from "react";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Check, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  FileText,
  AlertCircle,
  MessageSquare,
  Calendar,
  FileSpreadsheet,
  CreditCard
} from "lucide-react";
import { Workflow } from "@/types";
import { useOtomatizonStore } from "@/lib/store";
import { OperationalFlow } from "./OperationalFlow";
import { AutomationFlowCanvas } from "./AutomationFlowCanvas";
import { FollowUpQueueModal } from "./FollowUpQueueModal";
import { DS } from "@/lib/design-system";

interface AutomationDetailViewProps {
  workflow: Workflow;
  onBack: () => void;
  onNavigateToActivity?: () => void;
}

export const AutomationDetailView: React.FC<AutomationDetailViewProps> = ({
  workflow,
  onBack,
  onNavigateToActivity
}) => {
  const { 
    state, 
    pauseWorkflow, 
    resumeWorkflow, 
    runWorkflowSimulation 
  } = useOtomatizonStore();

  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testNotification, setTestNotification] = useState<string | null>(null);
  const [delayHours, setDelayHours] = useState(workflow.timingConfig?.delayHours || 24);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);

  const isActive = workflow.active;

  const handleToggleActive = () => {
    if (isActive) {
      pauseWorkflow(workflow.id);
    } else {
      resumeWorkflow(workflow.id);
    }
  };

  const handleTriggerSimulation = () => {
    setIsRunningTest(true);
    setTestNotification(null);

    setTimeout(() => {
      runWorkflowSimulation(workflow.id);
      setIsRunningTest(false);
      setTestNotification("Simulated execution completed: Lead captured in Sheets, brochure sent on WhatsApp, and follow-up scheduled.");
      setTimeout(() => setTestNotification(null), 6000);
    }, 850);
  };

  const connectedApps = workflow.connectedApps || ["WhatsApp", "Google Sheets", "Google Calendar"];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-mono text-[#75777E] hover:text-[#121316] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Automations</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-[#75777E]">Status:</span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase ${
            isActive 
              ? "bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]" 
              : "bg-stone-100 text-stone-600 border border-stone-200"
          }`}>
            {isActive ? "ACTIVE & MONITORING" : "PAUSED"}
          </span>
        </div>
      </div>

      {/* 1. Interactive Automation Flow Canvas matching Step 5 Visual Reference */}
      <AutomationFlowCanvas
        workflowTitle={workflow.title}
        isActive={isActive}
        onToggleActive={handleToggleActive}
        onRunTest={handleTriggerSimulation}
        isRunningTest={isRunningTest}
        onBack={onBack}
        flow={workflow.operationalFlow}
      />

      {/* 2. Step-by-Step Narrative Breakdown */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
            HOW INFORMATION FLOWS
          </span>
          <h2 className="text-xl font-bold text-[#121316] tracking-tight mt-1">
            Sequential Information Movement
          </h2>
          <p className="text-xs text-[#4A4B50] mt-0.5">
            Every step where data enters, decisions are made, and actions are dispatched across your tools.
          </p>
        </div>

        <OperationalFlow flow={workflow.operationalFlow} />
      </div>

      {/* Operational Timing & Rules */}
      <div className="p-6 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#121316]">
              Operational Timing Configuration
            </h3>
            <p className="text-xs text-[#75777E]">
              Control the waiting period before Otomatizon sends a polite follow-up.
            </p>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            {[12, 24, 48].map((hrs) => (
              <button
                key={hrs}
                onClick={() => setDelayHours(hrs)}
                className={`px-3 py-1 rounded-full transition-all ${
                  delayHours === hrs
                    ? "bg-[#121316] text-white font-bold"
                    : "bg-[#FAF9F5] text-[#75777E] hover:text-[#121316] border border-[#EAE7DF]"
                }`}
              >
                {hrs}h
              </button>
            ))}
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] text-xs text-[#4A4B50] space-y-1 font-mono">
          <div>&bull; Trigger: Instant upon customer inquiry on WhatsApp.</div>
          <div>&bull; Evaluation Window: Checks Google Calendar after {delayHours} hours.</div>
          <div>&bull; Stop Criteria: Immediate cancellation if student confirms booking or sends text reply.</div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={() => setIsQueueModalOpen(true)}
            className="px-4 py-2.5 rounded-full bg-[#15803D]/10 hover:bg-[#15803D] text-[#15803D] hover:text-white border border-[#15803D]/20 text-xs font-bold transition-all flex items-center gap-2"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>View &amp; Manage 24h Queue (Fast-Forward Available)</span>
          </button>
        </div>
      </div>

      {/* Follow-up Queue Modal (Phase 3) */}
      <FollowUpQueueModal
        isOpen={isQueueModalOpen}
        onClose={() => setIsQueueModalOpen(false)}
      />

    </div>
  );
};
