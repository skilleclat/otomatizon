"use client";

import React, { useState } from "react";
import { 
  Play, 
  Pause, 
  Check, 
  RefreshCw, 
  Sparkles, 
  Clock, 
  ArrowRight, 
  ArrowDown,
  History, 
  X, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Settings,
  MessageSquare,
  FileSpreadsheet,
  Calendar
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { Workflow } from "@/types";
import { DS } from "@/lib/design-system";
import { AutomationDetailView } from "./AutomationDetailView";

interface AutomationsViewProps {
  onNavigateToActivity: () => void;
}

export const AutomationsView: React.FC<AutomationsViewProps> = ({
  onNavigateToActivity
}) => {
  const { 
    state, 
    toggleWorkflow, 
    pauseWorkflow, 
    resumeWorkflow, 
    runWorkflowSimulation, 
    compileAndCreateWorkflow,
    upgradePlan
  } = useOtomatizonStore();

  const [selectedWorkflowDetail, setSelectedWorkflowDetail] = useState<Workflow | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);

  // Natural Language Routine Builder
  const [taskPrompt, setTaskPrompt] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const activeCount = state.workflows.filter((w) => w.active).length;
  const limit = state.stats.automationsLimit;

  // If a workflow is selected for detail view, render AutomationDetailView
  if (selectedWorkflowDetail) {
    // Find latest state of selected workflow from store
    const latestWf = state.workflows.find(w => w.id === selectedWorkflowDetail.id) || selectedWorkflowDetail;
    return (
      <AutomationDetailView
        workflow={latestWf}
        onBack={() => setSelectedWorkflowDetail(null)}
        onNavigateToActivity={onNavigateToActivity}
      />
    );
  }

  const handleRunTest = (wf: Workflow) => {
    setIsRunningTest(true);
    setTestResult(null);

    setTimeout(() => {
      runWorkflowSimulation(wf.id);
      setIsRunningTest(false);
      setTestResult("Workflow executed successfully: Lead recorded in Sheets, brochure sent on WhatsApp, and follow-up scheduled.");
      setTimeout(() => setTestResult(null), 8000);
    }, 850);
  };

  const handleToggle = (wf: Workflow) => {
    if (!wf.active) {
      const res = resumeWorkflow(wf.id);
      if (!res.success && res.reason === "limit_reached") {
        setLimitNotice(`Plan limit reached: The ${state.stats.currentPlanId.toUpperCase()} plan includes ${limit} active automation. Pause an active automation or upgrade to run up to 5.`);
      }
    } else {
      pauseWorkflow(wf.id);
      setLimitNotice(null);
    }
  };

  const handleCreateNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskPrompt.trim()) return;
    if (activeCount >= limit) {
      setLimitNotice(`Plan limit reached: You have ${activeCount}/${limit} active automations on the ${state.stats.currentPlanId.toUpperCase()} plan. Upgrade to Growth to activate more.`);
      return;
    }
    setIsTranslating(true);
    setTimeout(() => {
      compileAndCreateWorkflow(taskPrompt);
      setTaskPrompt("");
      setIsTranslating(false);
      setTestResult("New operational system configured and running in background!");
      setTimeout(() => setTestResult(null), 5000);
    }, 450);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Header with Plan Usage Tracker */}
      <div className="border-b border-[#EAE7DF] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className={DS.monoEyebrow}>
            OPERATIONAL SYSTEMS
          </span>
          <h1 className={DS.h1}>
            Automations
          </h1>
          <p className="text-[#4A4B50] text-sm mt-1.5">
            Active business processes connecting your tools into unified systems.
          </p>
        </div>

        {/* Plan Usage Pill */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-white border border-[#EAE7DF] text-xs font-mono shadow-sm">
            <span className="text-[#75777E]">Capacity: </span>
            <strong className="text-[#121316]">{activeCount} of {limit} active</strong>
          </div>

          {activeCount >= limit && state.stats.currentPlanId === "starter" && (
            <button
              onClick={() => upgradePlan("growth")}
              className={DS.btnPrimary}
            >
              <span>Upgrade</span>
            </button>
          )}
        </div>
      </div>

      {/* Plan Limit Warning */}
      {limitNotice && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between animate-fadeIn font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>{limitNotice}</span>
          </div>
          <button
            onClick={() => upgradePlan("growth")}
            className="px-3 py-1 rounded-full bg-amber-200 hover:bg-amber-300 text-black font-bold text-[11px] shrink-0"
          >
            Upgrade to Growth
          </button>
        </div>
      )}

      {/* Test Execution Notice */}
      {testResult && (
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] text-xs flex items-center justify-between animate-fadeIn font-medium">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>{testResult}</span>
          </div>
          <button
            onClick={onNavigateToActivity}
            className="underline font-mono text-[#15803D] hover:text-[#166534]"
          >
            Activity stream &rarr;
          </button>
        </div>
      )}

      {/* NATURAL LANGUAGE OPERATIONAL INPUT */}
      <div className="p-6 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
          TELL OTOMATIZON HOW YOU WORK
        </span>
        <h3 className="text-base font-bold text-[#121316]">
          Add a new routine to automate
        </h3>
        <p className="text-xs text-[#75777E]">
          Describe what happens in your day-to-day business. Otomatizon connects the tools and orchestrates the logic automatically.
        </p>

        <form onSubmit={handleCreateNewTask} className="space-y-3 pt-1">
          <textarea
            id="task-input"
            rows={2}
            value={taskPrompt}
            onChange={(e) => setTaskPrompt(e.target.value)}
            placeholder="e.g. When someone asks about French lessons on WhatsApp, send them my syllabus and follow up 24 hours later if they don't book."
            className="w-full bg-[#FAF9F5] border border-[#EAE7DF] rounded-2xl p-3.5 text-xs text-[#121316] placeholder-stone-400 focus:outline-none focus:border-[#15803D] resize-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#75777E]">
              Plain English &middot; No Zapier-style nodes required
            </span>

            <button
              type="submit"
              disabled={isTranslating || !taskPrompt.trim()}
              className="px-5 py-2 rounded-full bg-[#121316] hover:bg-black text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              <span>{isTranslating ? "Orchestrating..." : "Create automation →"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* LIST OF AUTOMATIONS */}
      {state.workflows.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-center mx-auto text-[#75777E]">
            <Sparkles className="w-5 h-5 text-[#15803D]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#121316]">
              No automations yet.
            </h3>
            <p className="text-xs text-[#4A4B50] max-w-sm mx-auto">
              Tell Otomatizon what you do manually. We&apos;ll help you find your first automation.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {state.workflows.map((wf) => {
            const connectedApps = wf.connectedApps || ["WhatsApp", "Google Sheets", "Google Calendar"];
            const runsCount = wf.metrics?.runsCount || 24;
            const leadsHelped = wf.metrics?.leadsHelped || 21;
            const hoursSaved = wf.metrics?.hoursSaved || 6.7;

            return (
              <div
                key={wf.id}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE7DF] space-y-6 shadow-sm hover:border-[#D5D1C6] transition-all group"
              >
                {/* Card Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className={wf.active ? DS.badgeSuccess : DS.badgeNeutral}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
                        {wf.active ? "Active" : "Paused"}
                      </span>
                      <span className="text-xs text-[#75777E] font-mono">
                        Last executed: {wf.lastRunAt || "Recently"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#121316] tracking-tight">
                      {wf.title}
                    </h3>

                    <p className="text-xs text-[#4A4B50] leading-relaxed max-w-2xl">
                      {wf.summary}
                    </p>
                  </div>

                  {/* Top Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <button
                      onClick={() => handleToggle(wf)}
                      className={`p-2 rounded-full border transition-colors ${
                        wf.active 
                          ? "text-[#75777E] hover:text-[#121316] bg-[#FAF9F5] border-[#EAE7DF]" 
                          : "text-[#15803D] bg-[#ECFDF5] border-[#A7F3D0]"
                      }`}
                      title={wf.active ? "Pause automation" : "Resume automation"}
                    >
                      {wf.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleRunTest(wf)}
                      disabled={isRunningTest}
                      className="px-3 py-1.5 rounded-full bg-[#FAF9F5] hover:bg-[#F4F2EB] border border-[#EAE7DF] text-xs font-mono text-[#121316] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      title="Simulate a real execution"
                    >
                      <RefreshCw className={`w-3 h-3 text-[#15803D] ${isRunningTest ? "animate-spin" : ""}`} />
                      <span>Test run</span>
                    </button>
                  </div>
                </div>

                {/* Connected Applications & Process Routing */}
                <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-[#75777E] font-bold">
                        CONNECTED APPS:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {connectedApps.map((app, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-[#EAE7DF] text-[#121316]">
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>

                    <span className="text-[#15803D] font-bold">
                      {runsCount} inquiries processed &middot; {leadsHelped} follow-ups sent &middot; ~{hoursSaved}h saved
                    </span>
                  </div>

                  {/* Flow Pill Preview */}
                  <div className="text-[11px] font-mono text-[#4A4B50] flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#EAE7DF]">
                    <span>WhatsApp</span>
                    <span className="text-[#75777E]">&rarr;</span>
                    <span className="text-[#15803D] font-bold">OTOMATIZON</span>
                    <span className="text-[#75777E]">&rarr;</span>
                    <span>Google Sheets</span>
                    <span className="text-[#75777E]">&rarr;</span>
                    <span>Google Calendar</span>
                    <span className="text-[#75777E]">&rarr;</span>
                    <span>WhatsApp</span>
                  </div>
                </div>

                {/* Primary Button to open Automation Detail */}
                <div className="pt-1 flex items-center justify-between border-t border-[#EAE7DF]">
                  <span className="text-xs font-mono text-[#75777E]">
                    Reliability rate: {wf.successRate || 98.6}%
                  </span>

                  <button
                    onClick={() => setSelectedWorkflowDetail(wf)}
                    className="px-5 py-2.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
                  >
                    <span>View automation flow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
