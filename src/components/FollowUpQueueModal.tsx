"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Clock, 
  FastForward, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  RefreshCw, 
  MessageSquare, 
  Sparkles, 
  Calendar, 
  Lock,
  ArrowRight,
  Zap,
  Check
} from "lucide-react";

interface FollowUpQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FollowUpQueueModal: React.FC<FollowUpQueueModalProps> = ({
  isOpen,
  onClose
}) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<any>(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/worker/jobs");
      const data = await res.json();
      if (data.success) {
        setJobs(data.jobs || []);
        setSummary(data.summary || {});
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchJobs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTriggerNow = async (jobId: string) => {
    setActionInProgress(jobId);
    try {
      const res = await fetch(`/api/worker/jobs/${jobId}/trigger-now`, {
        method: "POST"
      });
      const data = await res.json();
      setLastActionResult(data);
      await fetchJobs();
      setActionInProgress(null);
    } catch (err) {
      setActionInProgress(null);
    }
  };

  const handleCancelJob = async (jobId: string) => {
    setActionInProgress(jobId);
    try {
      await fetch(`/api/worker/jobs/${jobId}/cancel`, {
        method: "POST"
      });
      await fetchJobs();
      setActionInProgress(null);
    } catch (err) {
      setActionInProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121316]/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#FAF9F5] border border-[#EAE7DF] w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EAE7DF] bg-[#FFFFFF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#15803D]/10 border border-[#15803D]/20 flex items-center justify-center text-[#15803D]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#121316] flex items-center gap-2">
                24h Follow-up Queue &amp; Scheduler Worker
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]">
                  Scheduler Running
                </span>
              </h2>
              <p className="text-xs text-[#75777E]">
                Resilient task scheduler with anti-spam circuit breaker &amp; disk persistence
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FAF9F5] text-[#75777E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Metric Summary Bar */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#EAE7DF] shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-[#75777E] block">Pending Follow-ups</span>
                <span className="text-lg font-bold text-[#121316] font-mono">{summary.scheduledCount} active</span>
              </div>
              <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#EAE7DF] shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-[#75777E] block">Delivered Follow-ups</span>
                <span className="text-lg font-bold text-[#15803D] font-mono">{summary.dispatchedCount} sent</span>
              </div>
              <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#EAE7DF] shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-[#75777E] block">Spam Messages Prevented</span>
                <span className="text-lg font-bold text-[#121316] font-mono">{summary.cancelledConvertedCount} prevented</span>
              </div>
              <div className="p-3.5 bg-[#FFFFFF] rounded-2xl border border-[#EAE7DF] shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-[#75777E] block">Protected Revenue</span>
                <span className="text-lg font-bold text-[#15803D] font-mono">KES {summary.revenueSavedKes?.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Last Action Feedback */}
          {lastActionResult && (
            <div className="p-4 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl space-y-1.5 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-[#15803D]">
                <CheckCircle2 className="w-4 h-4" />
                Fast-Forward Trigger Successful
              </div>
              <p className="text-xs text-[#065F46]">
                {lastActionResult.evaluation?.reason || lastActionResult.executionResult?.reason || "Job executed successfully."}
              </p>
            </div>
          )}

          {/* Job List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold">
                SCHEDULED TASKS IN QUEUE
              </span>
              <button 
                onClick={fetchJobs}
                disabled={loading}
                className="text-xs text-[#15803D] hover:underline flex items-center gap-1 font-mono font-medium cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh Queue
              </button>
            </div>

            <div className="space-y-3">
              {jobs.map((job) => {
                const isScheduled = job.status === "scheduled";
                const isDispatched = job.status === "dispatched";
                const isCancelled = job.status.startsWith("cancelled");

                return (
                  <div 
                    key={job.id}
                    className="p-5 bg-[#FFFFFF] rounded-2xl border border-[#EAE7DF] shadow-2xs space-y-4 transition-all hover:border-[#15803D]/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7DF] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-[#121316]">{job.targetEntityName}</strong>
                          <span className="text-xs font-mono text-[#75777E]">{job.targetPhone}</span>
                        </div>
                        <div className="text-xs text-[#4A4B50] mt-0.5">
                          {job.payload?.subject || "Private Lesson"} &middot; Estimated value: KES {job.payload?.estimatedValueKes?.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isScheduled && (
                          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#FAF9F5] text-[#121316] border border-[#EAE7DF] font-bold flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#15803D]" />
                            {job.remainingHuman}
                          </span>
                        )}
                        {isDispatched && (
                          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] font-bold flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5" />
                            Delivered
                          </span>
                        )}
                        {isCancelled && (
                          <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-stone-100 text-[#75777E] border border-stone-200 font-bold">
                            Converted / Cancelled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Circuit breaker condition */}
                    <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EAE7DF] text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#121316]">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                        Anti-Spam Circuit Breaker Condition
                      </div>
                      <p className="text-[#4A4B50]">{job.conditionDescription}</p>
                    </div>

                    {/* Follow-up Message text */}
                    {job.payload?.followUpMessageText && (
                      <div className="text-xs space-y-1">
                        <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold">
                          PREPARED AUTOMATED FOLLOW-UP MESSAGE
                        </span>
                        <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200/60 text-[#065F46] font-sans">
                          {job.payload.followUpMessageText}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {isScheduled && (
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2">
                        <button
                          onClick={() => handleCancelJob(job.id)}
                          disabled={actionInProgress === job.id}
                          className="w-full sm:w-auto px-4 py-2 rounded-full border border-[#EAE7DF] hover:bg-[#FAF9F5] text-xs font-medium text-[#75777E] transition-colors cursor-pointer"
                        >
                          Cancel Task
                        </button>
                        <button
                          onClick={() => handleTriggerNow(job.id)}
                          disabled={actionInProgress === job.id}
                          className="w-full sm:w-auto px-5 py-2 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                        >
                          {actionInProgress === job.id ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FastForward className="w-3.5 h-3.5" />
                          )}
                          <span>Trigger Now (Fast-Forward)</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FFFFFF] border-t border-[#EAE7DF] flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-[#75777E]">
            <Lock className="w-3.5 h-3.5 text-[#15803D]" />
            Active disk persistence &middot; Zero dropped leads
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-[#EAE7DF] text-xs font-medium text-[#121316] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
