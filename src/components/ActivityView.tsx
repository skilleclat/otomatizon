"use client";

import React, { useState } from "react";
import { 
  Check, 
  Search, 
  Filter, 
  CheckCircle2, 
  MessageSquare, 
  Calendar, 
  Mail, 
  CreditCard, 
  Sparkles,
  Info,
  X,
  ShieldCheck,
  ArrowRight,
  FileSpreadsheet,
  Download,
  Terminal,
  Clock,
  Cpu,
  ChevronDown,
  QrCode,
  Smartphone,
  ExternalLink,
  Send,
  RefreshCw,
  Plus,
  Lock,
  Layers,
  ListFilter
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { ActivityLog } from "@/types";
import { DS } from "@/lib/design-system";

export interface LedgerEventItem {
  id: string;
  time: string;
  app: "WhatsApp" | "Otomatizon" | "Google Sheets" | "Google Calendar" | "Gmail" | "M-Pesa" | "System";
  event: string;
  automation: string;
  entity: string;
  status: "completed" | "waiting" | "in_progress" | "failed";
  result: string;
  details: {
    sourceApp: string;
    destinationApp: string;
    actionTaken: string;
    phone?: string;
    idempotencyKey?: string;
    executionId?: string;
    rawPayload?: Record<string, any>;
  };
}

export const ActivityView: React.FC = () => {
  const { state, simulateNewLead } = useOtomatizonStore();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "app_workspace">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectedEvent, setInspectedEvent] = useState<LedgerEventItem | null>(null);
  const [pageLimit, setPageLimit] = useState<number>(8);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [connectModalApp, setConnectModalApp] = useState<string | null>(null);
  const [qrScanned, setQrScanned] = useState(false);
  const [activeWaChat, setActiveWaChat] = useState<string>("James Mwangi");

  // Canonical Audit Ledger Events matching Reference Image 7
  const defaultLedgerEvents: LedgerEventItem[] = [
    {
      id: "evt_104208",
      time: "10:42:08",
      app: "WhatsApp",
      event: "Inquiry received",
      automation: "Lead follow-up",
      entity: "James Mwangi",
      status: "completed",
      result: "Success",
      details: {
        sourceApp: "WhatsApp Business Cloud Webhook",
        destinationApp: "Otomatizon Inbound Broker",
        actionTaken: "Inbound customer inquiry captured and verified",
        phone: "+254 712 345 678",
        idempotencyKey: "idemp_wa_254712345678_104208",
        executionId: "#12458",
        rawPayload: {
          from: "+254 712 345 678",
          message: "Hello, how much do French classes cost?"
        }
      }
    },
    {
      id: "evt_104209",
      time: "10:42:09",
      app: "Otomatizon",
      event: "Intent detected",
      automation: "Lead follow-up",
      entity: "James Mwangi",
      status: "completed",
      result: "Success",
      details: {
        sourceApp: "Otomatizon Classification Engine",
        destinationApp: "Google Sheets",
        actionTaken: "Extracted intent (French A1) with 96% confidence",
        phone: "+254 712 345 678",
        idempotencyKey: "idemp_intel_classify_104209",
        executionId: "#12458",
        rawPayload: { intent: "french_a1_inquiry", confidence: 0.96 }
      }
    },
    {
      id: "evt_104210",
      time: "10:42:10",
      app: "Google Sheets",
      event: "Lead created",
      automation: "Lead follow-up",
      entity: "James Mwangi",
      status: "completed",
      result: "Success",
      details: {
        sourceApp: "Otomatizon Orchestrator",
        destinationApp: "Google Sheets API v4",
        actionTaken: "Appended James Mwangi to 'Leads' worksheet at row 24",
        phone: "+254 712 345 678",
        idempotencyKey: "idemp_sheets_append_104210",
        executionId: "#12458",
        rawPayload: { range: "Leads!A24:E24", updatedRows: 1 }
      }
    },
    {
      id: "evt_104211",
      time: "10:42:11",
      app: "Google Calendar",
      event: "Availability checked",
      automation: "Lead follow-up",
      entity: "James Mwangi",
      status: "completed",
      result: "Success",
      details: {
        sourceApp: "Google Calendar FreeBusy API",
        destinationApp: "Otomatizon Decision Engine",
        actionTaken: "Verified 3 available tutorial slots across next 72h",
        phone: "+254 712 345 678",
        idempotencyKey: "idemp_cal_check_104211",
        executionId: "#12458",
        rawPayload: { slotsFound: 3, bookingConfirmed: false }
      }
    },
    {
      id: "evt_104212_1",
      time: "10:42:12",
      app: "Otomatizon",
      event: "No booking detected",
      automation: "Lead follow-up",
      entity: "James Mwangi",
      status: "completed",
      result: "Success",
      details: {
        sourceApp: "Decision Logic Node",
        destinationApp: "Automation Scheduler",
        actionTaken: "Confirmed no appointment on calendar; initialized 24h waiting timer",
        phone: "+254 712 345 678",
        idempotencyKey: "idemp_cond_nobook_104212",
        executionId: "#12458",
        rawPayload: { conditionBranch: "NO_BOOKING", delayHours: 24 }
      }
    },
    {
      id: "evt_104212_2",
      time: "10:42:12",
      app: "Otomatizon",
      event: "Follow-up scheduled (24h)",
      automation: "Lead follow-up",
      entity: "James Mwangi",
      status: "waiting",
      result: "Waiting",
      details: {
        sourceApp: "Scheduler Engine",
        destinationApp: "WhatsApp Outbound Broker",
        actionTaken: "Scheduled automated follow-up check-in for 2026-08-30 10:42",
        phone: "+254 712 345 678",
        idempotencyKey: "idemp_timer_24h_104212",
        executionId: "#12458",
        rawPayload: { scheduledFor: "2026-08-30T10:42:12Z", targetApp: "whatsapp" }
      }
    },
    {
      id: "evt_104213",
      time: "10:42:13",
      app: "System",
      event: "Execution pending",
      automation: "Lead follow-up",
      entity: "James Mwangi",
      status: "waiting",
      result: "Waiting",
      details: {
        sourceApp: "System Queue",
        destinationApp: "Worker Node 02",
        actionTaken: "Thread suspended until timer condition or student reply arrives",
        phone: "+254 712 345 678",
        idempotencyKey: "idemp_sys_wait_104213",
        executionId: "#12458",
        rawPayload: { workerId: "worker-nbo-02", state: "SLEEPING_UNTIL_TRIGGER" }
      }
    },
    {
      id: "evt_104214",
      time: "10:42:14",
      app: "WhatsApp",
      event: "Message prepared",
      automation: "Lead follow-up",
      entity: "James Mwangi",
      status: "waiting",
      result: "Waiting",
      details: {
        sourceApp: "Template Engine",
        destinationApp: "WhatsApp Business API",
        actionTaken: "Compiled personalized check-in message template",
        phone: "+254 712 345 678",
        idempotencyKey: "idemp_wa_prep_104214",
        executionId: "#12458",
        rawPayload: { template: "followup_checkin_24h", language: "en" }
      }
    },
    {
      id: "evt_091522",
      time: "09:15:22",
      app: "WhatsApp",
      event: "Brochure sent",
      automation: "Lead nurturing",
      entity: "Mercy Chebet",
      status: "completed",
      result: "Success",
      details: {
        sourceApp: "Otomatizon Dispatcher",
        destinationApp: "WhatsApp Business",
        actionTaken: "Transmitted course brochure PDF",
        phone: "+254 719 552 108",
        idempotencyKey: "idemp_wa_brochure_091522",
        executionId: "#12455",
        rawPayload: { media: "french_brochure_2026.pdf", status: "delivered" }
      }
    },
    {
      id: "evt_083015",
      time: "08:30:15",
      app: "M-Pesa",
      event: "Payment verified (KES 3,500)",
      automation: "Tuition collection",
      entity: "Brian Otieno",
      status: "completed",
      result: "Success",
      details: {
        sourceApp: "Safaricom Daraja API",
        destinationApp: "Google Sheets",
        actionTaken: "Coaching session scheduled & payment confirmed via M-Pesa STK",
        phone: "+254 722 991 304",
        idempotencyKey: "idemp_mpesa_QJD472910M",
        executionId: "#12450",
        rawPayload: { amountKes: 3500, ref: "QJD472910M", provider: "mpesa" }
      }
    },
    {
      id: "evt_082940",
      time: "08:29:40",
      app: "Google Calendar",
      event: "Lesson scheduled",
      automation: "Tuition collection",
      entity: "Brian Otieno",
      status: "completed",
      result: "Success",
      details: {
        sourceApp: "Google Calendar Event API",
        destinationApp: "WhatsApp Confirmation Dispatcher",
        actionTaken: "Created Meet booking: French B2 Exam Prep on 2026-08-30 14:00",
        phone: "+254 722 991 304",
        idempotencyKey: "idemp_cal_create_082940",
        executionId: "#12450",
        rawPayload: { summary: "French B2 Exam Prep - Brian Otieno", durationMins: 60 }
      }
    }
  ];

  const allEvents = [...defaultLedgerEvents];

  const filteredEvents = allEvents.filter((item) => {
    // 1. Filter by application
    if (activeFilter !== "all") {
      const matchApp = item.app.toLowerCase().replace(/\s+/g, "");
      const filterKey = activeFilter.toLowerCase().replace(/\s+/g, "");
      if (!matchApp.includes(filterKey)) return false;
    }

    // 2. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.entity.toLowerCase().includes(q) ||
        item.event.toLowerCase().includes(q) ||
        item.app.toLowerCase().includes(q) ||
        item.automation.toLowerCase().includes(q) ||
        item.time.includes(q)
      );
    }
    return true;
  });

  const getAppBadge = (app: string) => {
    switch (app) {
      case "WhatsApp":
        return { icon: MessageSquare, color: "text-[#15803D]", bg: "bg-emerald-50" };
      case "Google Calendar":
        return { icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" };
      case "M-Pesa":
        return { icon: CreditCard, color: "text-emerald-700", bg: "bg-emerald-50" };
      case "Gmail":
        return { icon: Mail, color: "text-red-600", bg: "bg-red-50" };
      case "Google Sheets":
        return { icon: FileSpreadsheet, color: "text-emerald-700", bg: "bg-emerald-50" };
      default:
        return { icon: Sparkles, color: "text-[#15803D]", bg: "bg-stone-50" };
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredEvents, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `otomatizon_audit_trail_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportNotice("Audit trail exported successfully (JSON)");
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* 1. HEADER & APPLICATION FILTER PILLS matching Reference Image 7 */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                UNIFIED ACTIVITY STREAM
              </span>
              <span className="text-xs font-mono text-[#75777E]">
                &bull; Live Operating Log
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121316] tracking-tight mt-1">
              Activity Stream
            </h1>
          </div>

          {/* View Mode Toggle: Table vs Interactive App Workspace */}
          <div className="flex items-center gap-2 bg-[#FAF9F5] p-1 rounded-2xl border border-[#EAE7DF] self-start sm:self-auto font-mono text-xs">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-[#121316] shadow-2xs border border-[#EAE7DF]"
                  : "text-[#75777E] hover:text-[#121316]"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Audit Ledger</span>
            </button>
            <button
              onClick={() => setViewMode("app_workspace")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "app_workspace"
                  ? "bg-[#002E25] text-white shadow-2xs"
                  : "text-[#75777E] hover:text-[#121316]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Interactive App View</span>
            </button>
          </div>
        </div>

        {/* Filter Pills & Search Bar Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Filter Pills matching Image 7 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-mono">
            {[
              { id: "all", label: "All" },
              { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, iconColor: "text-[#15803D]" },
              { id: "gmail", label: "Gmail", icon: Mail, iconColor: "text-red-600" },
              { id: "calendar", label: "Calendar", icon: Calendar, iconColor: "text-blue-600" },
              { id: "sheets", label: "Sheets", icon: FileSpreadsheet, iconColor: "text-emerald-700" },
              { id: "mpesa", label: "M-Pesa", icon: CreditCard, iconColor: "text-emerald-700" }
            ].map((p) => {
              const Icon = p.icon;
              const isSelected = activeFilter === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => setActiveFilter(p.id)}
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 shrink-0 border cursor-pointer ${
                    isSelected
                      ? "bg-[#002E25] text-white border-[#002E25] font-bold shadow-2xs"
                      : "bg-white text-[#75777E] hover:text-[#121316] border-[#EAE7DF]"
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-300" : p.iconColor}`} />}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input matching Image 7 */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search activity..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full bg-white border border-[#EAE7DF] text-[#121316] placeholder-[#75777E] text-xs focus:outline-none focus:border-[#15803D] shadow-2xs transition-all font-mono"
            />
          </div>

        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-[#15803D] flex items-center gap-2 animate-fadeIn">
          <Check className="w-4 h-4" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* VIEW MODE 1: TABULAR AUDIT LEDGER (matching Image 7 exactly) */}
      {viewMode === "table" && (
        <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              
              {/* Table Header Columns matching Image 7 */}
              <thead>
                <tr className="border-b border-[#EAE7DF] bg-[#FAF9F5]/70 text-[10px] text-[#75777E] uppercase tracking-wider">
                  <th className="py-3 px-5 font-bold">TIME</th>
                  <th className="py-3 px-4 font-bold">APPLICATION</th>
                  <th className="py-3 px-4 font-bold">EVENT</th>
                  <th className="py-3 px-4 font-bold">AUTOMATION</th>
                  <th className="py-3 px-4 font-bold">ENTITY</th>
                  <th className="py-3 px-5 font-bold text-right">RESULT</th>
                </tr>
              </thead>

              {/* Table Body Rows */}
              <tbody className="divide-y divide-[#EAE7DF]">
                {filteredEvents.slice(0, pageLimit).map((item) => {
                  const badge = getAppBadge(item.app);
                  const Icon = badge.icon;
                  const isSuccess = item.result === "Success";

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setInspectedEvent(item)}
                      className="hover:bg-[#FAF9F5] transition-colors cursor-pointer group"
                    >
                      {/* TIME */}
                      <td className="py-3.5 px-5 text-[#121316] font-bold whitespace-nowrap">
                        {item.time}
                      </td>

                      {/* APPLICATION */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 font-bold text-[#121316]">
                          <Icon className={`w-4 h-4 ${badge.color}`} />
                          <span>{item.app}</span>
                        </div>
                      </td>

                      {/* EVENT */}
                      <td className="py-3.5 px-4 text-[#121316] whitespace-nowrap">
                        {item.event}
                      </td>

                      {/* AUTOMATION */}
                      <td className="py-3.5 px-4 text-[#4A4B50] whitespace-nowrap">
                        {item.automation}
                      </td>

                      {/* ENTITY */}
                      <td className="py-3.5 px-4 text-[#75777E] whitespace-nowrap">
                        {item.entity}
                      </td>

                      {/* RESULT */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 font-bold ${
                          isSuccess ? "text-[#15803D]" : "text-amber-800"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isSuccess ? "bg-[#15803D]" : "bg-amber-600"}`} />
                          <span>{item.result}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

            </table>
          </div>

          {/* Empty State if filter yields nothing */}
          {filteredEvents.length === 0 && (
            <div className="p-10 text-center text-xs font-mono text-[#75777E] space-y-2">
              <div>No events match this filter.</div>
              <button
                onClick={() => { setActiveFilter("all"); setSearchQuery(""); }}
                className="text-[#15803D] font-bold underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          )}

          {/* Footer Controls matching Image 7 */}
          <div className="p-4 border-t border-[#EAE7DF] flex items-center justify-between text-xs font-mono">
            <div className="w-24" />

            {/* Show more Button */}
            {pageLimit < filteredEvents.length ? (
              <button
                onClick={() => setPageLimit((prev) => prev + 6)}
                className="text-[#75777E] hover:text-[#121316] transition-colors font-medium flex items-center gap-1 cursor-pointer"
              >
                <span>Show more</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="text-[#75777E] text-[11px]">All events displayed</span>
            )}

            {/* Export Button matching Image 7 */}
            <button
              onClick={handleExport}
              className="px-4 py-1.5 rounded-full bg-white hover:bg-[#FAF9F5] border border-[#EAE7DF] text-[#121316] font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#75777E]" />
              <span>Export</span>
            </button>
          </div>

        </div>
      )}

      {/* VIEW MODE 2: INTERACTIVE APP WORKSPACE (Mini-Apps & Connected Workspaces) */}
      {viewMode === "app_workspace" && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Top Quick-Connect Action Bar */}
          <div className="p-4 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#121316]">
              <ShieldCheck className="w-4 h-4 text-[#15803D]" />
              <span>Active Workspace: <strong>{activeFilter.toUpperCase()}</strong></span>
              <span className="text-[#75777E]">&bull; AES-256 Encrypted Stream</span>
            </div>

            <button
              onClick={() => setConnectModalApp(activeFilter === "all" ? "whatsapp" : activeFilter)}
              className="px-4 py-1.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect / Link Your Own Account</span>
            </button>
          </div>

          {/* 1. WHATSAPP MINI-WORKSPACE */}
          {(activeFilter === "whatsapp" || activeFilter === "all") && (
            <div className="p-6 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#121316]">WhatsApp Business Stream</h3>
                    <span className="text-[10px] font-mono text-[#15803D] font-bold">Connected: +254 712 882 109 &middot; Live Webhook</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] text-[10px] font-mono font-bold border border-[#A7F3D0]">
                  AI Autopilot Listening
                </span>
              </div>

              {/* Chat Conversation Preview with AI Coordination */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs font-mono">
                
                {/* Contacts List */}
                <div className="md:col-span-4 bg-[#FAF9F5] p-3 rounded-2xl border border-[#EAE7DF] space-y-2">
                  <span className="text-[10px] uppercase text-[#75777E] font-bold block">RECENT INBOUND CONTACTS</span>
                  
                  <div 
                    onClick={() => setActiveWaChat("James Mwangi")}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      activeWaChat === "James Mwangi" ? "bg-white border-[#15803D] shadow-2xs font-bold text-[#121316]" : "bg-transparent border-transparent text-[#4A4B50] hover:bg-white"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>James Mwangi</span>
                      <span className="text-[10px] text-[#75777E]">10:42</span>
                    </div>
                    <div className="text-[10px] text-[#15803D] truncate">How much do French classes cost?</div>
                  </div>

                  <div 
                    onClick={() => setActiveWaChat("Mercy Chebet")}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      activeWaChat === "Mercy Chebet" ? "bg-white border-[#15803D] shadow-2xs font-bold text-[#121316]" : "bg-transparent border-transparent text-[#4A4B50] hover:bg-white"
                    }`}
                  >
                    <div className="flex justify-between">
                      <span>Mercy Chebet</span>
                      <span className="text-[10px] text-[#75777E]">09:15</span>
                    </div>
                    <div className="text-[10px] text-[#75777E] truncate">Brochure PDF delivered</div>
                  </div>
                </div>

                {/* Live Message Thread with Otomatizon Actions */}
                <div className="md:col-span-8 bg-[#FAF9F5] p-4 rounded-2xl border border-[#EAE7DF] space-y-3">
                  <div className="text-[10px] uppercase text-[#75777E] font-bold border-b border-[#EAE7DF] pb-1 flex items-center justify-between">
                    <span>LIVE CONVERSATION &middot; {activeWaChat}</span>
                    <span className="text-[#15803D]">Auto-Reply &amp; 24h Timer Active</span>
                  </div>

                  <div className="space-y-2">
                    {/* Student Incoming */}
                    <div className="p-3 rounded-xl bg-white border border-[#EAE7DF] shadow-2xs max-w-sm">
                      <span className="text-[10px] text-[#75777E] block">{activeWaChat} &middot; 10:42 AM</span>
                      <p className="text-xs text-[#121316] mt-0.5">
                        {activeWaChat === "James Mwangi" ? "Hello, how much do French classes cost for exam preparation?" : "Hi, can I get the syllabus brochure for DELF B2?"}
                      </p>
                    </div>

                    {/* Otomatizon Intelligent Interception */}
                    <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] max-w-sm ml-auto text-right">
                      <div className="flex items-center justify-end gap-1.5 text-[10px] text-[#15803D] font-bold">
                        <Sparkles className="w-3 h-3" />
                        <span>Otomatizon Autopilot &middot; 10:42 AM</span>
                      </div>
                      <p className="text-xs text-[#121316] mt-0.5 text-left">
                        Hello {activeWaChat.split(" ")[0]}! Our private French tutoring is KES 3,500/hr. Attached is the syllabus brochure: 📄 <strong>French_Course_2026.pdf</strong>.
                      </p>
                      <div className="text-[10px] text-[#15803D] font-mono mt-1">
                        &bull; Slot check complete &middot; 24h unbooked follow-up timer started
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 2. GOOGLE SHEETS LIVE ROSTER */}
          {(activeFilter === "sheets" || activeFilter === "all") && (
            <div className="p-6 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#121316]">Google Sheets Master Ledger</h3>
                    <span className="text-[10px] font-mono text-[#75777E]">Sheet: <strong>Student_Roster_2026.xlsx</strong> &middot; Auto-Appended by AI</span>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] text-[10px] font-mono font-bold border border-[#A7F3D0]">
                  Synced (2 min ago)
                </span>
              </div>

              <div className="overflow-x-auto border border-[#EAE7DF] rounded-2xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#FAF9F5] text-[10px] text-[#75777E] uppercase border-b border-[#EAE7DF]">
                    <tr>
                      <th className="py-2.5 px-4">Row</th>
                      <th className="py-2.5 px-4">Student Name</th>
                      <th className="py-2.5 px-4">Phone Number</th>
                      <th className="py-2.5 px-4">Course</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Fee (KES)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAE7DF]">
                    <tr className="hover:bg-[#FAF9F5]">
                      <td className="py-2.5 px-4 text-[#75777E]">24</td>
                      <td className="py-2.5 px-4 font-bold text-[#121316]">James Mwangi</td>
                      <td className="py-2.5 px-4 text-[#75777E]">+254 712 345 678</td>
                      <td className="py-2.5 px-4 text-[#121316]">French A1 Coaching</td>
                      <td className="py-2.5 px-4 text-[#15803D] font-bold">New Lead</td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#121316]">3,500</td>
                    </tr>
                    <tr className="hover:bg-[#FAF9F5]">
                      <td className="py-2.5 px-4 text-[#75777E]">23</td>
                      <td className="py-2.5 px-4 font-bold text-[#121316]">Mercy Chebet</td>
                      <td className="py-2.5 px-4 text-[#75777E]">+254 719 552 108</td>
                      <td className="py-2.5 px-4 text-[#121316]">Executive Exam Prep</td>
                      <td className="py-2.5 px-4 text-blue-600 font-bold">Brochure Sent</td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#121316]">4,000</td>
                    </tr>
                    <tr className="hover:bg-[#FAF9F5]">
                      <td className="py-2.5 px-4 text-[#75777E]">22</td>
                      <td className="py-2.5 px-4 font-bold text-[#121316]">Brian Otieno</td>
                      <td className="py-2.5 px-4 text-[#75777E]">+254 722 991 304</td>
                      <td className="py-2.5 px-4 text-[#121316]">DELF B2 Prep</td>
                      <td className="py-2.5 px-4 text-emerald-700 font-bold">Paid &middot; Booked</td>
                      <td className="py-2.5 px-4 text-right font-bold text-[#15803D]">3,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. GOOGLE CALENDAR & M-PESA RECONCILIATION */}
          {(activeFilter === "calendar" || activeFilter === "mpesa" || activeFilter === "all") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Calendar Snapshot */}
              <div className="p-6 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-[#121316]">Google Calendar Availability</h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#15803D] font-bold">kamau.french.tutor@gmail.com</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-blue-50/50 border border-blue-200/70 flex items-center justify-between">
                    <div>
                      <strong className="text-[#121316] block">Today, 2:00 PM - 3:00 PM</strong>
                      <span className="text-[11px] text-[#4A4B50]">Brian Otieno &middot; DELF B2 Session</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold">Meet Link Ready</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-between text-[#75777E]">
                    <div>
                      <span className="block font-bold">Tomorrow, 10:00 AM</span>
                      <span className="text-[11px]">Open Slot Reserved for Follow-up</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-[#15803D] font-bold border border-[#A7F3D0]">Available</span>
                  </div>
                </div>
              </div>

              {/* M-Pesa Verification */}
              <div className="p-6 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-bold text-sm text-[#121316]">M-Pesa Real-Time Receipts</h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#15803D] font-bold">Paybill: 891244</span>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex items-center justify-between">
                    <div>
                      <strong className="text-[#121316] block">KES 3,500 &middot; Ref: QJD472910M</strong>
                      <span className="text-[11px] text-[#4A4B50]">Brian Otieno &middot; Verified via Safaricom</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] font-bold border border-[#A7F3D0]">Reconciled</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-between text-[#75777E]">
                    <div>
                      <span className="block font-bold">Auto-Lock Feature</span>
                      <span className="text-[11px]">Locks Calendar Slot upon receipt</span>
                    </div>
                    <span className="text-[10px] text-[#15803D] font-bold">Active</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* 4. INVESTIGATIVE TELEMETRY MODAL (When row is clicked) */}
      {inspectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl max-w-lg w-full p-6 space-y-5 animate-scaleUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                  INVESTIGATIVE AUDIT TRAIL
                </span>
                <span className="text-xs font-mono text-[#75777E]">{inspectedEvent.time}</span>
              </div>

              <button
                onClick={() => setInspectedEvent(null)}
                className="p-1 rounded-full text-[#75777E] hover:text-[#121316] hover:bg-[#FAF9F5] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Event Summary */}
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#121316]">
                {inspectedEvent.app} &mdash; {inspectedEvent.event}
              </h3>
              <p className="text-xs text-[#4A4B50]">
                {inspectedEvent.details.actionTaken}
              </p>
            </div>

            {/* Related Entities Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-0.5">
                <span className="text-[10px] text-[#75777E] uppercase block">CLIENT ENTITY</span>
                <strong className="text-[#121316]">{inspectedEvent.entity}</strong>
                {inspectedEvent.details.phone && (
                  <div className="text-[10px] text-[#75777E]">{inspectedEvent.details.phone}</div>
                )}
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-0.5">
                <span className="text-[10px] text-[#75777E] uppercase block">AUTOMATION</span>
                <strong className="text-[#121316]">{inspectedEvent.automation}</strong>
                <div className="text-[10px] text-[#15803D]">Execution {inspectedEvent.details.executionId}</div>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-0.5">
                <span className="text-[10px] text-[#75777E] uppercase block">SOURCE APPLICATION</span>
                <span className="text-[#121316] text-[11px] font-semibold">{inspectedEvent.details.sourceApp}</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-0.5">
                <span className="text-[10px] text-[#75777E] uppercase block">DESTINATION APPLICATION</span>
                <span className="text-[#121316] text-[11px] font-semibold">{inspectedEvent.details.destinationApp}</span>
              </div>
            </div>

            {/* Security & Idempotency Key */}
            {inspectedEvent.details.idempotencyKey && (
              <div className="p-3 rounded-2xl bg-white border border-[#EAE7DF] text-xs font-mono flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-1.5 text-[#15803D]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="font-bold text-[10px]">IDEMPOTENCE VERIFIED</span>
                </div>
                <span className="text-[#75777E] text-[10px] truncate max-w-[200px]" title={inspectedEvent.details.idempotencyKey}>
                  {inspectedEvent.details.idempotencyKey}
                </span>
              </div>
            )}

            {/* Raw JSON Payload Accordion */}
            {inspectedEvent.details.rawPayload && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
                  VERIFIED INBOUND / OUTBOUND PAYLOAD
                </span>
                <pre className="p-3 rounded-xl bg-stone-900 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-32 select-all">
                  {JSON.stringify(inspectedEvent.details.rawPayload, null, 2)}
                </pre>
              </div>
            )}

            <button
              onClick={() => setInspectedEvent(null)}
              className="w-full py-2.5 rounded-full bg-[#121316] hover:bg-black text-white text-xs font-bold transition-all shadow-sm text-center font-mono cursor-pointer"
            >
              Close Inspection
            </button>

          </div>
        </div>
      )}

      {/* 5. APP CONNECTION / QR MODAL */}
      {connectModalApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl max-w-md w-full p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  {connectModalApp === "whatsapp" ? <MessageSquare className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#121316]">Connect {connectModalApp.toUpperCase()}</h3>
                  <span className="text-[10px] font-mono text-[#75777E]">Instant API &amp; QR Pairing</span>
                </div>
              </div>

              <button
                onClick={() => { setConnectModalApp(null); setQrScanned(false); }}
                className="p-1 rounded-full text-[#75777E] hover:text-[#121316] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {connectModalApp === "whatsapp" ? (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-[#FAF9F5] rounded-2xl border border-[#EAE7DF] inline-block mx-auto">
                  {qrScanned ? (
                    <div className="w-40 h-40 flex flex-col items-center justify-center text-[#15803D] space-y-2">
                      <CheckCircle2 className="w-12 h-12" />
                      <span className="text-xs font-bold font-mono">WhatsApp Paired!</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-40 h-40 bg-white border border-stone-200 rounded-xl flex items-center justify-center p-2 mx-auto">
                        <QrCode className="w-32 h-32 text-[#121316]" />
                      </div>
                      <span className="text-[10px] font-mono text-[#75777E]">Scan with WhatsApp Web or Meta Cloud</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-[#4A4B50] leading-relaxed">
                  Open WhatsApp on your phone &gt; Linked Devices &gt; Scan this code to let Otomatizon automatically receive inquiries and follow up with leads.
                </div>

                <button
                  onClick={() => setQrScanned(true)}
                  className="w-full py-2.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all font-mono cursor-pointer"
                >
                  {qrScanned ? "Connection Verified ✓" : "Simulate Instant QR Pairing"}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-2">
                  <span className="text-[10px] text-[#75777E] uppercase block">OAUTH2 ONE-CLICK BINDING</span>
                  <p className="text-[#121316]">Grant read/write access to sync events, roster records, and mobile money notifications.</p>
                </div>

                <button
                  onClick={() => {
                    setQrScanned(true);
                    setTimeout(() => setConnectModalApp(null), 1000);
                  }}
                  className="w-full py-2.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold transition-all font-mono cursor-pointer flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Authenticate &amp; Link System</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
