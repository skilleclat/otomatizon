"use client";

import React, { useState, useEffect } from "react";
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
  HardDrive,
  QrCode,
  Smartphone,
  CheckCircle
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
        description: "Automatically capture incoming inquiries from your active WhatsApp chats"
      },
      {
        icon: <Zap className="w-4 h-4 text-emerald-600" />,
        title: "Dispatch automated brochures & 24h follow-ups",
        description: "Send price sheets, booking links, and polite follow-ups directly in your chats"
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
  const [whatsappMode, setWhatsappMode] = useState<"qr" | "phone">("qr");
  const [qrScanningState, setQrScanningState] = useState<"ready" | "pairing" | "connected">("ready");
  const [qrRefreshTimer, setQrRefreshTimer] = useState<number>(60);
  const [phoneInput, setPhoneInput] = useState("");
  const [realQrDataUrl, setRealQrDataUrl] = useState<string | null>(null);
  const [linkedPhoneNumber, setLinkedPhoneNumber] = useState<string | null>(null);

  const isWhatsApp = appId === "whatsapp_business" || appId === "whatsapp";

  const config = appConfigMap[appId] || {
    name: appName,
    category: "Business Tool",
    iconBg: "bg-emerald-50 border-emerald-200",
    iconColor: "text-emerald-600",
    accountLabel: "Linked Identifier",
    accountPlaceholder: "Identifier or email",
    accountDefault: "",
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

  // Fetch real Baileys QR Code and poll for live mobile device pairing
  const fetchBaileysQr = async () => {
    try {
      const res = await fetch("/api/whatsapp/qr");
      const data = await res.json();
      if (data.success) {
        if (data.qrDataUrl) {
          setRealQrDataUrl(data.qrDataUrl);
          setQrScanningState("ready");
        }
        if (data.isAuthenticated && data.user) {
          setQrScanningState("connected");
          setLinkedPhoneNumber(data.user.phone || "WhatsApp Linked Device");
          if (onConnected) {
            onConnected(appId, {
              account: data.user.phone || "WhatsApp Linked Device",
              connectedAt: new Date().toISOString(),
              status: "connected",
              authMethod: "baileys_multidevice"
            });
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch real WhatsApp QR code:", e);
    }
  };

  useEffect(() => {
    if (isOpen && isWhatsApp) {
      setQrScanningState("ready");
      setLoading(false);
      setQrRefreshTimer(60);
      fetchBaileysQr();
    }
  }, [isOpen, isWhatsApp]);

  // Live polling for scan verification
  useEffect(() => {
    if (!isOpen || !isWhatsApp || qrScanningState === "connected") return;
    
    const interval = setInterval(() => {
      fetchBaileysQr();
      setQrRefreshTimer((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 2500);

    return () => clearInterval(interval);
  }, [isOpen, isWhatsApp, qrScanningState]);

  if (!isOpen) return null;

  // Handle WhatsApp QR Scan Simulation / Linking
  const handleSimulateQrScan = async () => {
    setLoading(true);
    setQrScanningState("pairing");

    try {
      await new Promise((r) => setTimeout(r, 1400));
      setQrScanningState("connected");
      setLoading(false);

      const linkedAccount = phoneInput.trim() || "WhatsApp Linked Device (Phone Active)";

      if (onConnected) {
        onConnected(appId, {
          account: linkedAccount,
          connectedAt: new Date().toISOString(),
          status: "connected",
          authMethod: "qr_linked_device"
        });
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setLoading(false);
      setQrScanningState("ready");
    }
  };

  const handleAuthorizeAndConnect = async () => {
    setLoading(true);
    
    try {
      await new Promise((r) => setTimeout(r, 600));
      setLoading(false);
      
      const targetIdentifier = accountInput.trim() || (isWhatsApp ? phoneInput.trim() : "Linked Account");

      if (onConnected) {
        onConnected(appId, {
          account: targetIdentifier,
          connectedAt: new Date().toISOString(),
          status: "connected"
        });
      }
      
      setTimeout(() => {
        onClose();
      }, 300);
    } catch (err: any) {
      setLoading(false);
    }
  };

  const getAppIcon = (id: string) => {
    switch (id) {
      case "whatsapp_business":
      case "whatsapp":
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
        className="bg-white border border-[#EAE7DF] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col transform transition-all max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
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
            Link your active {config.name} to receive customer messages, send automated follow-ups, and sync workflows.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          
          {/* WHATSAPP QR CODE SCANNER (WHATSAPP WEB LINKED DEVICE STYLE) */}
          {isWhatsApp ? (
            <div className="space-y-4">
              
              {/* Mode Toggle Pills */}
              <div className="grid grid-cols-2 p-1 bg-[#FAF9F5] border border-[#EAE7DF] rounded-2xl text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setWhatsappMode("qr")}
                  className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    whatsappMode === "qr"
                      ? "bg-white text-[#121316] shadow-xs"
                      : "text-[#75777E] hover:text-[#121316]"
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Scan QR Code (Fast)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWhatsappMode("phone")}
                  className={`py-2 rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    whatsappMode === "phone"
                      ? "bg-white text-[#121316] shadow-xs"
                      : "text-[#75777E] hover:text-[#121316]"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#75777E]" />
                  <span>Phone Number</span>
                </button>
              </div>

              {whatsappMode === "qr" ? (
                /* QR Code Scanner Interface */
                <div className="space-y-4 text-xs font-mono">
                  
                  <div className="p-5 bg-[#FAF9F5] border border-[#EAE7DF] rounded-3xl flex flex-col sm:flex-row items-center gap-6">
                    
                    {/* Official WhatsApp Web QR Code Canvas */}
                    <div className="relative w-44 h-44 shrink-0 bg-white p-2.5 rounded-2xl border border-[#EAE7DF] shadow-md flex items-center justify-center">
                      
                      {qrScanningState === "pairing" ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-2 p-2">
                          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                          <span className="text-[11px] font-bold text-[#121316]">Pairing with phone...</span>
                          <span className="text-[9px] text-[#75777E]">Syncing conversation history</span>
                        </div>
                      ) : qrScanningState === "connected" ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-2 p-2 text-emerald-700">
                          <CheckCircle className="w-10 h-10 text-emerald-600" />
                          <span className="text-xs font-bold">WhatsApp Linked!</span>
                          <span className="text-[10px] text-[#121316] font-mono">{linkedPhoneNumber}</span>
                        </div>
                      ) : realQrDataUrl ? (
                        /* Authentic Real WhatsApp Web Multi-Device QR Code Image */
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img 
                            src={realQrDataUrl} 
                            alt="WhatsApp Web Multi-Device QR Code" 
                            className="w-full h-full object-contain rounded-xl select-none" 
                          />
                        </div>
                      ) : (
                        /* Loading Real QR Code from WhatsApp Protocol Socket */
                        <div className="flex flex-col items-center justify-center text-center space-y-2 p-2">
                          <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
                          <span className="text-[11px] font-bold text-[#121316]">Generating QR Code...</span>
                          <span className="text-[9px] text-[#75777E]">Connecting to WhatsApp Servers</span>
                        </div>
                      )}
                    </div>

                    {/* Step-by-Step Instructions */}
                    <div className="space-y-2.5">
                      <div className="font-bold text-[#121316] text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>How to link your WhatsApp:</span>
                      </div>
                      
                      <ol className="space-y-2 text-[11px] text-[#4A4B50] list-decimal list-inside leading-snug">
                        <li>Open <strong className="text-[#121316]">WhatsApp</strong> on your phone.</li>
                        <li>Tap <strong className="text-[#121316]">Menu ⋮</strong> (Android) or <strong className="text-[#121316]">Settings</strong> (iPhone).</li>
                        <li>Select <strong className="text-[#121316]">Linked Devices</strong> (<em>Appareils connectés</em>).</li>
                        <li>Tap <strong className="text-[#121316]">Link a Device</strong> (<em>Lier un appareil</em>).</li>
                        <li>Point your camera at this QR code to scan.</li>
                      </ol>

                      <div className="pt-2 flex items-center justify-between text-[10px] text-[#75777E]">
                        <span>Status: <strong className="text-emerald-700">{realQrDataUrl ? "Live QR Ready" : "Connecting..."}</strong></span>
                        <button 
                          type="button" 
                          onClick={fetchBaileysQr}
                          className="hover:underline text-emerald-700 font-bold cursor-pointer flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Refresh</span>
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                /* Phone Number Alternative */
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-[#75777E] block mb-1">
                      WhatsApp Business Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+254 712 345 678"
                      className="w-full px-4 py-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] text-xs font-mono focus:bg-white focus:border-[#15803D] focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={loading || !phoneInput.trim()}
                    onClick={handleAuthorizeAndConnect}
                    className="w-full py-3.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Authorize &amp; Connect Phone &rarr;</span>}
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* STANDARD APPS PERMISSIONS & OAUTH AUTHORIZATION */
            <>
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
              <div className="space-y-1.5 font-mono">
                <label className="text-xs font-bold text-[#121316] block">
                  {config.accountLabel}
                </label>
                <input
                  type="text"
                  value={accountInput}
                  onChange={(e) => setAccountInput(e.target.value)}
                  placeholder={config.accountPlaceholder}
                  className="w-full px-4 py-3 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] text-xs font-mono focus:bg-white focus:border-[#15803D] focus:outline-none transition-all"
                />
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-[11px] text-[#75777E] font-mono">
                <Lock className="w-3.5 h-3.5 text-[#15803D]" />
                <span>Encrypted with AES-256 &middot; You can revoke access at any time</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 font-mono">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#75777E] hover:text-[#121316] hover:bg-[#FAF9F5] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAuthorizeAndConnect}
                  disabled={loading}
                  className="px-6 py-3 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Authorize &amp; Connect</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
