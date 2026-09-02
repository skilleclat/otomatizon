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
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Lock,
  Power,
  ChevronRight
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { IntegrationStatus } from "@/types";
import { ConnectAppModal } from "./ConnectAppModal";

interface AppsViewProps {
  onNavigateToAutomations?: () => void;
}

interface AppConnector {
  id: string;
  name: string;
  category: string;
  role: string;
  status: IntegrationStatus;
  account: string;
  lastSync: string;
  automationsCount: number;
}

const initialConnectors: AppConnector[] = [
  {
    id: "whatsapp_business",
    name: "WhatsApp Business",
    category: "Customer Communication",
    role: "Captures inbound customer inquiries, delivers brochures, and sends automated follow-ups",
    status: "disconnected",
    account: "Not connected",
    lastSync: "Never",
    automationsCount: 0
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    category: "Scheduling & Availability",
    role: "Checks availability in real-time and books Google Meet session slots",
    status: "disconnected",
    account: "Not connected",
    lastSync: "Never",
    automationsCount: 0
  },
  {
    id: "google_sheets",
    name: "Google Sheets",
    category: "Master Data Ledger",
    role: "Logs customer inquiries, maintains rosters, and tracks business revenue",
    status: "disconnected",
    account: "Not connected",
    lastSync: "Never",
    automationsCount: 0
  },
  {
    id: "mpesa",
    name: "Safaricom M-Pesa",
    category: "Mobile Money & Payment",
    role: "Triggers STK Push prompts on customer phones and validates receipt codes automatically",
    status: "disconnected",
    account: "Not connected",
    lastSync: "Never",
    automationsCount: 0
  },
  {
    id: "gmail",
    name: "Gmail",
    category: "Email & Notifications",
    role: "Monitors formal inquiries and sends PDF invoices & receipts",
    status: "disconnected",
    account: "Not connected",
    lastSync: "Never",
    automationsCount: 0
  },
  {
    id: "google_business",
    name: "Google Business Profile",
    category: "Local Maps & Reviews",
    role: "Attracts local clients on Google Maps and collects verified 5-star reviews",
    status: "disconnected",
    account: "Not connected",
    lastSync: "Never",
    automationsCount: 0
  },
  {
    id: "google_drive",
    name: "Google Drive",
    category: "Course Materials & Storage",
    role: "Automatically generates shared client folders and attaches documents",
    status: "disconnected",
    account: "Not connected",
    lastSync: "Never",
    automationsCount: 0
  }
];

