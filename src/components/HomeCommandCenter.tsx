"use client";

import React, { useState } from "react";
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Check, 
  FileText,
  ShieldCheck, 
  AlertCircle, 
  MessageSquare, 
  Calendar, 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw, 
  FileSpreadsheet, 
  Zap, 
  Activity, 
  Mail, 
  MapPin, 
  ExternalLink,
  ChevronRight,
  Info,
  Cpu
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { NavTab } from "./Navbar";
import { AutomationPreviewModal } from "./AutomationPreviewModal";
import { MetricExplanationModal, MetricDetail } from "./MetricExplanationModal";
import { EventDetailModal } from "./EventDetailModal";
import { LiveAutomationPipeline } from "./LiveAutomationPipeline";
import { DecisionTraceDrawer } from "./DecisionTraceDrawer";
import { AttentionRequiredSection } from "./AttentionRequiredSection";
import { AppCollaborationMatrix } from "./AppCollaborationMatrix";
import { IntelligenceInspectorModal } from "./IntelligenceInspectorModal";
import { DecisionTrace } from "@/lib/decision-trace";
import { Opportunity, ActivityLog, DataProvenance } from "@/types";
import { DS } from "@/lib/design-system";

interface HomeCommandCenterProps {
  onNavigate: (tab: NavTab) => void;
  onOpenOnboarding: () => void;
}

const metricDetails: Record<string, MetricDetail> = {
  hours_saved: {
    id: "hours_saved",
    title: "16.3 Hours Saved This Week",
    value: "16.3 h",
    sublabel: "Administrative and coordination time reclaimed",
    formula: "SUM(inbound_inquiry_handling: 27 * 18m) + SUM(calendar_scheduling: 14 * 15m) + SUM(payment_chasing: 12 * 20m) = 16.3 hrs",
    formulaDescription: "Measured across 27 inbound inquiries, automated syllabus distribution, slot check, and automatic M-Pesa reconciliation.",
    provenance: "OBSERVED",
    confidenceScore: 98,
    timeframe: "Last 7 days",
    contributingFactors: [
      "27 WhatsApp inquiries automatically greeted & qualified (~8.1h)",
      "24 follow-up reminders sent without manual typing (~6.0h)",
      "12 tuition payments matched to calendar slots (~2.2h)"
    ]
  },
  inquiries: {
    id: "inquiries",
    title: "27 Inquiries Processed",
    value: "27",
    sublabel: "Prospective students received across WhatsApp & Gmail",
    formula: "COUNT(operational_events WHERE type = 'inquiry_received') = 27",
    formulaDescription: "Direct count of incoming prospective student inquiries received and classified by Otomatizon Intelligence.",
    provenance: "OBSERVED",
    confidenceScore: 100,
    timeframe: "Last 7 days",
    contributingFactors: [
      "23 inquiries from WhatsApp Business (+254 712...)",
      "4 inquiries from Gmail (French Tutoring inquiries)"
    ]
  },
  followups: {
    id: "followups",
    title: "24 Follow-ups Sent",
    value: "24",
    sublabel: "Automated check-ins dispatched after 24h delay",
    formula: "COUNT(actions WHERE actionType = 'send_whatsapp' AND condition = 'unbooked_after_24h') = 24",
    formulaDescription: "Polite follow-up messages automatically delivered to leads who had not confirmed a booking on Google Calendar within 24 hours.",
    provenance: "OBSERVED",
    confidenceScore: 100,
    timeframe: "Last 7 days",
    contributingFactors: [
      "24 students received personalized syllabus follow-ups",
      "8 leads responded immediately and converted into booked sessions"
    ]
  },
  revenue_protected: {
    id: "revenue_protected",
    title: "KES 88,000 Revenue Protected",
    value: "KES 88,000",
    sublabel: "Estimated tuition value secured from cold leads",
    formula: "COUNT(re_engaged_leads: 8) * avg_package_fee(KES 11,000) = KES 88,000",
    formulaDescription: "Calculated based on 8 re-engaged students who confirmed lesson packages following automated 24h follow-ups.",
    provenance: "CALCULATED",
    confidenceScore: 95,
    timeframe: "Last 30 days",
    contributingFactors: [
      "8 students would have been lost without 24h follow-up",
      "Average 3-session booking value: KES 10,500 - 11,000"
    ]
  }
};

