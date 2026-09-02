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
  ArrowDown,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  LayoutDashboard
} from "lucide-react";
import { getAllPlans } from "@/lib/billing/config";
import { trackFunnelEvent } from "@/lib/analytics/funnel";
import { BrandLogo } from "@/components/BrandLogo";
import { useOtomatizonStore } from "@/lib/store";

interface LandingPageProps {
  onOpenOnboarding: () => void;
  onEnterDashboard: () => void;
  onOpenCheckout?: (planId: string) => void;
  onTriggerAuth?: (mode?: "login" | "signup") => void;
}

interface DemoScenario {
  id: string;
  label: string;
  tagline: string;
  input: string;
  discovery: {
    title: string;
    description: string;
    impact: string;
  };
  whyItMatters: string;
  recommended: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "sme",
    label: "Petite & Moyenne Entreprise (PME)",
    tagline: "Devis non relancés, suivi des commandes clients et vérification des paiements M-Pesa.",
    input: "Clients send inquiries on WhatsApp and Instagram for quotes and services. We write orders in a spreadsheet, manually follow up on delayed approvals, and verify M-Pesa receipts on the office phone.",
    discovery: {
      title: "Unfollowed Customer Quotes & Payment Delays",
      description: "Quotes sent on WhatsApp without automatic 24h follow-up lead to lost sales.",
      impact: "CRITICAL"
    },
    whyItMatters: "SMEs lose up to 35% of qualified quote requests simply because manual follow-ups take too long during busy business hours.",
    recommended: "Automatically log inquiries in Google Sheets, dispatch quotes, trigger polite 24h follow-ups, and reconcile incoming M-Pesa payments."
  },
  {
    id: "consulting",
    label: "Consultant en affaires",
    tagline: "Discovery calls booked without qualification or agenda prep.",
    input: "Clients fill out my Google Form or email me. I manually send Calendly links and create folders in Google Drive for their onboarding files.",
    discovery: {
      title: "Manual Client Onboarding Friction",
      description: "Drive folders & welcome dossiers created manually per client.",
      impact: "HIGH IMPACT"
    },
    whyItMatters: "Consultants and service agencies spend 45 minutes per new client creating shared folders, sending prep materials, and confirming meeting times across separate tools.",
    recommended: "Trigger automatic Google Drive folder creation, share onboarding questionnaire, and log client details into Google Sheets on booking confirmation."
  },
  {
    id: "clinic",
    label: "Clinique & Cabinet médical",
    tagline: "Appointment no-shows and unconfirmed M-Pesa consultation deposits.",
    input: "Patients call or WhatsApp for medical consultations. We write their names in a notebook, send reminders manually, and check M-Pesa messages on a shared reception phone.",
    discovery: {
      title: "Unverified Booking Deposits & No-Shows",
      description: "Patients forget appointments; M-Pesa receipts checked manually.",
      impact: "CRITICAL"
    },
    whyItMatters: "No-shows cost local clinics and practices up to 30% of daily revenue because reminders aren't sent and deposits aren't automatically verified.",
    recommended: "Match incoming M-Pesa confirmation codes directly with calendar bookings and dispatch automated SMS/WhatsApp appointment reminders."
  },
  {
    id: "tutoring",
    label: "Professeur de français",
    tagline: "High WhatsApp message volume, manual scheduling & payment chasing.",
    input: "I teach French online. Students message me on WhatsApp. I send them prices manually, schedule them in Google Calendar, and ask for M-Pesa payments.",
    discovery: {
      title: "Inbound Lead Follow-Up Delay",
      description: "Students who don't book immediately are forgotten.",
      impact: "HIGH IMPACT"
    },
    whyItMatters: "Prospective students inquire on WhatsApp, but if they don't pick a slot immediately, following up manually takes hours and leads go cold.",
    recommended: "Automatically send syllabus, verify Google Calendar booking, and send a single polite WhatsApp reminder after 24 hours if unbooked."
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenOnboarding,
  onEnterDashboard,
  onOpenCheckout,
  onTriggerAuth
}) => {
  const { state, logout } = useOtomatizonStore();
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [visitorInput, setVisitorInput] = useState(DEMO_SCENARIOS[0].input);
  const [demoState, setDemoState] = useState<"ready" | "analyzing" | "discovered">("discovered");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAuthenticated = state.session?.isAuthenticated && !!state.session?.user;
  const user = state.session?.user;
  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

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

  const handleFreePlanClick = () => {
    if (state.session?.isAuthenticated) {
      upgradePlan("free");
      onEnterDashboard();
    } else if (onTriggerAuth) {
      onTriggerAuth("signup");
    } else {
      onOpenOnboarding();
    }
  };

  const plans = getAllPlans();

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#121316] selection:bg-[#15803D]/15 selection:text-[#15803D] font-sans antialiased">
      
      {/* 1. MINIMAL EDITORIAL HEADER */}
      <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#EAE7DF] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Brand Identity & Location */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 notranslate" translate="no">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="cursor-pointer focus:outline-none flex items-center gap-2 shrink-0 notranslate"
              translate="no"
            >
              <BrandLogo variant="full" size="md" />
            </button>
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#75777E] font-mono border-l border-[#EAE7DF] pl-3 shrink-0 whitespace-nowrap notranslate" translate="no">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse shrink-0" />
              <span className="font-semibold text-[#121316]">Nairobi, Kenya</span>
              <span className="text-[#A1A1AA]">&middot;</span>
              <span className="text-[#15803D] font-bold">LIVE OS</span>
            </div>
          </div>

          {/* Center: Editorial Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#EFECE6]/80 p-1 rounded-full border border-[#E2DED5] text-xs font-semibold text-[#5A5C63] shadow-2xs shrink-0">
            <a href="#problem" className="px-3 py-1.5 rounded-full hover:text-[#121316] hover:bg-white/60 transition-all whitespace-nowrap">The Problem</a>
            <a href="#difference" className="px-3 py-1.5 rounded-full hover:text-[#121316] hover:bg-white/60 transition-all whitespace-nowrap">The Difference</a>
            <a href="#examples" className="px-3 py-1.5 rounded-full hover:text-[#121316] hover:bg-white/60 transition-all whitespace-nowrap">Discoveries</a>
            <a href="#how-it-works" className="px-3 py-1.5 rounded-full hover:text-[#121316] hover:bg-white/60 transition-all whitespace-nowrap">How it works</a>
            <a href="#pricing" className="px-3 py-1.5 rounded-full hover:text-[#121316] hover:bg-white/60 transition-all whitespace-nowrap">Pricing</a>
          </nav>

          {/* Right: Authentication & Primary Action */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 whitespace-nowrap">
            {isAuthenticated ? (
              <div className="relative shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#EFECE6] hover:bg-[#E5E1D8] border border-[#E2DED5] text-xs font-bold text-[#121316] transition-all cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#002E25] text-white flex items-center justify-center text-[10px] font-mono font-bold shrink-0 notranslate" translate="no">
                      {userInitials}
                    </div>
                    <span className="max-w-[90px] sm:max-w-[120px] truncate hidden md:inline">{user?.fullName || "My Account"}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-[#75777E] shrink-0" />
                  </button>

                  <button
                    onClick={onEnterDashboard}
                    className="px-3 sm:px-4 py-2 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 border border-[#002E25] shrink-0 whitespace-nowrap"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  </button>
                </div>

                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-[#EAE7DF] shadow-xl py-2 px-2 z-50 animate-fadeIn text-xs">
                      <div className="px-3 py-2.5 border-b border-[#EAE7DF] mb-1">
                        <div className="font-bold text-[#121316] truncate">{user?.fullName}</div>
                        <div className="text-[10px] text-[#75777E] truncate font-mono">{user?.email}</div>
                        <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] text-[10px] font-mono font-bold border border-[#A7F3D0]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
                          <span>{state.organization?.name || "Workspace Active"}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onEnterDashboard();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF9F5] text-[#121316] font-semibold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Command Center</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenOnboarding();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF9F5] text-[#121316] font-semibold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Discover Automations</span>
                      </button>

                      <div className="my-1 border-t border-[#EAE7DF]" />

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 font-semibold flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={onEnterDashboard}
                  className="px-3.5 sm:px-4 py-2 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center gap-1.5 border border-[#002E25] shrink-0 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Live Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                </button>
                <button
                  onClick={() => onTriggerAuth ? onTriggerAuth("login") : onEnterDashboard()}
                  className="text-xs font-bold font-mono text-[#4A4B50] hover:text-[#121316] px-3 sm:px-3.5 py-1.5 rounded-full hover:bg-[#F4F2EB] transition-all cursor-pointer shrink-0 whitespace-nowrap"
                >
                  Sign In
                </button>
              </>
            )}
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

      {/* 8. SECTION 6 — REAL WORKFLOW JOURNEY (LOCAL SME / SERVICE BUSINESS) */}
      <section className="py-20 sm:py-24 border-t border-[#EAE7DF] bg-[#F4F2EB]/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#75777E] font-semibold block">
              PME &amp; CLINIQUE LOCALE / SERVICE BUSINESS
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#121316] tracking-tight">
              From first customer message to paid appointment.
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#121316] tracking-tight">
              Start small. Automate more as you grow.
            </h2>
            <p className="text-xs sm:text-sm text-[#4A4B50]">
              Clear pricing in KES. Free plan available forever. No hidden enterprise tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            {plans.map((plan) => {
              const isGrowth = plan.id === "growth";
              const isFree = plan.id === "free";

              return (
                <div
                  key={plan.id}
                  className={`bg-white p-6 sm:p-7 rounded-3xl border transition-all flex flex-col justify-between ${
                    isGrowth
                      ? "border-[#15803D] shadow-md ring-2 ring-[#15803D]/20"
                      : isFree
                      ? "border-[#EAE7DF] shadow-sm bg-[#FCFCFA]"
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
                      {isFree && (
                        <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#75777E] px-2 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAE7DF]">
                          Free Forever
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-2xl sm:text-3xl font-extrabold text-[#121316]">
                        {plan.priceKesMonthly === 0 ? "KES 0" : `KES ${plan.priceKesMonthly.toLocaleString()}`}
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
                      onClick={() => {
                        if (isFree) {
                          handleFreePlanClick();
                        } else if (onOpenCheckout) {
                          onOpenCheckout(plan.id);
                        } else {
                          handleCtaClick();
                        }
                      }}
                      className={`w-full py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isGrowth
                          ? "bg-[#15803D] hover:bg-[#166534] text-white shadow-sm"
                          : isFree
                          ? "bg-[#002E25] hover:bg-[#001D17] text-white shadow-xs"
                          : "bg-[#FAF9F5] hover:bg-[#EFECE6] text-[#121316] border border-[#EAE7DF]"
                      }`}
                    >
                      {isFree ? "Get Started Free" : `Start with ${plan.name}`}
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
