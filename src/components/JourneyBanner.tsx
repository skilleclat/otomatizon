"use client";

import React from "react";
import { 
  FileText, 
  Sparkles, 
  Search, 
  Link2, 
  Workflow as WorkflowIcon, 
  CheckCircle2, 
  Play, 
  Activity, 
  TrendingUp,
  ArrowRight
} from "lucide-react";

export const JourneyBanner: React.FC = () => {
  const journeyStages = [
    { num: "1", title: "Connect", desc: "your apps" },
    { num: "2", title: "Discover", desc: "opportunities" },
    { num: "3", title: "Create", desc: "automation" },
    { num: "4", title: "Activate", desc: "workflow" },
    { num: "5", title: "Execute", desc: "in real-time" },
    { num: "6", title: "Monitor", desc: "activities" },
    { num: "7", title: "Measure", desc: "business impact" },
    { num: "8", title: "Receive", desc: "executive report" },
  ];

  return (
    <div className="p-6 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE7DF] pb-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
            COMPLETE USER JOURNEY
          </span>
          <h3 className="text-sm font-bold text-[#121316] mt-1">
            End-to-End Business Automation Operating System
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#75777E]">
          Connect &middot; Discover &middot; Create &middot; Activate &middot; Execute &middot; Monitor &middot; Measure &middot; Report
        </span>
      </div>

      {/* 8-Stage Horizontal Process Track matching Reference Image 10 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs font-mono">
        {journeyStages.map((st, i) => (
          <div 
            key={st.num}
            className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1.5 hover:border-[#15803D]/40 transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="w-5 h-5 rounded-full bg-white border border-[#EAE7DF] flex items-center justify-center text-[10px] font-mono font-bold text-[#15803D]">
                {st.num}
              </span>
              {i < journeyStages.length - 1 && (
                <span className="text-[#A4A7AE] hidden lg:inline text-[10px]">&rarr;</span>
              )}
            </div>

            <div>
              <h4 className="font-bold text-[#121316] text-[11px] leading-tight">
                {st.title}
              </h4>
              <p className="text-[10px] text-[#75777E] leading-snug mt-0.5">
                {st.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Outcome Banner */}
      <div className="p-3.5 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#15803D]">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="font-semibold">
            <strong>Outcome:</strong> Your business runs better. Less manual work. More time. More revenue.
          </span>
        </div>
        <span className="text-[11px] font-mono text-[#15803D] uppercase font-bold">
          Autonomous Business Intelligence
        </span>
      </div>
    </div>
  );
};
