"use client";

import React, { useState } from "react";
import { 
  ArrowRight, 
  Check, 
  MessageSquare, 
  Calendar, 
  FileSpreadsheet, 
  Mail, 
  CreditCard, 
  HardDrive,
  ArrowDown
} from "lucide-react";
import { getAllPlans } from "@/lib/billing/config";
import { trackFunnelEvent } from "@/lib/analytics/funnel";
import { BrandLogo } from "@/components/BrandLogo";

interface LandingPageProps {
  onOpenOnboarding: () => void;
  onEnterDashboard: () => void;
  onOpenCheckout?: (planId: string) => void;
  onTriggerAuth?: (mode?: "login" | "signup") => void;
}

interface DemoScenario {
  id: string;
  label: string;
  input: string;
  foundTitle: string;
  foundDetail: string;
  impact: "High" | "Medium";
  whyItMatters: string;
  recommended: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "tutoring",
    label: "Tutoring & Coaching",
    input: "I run a tutoring business. Students contact me on WhatsApp, I schedule lessons manually, and some forget to pay.",
    foundTitle: "Payment follow-up",
    foundDetail: "Some students haven't completed payment before their scheduled lesson.",
    impact: "High",
    whyItMatters: "Unconfirmed payments can lead to missed sessions and unnecessary follow-up work.",
    recommended: "Automatically remind unpaid students before their lesson."
  },
  {
    id: "inquiries",
    label: "Lead Follow-up",
    input: "I get multiple WhatsApp inquiries for my services, but when I get busy I don't follow up with people who didn't book right away.",
    foundTitle: "Lead follow-up",
    foundDetail: "Inquiries go cold when no follow-up is sent within 24 hours.",
    impact: "High",
    whyItMatters: "Prospective customers who expressed clear intent are lost simply due to lack of a prompt check-in.",
    recommended: "Automatically check in with interested contacts 24 hours after their first message."
  },
  {
    id: "appointments",
    label: "Service Appointments",
    input: "Clients book appointments with me, but I spend half my day manually texting them to confirm and verify their M-Pesa payments.",
    foundTitle: "Manual booking confirmation",
    foundDetail: "You are spending manual hours verifying M-Pesa receipts against calendar slots.",
    impact: "Medium",
    whyItMatters: "Administrative time spent cross-checking payments reduces available client session hours.",
    recommended: "Match incoming M-Pesa confirmation codes directly with calendar bookings."
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenOnboarding,
  onEnterDashboard,
  onOpenCheckout,
  onTriggerAuth
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [visitorInput, setVisitorInput] = useState(DEMO_SCENARIOS[0].input);
  const [demoState, setDemoState] = useState<"ready" | "analyzing" | "discovered">("discovered");

  const currentScenario = DEMO_SCENARIOS[selectedScenarioIndex];

  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    setVisitorInput(DEMO_SCENARIOS[index].input);
    setDemoState("ready");
  };

  const handleRunDemo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!visitorInput.trim()) return;

    setDemoState("analyzing");
    trackFunnelEvent("cta_clicked", { text: visitorInput });

    setTimeout(() => {
      setDemoState("discovered");
    }, 120);
  };

  const handleCtaClick = () => {
    trackFunnelEvent("onboarding_started", { source: "landing_primary_cta" });
    onOpenOnboarding();
  };

  const plans = getAllPlans();

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#121316] selection:bg-[#15803D]/15 selection:text-[#15803D] font-sans antialiased">
      
      {/* 1. MINIMAL EDITORIAL HEADER */}
      <header className="sticky top-0 z-50 w-full bg-[#FAF9F5]/90 backdrop-blur-xl border-b border-[#EAE7DF] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Operational Region */}
          <div className="flex items-center gap-3 shrink-0">
            <div 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="cursor-pointer select-none transition-transform active:scale-[0.98]"
            >
              <BrandLogo variant="full" size="md" />
            </div>
            
            <div className="h-5 w-px bg-[#EAE7DF] hidden sm:block" />

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F2EB] border border-[#E2DED5] text-[11px] font-mono text-[#5A5C63] select-none shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15803D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#15803D]"></span>
              </span>
              <span className="font-semibold text-[#121316]">Nairobi, Kenya</span>
              <span className="text-[#A1A1AA]">&middot;</span>
              <span className="text-[#15803D] font-bold">LIVE OS</span>
            </div>
          </div>

          {/* Center: Editorial Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#EFECE6]/80 p-1 rounded-full border border-[#E2DED5] text-xs font-semibold text-[#5A5C63] shadow-2xs">
            <a href="#problem" className="px-3.5 py-1.5 rounded-full hover:text-[#121316] hover:bg-white/60 transition-all">The Problem</a>
            <a href="#difference" className="px-3.5 py-1.5 rounded-full hover:text-[#121316] hover:bg-white/60 transition-all">The Difference</a>
            <a href="#examples" className="px-3.5 py-1.5 rounded-full hover:text-[#121316] hover:bg-white/60 transition-all">Discoveries</a>
            <a href="#how-it-works" className="px-3.5 py-1.5 rounded-full hover:text-[#121316] hover:bg-white/60 transition-all">How it works</a>
            <a href="#pricing" className="px-3.5 py-1.5 rounded-full hover:text-[#121316] hover:bg-white/60 transition-all">Pricing</a>
          </nav>

          {/* Right: Authentication & Primary Action */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onTriggerAuth ? onTriggerAuth("login") : onEnterDashboard()}
              className="text-xs font-bold font-mono text-[#4A4B50] hover:text-[#121316] px-3.5 py-1.5 rounded-full hover:bg-[#F4F2EB] transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={handleCtaClick}
              className="px-4 py-2 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 border border-[#002E25]"
            >
              <span>Find Automations</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. THE HERO */}
      <section className="pt-16 pb-16 sm:pt-24 sm:pb-24 max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-8">
        
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EFECE6] border border-[#E5E1D8] text-[11px] font-mono uppercase tracking-widest text-[#4A4B50]">
          BUILT FOR SMALL BUSINESSES
        </div>

        {/* The Core Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#121316] leading-[1.1]">
          Turn the free apps you already use into{" "}
          <span className="text-[#15803D] font-serif italic font-normal">
            one business system.
          </span>
        </h1>

        {/* Supporting Copy */}
        <p className="text-sm sm:text-lg text-[#4A4B50] leading-relaxed max-w-2xl mx-auto font-normal">
          Tell Otomatizon how your business works. It finds what you&apos;re doing manually, shows you what to automate, and builds it for you.
        </p>

        {/* ONE Dominant CTA */}
        <div className="pt-2 flex flex-col items-center gap-2.5">
          <button
            onClick={handleCtaClick}
            className="px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-sm sm:text-base font-bold transition-all shadow-md hover:shadow-lg shadow-emerald-950/10 flex items-center gap-2.5"
          >
            <span>Find what you can automate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <span className="text-xs text-[#75777E] font-normal">
            No technical knowledge required.
          </span>
        </div>

        {/* 3. HERO VISUAL — THE DECISION ENGINE DEMONSTRATION */}
        <div className="pt-6 sm:pt-8 max-w-2xl mx-auto text-left">
          <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-lg shadow-stone-900/[0.03] p-5 sm:p-7 space-y-5">
            
            {/* Input Phase Header & Scenario Pills */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#75777E] font-semibold block">
                  WHAT DO YOU DO?
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {DEMO_SCENARIOS.map((sc, idx) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleSelectScenario(idx)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full transition-all border ${
                        selectedScenarioIndex === idx
                          ? "bg-[#121316] text-white border-[#121316]"
                          : "bg-[#FAF9F5] text-[#75777E] border-[#EAE7DF] hover:border-[#121316]"
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <form onSubmit={handleRunDemo} className="space-y-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={visitorInput}
                    onChange={(e) => {
                      setVisitorInput(e.target.value);
                      if (demoState === "discovered") setDemoState("ready");
                    }}
                    placeholder="Describe how customers reach you and how you run your business..."
                    className="w-full bg-[#FAF9F5] border border-[#EAE7DF] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm text-[#121316] placeholder-stone-400 focus:outline-none focus:border-[#15803D] transition-colors resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[11px] text-[#75777E] hidden sm:inline">
                    Click to test what Otomatizon identifies
                  </span>
                  <span className="text-[11px] text-[#75777E] sm:hidden">
                    Test the Decision Engine
                  </span>
                  <button
                    type="submit"
                    disabled={demoState === "analyzing"}
                    className="px-4 py-2 rounded-full bg-[#121316] hover:bg-black text-white text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 ml-auto"
                  >
                    <span>See what Otomatizon finds &rarr;</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Intermediate Processing State: Understanding Your Business */}
            {demoState === "analyzing" && (
              <div className="p-6 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex flex-col items-center justify-center text-center space-y-2.5 py-8">
                <div className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
                <span className="text-[11px] font-mono uppercase tracking-widest text-[#15803D] font-bold">
                  UNDERSTANDING YOUR BUSINESS
                </span>
                <p className="text-xs text-[#75777E]">
                  Identifying repetitive work...
                </p>
              </div>
            )}

            {/* Output Phase: Calm, Deliberate Discovery Card */}
            {demoState === "discovered" && (
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-4">
                
                {/* Discovery Header */}
                <div className="flex items-center justify-between border-b border-[#EAE7DF] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#15803D] font-bold">
                      WE FOUND SOMETHING
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-[#75777E] uppercase">IMPACT</span>
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                      {currentScenario.impact}
                    </span>
                  </div>
                </div>

                {/* Finding & Detail */}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#121316]">
                    {currentScenario.foundTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#4A4B50] leading-relaxed">
                    {currentScenario.foundDetail}
                  </p>
                </div>

                {/* Why It Matters */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-semibold block">
                    WHY IT MATTERS
                  </span>
                  <p className="text-xs text-[#4A4B50] leading-relaxed">
                    {currentScenario.whyItMatters}
                  </p>
                </div>

                {/* Recommended Action */}
                <div className="p-3.5 rounded-xl bg-white border border-[#EAE7DF] space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-semibold block">
                    RECOMMENDED
                  </span>
                  <p className="text-xs font-semibold text-[#121316] leading-snug">
                    {currentScenario.recommended}
                  </p>
                </div>

                {/* Action Row */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDemoState("ready")}
                    className="text-[11px] font-medium text-[#75777E] hover:text-[#121316] transition-colors"
                  >
                    Edit input
                  </button>
                  <button
                    onClick={handleCtaClick}
                    className="px-5 py-2.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Automate this</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. SECTION 2 — THE PROBLEM */}
      <section id="problem" className="py-20 sm:py-24 border-t border-[#EAE7DF] bg-[#F4F2EB]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-10">
          
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#121316] tracking-tight">
            Your business already runs on enough apps.
          </h2>

          {/* Familiar tools — tightly focused, no marketplace */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 max-w-xl mx-auto">
            {[
              { name: "WhatsApp", icon: MessageSquare },
              { name: "Gmail", icon: Mail },
              { name: "Google Calendar", icon: Calendar },
              { name: "Google Sheets", icon: FileSpreadsheet },
              { name: "Google Drive", icon: HardDrive },
              { name: "Payments (M-Pesa)", icon: CreditCard }
            ].map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <div 
                  key={idx}
                  className="px-3.5 py-2 rounded-2xl bg-white border border-[#EAE7DF] flex items-center gap-2 text-xs font-semibold text-[#121316] shadow-sm"
                >
                  <Icon className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>{tool.name}</span>
                </div>
              );
            })}
          </div>

          <p className="text-lg sm:text-2xl font-bold text-[#121316] tracking-tight max-w-xl mx-auto leading-snug">
            They work. They&apos;re just not working together.
          </p>
        </div>
      </section>

      {/* 5. SECTION 3 — THE OTOMATIZON DIFFERENCE */}
      <section id="difference" className="py-20 sm:py-24 border-t border-[#EAE7DF] bg-[#FAF9F5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-14">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#121316] tracking-tight">
              You don&apos;t build automations.
            </h2>
            <p className="text-sm sm:text-base text-[#4A4B50] leading-relaxed">
              You tell Otomatizon how your business works. It figures out what should happen automatically.
            </p>
          </div>

          {/* Simple Clean Linear Progression */}
          <div className="max-w-xl mx-auto space-y-4">
            
            {/* Step 1: You Say */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE7DF] shadow-sm space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#75777E] tracking-widest font-semibold block">
                YOU SAY
              </span>
              <p className="text-sm sm:text-base font-semibold text-[#121316]">
                &ldquo;When someone asks about my service, follow up if they don&apos;t book.&rdquo;
              </p>
            </div>

            <div className="flex justify-center text-[#75777E]">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 2: Otomatizon Figures It Out */}
            <div className="bg-[#FAF9F5] p-5 sm:p-6 rounded-3xl border border-[#A7F3D0] shadow-sm space-y-3">
              <span className="text-[10px] font-mono uppercase text-[#15803D] tracking-widest font-bold block">
                OTOMATIZON FIGURES IT OUT
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono font-medium text-[#121316]">
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAE7DF]">New inquiry</span>
                <span className="text-[#75777E]">&rarr;</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAE7DF]">Follow-up</span>
                <span className="text-[#75777E]">&rarr;</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAE7DF]">Booking</span>
                <span className="text-[#75777E]">&rarr;</span>
                <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAE7DF]">Stop when customer responds</span>
              </div>
            </div>

            <div className="flex justify-center text-[#75777E]">
              <ArrowDown className="w-4 h-4" />
            </div>

            {/* Step 3: Result */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EAE7DF] shadow-sm space-y-1 text-center">
              <span className="text-[10px] font-mono uppercase text-[#75777E] tracking-widest font-semibold block">
                RESULT
              </span>
              <p className="text-lg sm:text-xl font-bold text-[#15803D] tracking-tight">
                Less manual work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 4 — DECISION ENGINE DISCOVERIES */}
      <section id="examples" className="py-20 sm:py-24 border-t border-[#EAE7DF] bg-[#F4F2EB]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center space-y-2.5 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#121316] tracking-tight">
              Otomatizon finds the work you shouldn&apos;t be doing manually.
            </h2>
            <p className="text-xs sm:text-sm text-[#4A4B50]">
              No configuration forms. It identifies operational friction and presents the solution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            
            {/* Discovery 1: Lead follow-up */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAE7DF] shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                    WE FOUND SOMETHING
                  </span>
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                    High
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#121316]">
                  Lead follow-up
                </h3>
                <p className="text-xs text-[#4A4B50] leading-relaxed">
                  &ldquo;14 leads haven&apos;t received a follow-up.&rdquo;
                </p>
              </div>

              <button
                onClick={handleCtaClick}
                className="text-xs font-bold text-[#15803D] hover:text-[#166534] flex items-center gap-1.5 transition-colors pt-3 border-t border-[#EAE7DF]"
              >
                <span>Automate it</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Discovery 2: Scheduling */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAE7DF] shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                    WE FOUND SOMETHING
                  </span>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                    Medium
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#121316]">
                  Scheduling
                </h3>
                <p className="text-xs text-[#4A4B50] leading-relaxed">
                  &ldquo;You spend time manually confirming appointments.&rdquo;
                </p>
              </div>

              <button
                onClick={handleCtaClick}
                className="text-xs font-bold text-[#15803D] hover:text-[#166534] flex items-center gap-1.5 transition-colors pt-3 border-t border-[#EAE7DF]"
              >
                <span>Automate it</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Discovery 3: Payment reminders */}
            <div className="bg-white p-6 rounded-3xl border border-[#EAE7DF] shadow-sm flex flex-col justify-between space-y-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                    WE FOUND SOMETHING
                  </span>
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                    High
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#121316]">
                  Payment reminders
                </h3>
                <p className="text-xs text-[#4A4B50] leading-relaxed">
                  &ldquo;Customers are booking before completing payment.&rdquo;
                </p>
              </div>

              <button
                onClick={handleCtaClick}
                className="text-xs font-bold text-[#15803D] hover:text-[#166534] flex items-center gap-1.5 transition-colors pt-3 border-t border-[#EAE7DF]"
              >
                <span>Automate it</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION 5 — HOW IT WORKS */}
      <section id="how-it-works" className="py-20 sm:py-24 border-t border-[#EAE7DF] bg-[#FAF9F5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#121316] tracking-tight">
              How Otomatizon works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 text-left">
            {[
              { num: "01", text: "Tell us how your business works." },
              { num: "02", text: "Connect the tools you already use." },
              { num: "03", text: "We find what you can automate." },
              { num: "04", text: "Activate it. Otomatizon handles the rest." }
            ].map((st, i) => (
              <div key={i} className="space-y-2 border-t border-[#EAE7DF] pt-4">
                <span className="text-xs font-mono text-[#15803D] font-bold block">
                  {st.num}
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#121316] leading-relaxed">
                  {st.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. SECTION 6 — REAL WORKFLOW JOURNEY (COACH / TUTOR) */}
      <section className="py-20 sm:py-24 border-t border-[#EAE7DF] bg-[#F4F2EB]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#75777E] font-semibold block">
              COACH / TUTOR EXAMPLE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#121316] tracking-tight">
              From first message to paid session.
            </h2>
          </div>

          {/* Tangible Business Journey */}
          <div className="max-w-xl mx-auto bg-white p-5 sm:p-7 rounded-3xl border border-[#EAE7DF] shadow-sm space-y-4">
            
            {/* Step 1: Customer */}
            <div className="space-y-1 border-b border-[#EAE7DF] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-semibold block">
                CUSTOMER &middot; WhatsApp message
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#121316]">
                &ldquo;I&apos;d like to know more about your lessons.&rdquo;
              </p>
            </div>

            <div className="flex justify-center text-[#75777E]">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            {/* Step 2: Otomatizon Info */}
            <div className="space-y-1 border-b border-[#EAE7DF] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold block">
                OTOMATIZON
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#121316]">
                Information sent
              </p>
            </div>

            <div className="flex justify-center text-[#75777E]">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            {/* Step 3: Calendar */}
            <div className="space-y-1 border-b border-[#EAE7DF] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#75777E] font-semibold block">
                GOOGLE CALENDAR
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#121316]">
                Session booked
              </p>
            </div>

            <div className="flex justify-center text-[#75777E]">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            {/* Step 4: Payment Pending */}
            <div className="space-y-1 border-b border-[#EAE7DF] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-semibold block">
                PAYMENT
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#121316]">
                Payment pending
              </p>
            </div>

            <div className="flex justify-center text-[#75777E]">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            {/* Step 5: Otomatizon Reminder */}
            <div className="space-y-1 border-b border-[#EAE7DF] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold block">
                OTOMATIZON
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#121316]">
                Payment reminder sent
              </p>
            </div>

            <div className="flex justify-center text-[#75777E]">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            {/* Step 6: Calendar Confirmed */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#15803D] font-bold block">
                GOOGLE CALENDAR
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#121316]">
                Session confirmed
              </p>
            </div>

            <div className="pt-5 border-t border-[#EAE7DF] space-y-4 text-center">
              <p className="text-xs sm:text-sm font-medium text-[#4A4B50]">
                These disconnected actions now behave like one system.
              </p>
              <div>
                <button
                  onClick={handleCtaClick}
                  className="px-6 py-3 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm"
                >
                  <span>Find what you can automate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. SECTION 7 — TRUST */}
      <section className="py-16 sm:py-20 border-t border-[#EAE7DF] bg-[#FAF9F5] text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-3">
          <h3 className="text-lg sm:text-2xl font-bold text-[#121316] tracking-tight">
            Built for the way small businesses actually work.
          </h3>
          <p className="text-xs sm:text-sm font-mono text-[#75777E]">
            Kenya first. Simple tools. Simple workflows. Clear pricing in KES.
          </p>
        </div>
      </section>

      {/* 10. SECTION 8 — PRICING */}
      <section id="pricing" className="py-20 sm:py-24 border-t border-[#EAE7DF] bg-[#F4F2EB]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#121316] tracking-tight">
              Start small. Automate more as you grow.
            </h2>
            <p className="text-xs sm:text-sm text-[#4A4B50]">
              Clear pricing in KES. No hidden enterprise tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">
            {plans.map((plan) => {
              const isGrowth = plan.id === "growth";

              return (
                <div
                  key={plan.id}
                  className={`bg-white p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between ${
                    isGrowth
                      ? "border-[#15803D] shadow-md ring-2 ring-[#15803D]/20"
                      : "border-[#EAE7DF] shadow-sm"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-[#121316]">
                        {plan.name}
                      </h3>
                      {isGrowth && (
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#15803D] px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0]">
                          Popular
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#121316]">
                        KES {plan.priceKesMonthly.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#75777E] font-mono"> / month</span>
                    </div>

                    <p className="text-xs text-[#4A4B50] leading-relaxed">
                      {plan.tagline}
                    </p>

                    <div className="pt-4 border-t border-[#EAE7DF] space-y-2.5 text-xs text-[#121316]">
                      {plan.features.slice(0, 4).map((feat, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#15803D] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => onOpenCheckout ? onOpenCheckout(plan.id) : handleCtaClick()}
                      className={`w-full py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isGrowth
                          ? "bg-[#15803D] hover:bg-[#166534] text-white shadow-sm"
                          : "bg-[#FAF9F5] hover:bg-[#EFECE6] text-[#121316] border border-[#EAE7DF]"
                      }`}
                    >
                      Start with {plan.name}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. SECTION 9 — FINAL CTA */}
      <section className="py-20 sm:py-24 border-t border-[#EAE7DF] bg-[#FAF9F5] text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#121316] tracking-tight">
            What would you automate first?
          </h2>
          <p className="text-sm sm:text-base text-[#4A4B50] max-w-xl mx-auto leading-relaxed">
            Tell Otomatizon how your business works. We&apos;ll find what you can automate.
          </p>
          <div className="pt-2">
            <button
              onClick={handleCtaClick}
              className="px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-sm sm:text-base font-bold transition-all shadow-md hover:shadow-lg shadow-emerald-950/10 inline-flex items-center gap-2.5"
            >
              <span>Find what you can automate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 12. MINIMAL FOOTER */}
      <footer className="py-10 border-t border-[#EAE7DF] bg-[#F4F2EB]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#75777E]">
          <div className="flex items-center gap-2.5">
            <BrandLogo variant="full" size="sm" />
            <span>&mdash; Built for small businesses in Kenya</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <a href="#how-it-works" className="hover:text-[#121316] transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-[#121316] transition-colors">Pricing</a>
            <button onClick={onOpenOnboarding} className="hover:text-[#121316] transition-colors cursor-pointer">Product</button>
            <button onClick={() => onTriggerAuth ? onTriggerAuth("login") : onEnterDashboard()} className="hover:text-[#121316] transition-colors cursor-pointer">Sign In</button>
            <span className="text-[#8C8E96]">&copy; 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
