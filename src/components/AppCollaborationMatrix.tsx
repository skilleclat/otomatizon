"use client";

import React from "react";
import { 
  MessageSquare, 
  Calendar, 
  FileSpreadsheet, 
  CreditCard, 
  Mail, 
  HardDrive, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";

interface AppCollaborationMatrixProps {
  onNavigateToApps?: () => void;
}

export const AppCollaborationMatrix: React.FC<AppCollaborationMatrixProps> = ({
  onNavigateToApps
}) => {
  const collaborations = [
    {
      id: "collab_lead",
      name: "Lead Acquisition & Conversion",
      activeWorkflows: ["Lead Follow-Up Autopilot"],
      apps: [
        { name: "WhatsApp Business", role: "Inbound Capture & Outreach", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
        { name: "Otomatizon Intelligence", role: "NLP & Intent Extraction", icon: Cpu, color: "text-[#15803D]", bg: "bg-[#ECFDF5]" },
        { name: "Google Sheets", role: "Student Roster Table", icon: FileSpreadsheet, color: "text-emerald-700", bg: "bg-emerald-50" },
        { name: "Google Calendar", role: "Slots & Google Meet", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" }
      ],
      impact: "14 follow-ups / wk · +8.2h saved"
    },
    {
      id: "collab_payment",
      name: "Tuition Payment & Official Receipts",
      activeWorkflows: ["Payment Recovery & M-Pesa"],
      apps: [
        { name: "Safaricom M-Pesa", role: "Daraja Lipa Na M-Pesa STK", icon: CreditCard, color: "text-emerald-700", bg: "bg-emerald-50" },
        { name: "Otomatizon Intelligence", role: "Circuit Breaker & Reconciliation", icon: Cpu, color: "text-[#15803D]", bg: "bg-[#ECFDF5]" },
        { name: "Google Calendar", role: "Confirmed Session Lock", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Gmail", role: "Invoice & Receipt Delivery", icon: Mail, color: "text-rose-600", bg: "bg-rose-50" }
      ],
      impact: "100% payments reconciled"
    }
  ];

  return (
    <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-5 animate-fadeIn">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EAE7DF] pb-4">
        <div>
          <h3 className="text-base font-bold text-[#121316] flex items-center gap-2">
            Inter-Application Collaboration
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] font-bold">
              6 Synchronized Systems
            </span>
          </h3>
          <p className="text-xs text-[#75777E]">
            Your business tools are no longer isolated: Otomatizon orchestrates their continuous communication.
          </p>
        </div>

        {onNavigateToApps && (
          <button
            onClick={onNavigateToApps}
            className="text-xs font-mono font-bold text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View systems map &rarr;</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {collaborations.map((collab) => (
          <div
            key={collab.id}
            className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-4 shadow-2xs hover:border-[#15803D]/40 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#121316] font-mono uppercase">
                {collab.name}
              </span>
              <span className="text-[11px] font-mono text-[#15803D] font-bold">
                {collab.impact}
              </span>
            </div>

            {/* Chain of collaborating apps */}
            <div className="flex flex-wrap items-center gap-2">
              {collab.apps.map((app, i) => {
                const IconComponent = app.icon;
                return (
                  <React.Fragment key={app.name}>
                    <div className="p-2.5 rounded-xl bg-white border border-[#EAE7DF] flex items-center gap-2 shadow-2xs">
                      <div className={`w-6 h-6 rounded-lg ${app.bg} flex items-center justify-center`}>
                        <IconComponent className={`w-3.5 h-3.5 ${app.color}`} />
                      </div>
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-[#121316] leading-none">{app.name}</div>
                        <div className="text-[9px] font-mono text-[#75777E] mt-0.5">{app.role}</div>
                      </div>
                    </div>

                    {i < collab.apps.length - 1 && (
                      <span className="text-[#75777E] font-mono text-xs">&rarr;</span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
