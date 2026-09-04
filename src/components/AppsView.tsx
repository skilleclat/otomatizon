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
  ChevronRight,
  Video,
  Layers
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { IntegrationStatus } from "@/types";
import { ConnectAppModal } from "./ConnectAppModal";
import { LiveIntelligenceRunnerModal } from "./LiveIntelligenceRunnerModal";

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
    role: "Captures inbound customer inquiries, delivers brochures, and sends automated follow-ups via Linked Device",
    status: "disconnected",
    account: "Not connected",
    lastSync: "Never",
    automationsCount: 0
  },
  {
    id: "google_workspace",
    name: "Gmail & Google Workspace Suite",
    category: "Master Business Suite",
    role: "Single Google authentication that unifies Gmail, Google Calendar, Google Meet, Google Sheets, and Google Drive",
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
    id: "google_business",
    name: "Google Business Profile",
    category: "Local Maps & Reviews",
    role: "Attracts local clients on Google Maps and collects verified 5-star reviews automatically",
    status: "disconnected",
    account: "Not connected",
    lastSync: "Never",
    automationsCount: 0
  }
];

export const AppsView: React.FC<AppsViewProps> = ({ onNavigateToAutomations }) => {
  const { state, toggleIntegration } = useOtomatizonStore();

  const getComputedConnectors = (currentIntegrations: any[]): AppConnector[] => {
    return initialConnectors.map((c) => {
      let isConnected = false;
      let accountStr = c.account;
      let lastSyncStr = c.lastSync;

      if (c.id === "google_workspace") {
        const gConn = (currentIntegrations || []).find((i) => 
          (i.id.startsWith("google") || i.id === "gmail") && 
          (i.connected === true || i.status === "connected" || i.status === "active")
        );
        if (gConn) {
          isConnected = true;
          accountStr = gConn.account || gConn.accountEmail || "skilleclat@gmail.com";
          lastSyncStr = gConn.lastSyncedAt || "Just now";
        }
      } else if (c.id === "whatsapp_business") {
        const waConn = (currentIntegrations || []).find((i) => 
          i.id.startsWith("whatsapp") && 
          (i.connected === true || i.status === "connected" || i.status === "active")
        );
        if (waConn) {
          isConnected = true;
          accountStr = waConn.account || waConn.accountPhone || "+254 743 898 803";
          lastSyncStr = waConn.lastSyncedAt || "Just now";
        }
      } else if (c.id === "mpesa") {
        const mConn = (currentIntegrations || []).find((i) => 
          (i.id === "mpesa" || i.id === "mpesa_safaricom" || i.id.startsWith("mpesa")) && 
          (i.connected === true || i.status === "connected" || i.status === "active")
        );
        if (mConn) {
          isConnected = true;
          accountStr = mConn.account || mConn.accountIdentifier || "Paybill 174379 · +254 743 898 803";
          lastSyncStr = mConn.lastSyncedAt || "Just now";
        }
      } else if (c.id === "google_business") {
        const gbConn = (currentIntegrations || []).find((i) => 
          i.id === "google_business" && 
          (i.connected === true || i.status === "connected" || i.status === "active")
        );
        if (gbConn) {
          isConnected = true;
          accountStr = gbConn.account || "Google Maps Verified";
          lastSyncStr = gbConn.lastSyncedAt || "Just now";
        }
      }

      return {
        ...c,
        status: (isConnected ? "connected" : "disconnected") as IntegrationStatus,
        account: isConnected ? (accountStr !== "Not connected" ? accountStr : (c.id === "google_workspace" ? "skilleclat@gmail.com" : c.id === "mpesa" ? "Paybill 174379 · +254 743 898 803" : "+254 743 898 803")) : "Not connected",
        lastSync: isConnected ? (lastSyncStr !== "Never" ? lastSyncStr : "Just now") : "Never"
      };
    });
  };

  const [connectors, setConnectors] = useState<AppConnector[]>(() => getComputedConnectors(state.integrations));
  const [activeModalApp, setActiveModalApp] = useState<AppConnector | null>(null);
  const [isLiveTraceOpen, setIsLiveTraceOpen] = useState<boolean>(false);

  // Synchronize connectors with store & server database
  React.useEffect(() => {
    setConnectors(getComputedConnectors(state.integrations));

    // Query server state for live verification
    fetch("/api/state")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.connections && Array.isArray(data.connections)) {
          setConnectors((prev) =>
            prev.map((c) => {
              const sc = data.connections.find((item: any) =>
                item.id === c.id ||
                (c.id === "google_workspace" && (item.id.startsWith("google") || item.id === "gmail")) ||
                (c.id === "whatsapp_business" && item.id.startsWith("whatsapp")) ||
                (c.id === "mpesa" && (item.id.startsWith("mpesa") || item.id === "mpesa_safaricom" || item.id === "mpesa_daraja"))
              );
              if (sc && sc.connected !== false && sc.status !== "disconnected") {
                return {
                  ...c,
                  status: "connected" as IntegrationStatus,
                  account: sc.account || c.account,
                  lastSync: sc.lastSyncAt ? "Just now" : c.lastSync
                };
              }
              return c;
            })
          );
        }
      })
      .catch(() => {});
  }, [state.integrations]);

  // Sub-services of Google Workspace
  const googleWorkspaceSubServices = [
    { id: "gmail", name: "Gmail", icon: <Mail className="w-3.5 h-3.5 text-red-600" />, desc: "Inquiries & Invoicing" },
    { id: "google_calendar", name: "Calendar", icon: <Calendar className="w-3.5 h-3.5 text-blue-600" />, desc: "Slot Availability" },
    { id: "google_meet", name: "Google Meet", icon: <Video className="w-3.5 h-3.5 text-emerald-600" />, desc: "1-on-1 Video Links" },
    { id: "google_sheets", name: "Sheets", icon: <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />, desc: "Lead & Revenue Ledger" },
    { id: "google_drive", name: "Drive", icon: <HardDrive className="w-3.5 h-3.5 text-amber-600" />, desc: "Client Storage" },
  ];

  const getAppIcon = (id: string) => {
    switch (id) {
      case "whatsapp_business":
      case "whatsapp":
        return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case "google_workspace":
      case "gmail":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
        );
      case "google_business":
        return <MapPin className="w-5 h-5 text-blue-600" />;
      case "mpesa":
        return <CreditCard className="w-5 h-5 text-emerald-700" />;
      default:
        return <Sparkles className="w-5 h-5 text-[#15803D]" />;
    }
  };

  const handleToggleConnect = (connector: AppConnector) => {
    if (connector.status === "connected") {
      setConnectors((prev) =>
        prev.map((c) =>
          c.id === connector.id
            ? { ...c, status: "disconnected" as IntegrationStatus, account: "Not connected", lastSync: "Disconnected" }
            : c
        )
      );
      if (connector.id === "mpesa" || connector.id === "mpesa_safaricom") {
        fetch(`/api/connectors/mpesa/disconnect?orgId=${encodeURIComponent(state.organization.id)}`, { method: "POST" }).catch(() => {});
      }
      if (typeof toggleIntegration === "function") {
        toggleIntegration(connector.id, false);
      }
    } else {
      setActiveModalApp(connector);
    }
  };

  const handleAppConnected = (appId: string, details: any) => {
    const targetAccount = details?.account || (
      appId === "google_workspace" || appId.startsWith("google") || appId === "gmail"
        ? "skilleclat@gmail.com"
        : appId.startsWith("mpesa")
        ? "Paybill 174379 · +254 743 898 803"
        : "+254 743 898 803"
    );
    
    setConnectors((prev) =>
      prev.map((c) =>
        c.id === appId || (appId.startsWith("google") && c.id === "google_workspace") || (appId === "gmail" && c.id === "google_workspace") || (appId.startsWith("mpesa") && c.id === "mpesa")
          ? {
              ...c,
              status: "connected" as IntegrationStatus,
              account: targetAccount,
              lastSync: "Just now"
            }
          : c
      )
    );

    if (typeof toggleIntegration === "function") {
      toggleIntegration(appId, true, { account: targetAccount, authType: details?.authType || details?.authMethod });
    }
    setActiveModalApp(null);
  };

  const isGoogleConnected = connectors.find(c => c.id === "google_workspace")?.status === "connected";
  const googleAccountName = connectors.find(c => c.id === "google_workspace")?.account || "Not connected";
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
              &bull; {connectedCount} master systems active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121316] tracking-tight">
            Connected Business Systems
          </h1>
          <p className="text-xs sm:text-sm text-[#4A4B50] font-normal">
            Otomatizon connects your everyday free tools (WhatsApp, Gmail, Google Workspace, M-Pesa) and makes them operate as one intelligent system.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsLiveTraceOpen(true)}
            className="px-4 py-2 rounded-2xl bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Test Live AI Orchestration</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-[#75777E] bg-white px-3.5 py-2 rounded-2xl border border-[#EAE7DF] shadow-2xs self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-[#15803D]" />
            <span>AES-256 Encryption &middot; Official OAuth2</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Architecture Pipeline */}
      <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#EAE7DF] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EAE7DF] pb-4">
          <div>
            <h2 className="text-sm font-bold text-[#121316] flex items-center gap-2">
              <span>Business System Architecture</span>
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
            </h2>
            <p className="text-xs text-[#75777E] mt-0.5">
              Information flows automatically between WhatsApp, Gmail, Google Sheets, Google Calendar/Meet, and Safaricom M-Pesa.
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

      {/* 3. Master Connectors List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-mono uppercase tracking-widest text-[#75777E] font-bold">
            Master Integration Connectors
          </h2>
          <span className="text-xs text-[#75777E] font-mono">1-Click Authorization</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {connectors.map((connector) => {
            const isConn = connector.status === "connected";
            const isGoogleSuite = connector.id === "google_workspace";

            return (
              <div
                key={connector.id}
                className={`p-6 rounded-3xl bg-white border transition-all flex flex-col gap-4 shadow-sm hover:border-[#15803D]/40 ${
                  isConn ? "border-[#EAE7DF]" : "border-[#EAE7DF] bg-[#FAF9F5]/30"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* App Info Left */}
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-center shrink-0 mt-0.5">
                      {getAppIcon(connector.id)}
                    </div>
                    
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#121316]">
                          {connector.name}
                        </h3>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FAF9F5] text-[#75777E] border border-[#EAE7DF]">
                          {connector.category}
                        </span>
                        {isConn ? (
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                            Connected &middot; Live
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#FAF9F5] text-[#75777E] border border-[#EAE7DF]">
                            Not connected
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#4A4B50] leading-relaxed">
                        {connector.role}
                      </p>

                      {isConn && (
                        <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[#75777E]">
                          <span className="truncate">Account: <span className="text-[#121316] font-bold">{connector.account}</span></span>
                          <span>&middot;</span>
                          <span>Synced {connector.lastSync}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Connect / Disconnect Action Button */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    {isConn ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleConnect(connector)}
                          className="px-4 py-2 rounded-full border border-[#EAE7DF] bg-[#FAF9F5] hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs font-mono font-medium text-[#75777E] transition-all cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleToggleConnect(connector)}
                        className="px-5 py-2.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all flex items-center gap-1.5 shadow-xs cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span>Connect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub-Services Pill Grid for Google Workspace */}
                {isGoogleSuite && (
                  <div className="pt-3 border-t border-[#EAE7DF] mt-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold">
                        Included Google Services ({googleWorkspaceSubServices.length}):
                      </span>
                      {isConn && (
                        <span className="text-[10px] font-mono text-[#15803D] font-bold">
                          All 5 Services Automated
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {googleWorkspaceSubServices.map((srv) => (
                        <div
                          key={srv.id}
                          className={`p-2.5 rounded-2xl border text-xs flex flex-col gap-1 transition-all ${
                            isConn
                              ? "bg-[#ECFDF5]/50 border-[#A7F3D0] text-[#121316]"
                              : "bg-[#FAF9F5] border-[#EAE7DF] text-[#75777E] opacity-75"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {srv.icon}
                            <span className="font-bold text-[11px] truncate">{srv.name}</span>
                          </div>
                          <span className="text-[9px] text-[#75777E] truncate">{srv.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

      {/* Connect Modal */}
      {activeModalApp && (
        <ConnectAppModal
          appId={activeModalApp.id === "google_workspace" ? "gmail" : activeModalApp.id}
          appName={activeModalApp.name}
          isOpen={!!activeModalApp}
          onClose={() => setActiveModalApp(null)}
          onConnected={handleAppConnected}
          isConnected={activeModalApp.status === "connected"}
          organizationId={state.organization.id}
        />
      )}

      {/* Live AI Orchestration Runner Trace Modal */}
      <LiveIntelligenceRunnerModal
        isOpen={isLiveTraceOpen}
        onClose={() => setIsLiveTraceOpen(false)}
        connectedEmail={connectors.find(c => c.id === "google_workspace" && c.status === "connected")?.account || "heritiermaliyabwana1@gmail.com"}
        connectedPhone={connectors.find(c => c.id.startsWith("whatsapp") && c.status === "connected")?.account || "+254 770 979 109"}
      />

    </div>
  );
};
