"use client";

import React, { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
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
  ChevronRight,
  Info,
  Zap,
  Activity
} from "lucide-react";
import { useOtomatizonStore, dispatchOperationalEvent } from "@/lib/store";
import { DecisionTrace, defaultPipelineTraces, getTracesForWorkflow } from "@/lib/decision-trace";

interface LiveAutomationPipelineProps {
  onSelectTrace: (trace: DecisionTrace) => void;
}

export const LiveAutomationPipeline: React.FC<LiveAutomationPipelineProps> = ({
  onSelectTrace
}) => {
  const { state, dispatchOperationalEvent, simulatePackageRenewal, simulateGoogleReview } = useOtomatizonStore();
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("wf_lead_autopilot");
  const [traces, setTraces] = useState<DecisionTrace[]>(defaultPipelineTraces);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlayingSimulation, setIsPlayingSimulation] = useState<boolean>(false);
  const [simSpeedMs, setSimSpeedMs] = useState<number>(700);

  const workflows = state.workflows || [];
  const currentWorkflow = workflows.find((w) => w.id === selectedWorkflowId) || workflows[0];

  const handleSelectWorkflow = (wfId: string) => {
    setSelectedWorkflowId(wfId);
    const newTraces = getTracesForWorkflow(wfId);
    setTraces(newTraces);
    setActiveStepIndex(0);
    setIsPlayingSimulation(false);
  };

  useEffect(() => {
    let timer: any = null;
    if (isPlayingSimulation) {
      timer = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev >= traces.length - 1) {
            setIsPlayingSimulation(false);
            return traces.length - 1;
          }
          return prev + 1;
        });
      }, simSpeedMs);
    }
    return () => clearInterval(timer);
  }, [isPlayingSimulation, traces.length, simSpeedMs]);

  const handleStartSimulation = () => {
    if (selectedWorkflowId === "wf_package_renewal") {
      simulatePackageRenewal("Emmanuel Kiprono");
    } else if (selectedWorkflowId === "wf_google_reviews") {
      simulateGoogleReview("Clara Wambui");
    } else {
      // Default Lead Inbound
      dispatchOperationalEvent({
        sourceAppId: "app_wa_01",
        dataSourceId: "ds_wa_inbound",
        eventType: "inquiry_received",
        entityName: "Dr. Patrick Mbugua",
        title: "WhatsApp: Dr. Patrick Mbugua [CBC Mathematics]",
        description: "Inbound request for Grade 8 Mathematics CBC coaching on Saturday morning.",
        payload: {
          phone: "+254 722 998 811",
          service: "Mathematics CBC Coaching",
          channel: "WhatsApp Business",
          amountKes: 3500
        },
        provenance: "OBSERVED"
      });
    }

    setActiveStepIndex(0);
    setIsPlayingSimulation(true);
  };

  const handleTogglePlayPause = () => {
    setIsPlayingSimulation(!isPlayingSimulation);
  };

  const handleReset = () => {
    setIsPlayingSimulation(false);
    setActiveStepIndex(0);
  };

  const renderAppIcon = (key: string, isActive: boolean) => {
    switch (key) {
      case "whatsapp":
        return <MessageSquare className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-[#75777E]"}`} />;
      case "calendar":
        return <Calendar className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-[#75777E]"}`} />;
      case "sheets":
        return <FileSpreadsheet className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-[#75777E]"}`} />;
      case "mpesa":
        return <CreditCard className={`w-4 h-4 ${isActive ? "text-emerald-700" : "text-[#75777E]"}`} />;
      default:
        return <Cpu className={`w-4 h-4 ${isActive ? "text-[#15803D]" : "text-[#75777E]"}`} />;
    }
  };

  const activeTrace = traces[activeStepIndex] || traces[0];

  const getSimulateButtonLabel = () => {
    if (selectedWorkflowId === "wf_package_renewal") return "Simulate Session & Renewal";
    if (selectedWorkflowId === "wf_google_reviews") return "Simulate Review Collector";
    return "Simulate Inbound Lead";
  };

  return (
    <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-6 animate-fadeIn">
      
      {/* 1. Workflow Switcher & Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#EAE7DF] pb-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
              LIVE OPERATIONAL PIPELINE
            </span>
            
            {/* Workflow Quick Switcher Pills */}
            <div className="flex items-center gap-1.5 bg-[#FAF9F5] p-1 rounded-full border border-[#EAE7DF]">
              <button
                onClick={() => handleSelectWorkflow("wf_lead_autopilot")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedWorkflowId === "wf_lead_autopilot"
                    ? "bg-[#002E25] text-white shadow-xs"
                    : "text-[#4A4B50] hover:text-[#121316]"
                }`}
              >
                1. Lead Follow-Up
              </button>
              <button
                onClick={() => handleSelectWorkflow("wf_package_renewal")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedWorkflowId === "wf_package_renewal"
                    ? "bg-[#002E25] text-white shadow-xs"
                    : "text-[#4A4B50] hover:text-[#121316]"
                }`}
              >
                2. Package Credit Tracker
              </button>
              <button
                onClick={() => handleSelectWorkflow("wf_google_reviews")}
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedWorkflowId === "wf_google_reviews"
                    ? "bg-[#002E25] text-white shadow-xs"
                    : "text-[#4A4B50] hover:text-[#121316]"
                }`}
              >
                3. Google Reviews
              </button>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-[#121316] tracking-tight">
            {currentWorkflow?.title || "Automation Circulation & Reasoning"}
          </h2>
          <p className="text-xs text-[#4A4B50]">
            {currentWorkflow?.summary || "Watch how Otomatizon ingests events, reasons, orchestrates applications, and verifies business outcomes."}
          </p>
        </div>

        {/* Live Stepper Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleStartSimulation}
            disabled={isPlayingSimulation}
            className="px-4 py-2.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all shadow-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-300 text-emerald-300" />
            <span>{getSimulateButtonLabel()}</span>
          </button>

          {isPlayingSimulation ? (
            <button
              onClick={handleTogglePlayPause}
              className="p-2.5 rounded-full border border-[#EAE7DF] hover:bg-[#FAF9F5] text-[#121316] transition-colors cursor-pointer"
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          ) : null}

          <button
            onClick={handleReset}
            className="p-2.5 rounded-full border border-[#EAE7DF] hover:bg-[#FAF9F5] text-[#75777E] hover:text-[#121316] transition-colors cursor-pointer"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Interactive Pipeline Grid (7 Horizontal Nodes) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
        {traces.map((step, idx) => {
          const isSelected = idx === activeStepIndex;
          const isPassed = idx < activeStepIndex;
          const isIntelligence = step.appIconKey === "otomatizon";

          return (
            <div
              key={step.stepNumber}
              onClick={() => {
                setActiveStepIndex(idx);
                onSelectTrace(step);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                isSelected
                  ? "bg-[#FAF9F5] border-[#15803D] ring-2 ring-[#15803D]/20 shadow-md scale-[1.02]"
                  : isPassed
                  ? "bg-white border-[#A7F3D0] hover:border-[#15803D]/60"
                  : "bg-white border-[#EAE7DF] hover:border-[#D5D1C6] opacity-75"
              }`}
            >
              {/* Top Node Header */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#75777E]">
                  0{step.stepNumber}
                </span>

                <div className="flex items-center gap-1">
                  {renderAppIcon(step.appIconKey, isSelected || isPassed)}
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
                  )}
                </div>
              </div>

              {/* Node Title & App */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-[#75777E] uppercase block truncate">
                  {step.application}
                </span>
                <h4 className="text-xs font-bold text-[#121316] leading-snug line-clamp-2">
                  {step.stageName}
                </h4>
              </div>

              {/* Status Badge & Latency */}
              <div className="pt-2 border-t border-[#EAE7DF] flex items-center justify-between text-[10px] font-mono">
                <span className={isSelected || isPassed ? "text-[#15803D] font-bold" : "text-[#75777E]"}>
                  {step.status}
                </span>
                <span className="text-[#75777E]">
                  {step.latencyMs}ms
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Real-Time Active Decision Banner (Live Reasoning Focus) */}
      {activeTrace && (
        <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7DF] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#15803D] uppercase">
                ACTIVE STAGE 0{activeTrace.stepNumber}: {activeTrace.stageName}
              </span>
              <span className="text-[11px] font-mono text-[#75777E]">
                &bull; {activeTrace.application}
              </span>
            </div>

            <button
              onClick={() => onSelectTrace(activeTrace)}
              className="text-xs font-mono font-bold text-[#15803D] hover:text-[#166534] flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>Why did Otomatizon do this? (Inspect Decision Trace)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Column 1: Event & Detection */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold block">
                DETECTED EVENT
              </span>
              <p className="text-[#121316] font-medium leading-relaxed">
                {activeTrace.trace.detected}
              </p>
            </div>

            {/* Column 2: Decision & Reasoning */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#15803D] font-bold block">
                OTOMATIZON DECISION
              </span>
              <p className="text-[#121316] font-bold leading-relaxed">
                {activeTrace.trace.decision}
              </p>
            </div>

            {/* Column 3: Outcome & Next Action */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold block">
                BUSINESS OUTCOME &amp; NEXT STAGE
              </span>
              <p className="text-[#065F46] font-medium leading-relaxed">
                {activeTrace.trace.verification.businessOutcome}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
