"use client";

import React, { useState } from "react";
import { 
  X, 
  Clock, 
  MessageSquare, 
  FileSpreadsheet, 
  Calendar, 
  CreditCard, 
  ShieldCheck, 
  Terminal,
  CheckCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { ActivityLog } from "@/types";

interface EventDetailModalProps {
  isOpen: boolean;
  event?: ActivityLog | null;
  log?: ActivityLog | null;
  onClose: () => void;
  onNavigateToApps?: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  isOpen,
  event,
  log,
  onClose,
  onNavigateToApps
}) => {
  const activeItem = event || log;
  const [showRawPayload, setShowRawPayload] = useState(false);

  if (!isOpen || !activeItem) return null;

  const getChannelIcon = (ch?: string) => {
    switch (ch) {
      case "whatsapp":
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case "sheets":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-700" />;
      case "calendar":
        return <Calendar className="w-4 h-4 text-blue-600" />;
      case "mpesa":
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#15803D]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl max-w-lg w-full p-6 sm:p-7 space-y-5 animate-scaleIn">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#EAE7DF] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                OPERATIONAL TELEMETRY
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAE7DF] text-[#75777E] font-bold">
                {activeItem.provenance || "OBSERVED"}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#121316] tracking-tight mt-1">
              {activeItem.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-[#75777E] font-mono">
              <Clock className="w-3 h-3" />
              <span>{activeItem.timestamp}</span>
              <span>&bull;</span>
              <span>Channel: {String(activeItem.channel || "SYSTEM").toUpperCase()}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-center text-[#75777E] hover:text-[#121316] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Core Narrative */}
        <div className="space-y-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-1.5">
            <div className="font-mono text-[10px] text-[#75777E] uppercase tracking-wider">
              Trigger / Inbound Context
            </div>
            <p className="text-[#121316] leading-relaxed">
              {activeItem.description}
            </p>
            {activeItem.entityName && (
              <div className="text-[11px] font-mono text-[#15803D] pt-0.5 font-bold">
                Associated Entity: {activeItem.entityName}
              </div>
            )}
          </div>

          {activeItem.actionTakenByOtomatizon && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-1.5">
              <div className="font-mono text-[10px] text-emerald-800 uppercase tracking-wider font-bold">
                Otomatizon Intelligence Action
              </div>
              <p className="text-emerald-950 leading-relaxed">
                {activeItem.actionTakenByOtomatizon}
              </p>
            </div>
          )}

          {activeItem.businessResult && (
            <div className="p-3.5 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs space-y-1.5">
              <div className="font-mono text-[10px] text-[#75777E] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-[#15803D]" />
                <span className="font-bold text-[#121316]">Verified System Result</span>
              </div>
              <p className="text-[#4A4B50] leading-relaxed">
                {activeItem.businessResult}
              </p>
            </div>
          )}
        </div>

        {/* Raw Telemetry Accordion */}
        <div className="border-t border-[#EAE7DF] pt-3">
          <button
            onClick={() => setShowRawPayload(!showRawPayload)}
            className="text-[11px] font-mono text-[#75777E] hover:text-[#121316] flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{showRawPayload ? "Hide raw JSON telemetry" : "View raw JSON telemetry"}</span>
          </button>

          {showRawPayload && (
            <pre className="mt-2.5 p-3 rounded-xl bg-stone-900 text-emerald-400 font-mono text-[10px] overflow-x-auto select-all max-h-40">
              {JSON.stringify(
                {
                  id: activeItem.id,
                  type: activeItem.type,
                  channel: activeItem.channel,
                  application: activeItem.application,
                  entityName: activeItem.entityName,
                  timestamp: activeItem.timestamp,
                  provenance: activeItem.provenance || "OBSERVED",
                  idempotencyKey: `idemp_${activeItem.id}`,
                  verifiedAt: new Date().toISOString()
                },
                null,
                2
              )}
            </pre>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-[#121316] hover:bg-black text-white text-xs font-bold transition-all shadow-xs"
          >
            Close event inspector
          </button>
        </div>

      </div>
    </div>
  );
};