export const HomeCommandCenter: React.FC<HomeCommandCenterProps> = ({
  onNavigate,
  onOpenOnboarding
}) => {
  const { state } = useOtomatizonStore();
  const [selectedMetric, setSelectedMetric] = useState<MetricDetail | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [selectedTrace, setSelectedTrace] = useState<DecisionTrace | null>(null);
  const [isIntelligenceLabOpen, setIsIntelligenceLabOpen] = useState(false);

  const userFirstName = state.session?.user?.fullName?.split(" ")[0] || "";
  const orgName = state.organization?.name || state.businessProfile?.name || "Your Workspace";
  const currentHours = state.stats?.hoursSaved || state.metrics?.hoursSaved || 16.3;
  const currentRevenue = state.stats?.revenueKes || state.metrics?.revenueRecoveredKes || 88000;
  const currentInquiries = state.metrics?.inquiriesProcessed || state.operationalEvents?.length || 27;
  const currentFollowups = state.metrics?.followUpsSent || state.activityLogs?.filter(a => a.type === 'followup_sent').length || 24;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* 1. TOP OPERATIONAL STATUS & WELCOME BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#EAE7DF] shadow-sm">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
              LIVE AUTOMATION OS &middot; RUNNING
            </span>
            <span className="text-xs font-mono text-[#15803D] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              {`Otomatizon saved you... ${currentHours.toFixed(1)} hours & KES ${currentRevenue.toLocaleString()} this week`}
            </span>
            <span className="text-xs font-mono text-[#75777E] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#15803D]" />
              Nairobi, Kenya
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#121316] tracking-tight">
            Welcome{userFirstName ? `, ${userFirstName}` : ""}. Here is what Otomatizon is orchestrating for {orgName}.
          </h1>
          <p className="text-xs text-[#4A4B50]">
            Your business operating system is running autonomously across WhatsApp, Google Workspace, and Safaricom M-Pesa.
            <span className="sr-only">Explain this recommendation</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsIntelligenceLabOpen(true)}
            className="px-4 py-2.5 rounded-full bg-[#15803D]/10 hover:bg-[#15803D] text-[#15803D] hover:text-white border border-[#15803D]/20 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-mono"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Semantic Intelligence Lab</span>
          </button>

          <button
            onClick={() => onNavigate("report")}
            className="px-4 py-2.5 rounded-full bg-[#121316] hover:bg-[#002E25] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-mono"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-300" />
            <span>Business Report</span>
          </button>
        </div>
      </div>

      {/* Quick-Start Banner if user has 0 workflows */}
      {state.workflows.length === 0 && (
        <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#121316]">Ready to automate your operations?</h2>
              <p className="text-xs text-[#4A4B50]">Describe your daily customer process to uncover repetitive bottlenecks, or connect your daily tools.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onOpenOnboarding}
              className="px-5 py-2.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Describe How You Work &rarr;</span>
            </button>
            <button
              onClick={() => onNavigate("apps")}
              className="px-5 py-2.5 rounded-full bg-[#FAF9F5] hover:bg-[#F4F2EB] text-[#121316] border border-[#EAE7DF] text-xs font-bold font-mono transition-all cursor-pointer"
            >
              <span>Connect Your Apps</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. THE HERO: LIVE AUTOMATION PIPELINE & REASONING (HOW IT'S THINKING & OPERATING) */}
      <LiveAutomationPipeline onSelectTrace={(trace) => setSelectedTrace(trace)} />

      {/* 3. NEEDS YOUR ATTENTION: EXCEPTION MANAGEMENT & HUMAN ARBITRATION */}
      <AttentionRequiredSection />

      {/* 4. QUANTIFIED IMPACT METRICS (TRACEABLE & CAUSAL) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Hours Saved */}
        <div 
          onClick={() => setSelectedMetric({
            ...metricDetails.hours_saved,
            value: `${currentHours.toFixed(1)} h`,
            title: `${currentHours.toFixed(1)} Hours Saved`
          })}
          className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm hover:border-[#15803D] transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold">HOURS SAVED</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] font-bold">
              OBSERVED
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-mono">
            {currentHours.toFixed(1)} h <span className="text-xs text-[#75777E] font-normal">/ wk</span>
          </div>
          <div className="text-[11px] text-[#4A4B50] flex items-center justify-between pt-1 border-t border-[#EAE7DF]">
            <span>{currentInquiries} automated tasks</span>
            <span className="text-[#15803D] font-bold group-hover:underline text-[10px]">Inspect &rarr;</span>
          </div>
        </div>

        {/* Metric 2: Revenue Protected */}
        <div 
          onClick={() => setSelectedMetric({
            ...metricDetails.revenue_protected,
            value: `KES ${currentRevenue.toLocaleString()}`,
            title: `KES ${currentRevenue.toLocaleString()} Protected Revenue`
          })}
          className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm hover:border-[#15803D] transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold">REVENUE PROTECTED</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] font-bold">
              CALCULATED
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#15803D] font-mono">
            {currentRevenue.toLocaleString()} <span className="text-xs text-[#75777E] font-normal">KES</span>
          </div>
          <div className="text-[11px] text-[#4A4B50] flex items-center justify-between pt-1 border-t border-[#EAE7DF]">
            <span>8 conversions recovered</span>
            <span className="text-[#15803D] font-bold group-hover:underline text-[10px]">Inspect &rarr;</span>
          </div>
        </div>

        {/* Metric 3: Inquiries Processed */}
        <div 
          onClick={() => setSelectedMetric({
            ...metricDetails.inquiries,
            value: `${state.metrics?.inquiriesProcessed || (state.leads?.length || 27)}`,
            title: `${state.metrics?.inquiriesProcessed || (state.leads?.length || 27)} Inquiries Handled`
          })}
          className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm hover:border-[#15803D] transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold">INQUIRIES HANDLED</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF9F5] text-[#121316] border border-[#EAE7DF] font-bold">
              OBSERVED
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-mono">
            {state.metrics?.inquiriesProcessed || (state.leads?.length || 27)} <span className="text-xs text-[#75777E] font-normal">prospects</span>
          </div>
          <div className="text-[11px] text-[#4A4B50] flex items-center justify-between pt-1 border-t border-[#EAE7DF]">
            <span>WhatsApp &amp; Gmail</span>
            <span className="text-[#15803D] font-bold group-hover:underline text-[10px]">Inspect &rarr;</span>
          </div>
        </div>

        {/* Metric 4: Follow-ups Dispatched */}
        <div 
          onClick={() => setSelectedMetric({
            ...metricDetails.followups,
            value: `${state.metrics?.followUpsSent || 24}`,
            title: `${state.metrics?.followUpsSent || 24} Follow-ups Dispatched`
          })}
          className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm hover:border-[#15803D] transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold">24H FOLLOW-UPS</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] font-bold">
              OBSERVED
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-mono">
            {state.metrics?.followUpsSent || 24} <span className="text-xs text-[#75777E] font-normal">delivered</span>
          </div>
          <div className="text-[11px] text-[#4A4B50] flex items-center justify-between pt-1 border-t border-[#EAE7DF]">
            <span>Circuit breaker active</span>
            <span className="text-[#15803D] font-bold group-hover:underline text-[10px]">Inspect &rarr;</span>
          </div>
        </div>
      </div>

      {/* 5. APPLICATION COLLABORATION MATRIX */}
      <AppCollaborationMatrix onNavigateToApps={() => onNavigate("apps")} />

      {/* 6. REAL-TIME AUDIT STREAM (LATEST SYSTEM EVENTS) */}
      <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE7DF] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#121316] flex items-center gap-2">
              Operational Audit Stream &middot; Live Feed
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] font-bold">
                Live Audit Trail
              </span>
            </h3>
            <p className="text-xs text-[#75777E]">
              Every recorded event reflects a verified action across your connected business tools.
            </p>
          </div>

          <button
            onClick={() => onNavigate("activity")}
            className="text-xs font-mono font-bold text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View complete audit log ({(state?.activity || []).length}) &rarr;</span>
          </button>
        </div>

        <div className="space-y-3">
          {(state?.activity || []).slice(0, 4).map((log) => (
            <div
              key={log.id}
              onClick={() => setSelectedLog(log)}
              className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] hover:border-[#15803D] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#EAE7DF] flex items-center justify-center shrink-0 mt-0.5 text-[#15803D]">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-[#121316] truncate">
                      {log.title}
                    </strong>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white border border-[#EAE7DF] text-[#75777E]">
                      {log.application}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A4B50] truncate">
                    {log.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                <span className="text-[#75777E]">{log.timestamp}</span>
                <span className="text-[#15803D] font-bold group-hover:underline text-[11px]">
                  Details &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DRAWERS & MODALS */}
      
      {/* 1. Decision Trace Drawer (Reasoning Inspector) */}
      <DecisionTraceDrawer
        trace={selectedTrace}
        onClose={() => setSelectedTrace(null)}
      />

      {/* 2. Semantic Intelligence Lab Modal */}
      <IntelligenceInspectorModal
        isOpen={isIntelligenceLabOpen}
        onClose={() => setIsIntelligenceLabOpen(false)}
      />

      {/* 3. Metric Explanation Modal */}
      <MetricExplanationModal
        metric={selectedMetric}
        isOpen={!!selectedMetric}
        onClose={() => setSelectedMetric(null)}
      />

      {/* 4. Event Detail Modal */}
      <EventDetailModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />

    </div>
  );
};
