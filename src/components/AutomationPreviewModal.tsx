"use client";

import React, { useState } from "react";
import { 
  X, 
  ArrowDown, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  MessageSquare,
  FileSpreadsheet,
  Calendar,
  CreditCard,
  Clock,
  ShieldCheck,
  AlertCircle,
  Link2
} from "lucide-react";
import { Opportunity, IntegrationId } from "@/types";
import { useOtomatizonStore } from "@/lib/store";
import { DS } from "@/lib/design-system";

interface AutomationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  onActivate: () => void;
}

export const AutomationPreviewModal: React.FC<AutomationPreviewModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onActivate
}) => {
  const { state, toggleIntegration } = useOtomatizonStore();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [delayHours, setDelayHours] = useState(24);
  const [isActivated, setIsActivated] = useState(false);
  const [connectingAppId, setConnectingAppId] = useState<string | null>(null);

  if (!isOpen || !opportunity) return null;

  // Determine Required Integrations & Readiness
  const requiredIds: IntegrationId[] = opportunity.requiredIntegrations || ["whatsapp_business", "google_calendar"];
  const missingIntegrations = requiredIds.map(reqId => {
    const found = state.integrations.find(i => i.id === reqId);
    const isConnected = found && found.status === "connected";
    return {
      id: reqId,
      name: found ? found.name : reqId.replace(/_/g, " "),
      isConnected: Boolean(isConnected)
    };
  }).filter(item => !item.isConnected);

  const isReadyToActivate = missingIntegrations.length === 0;

  const handleConnectApp = async (id: IntegrationId) => {
    setConnectingAppId(id);
    setTimeout(async () => {
      await toggleIntegration(id);
      setConnectingAppId(null);
    }, 600);
  };

  const handleActivate = () => {
    if (!isReadyToActivate) return;
    setIsActivated(true);
    setTimeout(() => {
      onActivate();
      setIsActivated(false);
      onClose();
    }, 600);
  };

  const steps = [
    {
      num: "1",
      title: "Inquiry arrives on WhatsApp",
      desc: "Student reaches out inquiring about rates, schedules, or lesson packages.",
      icon: MessageSquare
    },
    {
      num: "2",
      title: "Information brochure delivered automatically",
      desc: "Your course syllabus, pricing details, and booking link are dispatched.",
      icon: MessageSquare
    },
    {
      num: "3",
      title: `Wait ${delayHours} hours and verify calendar booking`,
      desc: "Otomatizon checks whether a session slot was confirmed on Google Calendar.",
      icon: Clock
    },
    {
      num: "4",
      title: "Gentle follow-up if unbooked",
      desc: "A courteous check-in message is sent to answer any remaining questions.",
      icon: Sparkles
    }
  ];

  return (
    <div className={DS.modalOverlay} onClick={onClose}>
      <div 
        className={DS.modalDialog}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={DS.modalHeader}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={isReadyToActivate ? DS.badgeSuccess : "text-[10px] font-mono uppercase font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full"}>
                {isReadyToActivate ? "Ready to Activate" : "Ready to Connect"}
              </span>
              <span className="text-xs text-[#75777E] font-mono">
                {opportunity.impactLevel}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#121316] tracking-tight">
              {opportunity.suggestedWorkflowTitle || "Here's what will happen"}
            </h2>
            <p className="text-xs text-[#4A4B50]">
              Tell Otomatizon how you work. Otomatizon orchestrates the rest.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#75777E] hover:text-[#121316] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Missing Integrations Guard (No Fake Activation) */}
          {!isReadyToActivate && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs">
                    {missingIntegrations.length} {missingIntegrations.length === 1 ? "app needs" : "apps need"} connection before activation
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Otomatizon requires authorized access to execute these actions safely without errors.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {missingIntegrations.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleConnectApp(m.id as IntegrationId)}
                    disabled={connectingAppId === m.id}
                    className="px-3 py-1.5 rounded-full bg-white border border-amber-300 text-amber-900 font-semibold text-[11px] hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Link2 className="w-3 h-3 text-amber-700" />
                    <span>
                      {connectingAppId === m.id ? "Connecting..." : `Connect ${m.name}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 1. WHAT TRIGGERS IT */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
              WHAT TRIGGERS IT
            </span>
            <p className="font-semibold text-[#121316]">
              A new customer inquiry received on WhatsApp or email that hasn&apos;t booked within {delayHours} hours.
            </p>
          </div>

          {/* 2. WHAT OTOMATIZON DOES */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block px-1">
              WHAT OTOMATIZON DOES
            </span>
            
            <div className="space-y-2">
              {steps.map((step, idx) => (
                <React.Fragment key={step.num}>
                  <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-start gap-3.5 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                      {step.num}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#121316]">
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-[#4A4B50] mt-0.5 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {idx < steps.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowDown className="w-3.5 h-3.5 text-[#75777E]" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* 3. WHEN IT STOPS */}
          <div className="space-y-1.5 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
              WHEN IT STOPS
            </span>
            <p className="font-semibold text-[#121316]">
              Stops immediately as soon as the customer books a slot on Google Calendar or replies directly.
            </p>
          </div>

          {/* 4. WHAT APPS IT NEEDS */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-bold block">
              WHAT APPS IT NEEDS
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {requiredIds.map((reqId) => {
                const conn = state.integrations.find(i => i.id === reqId);
                const isConn = conn && conn.status === "connected";

                return (
                  <div 
                    key={reqId}
                    className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5 border ${
                      isConn 
                        ? "bg-white text-[#15803D] border-[#A7F3D0]"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    {isConn ? (
                      <Check className="w-3 h-3 text-[#15803D]" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-amber-700" />
                    )}
                    <span>{conn ? conn.name : reqId}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advanced Technical Details Toggle */}
          <div className="pt-2 border-t border-[#EAE7DF]">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-mono text-[#75777E] hover:text-[#121316] transition-colors"
            >
              <span>Execution details & safety</span>
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showAdvanced && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1.5 text-xs text-[#4A4B50] font-mono animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>Idempotency window: 15 minutes (avoids duplicate messages)</span>
                </div>
                <div>Execution timeout: 30 seconds per webhook</div>
                <div>Rollback behavior: Non-destructive fail-safe</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#EAE7DF] flex items-center justify-between bg-[#FAF9F5]">
          <button
            onClick={onClose}
            className={DS.btnGhost}
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {isReadyToActivate ? (
              <button
                onClick={handleActivate}
                disabled={isActivated}
                className={DS.btnPrimary}
              >
                {isActivated ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Activated!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Activate automation</span>
                  </>
                )}
              </button>
            ) : (
              <button
                disabled
                className="px-5 py-2.5 rounded-full bg-[#EAE7DF] text-[#75777E] text-xs font-bold cursor-not-allowed"
              >
                Connect apps above to activate
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