export const AppsView: React.FC<AppsViewProps> = ({ onNavigateToAutomations }) => {
  const { state } = useOtomatizonStore();
  const [connectors, setConnectors] = useState<AppConnector[]>(initialConnectors);
  const [activeModalApp, setActiveModalApp] = useState<AppConnector | null>(null);

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
      case "google_drive":
        return <HardDrive className="w-5 h-5 text-amber-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#15803D]" />;
    }
  };

  const handleToggleConnect = (connector: AppConnector) => {
    if (connector.status === "connected") {
      // Disconnect directly
      setConnectors(prev => prev.map(c => 
        c.id === connector.id 
          ? { ...c, status: "disconnected" as IntegrationStatus, account: "Not connected", lastSync: "Disconnected" }
          : c
      ));
    } else {
      // Open clean Claude-style connection modal
      setActiveModalApp(connector);
    }
  };

  const handleAppConnected = (appId: string, details: any) => {
    setConnectors(prev => prev.map(c => 
      c.id === appId 
        ? { 
            ...c, 
            status: "connected" as IntegrationStatus, 
            account: details.account || c.account,
            lastSync: "Just now"
          }
        : c
    ));
    setActiveModalApp(null);
  };

  const connectedCount = connectors.filter(c => c.status === "connected").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* 1. Header with Clean Status */}
      <div className="border-b border-[#EAE7DF] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              INTEGRATIONS
            </span>
            <span className="text-xs font-mono text-[#75777E]">
              &bull; {connectedCount} of {connectors.length} tools active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121316] tracking-tight">
            Connected Business Systems
          </h1>
          <p className="text-xs sm:text-sm text-[#4A4B50] font-normal">
            Otomatizon connects your tools and makes them work together as a unified business system.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#75777E] bg-white px-3.5 py-2 rounded-2xl border border-[#EAE7DF] shadow-2xs self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-[#15803D]" />
          <span>AES-256 Encryption &middot; Official OAuth2</span>
        </div>
      </div>

      {/* 2. Visual System Architecture Overview */}
      <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7DF] pb-4">
          <div>
            <h2 className="text-sm font-bold text-[#121316] flex items-center gap-2">
              <span>Business System Architecture</span>
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
            </h2>
            <p className="text-xs text-[#75777E] mt-0.5">
              Information flows automatically between your inbound channels, records, and payment gateways.
            </p>
          </div>
          {onNavigateToAutomations && (
            <button
              onClick={onNavigateToAutomations}
              className="text-xs font-mono font-bold text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>View Active Automations &rarr;</span>
            </button>
          )}
        </div>

        {/* Dynamic Connected Pills Bar */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          {connectors.map((c) => (
            <div
              key={c.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition-all ${
                c.status === "connected"
                  ? "bg-[#FAF9F5] border-[#EAE7DF] text-[#121316]"
                  : "bg-white border-dashed border-[#EAE7DF] text-[#75777E] opacity-60"
              }`}
            >
              {getAppIcon(c.id)}
              <span className="font-medium text-[11px]">{c.name}</span>
              {c.status === "connected" ? (
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
              ) : (
                <span className="text-[10px] text-[#75777E]">&middot; Offline</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Connectors List (Claude Style) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#75777E] font-bold">
            Available Integrations ({connectors.length})
          </h2>
          <span className="text-xs text-[#75777E] font-mono">1-Click Authorization</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {connectors.map((connector) => {
            const isConn = connector.status === "connected";

            return (
              <div
                key={connector.id}
                className={`p-5 rounded-3xl bg-white border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-[#15803D]/40 ${
                  isConn ? "border-[#EAE7DF]" : "border-[#EAE7DF] bg-[#FAF9F5]/40"
                }`}
              >
                {/* App Info Left */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-center shrink-0 mt-0.5">
                    {getAppIcon(connector.id)}
                  </div>
                  
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-[#121316]">
                        {connector.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF9F5] text-[#75777E] border border-[#EAE7DF]">
                        {connector.category}
                      </span>
                      {isConn ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                          Connected
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF9F5] text-[#75777E] border border-[#EAE7DF]">
                          Not connected
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#4A4B50] leading-relaxed">
                      {connector.role}
                    </p>

                    {isConn && (
                      <div className="flex items-center gap-3 pt-0.5 text-[11px] font-mono text-[#75777E]">
                        <span className="truncate">Account: <span className="text-[#121316] font-medium">{connector.account}</span></span>
                        <span>&middot;</span>
                        <span>Synced {connector.lastSync}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons Right */}
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                  {isConn ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setActiveModalApp(connector)}
                        className="px-4 py-2 rounded-full bg-[#FAF9F5] hover:bg-[#F4F2EB] text-[#121316] border border-[#EAE7DF] text-xs font-bold font-mono transition-all cursor-pointer"
                      >
                        Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleConnect(connector)}
                        className="px-3.5 py-2 rounded-full text-xs font-bold font-mono text-[#BE123C] hover:bg-[#FFF1F2] border border-transparent hover:border-[#FECDD3] transition-all cursor-pointer"
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleConnect(connector)}
                      className="px-5 py-2.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <span>Connect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Security & Privacy Guarantee */}
      <div className="p-6 rounded-3xl bg-[#FAF9F5] border border-[#EAE7DF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[#121316]">Bank-Grade Isolation &amp; Zero Data Selling</h4>
            <p className="text-xs text-[#4A4B50]">
              Otomatizon communicates directly through official Meta, Google, and Safaricom APIs. Your credentials never touch untrusted servers.
            </p>
          </div>
        </div>
      </div>

      {/* Claude-Style 1-Click Connect Modal */}
      {activeModalApp && (
        <ConnectAppModal
          appId={activeModalApp.id}
          appName={activeModalApp.name}
          isOpen={!!activeModalApp}
          onClose={() => setActiveModalApp(null)}
          onConnected={handleAppConnected}
          isConnected={activeModalApp.status === "connected"}
        />
      )}

    </div>
  );
};
