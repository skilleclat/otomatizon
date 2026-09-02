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
  FileSpreadsheet, 
  Zap, 
  Activity, 
  Mail, 
  MapPin, 
  ChevronRight,
  Plus
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { NavTab } from "./Navbar";
import { MetricExplanationModal, MetricDetail } from "./MetricExplanationModal";
import { EventDetailModal } from "./EventDetailModal";
import { IntelligenceInspectorModal } from "./IntelligenceInspectorModal";
import { ActivityLog } from "@/types";

interface HomeCommandCenterProps {
  onNavigate: (tab: NavTab) => void;
  onOpenOnboarding: () => void;
}

export const HomeCommandCenter: React.FC<HomeCommandCenterProps> = ({
  onNavigate,
  onOpenOnboarding
}) => {
  const { state } = useOtomatizonStore();
  const [selectedMetric, setSelectedMetric] = useState<MetricDetail | null>(null);
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isIntelligenceLabOpen, setIsIntelligenceLabOpen] = useState(false);

  const userFirstName = state.session?.user?.fullName?.split(" ")[0] || "";
  const orgName = state.organization?.name || state.businessProfile?.name || "Your Workspace";
  const currentHours = state.metrics?.hoursSaved || state.stats?.hoursSaved || 0;
  const currentRevenue = state.metrics?.revenueRecoveredKes || state.stats?.revenueKes || 0;
  const currentInquiries = state.metrics?.inquiriesProcessed || (state.leads?.length || 0);
  const currentFollowups = state.metrics?.followUpsSent || 0;

  const connectedAppsList = state.integrations.filter(i => i.connected);
  const activeWorkflowsList = state.workflows.filter(w => w.active);
  const recentLogs = state.activityLogs || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* 1. Executive Status & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-7 rounded-3xl border border-[#EAE7DF] shadow-sm">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
              LIVE AUTOMATION OS &middot; {activeWorkflowsList.length > 0 ? "RUNNING" : "STANDBY"}
            </span>
            <span className="text-xs font-mono text-[#75777E] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#15803D]" />
              Nairobi, Kenya
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#121316] tracking-tight">
            Welcome{userFirstName ? `, ${userFirstName}` : ""}. {orgName} Command Center.
          </h1>
          <p className="text-xs text-[#4A4B50]">
            {activeWorkflowsList.length > 0 
              ? `Currently orchestrating ${activeWorkflowsList.length} active automation across your connected systems.`
              : "Connect your everyday tools or describe how you work to activate your first automation."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="px-4 py-2.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-mono shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Describe How You Work</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate("report")}
            className="px-4 py-2.5 rounded-full bg-white hover:bg-[#FAF9F5] text-[#121316] border border-[#EAE7DF] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer font-mono shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Business Report</span>
          </button>
        </div>
      </div>

      {/* 2. Zero State Setup Banner if no workflows */}
      {activeWorkflowsList.length === 0 && (
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm space-y-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base sm:text-lg font-extrabold text-[#121316]">
                Ready to automate your repetitive business workflows?
              </h2>
              <p className="text-xs sm:text-sm text-[#4A4B50] leading-relaxed max-w-2xl">
                Tell Otomatizon how you interact with customers on WhatsApp, schedule sessions, and collect payments. Otomatizon will identify bottlenecks and configure your system.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenOnboarding}
              className="px-5 py-2.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Start Discovery &rarr;</span>
            </button>
            <button
              onClick={() => onNavigate("apps")}
              className="px-5 py-2.5 rounded-full bg-[#FAF9F5] hover:bg-[#F4F2EB] text-[#121316] border border-[#EAE7DF] text-xs font-bold font-mono transition-all cursor-pointer"
            >
              <span>Connect Your Apps (0 connected)</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Four Real Measured Impact Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Hours Saved */}
        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold">HOURS SAVED</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF9F5] text-[#75777E] border border-[#EAE7DF] font-bold">
              OBSERVED
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-mono">
            {currentHours.toFixed(1)} h <span className="text-xs text-[#75777E] font-normal">/ wk</span>
          </div>
          <div className="text-[11px] text-[#75777E] pt-1 border-t border-[#EAE7DF]">
            <span>{currentInquiries} automated tasks executed</span>
          </div>
        </div>

        {/* Revenue Protected */}
        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold">REVENUE RECOVERED</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF9F5] text-[#75777E] border border-[#EAE7DF] font-bold">
              OBSERVED
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-mono">
            {currentRevenue.toLocaleString()} <span className="text-xs text-[#75777E] font-normal">KES</span>
          </div>
          <div className="text-[11px] text-[#75777E] pt-1 border-t border-[#EAE7DF]">
            <span>Verified recovered payments</span>
          </div>
        </div>

        {/* Inquiries Handled */}
        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold">INQUIRIES HANDLED</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF9F5] text-[#75777E] border border-[#EAE7DF] font-bold">
              OBSERVED
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-mono">
            {currentInquiries} <span className="text-xs text-[#75777E] font-normal">inquiries</span>
          </div>
          <div className="text-[11px] text-[#75777E] pt-1 border-t border-[#EAE7DF]">
            <span>Across WhatsApp &amp; Gmail</span>
          </div>
        </div>

        {/* Follow-ups Sent */}
        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#75777E] font-bold">FOLLOW-UPS SENT</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF9F5] text-[#75777E] border border-[#EAE7DF] font-bold">
              OBSERVED
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#121316] font-mono">
            {currentFollowups} <span className="text-xs text-[#75777E] font-normal">delivered</span>
          </div>
          <div className="text-[11px] text-[#75777E] pt-1 border-t border-[#EAE7DF]">
            <span>Scheduled follow-ups</span>
          </div>
        </div>

      </div>

      {/* 4. Connected Systems & Direct Integration Access */}
      <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7DF] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#121316] flex items-center gap-2">
              Connected Everyday Tools
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FAF9F5] text-[#75777E] border border-[#EAE7DF] font-bold">
                {connectedAppsList.length} Connected
              </span>
            </h3>
            <p className="text-xs text-[#75777E] mt-0.5">
              Secure links connecting your messaging, calendar, sheets, and payment channels.
            </p>
          </div>

          <button
            onClick={() => onNavigate("apps")}
            className="text-xs font-mono font-bold text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Manage Integrations &rarr;</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {state.integrations.map((app) => (
            <div 
              key={app.id}
              onClick={() => onNavigate("apps")}
              className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] hover:border-[#15803D] transition-all cursor-pointer space-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#121316] truncate">{app.name}</span>
                <span className={`w-2 h-2 rounded-full ${app.connected ? "bg-[#15803D]" : "bg-zinc-300"}`} />
              </div>
              <div className="text-[10px] text-[#75777E] font-mono truncate">
                {app.connected ? "Connected" : "Disconnected"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Real-Time Operational Audit Feed */}
      <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE7DF] pb-4">
          <div>
            <h3 className="text-base font-bold text-[#121316] flex items-center gap-2">
              Operational Audit Stream
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#FAF9F5] text-[#75777E] border border-[#EAE7DF] font-bold">
                {recentLogs.length} Events
              </span>
            </h3>
            <p className="text-xs text-[#75777E]">
              Chronological log of verified actions executed across your connected apps.
            </p>
          </div>

          {recentLogs.length > 0 && (
            <button
              onClick={() => onNavigate("activity")}
              className="text-xs font-mono font-bold text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View all audit logs ({recentLogs.length}) &rarr;</span>
            </button>
          )}
        </div>

        {recentLogs.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Activity className="w-8 h-8 text-[#75777E] mx-auto opacity-40" />
            <p className="text-xs text-[#75777E]">
              No events recorded yet. Once you connect your tools and activate automations, every verified action will be logged here.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentLogs.slice(0, 4).map((log: any) => (
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
                        {log.application || log.app || "System"}
                      </span>
                    </div>
                    <p className="text-xs text-[#4A4B50] truncate">
                      {log.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                  <span className="text-[#75777E]">{log.timestamp || "Just now"}</span>
                  <span className="text-[#15803D] font-bold group-hover:underline text-[11px]">
                    Details &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DRAWERS & MODALS */}
      
      {/* Metric Explanation Modal */}
      <MetricExplanationModal
        metric={selectedMetric}
        isOpen={!!selectedMetric}
        onClose={() => setSelectedMetric(null)}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />

      {/* Semantic Intelligence Lab Modal */}
      <IntelligenceInspectorModal
        isOpen={isIntelligenceLabOpen}
        onClose={() => setIsIntelligenceLabOpen(false)}
      />

    </div>
  );
};
