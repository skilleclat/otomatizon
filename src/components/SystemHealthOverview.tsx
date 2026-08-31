"use client";

import React, { useState } from "react";
import { 
  Check, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  MessageSquare, 
  Calendar, 
  FileSpreadsheet, 
  Mail, 
  CreditCard, 
  MapPin, 
  Activity, 
  ArrowRight,
  TrendingUp,
  Clock,
  Layers,
  Cpu
} from "lucide-react";
import { BrandLogo } from "./BrandLogo";

interface SystemHealthOverviewProps {
  onNavigateTab?: (tab: string) => void;
}

export const SystemHealthOverview: React.FC<SystemHealthOverviewProps> = ({
  onNavigateTab
}) => {
  const [activeStep, setActiveStep] = useState<number>(5); // default active at execution/monitoring

  // 8 Journey Steps matching Reference Image 10
  const journeySteps = [
    { num: 1, title: "Connect", subtitle: "your apps", icon: LinkIcon, tab: "apps" },
    { num: 2, title: "Discover", subtitle: "opportunities", icon: SearchIcon, tab: "opportunities" },
    { num: 3, title: "Create", subtitle: "automation", icon: WandIcon, tab: "automations" },
    { num: 4, title: "Activate", subtitle: "workflow", icon: ZapIcon, tab: "automations" },
    { num: 5, title: "Execute", subtitle: "in real-time", icon: PlayIcon, tab: "automations" },
    { num: 6, title: "Monitor", subtitle: "activities", icon: ActivityIcon, tab: "activity" },
    { num: 7, title: "Measure", subtitle: "business impact", icon: ChartIcon, tab: "home" },
    { num: 8, title: "Receive", subtitle: "executive report", icon: FileIcon, tab: "report" }
  ];

  function LinkIcon(props: any) {
    return <Layers className="w-3.5 h-3.5" {...props} />;
  }
  function SearchIcon(props: any) {
    return <Sparkles className="w-3.5 h-3.5" {...props} />;
  }
  function WandIcon(props: any) {
    return <Cpu className="w-3.5 h-3.5" {...props} />;
  }
  function ZapIcon(props: any) {
    return <CheckCircle2 className="w-3.5 h-3.5" {...props} />;
  }
  function PlayIcon(props: any) {
    return <Activity className="w-3.5 h-3.5" {...props} />;
  }
  function ActivityIcon(props: any) {
    return <Clock className="w-3.5 h-3.5" {...props} />;
  }
  function ChartIcon(props: any) {
    return <TrendingUp className="w-3.5 h-3.5" {...props} />;
  }
  function FileIcon(props: any) {
    return <ShieldCheck className="w-3.5 h-3.5" {...props} />;
  }

  return (
    <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-6 sm:p-8 space-y-8 animate-fadeIn">
      
      {/* 1. 8-STEP HORIZONTAL INTERACTIVE JOURNEY matching Reference Image 10 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
              COMPLETE USER JOURNEY
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-[#121316] tracking-tight">
              From business understanding to measured impact
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#75777E] hidden sm:inline">
            8 stages orchestrated continuously
          </span>
        </div>

        {/* 8-Step Connector Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-center font-mono">
          {journeySteps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = s.num <= 5;
            const isSelected = activeStep === s.num;

            return (
              <div
                key={s.num}
                onClick={() => {
                  setActiveStep(s.num);
                  if (onNavigateTab && s.tab) onNavigateTab(s.tab);
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col items-center justify-between space-y-2 ${
                  isSelected
                    ? "bg-[#ECFDF5] border-[#15803D] shadow-2xs"
                    : "bg-[#FAF9F5]/70 border-[#EAE7DF] hover:border-[#15803D]/50"
                }`}
              >
                {/* Circle Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${
                  isSelected
                    ? "bg-[#15803D] text-white scale-105"
                    : isCompleted
                    ? "bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]"
                    : "bg-white text-[#75777E] border border-[#EAE7DF]"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>

                {/* Title & Subtitle */}
                <div>
                  <div className={`text-xs font-bold ${isSelected ? "text-[#15803D]" : "text-[#121316]"}`}>
                    {s.title}
                  </div>
                  <div className="text-[9px] text-[#75777E] mt-0.5 leading-tight">
                    {s.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SPLIT: RADIAL CONSTELLATION (Left) + SYSTEM STATUS & SYSTEM HEALTH (Right) matching Reference Image 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-t border-[#EAE7DF] pt-8">
        
        {/* Left Column (6 cols): Radial Constellation Diagram */}
        <div className="lg:col-span-6 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#121316]">
            System Overview
          </h4>

          <div className="relative w-full h-80 rounded-2xl bg-[#FAF9F5]/70 border border-[#EAE7DF] flex items-center justify-center overflow-hidden p-4">
            
            {/* SVG Connecting Dashed Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 360 300">
              {/* Lines from center (180, 150) to orbital nodes */}
              {/* WhatsApp (180, 45) */}
              <line x1="180" y1="150" x2="180" y2="55" stroke="#15803D" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Sheets (295, 95) */}
              <line x1="180" y1="150" x2="285" y2="95" stroke="#15803D" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Calendar (285, 215) */}
              <line x1="180" y1="150" x2="275" y2="215" stroke="#15803D" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Google Maps (180, 255) */}
              <line x1="180" y1="150" x2="180" y2="245" stroke="#15803D" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* M-Pesa (75, 235) */}
              <line x1="180" y1="150" x2="85" y2="225" stroke="#15803D" strokeWidth="1.5" strokeDasharray="3 3" />
              {/* Gmail (65, 115) */}
              <line x1="180" y1="150" x2="75" y2="120" stroke="#15803D" strokeWidth="1.5" strokeDasharray="3 3" />
            </svg>

            {/* Central Dark Emerald Otomatizon Core matching Image 10 */}
            <div className="relative z-10 w-24 h-24 rounded-full bg-[#002E25] text-white flex flex-col items-center justify-center text-center shadow-lg border-2 border-emerald-400/40 p-2">
              <span className="font-extrabold text-[11px] tracking-wider uppercase">OTOMATIZON</span>
              <span className="text-[8px] font-mono text-emerald-300 mt-0.5 leading-tight">Intelligence Core</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mt-1" />
            </div>

            {/* Orbital Satellite Node 1: WhatsApp (+65%) Top Center */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
              <div className="px-3 py-1.5 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center gap-1.5 text-xs font-mono">
                <MessageSquare className="w-3.5 h-3.5 text-[#15803D]" />
                <span className="font-bold text-[#121316]">WhatsApp</span>
                <span className="text-[10px] text-[#15803D] font-bold">+65%</span>
              </div>
            </div>

            {/* Orbital Satellite Node 2: Google Sheets Top Right */}
            <div className="absolute top-16 right-4 z-10">
              <div className="px-3 py-1.5 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center gap-1.5 text-xs font-mono">
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-bold text-[#121316]">Sheets</span>
              </div>
            </div>

            {/* Orbital Satellite Node 3: Google Calendar Bottom Right */}
            <div className="absolute bottom-16 right-4 z-10">
              <div className="px-3 py-1.5 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center gap-1.5 text-xs font-mono">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span className="font-bold text-[#121316]">Calendar</span>
              </div>
            </div>

            {/* Orbital Satellite Node 4: Google Maps Bottom Center */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <div className="px-3 py-1.5 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center gap-1.5 text-xs font-mono">
                <MapPin className="w-3.5 h-3.5 text-red-600" />
                <span className="font-bold text-[#121316]">Google Maps</span>
              </div>
            </div>

            {/* Orbital Satellite Node 5: Safaricom M-Pesa Bottom Left */}
            <div className="absolute bottom-14 left-4 z-10">
              <div className="px-3 py-1.5 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center gap-1.5 text-xs font-mono">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                <span className="font-bold text-[#121316]">M-Pesa</span>
              </div>
            </div>

            {/* Orbital Satellite Node 6: Gmail Top Left */}
            <div className="absolute top-16 left-4 z-10">
              <div className="px-3 py-1.5 rounded-2xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center gap-1.5 text-xs font-mono">
                <Mail className="w-3.5 h-3.5 text-red-600" />
                <span className="font-bold text-[#121316]">Gmail</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column (6 cols): System Status & System Healthy Callout */}
        <div className="lg:col-span-6 space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#121316]">
            System Status
          </h4>

          {/* 4 Checkpoints matching Reference Image 10 */}
          <div className="space-y-3 font-mono text-xs">
            
            {/* Checkpoint 1 */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#15803D] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#121316]">6 connected systems</div>
                <div className="text-[11px] text-[#75777E]">All operational</div>
              </div>
            </div>

            {/* Checkpoint 2 */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#15803D] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#121316]">1 active automation</div>
                <div className="text-[11px] text-[#75777E]">Running normally</div>
              </div>
            </div>

            {/* Checkpoint 3 */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#15803D] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#121316]">Active executions</div>
                <div className="text-[11px] text-[#75777E]">None critically waiting</div>
              </div>
            </div>

            {/* Checkpoint 4 */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#15803D] flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-[#121316]">Integrations up to date</div>
                <div className="text-[11px] text-[#75777E]">Sync OK</div>
              </div>
            </div>

          </div>

          {/* Big Bottom-Right Callout: System Healthy matching Reference Image 10 */}
          <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#15803D] text-white flex items-center justify-center shadow-xs">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-base font-extrabold text-[#121316]">
                System Healthy
              </div>
              <div className="text-xs text-[#75777E] font-mono mt-0.5">
                All services operating normally
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
