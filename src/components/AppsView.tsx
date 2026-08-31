"use client";

import React, { useState } from "react";
import { 
  Check, 
  AlertCircle, 
  MessageSquare, 
  Mail, 
  Calendar, 
  FileSpreadsheet, 
  HardDrive, 
  MapPin, 
  CreditCard, 
  RefreshCw, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Power, 
  Info,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { Integration, IntegrationStatus } from "@/types";
import { DS } from "@/lib/design-system";
import { SystemHealthOverview } from "./SystemHealthOverview";
import { ConnectAppModal } from "./ConnectAppModal";

interface AppsViewProps {
  onNavigateToAutomations?: () => void;
}

interface AppSystemDetail {
  id: string;
  name: string;
  subtitle: string;
  category?: string;
  status: IntegrationStatus;
  statusText: string;
  accountLinked: string;
  lastSync: string;
  role: string;
  capabilities: string[];
  automationsUsingIt: {
    id: string;
    title: string;
  }[];
  permissions: string[];
  systemHealth: string;
}

const systemsMapData: Record<string, AppSystemDetail> = {
  whatsapp_business: {
    id: "whatsapp_business",
    name: "WhatsApp Business",
    subtitle: "Customer Communication",
    category: "messaging",
    status: "connected",
    statusText: "CONNECTED",
    accountLinked: "+254 712 882 109",
    lastSync: "2 min ago",
    role: "Receives customer inquiries, delivers course brochures, and sends automated follow-ups",
    capabilities: [
      "Read incoming WhatsApp messages",
      "Send pre-approved message templates",
      "Manage contacts and conversation labels",
      "Attach PDF syllabus and lesson materials"
    ],
    automationsUsingIt: [
      { id: "wf_lead_autopilot", title: "Lead Follow-Up Autopilot" },
      { id: "wf_payment_recovery", title: "Payment Recovery" },
      { id: "wf_class_reminders", title: "Class Notifications" }
    ],
    permissions: ["messages.read", "messages.write", "contacts.read", "business_profile.read"],
    systemHealth: "100% Operational · 180ms Latency"
  },
  gmail: {
    id: "gmail",
    name: "Gmail",
    subtitle: "Email & Notifications",
    category: "messaging",
    status: "connected",
    statusText: "CONNECTED",
    accountLinked: "kamau.french.tutor@gmail.com",
    lastSync: "5 min ago",
    role: "Receives formal student inquiries, dispatches invoices and confirmation emails",
    capabilities: [
      "Monitor formal inquiry emails",
      "Send quotation summaries and terms",
      "Dispatch lesson receipts and invoices",
      "Archive student communication history"
    ],
    automationsUsingIt: [
      { id: "wf_class_reminders", title: "Class Notifications & Summaries" }
    ],
    permissions: ["gmail.send", "gmail.readonly", "userinfo.email"],
    systemHealth: "100% Operational · 140ms Latency"
  },
  google_business: {
    id: "google_business",
    name: "Google Business Profile",
    subtitle: "Location & Visibility",
    category: "messaging",
    status: "connected",
    statusText: "CONNECTED",
    accountLinked: "Kamau French Tutoring (Nairobi CBD)",
    lastSync: "12 min ago",
    role: "Attracts local students in Nairobi and collects verified 5-star Google Maps reviews",
    capabilities: [
      "Track call and website clicks from Google Maps",
      "Publish tutoring hours and location updates",
      "Request 5-star reviews after course completion",
      "Synchronize campus contact details"
    ],
    automationsUsingIt: [
      { id: "wf_lead_autopilot", title: "Lead Follow-Up Autopilot" }
    ],
    permissions: ["business.manage", "locations.read"],
    systemHealth: "100% Operational · 210ms Latency"
  },
  google_calendar: {
    id: "google_calendar",
    name: "Google Calendar",
    subtitle: "Scheduling & Bookings",
    category: "google",
    status: "connected",
    statusText: "CONNECTED",
    accountLinked: "kamau.french.tutor@gmail.com",
    lastSync: "1 min ago",
    role: "Real-time calendar availability, lesson booking, and Google Meet video conference links",
    capabilities: [
      "Inspect available lesson slots in real time",
      "Create Google Meet video session events",
      "Lock calendar slots upon confirmed booking",
      "Reschedule lessons upon student date change"
    ],
    automationsUsingIt: [
      { id: "wf_lead_autopilot", title: "Lead Follow-Up Autopilot" },
      { id: "wf_class_reminders", title: "Class Notifications" }
    ],
    permissions: ["calendar.events", "calendar.readonly"],
    systemHealth: "100% Operational · 120ms Latency"
  },
  google_sheets: {
    id: "google_sheets",
    name: "Google Sheets",
    subtitle: "Data & Leads Ledger",
    category: "google",
    status: "connected",
    statusText: "CONNECTED",
    accountLinked: "Student_Roster_2026.xlsx",
    lastSync: "2 min ago",
    role: "Master student roster, pipeline tracking, and historical revenue ledger",
    capabilities: [
      "Instantly record every qualified lead",
      "Update lead status (contacted, booked, paid)",
      "Calculate monthly business revenue in KES",
      "Maintain learning history and lesson count"
    ],
    automationsUsingIt: [
      { id: "wf_lead_autopilot", title: "Lead Follow-Up Autopilot" }
    ],
    permissions: ["spreadsheets", "drive.file"],
    systemHealth: "100% Operational · 160ms Latency"
  },
  mpesa: {
    id: "mpesa",
    name: "M-Pesa",
    subtitle: "Payments & Verification",
    category: "payments",
    status: "connected",
    statusText: "CONNECTED",
    accountLinked: "Till / Paybill: 891244 (Safaricom)",
    lastSync: "4 min ago",
    role: "Instant mobile money collection, STK Push prompts, and transaction reconciliation",
    capabilities: [
      "Trigger STK Push mobile payment prompts",
      "Validate Safaricom receipt codes in real time",
      "Reconcile payments with Google Calendar bookings",
      "Send polite payment reminders for overdue fees"
    ],
    automationsUsingIt: [
      { id: "wf_payment_recovery", title: "Payment Recovery" }
    ],
    permissions: ["mpesa_stk_push", "mpesa_c2b_validation"],
    systemHealth: "100% Operational · 90ms Latency"
  },
  google_drive: {
    id: "google_drive",
    name: "Google Drive",
    subtitle: "Course Materials & Syllabus",
    subtitleFr: "Course Materials & Syllabus",
    category: "google",
    status: "requires_configuration" as any,
    statusText: "REQUIRES CONFIGURATION",
    statusTextFr: "REQUIRES CONFIGURATION",
    accountLinked: "Pending Folder Binding",
    lastSync: "Not synchronized",
    role: "Stores and automatically generates shared folders for lesson recordings and PDF notes",
    capabilities: [
      "Auto-create student folders",
      "Attach homework PDF documents",
      "Generate shareable lesson links"
    ],
    automationsUsingIt: [],
    permissions: ["drive.file", "drive.readonly"],
    systemHealth: "requires_configuration"
  },
  instagram_dm: {
    id: "instagram_dm",
    name: "Instagram Direct",
    subtitle: "Social Inbound Leads",
    subtitleFr: "Social Inbound Leads",
    category: "messaging",
    status: "coming_soon" as any,
    statusText: "COMING SOON",
    statusTextFr: "COMING SOON",
    accountLinked: "Awaiting Meta API v21",
    lastSync: "Coming soon",
    role: "Direct messaging capture for prospective student inquiries originating on Instagram",
    capabilities: [
      "Capture direct messages",
      "Auto-reply with course link"
    ],
    automationsUsingIt: [],
    permissions: ["instagram_basic", "instagram_manage_messages"],
    systemHealth: "coming_soon"
  }
};

export const AppsView: React.FC<AppsViewProps> = ({ onNavigateToAutomations }) => {
  const { state, toggleIntegration } = useOtomatizonStore();
  const [selectedAppId, setSelectedAppId] = useState<string>("whatsapp_business");
  const [isActionPending, setIsActionPending] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const selectedApp = systemsMapData[selectedAppId] || systemsMapData["whatsapp_business"];

  const getAppIcon = (id: string) => {
    switch (id) {
      case "whatsapp_business":
        return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case "gmail":
        return <Mail className="w-5 h-5 text-red-600" />;
      case "google_business":
        return <MapPin className="w-5 h-5 text-blue-600" />;
      case "google_calendar":
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case "google_sheets":
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
      case "mpesa":
        return <CreditCard className="w-5 h-5 text-emerald-700" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#15803D]" />;
    }
  };

  const handleToggleConnection = async (appId: string) => {
    setIsActionPending(true);
    await toggleIntegration(appId as any);
    setTimeout(() => {
      setIsActionPending(false);
      setIsManageModalOpen(false);
    }, 450);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* 1. HEADER matching Reference Image 3 */}
      <div className="border-b border-[#EAE7DF] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              APPLICATIONS
            </span>
            <span className="text-xs font-mono text-[#75777E]">
              &bull; Business Operating System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121316] tracking-tight">
            Connected Business Systems
          </h1>
          <p className="text-xs sm:text-sm text-[#4A4B50] font-normal">
            Otomatizon connects your tools and makes them work together.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#75777E] bg-white px-3 py-1.5 rounded-2xl border border-[#EAE7DF] shadow-2xs self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#15803D]" />
          <span>AES-256 Encryption &middot; Official APIs</span>
        </div>
      </div>

      {/* 2. SYSTEM HEALTH OVERVIEW & 8-STEP JOURNEY matching Reference Image 10 */}
      <SystemHealthOverview onNavigateTab={(tab) => {
        if (tab === "automations" && onNavigateToAutomations) onNavigateToAutomations();
      }} />

      {/* 3. THE VISUAL SYSTEM ARCHITECTURE MAP matching Step 3 Reference Image */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-6">
        
        {/* Map Diagram: Left Inbound Nodes (3) -> Center Otomatizon Hub -> Right Action/Record Nodes (3) */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-[#FAF9F5]/70 border border-[#EAE7DF]">
          
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 lg:gap-2 items-center">
            
            {/* LEFT COLUMN: Inbound & Messaging Channels (4 cols on lg) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Card 1: WhatsApp Business */}
              <div 
                onClick={() => setSelectedAppId("whatsapp_business")}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-3 group ${
                  selectedAppId === "whatsapp_business"
                    ? "border-[#15803D] ring-2 ring-[#15803D]/20 bg-emerald-50/10"
                    : "border-[#EAE7DF] hover:border-[#15803D]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#121316] truncate">WhatsApp Business</div>
                    <div className="text-[11px] text-[#75777E] truncate">Customer Communication</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] font-mono text-[#15803D] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                  <span>2 automations</span>
                </div>
              </div>

              {/* Card 2: Gmail */}
              <div 
                onClick={() => setSelectedAppId("gmail")}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-3 group ${
                  selectedAppId === "gmail"
                    ? "border-[#15803D] ring-2 ring-[#15803D]/20 bg-emerald-50/10"
                    : "border-[#EAE7DF] hover:border-[#15803D]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#121316] truncate">Gmail</div>
                    <div className="text-[11px] text-[#75777E] truncate">Email &amp; Notifications</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] font-mono text-[#15803D] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                  <span>1 automation</span>
                </div>
              </div>

              {/* Card 3: Google Business Profile */}
              <div 
                onClick={() => setSelectedAppId("google_business")}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-3 group ${
                  selectedAppId === "google_business"
                    ? "border-[#15803D] ring-2 ring-[#15803D]/20 bg-emerald-50/10"
                    : "border-[#EAE7DF] hover:border-[#15803D]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#121316] truncate">Google Business Profile</div>
                    <div className="text-[11px] text-[#75777E] truncate">Location &amp; Visibility</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] font-mono text-[#15803D] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                  <span>1 automation</span>
                </div>
              </div>

            </div>

            {/* CENTER COLUMN: Central Otomatizon Intelligence Layer (3 cols on lg) */}
            <div className="lg:col-span-3 flex flex-col items-center justify-center py-6 px-2 text-center space-y-3 relative">
              
              {/* Central Squircle Icon with Official Emblem */}
              <div className="relative group">
                <img
                  src="/intelligence-core-logo.png"
                  alt="OTOMATIZON Intelligence Layer"
                  className="w-24 h-24 rounded-3xl object-contain shadow-xl border-2 border-[#15803D]/40 group-hover:scale-105 group-hover:border-[#15803D] transition-all bg-[#002E25]"
                />
                <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-white absolute -top-1 -right-1 animate-pulse" />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-black text-[#121316] tracking-tight font-mono">
                  OTOMATIZON
                </div>
                <div className="text-xs font-mono text-[#15803D] uppercase font-bold">
                  Intelligence Layer
                </div>
                <p className="text-[11px] text-[#4A4B50] max-w-[180px] leading-tight mx-auto font-medium">
                  Understands, decides, and orchestrates
                </p>
              </div>

              {/* Decorative connector indicators for desktop */}
              <div className="hidden lg:block text-[10px] font-mono text-[#75777E] pt-1">
                &larr; Events &middot; Actions &rarr;
              </div>
            </div>

            {/* RIGHT COLUMN: Execution, Records & Payments (4 cols on lg) */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Card 4: Google Calendar */}
              <div 
                onClick={() => setSelectedAppId("google_calendar")}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-3 group ${
                  selectedAppId === "google_calendar"
                    ? "border-[#15803D] ring-2 ring-[#15803D]/20 bg-emerald-50/10"
                    : "border-[#EAE7DF] hover:border-[#15803D]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#121316] truncate">Google Calendar</div>
                    <div className="text-[11px] text-[#75777E] truncate">Scheduling &amp; Bookings</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] font-mono text-[#15803D] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                  <span>2 automations</span>
                </div>
              </div>

              {/* Card 5: Google Sheets */}
              <div 
                onClick={() => setSelectedAppId("google_sheets")}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-3 group ${
                  selectedAppId === "google_sheets"
                    ? "border-[#15803D] ring-2 ring-[#15803D]/20 bg-emerald-50/10"
                    : "border-[#EAE7DF] hover:border-[#15803D]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#121316] truncate">Google Sheets</div>
                    <div className="text-[11px] text-[#75777E] truncate">Data &amp; Leads Ledger</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] font-mono text-[#15803D] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                  <span>1 automation</span>
                </div>
              </div>

              {/* Card 6: M-Pesa */}
              <div 
                onClick={() => setSelectedAppId("mpesa")}
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer shadow-2xs flex items-center justify-between gap-3 group ${
                  selectedAppId === "mpesa"
                    ? "border-[#15803D] ring-2 ring-[#15803D]/20 bg-emerald-50/10"
                    : "border-[#EAE7DF] hover:border-[#15803D]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#121316] truncate">M-Pesa</div>
                    <div className="text-[11px] text-[#75777E] truncate">Payments &amp; Verification</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[10px] font-mono text-[#15803D] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                  <span>1 automation</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* 3. APPLICATION DETAILS (Application Deep Inspection Card) matching Reference Image 3 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#75777E] font-bold">
            APPLICATION DETAILS
          </span>
          <span className="text-[11px] font-mono text-[#15803D] font-bold">
            Select any system card above to inspect its operational role
          </span>
        </div>

        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-6 animate-fadeIn">
          
          {/* Card Top: App Identity, Status & Linked Account */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE7DF] pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-center shrink-0">
                {getAppIcon(selectedApp.id)}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#121316] tracking-tight">
                  {selectedApp.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#75777E] mt-0.5 font-mono">
                  <span className="text-[#121316] font-semibold">{selectedApp.subtitle}</span>
                  <span>&bull;</span>
                  <span>Linked Account: <strong className="text-[#121316]">{selectedApp.accountLinked}</strong></span>
                  <span>&bull;</span>
                  <span>Sync: {selectedApp.lastSync}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] font-mono uppercase font-bold text-[#15803D] bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
                {selectedApp.statusText}
              </span>
            </div>
          </div>

          {/* Two-Column Deep Inspection Body matching Reference Image 3 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
            
            {/* Left Column (7 cols): ROLE & CAPABILITIES */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* ROLE */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
                  ROLE IN YOUR BUSINESS SYSTEM
                </span>
                <p className="text-sm font-medium text-[#121316] leading-relaxed bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EAE7DF]">
                  {selectedApp.role}
                </p>
              </div>

              {/* CAPABILITIES */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
                  CAPABILITIES EXECUTED BY OTOMATIZON
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedApp.capabilities.map((cap, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center gap-2 text-[#121316]">
                      <Check className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                      <span className="text-[11px] font-medium">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* PERMISSIONS & SCOPES */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
                  PERMISSIONS GRANTED (OAUTH2 SCOPES)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApp.permissions.map((perm, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-[#4A4B50] border border-stone-200">
                      {perm}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (5 cols): USED IN & ACTION BUTTON */}
            <div className="lg:col-span-5 space-y-5 border-t lg:border-t-0 lg:border-l lg:border-[#EAE7DF] pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between">
              
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
                  USED IN (ACTIVE AUTOMATIONS)
                </span>

                <div className="space-y-2">
                  {selectedApp.automationsUsingIt.map((wf, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onNavigateToAutomations && onNavigateToAutomations()}
                      className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] hover:border-[#15803D] transition-all cursor-pointer flex items-center justify-between text-xs font-bold text-[#121316] group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                        <span>{wf.title}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#75777E] group-hover:text-[#15803D] transition-colors" />
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/80 text-[11px] text-[#15803D] font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{selectedApp.systemHealth}</span>
                </div>
              </div>

              {/* Action Buttons: Configure Live & Manage Connection */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={() => setIsConnectModalOpen(true)}
                  className="w-full sm:flex-1 py-3 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Configure & Test Live</span>
                </button>
                
                <button
                  onClick={() => setIsManageModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-3 rounded-full bg-white hover:bg-[#FAF9F5] border border-[#EAE7DF] text-xs font-bold text-[#121316] transition-all shadow-2xs flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-[#75777E]" />
                  <span>Settings</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* 4. ACTIVE CROSS-APP SYNERGIES (Comment vos outils coopèrent) */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#EAE7DF] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                ACTIVE SYNERGIES
              </span>
              <span className="text-xs font-mono text-[#75777E]">
                &bull; Zero manual data entry
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#121316] mt-1">
              How your connected tools work together automatically
            </h3>
          </div>
          <span className="text-xs font-mono text-[#15803D] font-bold self-start sm:self-auto">
            4 active automated bridges
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#121316] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
                <span className="text-[#75777E]">&rarr;</span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Google Sheets</span>
              </div>
              <span className="text-[10px] font-mono text-[#15803D] font-bold">Instant Sync</span>
            </div>
            <p className="text-[#4A4B50] leading-relaxed">
              Every prospective student who sends a message is automatically recorded as a structured lead in your master student spreadsheet without manual copying.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#121316] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Calendar</span>
                <span className="text-[#75777E]">&rarr;</span>
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </div>
              <span className="text-[10px] font-mono text-[#15803D] font-bold">Intelligent Timer</span>
            </div>
            <p className="text-[#4A4B50] leading-relaxed">
              If an interested student does not book an available lesson slot within 24 hours, Otomatizon sends a polite follow-up with available times and brochure.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#121316] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>M-Pesa</span>
                <span className="text-[#75777E]">&rarr;</span>
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Calendar</span>
              </div>
              <span className="text-[10px] font-mono text-[#15803D] font-bold">Auto-Lock</span>
            </div>
            <p className="text-[#4A4B50] leading-relaxed">
              When student tuition is received via Till/Paybill, the slot is instantly confirmed, Google Meet links are generated, and a confirmation receipt is texted.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-[#121316] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Google Profile</span>
                <span className="text-[#75777E]">&rarr;</span>
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </div>
              <span className="text-[10px] font-mono text-[#15803D] font-bold">Review Engine</span>
            </div>
            <p className="text-[#4A4B50] leading-relaxed">
              Following course completion or exam success, satisfied students automatically receive an invite to leave a verified 5-star review on Google Maps.
            </p>
          </div>

        </div>
      </div>

      {/* 5. FOOTER BAR matching Reference Image 3 */}
      <div className="p-4 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-[#15803D] font-bold">
          <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
          <span>6 connected systems &middot; All business systems operational</span>
        </div>

        <button
          onClick={() => onNavigateToAutomations && onNavigateToAutomations()}
          className="text-xs font-bold text-[#121316] hover:text-[#15803D] transition-colors flex items-center gap-1.5 self-end sm:self-auto"
        >
          <span>View Full Architecture</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Manage Connection Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl max-w-md w-full p-6 space-y-5 animate-scaleIn">
            <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-center">
                  {getAppIcon(selectedApp.id)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#121316]">{selectedApp.name}</h3>
                  <p className="text-xs text-[#75777E] font-mono">OAuth2 Access Manager</p>
                </div>
              </div>

              <button
                onClick={() => setIsManageModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-center text-[#75777E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1 font-mono">
                <div className="text-[10px] text-[#75777E] uppercase">Synchronized Account</div>
                <div className="font-bold text-[#121316]">{selectedApp.accountLinked}</div>
                <div className="text-[10px] text-[#15803D]">AES-256 GCM encryption active</div>
              </div>

              <p className="text-xs text-[#4A4B50] leading-relaxed">
                You can force an immediate OAuth2 token refresh or temporarily disconnect Otomatizon&apos;s access.
              </p>
            </div>

            <div className="pt-2 border-t border-[#EAE7DF] flex items-center justify-between gap-3">
              <button
                onClick={() => setIsManageModalOpen(false)}
                className="px-4 py-2.5 rounded-full bg-[#FAF9F5] hover:bg-[#EAE7DF] text-xs font-bold text-[#121316]"
              >
                Close
              </button>

              <button
                onClick={() => handleToggleConnection(selectedApp.id)}
                disabled={isActionPending}
                className="px-4 py-2.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition-all"
              >
                {isActionPending ? "Updating..." : "Disconnect Access"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Connector Configuration & Test Modal (Phase 1) */}
      <ConnectAppModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        appId={selectedApp.id}
        appName={selectedApp.name}
        onConnected={(id, details) => {
          // Live connection state update
        }}
      />

    </div>
  );
};
