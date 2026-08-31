"use client";

import React, { useState } from "react";
import { 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  Clock, 
  ArrowRight, 
  Check, 
  X,
  Sparkles,
  Info
} from "lucide-react";
import { AttentionItem, sampleAttentionItems } from "@/lib/decision-trace";
import { useOtomatizonStore } from "@/lib/store";

export const AttentionRequiredSection: React.FC = () => {
  const { dispatchOperationalEvent } = useOtomatizonStore();
  const [items, setItems] = useState<AttentionItem[]>(sampleAttentionItems);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleResolveAction = (itemId: string, actionId: string, actionLabel: string) => {
    const item = items.find((i) => i.id === itemId);
    
    // Dispatch real human intervention event to system ledger
    dispatchOperationalEvent({
      sourceAppId: item?.appIconKey === "calendar" ? "app_cal_01" : "app_mpesa_01",
      dataSourceId: "ds_human_arbitration",
      eventType: "status_changed",
      entityName: item ? item.title : "Exception Resolved",
      title: `Human Action: ${actionLabel}`,
      description: `Administrator resolved exception on ${item?.application || "system"}: "${actionLabel}".`,
      payload: { itemId, actionId, actionLabel, resolvedBy: "James Kamau" },
      provenance: "OBSERVED"
    });

    setResolvedIds((prev) => [...prev, itemId]);
    setFeedbackMessage(`Action confirmed: "${actionLabel}" recorded. Otomatizon continues orchestration.`);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      setFeedbackMessage(null);
    }, 2500);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#A7F3D0] shadow-sm p-6 flex items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#15803D]">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#121316]">
              No Action Required
            </h3>
            <p className="text-xs text-[#75777E]">
              All automations are running autonomously without exceptions or blockers.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono text-[#15803D] font-bold px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
          100% Autonomous
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-amber-200/80 shadow-sm p-6 sm:p-8 space-y-5 animate-fadeIn">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7DF] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#121316] flex items-center gap-2">
              Needs Your Attention
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                {items.length} pending
              </span>
            </h3>
            <p className="text-xs text-[#75777E]">
              Otomatizon handles operational exceptions and requests your arbitration only when human decision is required.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback Alert if action taken */}
      {feedbackMessage && (
        <div className="p-3.5 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl text-xs text-[#065F46] font-medium flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4 text-[#15803D]" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* List of Active Exception Cards */}
      <div className="space-y-4">
        {items.map((item) => {
          const isResolved = resolvedIds.includes(item.id);

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 ${
                isResolved
                  ? "bg-[#ECFDF5]/40 border-[#A7F3D0] opacity-50"
                  : "bg-[#FAF9F5] border-amber-200/80 shadow-2xs hover:border-amber-400"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-[#121316]">{item.title}</span>
                  <span className="text-[#75777E]">&bull; {item.application}</span>
                </div>
                <span className="text-[11px] font-mono text-[#75777E]">{item.timestamp}</span>
              </div>

              {/* 4-Part Explanation Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                
                {/* 1. What Happened */}
                <div className="p-3 rounded-xl bg-white border border-[#EAE7DF] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold block">
                    WHAT HAPPENED
                  </span>
                  <p className="text-[#121316] text-[11px] leading-relaxed">
                    {item.whatHappened}
                  </p>
                </div>

                {/* 2. Why */}
                <div className="p-3 rounded-xl bg-white border border-[#EAE7DF] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold block">
                    WHY (REASON)
                  </span>
                  <p className="text-[#4A4B50] text-[11px] leading-relaxed">
                    {item.why}
                  </p>
                </div>

                {/* 3. What Otomatizon Tried */}
                <div className="p-3 rounded-xl bg-white border border-[#EAE7DF] space-y-1">
                  <span className="text-[10px] font-mono uppercase text-[#15803D] font-bold block">
                    WHAT OTOMATIZON TRIED
                  </span>
                  <p className="text-[#065F46] text-[11px] leading-relaxed">
                    {item.whatOtomatizonTried}
                  </p>
                </div>

                {/* 4. What It Needs From User */}
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-amber-900 font-bold block">
                    ARBITRATION NEEDED
                  </span>
                  <p className="text-amber-950 font-bold text-[11px] leading-relaxed">
                    {item.whatItNeedsFromUser}
                  </p>
                </div>

              </div>

              {/* Action Buttons Tier */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                {item.suggestedActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleResolveAction(item.id, action.id, action.label)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      action.isPrimary
                        ? "bg-[#15803D] hover:bg-[#166534] text-white shadow-xs"
                        : "bg-white hover:bg-[#FAF9F5] text-[#121316] border border-[#EAE7DF]"
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
