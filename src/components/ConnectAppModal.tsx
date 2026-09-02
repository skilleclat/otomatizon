"use client";

import React, { useState } from "react";
import { 
  X, 
  Check, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  ArrowRight,
  Zap,
  Sparkles,
  MessageSquare,
  Mail,
  Calendar,
  FileSpreadsheet,
  CreditCard,
  MapPin,
  HardDrive
} from "lucide-react";

interface ConnectAppModalProps {
  appId: string;
  appName: string;
  isOpen: boolean;
  onClose: () => void;
  onConnected?: (appId: string, details: any) => void;
  isConnected?: boolean;
}

interface AppPermissionInfo {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const appConfigMap: Record<string, {
  name: string;
  category: string;
  iconBg: string;
  iconColor: string;
  accountPlaceholder: string;
  accountDefault: string;
  accountLabel: string;
  permissions: AppPermissionInfo[];
}> = {
  whatsapp_business: {
    name: "WhatsApp Business",
    category: "Customer Messaging",
    iconBg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    accountLabel: "WhatsApp Business Phone Number",
    accountPlaceholder: "+254 7XX XXX XXX",
    accountDefault: "",
    permissions: [
      {
        icon: <MessageSquare className="w-4 h-4 text-emerald-600" />,
        title: "Receive incoming customer inquiries",
        description: "Automatically read new messages sent to your business WhatsApp"
      },
      {
        icon: <Zap className="w-4 h-4 text-emerald-600" />,
        title: "Send details & automated follow-ups",
        description: "Deliver information and polite follow-ups without manual typing"
      }
    ]
  },
  google_calendar: {
    name: "Google Calendar",
    category: "Scheduling & Availability",
    iconBg: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    accountLabel: "Google Account Email",
    accountPlaceholder: "name@gmail.com",
    accountDefault: "",
    permissions: [
      {
        icon: <Calendar className="w-4 h-4 text-blue-600" />,
        title: "Inspect real-time schedule availability",
        description: "Check free slots to prevent double bookings"
      },
      {
        icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
        title: "Create confirmed calendar sessions",
        description: "Generate calendar events and meeting links upon confirmation"
      }
    ]
  },
  google_sheets: {
    name: "Google Sheets",
    category: "Data & Lead Ledger",
    iconBg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    accountLabel: "Master Sheet Name or Google Email",
    accountPlaceholder: "My_Customer_Roster.xlsx",
    accountDefault: "",
    permissions: [
      {
        icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
        title: "Record new leads and inquiries",
        description: "Automatically append qualified customer details into your sheet"
      },
      {
        icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
        title: "Sync history & business revenue",
        description: "Maintain updated booking statuses and summaries"
      }
    ]
  },
  gmail: {
    name: "Gmail",
    category: "Email Notifications",
    iconBg: "bg-red-50 border-red-200",
    iconColor: "text-red-600",
    accountLabel: "Gmail Account Email",
    accountPlaceholder: "name@gmail.com",
    accountDefault: "",
    permissions: [
      {
        icon: <Mail className="w-4 h-4 text-red-600" />,
        title: "Monitor inquiry emails",
        description: "Capture customer requests sent via email"
      },
      {
        icon: <Zap className="w-4 h-4 text-red-600" />,
        title: "Send invoices & receipts",
        description: "Deliver booking confirmations and receipts directly"
      }
    ]
  },
  mpesa: {
    name: "Safaricom M-Pesa",
    category: "Mobile Payments",
    iconBg: "bg-emerald-50 border-emerald-300",
    iconColor: "text-emerald-700",
    accountLabel: "Till / Paybill Number & Phone",
    accountPlaceholder: "Till / Paybill: XXXXXX",
    accountDefault: "",
    permissions: [
      {
        icon: <CreditCard className="w-4 h-4 text-emerald-700" />,
        title: "Initiate STK Push prompts on customer phone",
        description: "Trigger secure PIN prompt directly on handset for instant payment"
      },
      {
        icon: <ShieldCheck className="w-4 h-4 text-emerald-700" />,
        title: "Verify Safaricom receipt codes",
        description: "Validate received transaction codes in real time"
      }
    ]
  },
  google_business: {
    name: "Google Business Profile",
    category: "Local Visibility",
    iconBg: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    accountLabel: "Google Business Profile Location",
    accountPlaceholder: "My Business Name (City)",
    accountDefault: "",
    permissions: [
      {
        icon: <MapPin className="w-4 h-4 text-blue-600" />,
        title: "Track customer calls & directions",
        description: "Identify prospective inquiries originating from Google Maps"
      },
      {
        icon: <Sparkles className="w-4 h-4 text-blue-600" />,
        title: "Request verified reviews",
        description: "Send automated 5-star review invites after completed services"
      }
    ]
  },
  google_drive: {
    name: "Google Drive",
    category: "Document Storage",
    iconBg: "bg-amber-50 border-amber-200",
    iconColor: "text-amber-600",
    accountLabel: "Google Drive Account Email",
    accountPlaceholder: "name@gmail.com",
    accountDefault: "",
    permissions: [
      {
        icon: <HardDrive className="w-4 h-4 text-amber-600" />,
        title: "Create customer folders",
        description: "Organize client files and documents automatically"
      }
    ]
  }
};

export const ConnectAppModal: React.FC<ConnectAppModalProps> = ({
  appId,
  appName,
  isOpen,
  onClose,
  onConnected,
  isConnected = false
}) => {
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testResult, setTestResult] = useState<string | null>(null);

