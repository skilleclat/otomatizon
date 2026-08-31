"use client";

import React from "react";
import { X, Calculator, ShieldCheck, CheckCircle2, ArrowUpRight, Clock, DollarSign, Activity } from "lucide-react";
import { DataProvenance } from "@/types";

export interface MetricDetail {
  id: string;
  title: string;
  value: string;
  sublabel: string;
  formula: string;
  formulaDescription: string;
  provenance: DataProvenance;
  confidenceScore: number;
  timeframe: string;
  contributingFactors: string[];
}

interface MetricExplanationModalProps {
  isOpen: boolean;
  metric: MetricDetail | null;
  onClose: () => void;
}

export const MetricExplanationModal: React.FC<MetricExplanationModalProps> = ({
  isOpen,
  metric,
  onClose
}) => {
  if (!isOpen || !metric) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-6 animate-scaleIn">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#EAE7DF] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                CALCULATION &amp; AUDIT TRAIL
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAE7DF] text-[#75777E] font-bold">
                {metric.provenance}
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#121316] tracking-tight">
              {metric.title}
            </h3>
            <p className="text-xs text-[#75777E]">
              {metric.sublabel} &middot; {metric.timeframe}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-center text-[#75777E] hover:text-[#121316] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Number Callout */}
        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#75777E] uppercase tracking-wider">
              Verified Value
            </div>
            <div className="text-3xl font-extrabold text-[#121316] font-mono tracking-tight mt-0.5">
              {metric.value}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs text-[#15803D] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>{metric.confidenceScore}% Confidence</span>
            </div>
            <span className="text-[10px] font-mono text-[#75777E]">
              Zero simulated assumptions
            </span>
          </div>
        </div>

        {/* Formula Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-[#121316] font-bold uppercase tracking-wider">
            <Calculator className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Mathematical Calculation</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-[#121316] select-all">
            {metric.formula}
          </div>
          <p className="text-xs text-[#4A4B50] leading-relaxed">
            {metric.formulaDescription}
          </p>
        </div>

        {/* Contributing Factors */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-[#75777E] uppercase tracking-wider">
            Contributing Verified Events
          </div>
          <div className="space-y-1.5">
            {metric.contributingFactors.map((factor, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-[#4A4B50]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 5-Stage Causal Provenance Chain */}
        <div className="space-y-2">
          <div className="text-[10px] font-mono text-[#75777E] uppercase tracking-wider font-bold">
            CAUSAL PROVENANCE CHAIN (METRIC &rarr; OUTCOME)
          </div>
          <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#121316]">
              <span className="w-5 h-5 rounded-full bg-white border border-[#EAE7DF] flex items-center justify-center text-[10px] font-bold">1</span>
              <span><strong>Metric:</strong> {metric.title} ({metric.value})</span>
            </div>
            <div className="flex items-center gap-2 text-[#121316]">
              <span className="w-5 h-5 rounded-full bg-white border border-[#EAE7DF] flex items-center justify-center text-[10px] font-bold">2</span>
              <span><strong>Source Events:</strong> Verified WhatsApp Webhooks (HMAC-SHA256)</span>
            </div>
            <div className="flex items-center gap-2 text-[#121316]">
              <span className="w-5 h-5 rounded-full bg-white border border-[#EAE7DF] flex items-center justify-center text-[10px] font-bold">3</span>
              <span><strong>Automation:</strong> Lead Follow-Up Autopilot</span>
            </div>
            <div className="flex items-center gap-2 text-[#121316]">
              <span className="w-5 h-5 rounded-full bg-white border border-[#EAE7DF] flex items-center justify-center text-[10px] font-bold">4</span>
              <span><strong>Executed Actions:</strong> Sheets Logging + 24h Follow-up + Calendar Check</span>
            </div>
            <div className="flex items-center gap-2 text-[#15803D] font-bold">
              <span className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[10px]">5</span>
              <span><strong>Business Outcome:</strong> Bookings Secured &amp; Verified Time Saved</span>
            </div>
          </div>
        </div>

        {/* Close CTA */}
        <div className="pt-3 border-t border-[#EAE7DF]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#121316] hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
          >
            Close explanation
          </button>
        </div>

      </div>
    </div>
  );
};
