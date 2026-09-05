"use client";

import React, { useState } from "react";
import { 
  Download, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  MessageSquare, 
  Calendar, 
  FileSpreadsheet, 
  Mail, 
  CreditCard, 
  HardDrive,
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Cpu, 
  Sparkles,
  Zap,
  Lock,
  FileText
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { BrandLogo } from "@/components/BrandLogo";
import { triggerBrowserPdfDownload } from "@/lib/pdf/generate-report-pdf";

interface BusinessReportViewProps {
  onNavigateToAutomations?: () => void;
  onNavigateToApps?: () => void;
}

export const BusinessReportView: React.FC<BusinessReportViewProps> = ({
  onNavigateToAutomations,
  onNavigateToApps
}) => {
  const { state, generateBusinessReport } = useOtomatizonStore();
  const report = generateBusinessReport();
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("01");

  const connectedApps = state.integrations.filter((i) => i.connected);
  const activeHoursSaved = state.metrics?.hoursSaved || state.stats?.hoursSaved || 0;
  const activeRevenueProtected = state.metrics?.revenueRecoveredKes || state.stats?.revenueKes || 0;

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      triggerBrowserPdfDownload(report, `Otomatizon_Business_Report_${(report.businessName || "Workspace").replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      if (typeof window !== "undefined") {
        window.open("/api/report/pdf", "_blank");
      }
    } finally {
      setTimeout(() => setIsDownloading(false), 1200);
    }
  };

  const reportSections = [
    { id: "01", label: "Executive Summary" },
    { id: "02", label: "What We Understood" },
    { id: "03", label: "Connected Systems" },
    { id: "04", label: "Discovered Opportunities" },
    { id: "05", label: "Recommended Automations" },
    { id: "06", label: "Impact & Security Guarantee" }
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn print:px-0 print:py-0">
      
      {/* 1. TOP BANNER & PDF ACTION */}
      <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <BrandLogo variant="full" size="md" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              BUSINESS REPORT
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#121316] tracking-tight">
            Business Process Automation &amp; Intelligence Report
          </h1>

          <p className="text-xs text-[#75777E] font-mono">
            Prepared for {report.businessName || state.organization.name || "Your Workspace"} &middot; {report.city || "Nairobi"}, {report.country || "Kenya"}
          </p>
        </div>

        {/* Primary PDF Action */}
        <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-6 py-3 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold transition-all shadow-md flex items-center gap-2 font-mono disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Download className={`w-4 h-4 text-emerald-300 ${isDownloading ? "animate-bounce" : ""}`} />
            <span>{isDownloading ? "Generating PDF..." : "Download Official PDF"}</span>
          </button>
          <span className="text-[11px] font-mono text-[#75777E]">
            Standard PDF-1.4 &middot; Verified Audit
          </span>
        </div>
      </div>

      {/* Top Verified Metrics (Live State) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#75777E] block">Hours Saved</span>
          <div className="text-2xl font-bold text-[#121316] font-mono">
            {activeHoursSaved.toFixed(1)} h <span className="text-xs text-[#75777E] font-normal">/ wk</span>
          </div>
          <span className="text-[11px] text-[#15803D] font-mono font-medium">&bull; Measured</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#75777E] block">Protected Revenue</span>
          <div className="text-2xl font-bold text-[#15803D] font-mono">
            {activeRevenueProtected.toLocaleString()} <span className="text-xs text-[#75777E] font-normal">KES</span>
          </div>
          <span className="text-[11px] text-[#15803D] font-mono font-medium">&bull; Reconciled</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#75777E] block">Connected Systems</span>
          <div className="text-2xl font-bold text-[#121316] font-mono">
            {connectedApps.length} / {state.integrations.length}
          </div>
          <span className="text-[11px] text-[#75777E] font-mono font-medium">&bull; Active Channels</span>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#EAE7DF] shadow-xs space-y-1">
          <span className="text-[10px] font-mono uppercase text-[#75777E] block">Active Workflows</span>
          <div className="text-2xl font-bold text-[#121316] font-mono">
            {state.workflows.filter(w => w.active).length}
          </div>
          <span className="text-[11px] text-[#15803D] font-mono font-medium">&bull; Operational</span>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (4 cols): Navigation Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-4 sticky top-6 space-y-1 font-mono text-xs">
          <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-[#75777E] font-bold border-b border-[#EAE7DF] mb-1">
            REPORT SECTIONS
          </div>

          {reportSections.map((sec) => {
            const isCurrent = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl flex items-center gap-2.5 transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-[#ECFDF5] text-[#15803D] font-bold border border-[#A7F3D0]"
                    : "text-[#4A4B50] hover:text-[#121316] hover:bg-[#FAF9F5]"
                }`}
              >
                <span className="text-[11px] text-[#75777E]">{sec.id}</span>
                <span className="truncate">{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Column (8 cols): Document Content Canvas */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SECTION 01: Executive Summary */}
          <div id="section-01" className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs text-[#15803D] font-bold">01</span>
                <h3 className="text-sm font-bold uppercase text-[#121316]">Executive Summary</h3>
              </div>
              <span className="text-[10px] font-mono text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                OBSERVED
              </span>
            </div>

            <p className="text-xs text-[#4A4B50] leading-relaxed">
              This executive report establishes the automation roadmap for <strong className="text-[#121316]">{report.businessName}</strong>. It identifies workflow bottlenecks across everyday communication channels, calendars, spreadsheets, and payment systems.
            </p>
          </div>

          {/* SECTION 02: What We Understood */}
          <div id="section-02" className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs text-[#15803D] font-bold">02</span>
                <h3 className="text-sm font-bold uppercase text-[#121316]">What We Understood</h3>
              </div>
              <span className="text-[10px] font-mono text-[#75777E] px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAE7DF]">
                INFERRED
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] text-xs space-y-2">
              <p className="text-[#121316] font-semibold">{report.understood.summary}</p>
              <div className="text-xs font-mono text-[#75777E] pt-1">
                <span>Customer Channels: {report.understood.primaryChannels.join(", ")}</span>
              </div>
            </div>
          </div>

          {/* SECTION 03: Connected Systems */}
          <div id="section-03" className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs text-[#15803D] font-bold">03</span>
                <h3 className="text-sm font-bold uppercase text-[#121316]">Connected Systems &amp; Security</h3>
              </div>
              <span className="text-[10px] font-mono text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                {connectedApps.length} OF {state.integrations.length} CONNECTED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              {state.integrations.map((app) => (
                <div key={app.id} className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#121316]">{app.name}</div>
                    <div className="text-[10px] text-[#75777E]">{app.description}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${app.connected ? "bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]" : "bg-white text-[#75777E] border border-[#EAE7DF]"}`}>
                    {app.connected ? "Active" : "Disconnected"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 04: Discovered Opportunities */}
          <div id="section-04" className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs text-[#15803D] font-bold">04</span>
                <h3 className="text-sm font-bold uppercase text-[#121316]">Discovered Opportunities</h3>
              </div>
              <span className="text-[10px] font-mono text-[#75777E] px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAE7DF]">
                {state.opportunities.length} DISCOVERED
              </span>
            </div>

            {state.opportunities.length === 0 ? (
              <div className="p-6 text-center space-y-2 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF]">
                <p className="text-xs text-[#75777E]">
                  No opportunities generated yet. Complete your business description or connect your tools to uncover repetitive bottlenecks.
                </p>
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {state.opportunities.map((opp) => (
                  <div key={opp.id} className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1">
                    <strong className="text-[#121316] text-xs block">{opp.title}</strong>
                    <p className="text-[#4A4B50] text-[11px]">{opp.problem}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION 05: Recommended Automations */}
          <div id="section-05" className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs text-[#15803D] font-bold">05</span>
                <h3 className="text-sm font-bold uppercase text-[#121316]">Recommended Automations</h3>
              </div>
              <span className="text-[10px] font-mono text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                RECOMMENDED
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
              <div className="space-y-0.5">
                <strong className="text-[#121316] text-xs block">{report.recommendedFirstAutomation.title}</strong>
                <div className="text-[11px] text-[#4A4B50]">{report.recommendedFirstAutomation.reason}</div>
              </div>
              {onNavigateToAutomations && (
                <button
                  onClick={onNavigateToAutomations}
                  className="px-4 py-2 rounded-full bg-[#15803D] text-white font-bold text-xs hover:bg-[#166534] transition-colors cursor-pointer shrink-0"
                >
                  View Automations &rarr;
                </button>
              )}
            </div>
          </div>

          {/* SECTION 06: Security & Privacy Guarantee */}
          <div id="section-06" className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 font-mono border-b border-[#EAE7DF] pb-4">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <h3 className="text-sm font-bold uppercase text-[#121316]">Security &amp; Data Isolation</h3>
            </div>
            <p className="text-xs text-[#4A4B50] leading-relaxed">
              All credentials and access tokens are secured using AES-256-GCM encryption. Otomatizon isolates data per organization workspace and never shares customer communication data with third parties.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