  const config = appConfigMap[appId] || {
    name: appName,
    category: "Business Tool",
    iconBg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    accountLabel: "Linked Identifier",
    accountPlaceholder: "Identifier or email",
    accountDefault: "workspace.user@business.com",
    permissions: [
      {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        title: "Read required business events",
        description: "Inspect necessary triggers to run your automations"
      },
      {
        icon: <Zap className="w-4 h-4 text-emerald-600" />,
        title: "Execute automated actions",
        description: "Perform scheduled tasks across your workflow"
      }
    ]
  };

  const [accountInput, setAccountInput] = useState(config.accountDefault);

  if (!isOpen) return null;

  const handleAuthorizeAndConnect = async () => {
    setLoading(true);
    setTestStatus("testing");
    
    // Simulate real OAuth handshake / webhook verification (1 second standard Claude style)
    try {
      await new Promise((r) => setTimeout(r, 800));
      setLoading(false);
      setTestStatus("success");
      setTestResult(`${config.name} connected successfully with ${accountInput}`);
      
      if (onConnected) {
        onConnected(appId, {
          account: accountInput,
          connectedAt: new Date().toISOString(),
          status: "connected"
        });
      }
      
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setLoading(false);
      setTestStatus("error");
      setTestResult(err?.message || "Failed to authorize integration");
    }
  };

  const getAppIcon = (id: string) => {
    switch (id) {
      case "whatsapp_business":
        return <MessageSquare className="w-6 h-6 text-emerald-600" />;
      case "gmail":
        return <Mail className="w-6 h-6 text-red-600" />;
      case "google_business":
        return <MapPin className="w-6 h-6 text-blue-600" />;
      case "google_calendar":
        return <Calendar className="w-6 h-6 text-blue-600" />;
      case "google_sheets":
        return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
      case "mpesa":
        return <CreditCard className="w-6 h-6 text-emerald-700" />;
      default:
        return <Sparkles className="w-6 h-6 text-[#15803D]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121316]/50 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white border border-[#EAE7DF] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header - Simple & Clean Claude Connector Style */}
        <div className="p-6 border-b border-[#EAE7DF] relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#FAF9F5] text-[#75777E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Connected Logos (App <-> Otomatizon) */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-2xl ${config.iconBg} border flex items-center justify-center shadow-2xs`}>
              {getAppIcon(appId)}
            </div>
            
            <div className="flex items-center gap-1.5 text-[#75777E]">
              <span className="w-4 h-px bg-[#EAE7DF]" />
              <ArrowRight className="w-3.5 h-3.5" />
              <span className="w-4 h-px bg-[#EAE7DF]" />
            </div>

            <div className="w-12 h-12 rounded-2xl bg-[#002E25] border border-[#15803D]/30 flex items-center justify-center shadow-2xs">
              <span className="text-white font-extrabold font-mono text-base">O</span>
            </div>
          </div>

          <h2 className="text-lg font-bold text-[#121316]">
            Connect {config.name}
          </h2>
          <p className="text-xs text-[#4A4B50] mt-1 leading-relaxed">
            Allow Otomatizon to access {config.name} to run your automated customer workflows.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* Permissions Section */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
              What Otomatizon will be able to do
            </span>

            <div className="space-y-2.5">
              {config.permissions.map((perm, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF]">
                  <div className="mt-0.5 shrink-0">
                    {perm.icon}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#121316]">{perm.title}</div>
                    <div className="text-[11px] text-[#75777E] leading-relaxed">{perm.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#121316] block">
              {config.accountLabel}
            </label>
            <input
              type="text"
              value={accountInput}
              onChange={(e) => setAccountInput(e.target.value)}
              placeholder={config.accountPlaceholder}
              className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-[#EAE7DF] rounded-xl text-xs text-[#121316] font-mono focus:outline-none focus:border-[#15803D] focus:bg-white transition-all"
            />
          </div>

          {/* Status Feedback */}
          {testStatus === "success" && (
            <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl flex items-center gap-2.5 text-xs text-[#15803D] font-medium animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}

          {testStatus === "error" && (
            <div className="p-3 bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl flex items-center gap-2.5 text-xs text-[#BE123C] font-medium animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{testResult}</span>
            </div>
          )}

          {/* Security Note */}
          <div className="flex items-center gap-2 text-[11px] text-[#75777E] pt-1">
            <Lock className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
            <span>Encrypted with AES-256 &middot; You can revoke access at any time</span>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-6 bg-[#FAF9F5] border-t border-[#EAE7DF] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full text-xs font-bold text-[#4A4B50] hover:text-[#121316] hover:bg-white border border-transparent hover:border-[#EAE7DF] transition-all cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleAuthorizeAndConnect}
            disabled={loading || testStatus === "success"}
            className="px-6 py-2.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : testStatus === "success" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Connected</span>
              </>
            ) : (
              <>
                <span>Authorize &amp; Connect</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
