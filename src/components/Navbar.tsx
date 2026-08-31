"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Grid, 
  Activity,
  Home,
  User as UserIcon,
  LogOut,
  Zap,
  Settings,
  FileText,
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Menu,
  X
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { DS } from "@/lib/design-system";
import { BrandLogo } from "@/components/BrandLogo";

export type NavTab = "home" | "report" | "opportunities" | "automations" | "apps" | "activity" | "settings";

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingOpportunitiesCount: number;
  activeAutomationsCount: number;
  onTriggerOnboarding: () => void;
  onTriggerSimulation: () => void;
  onTriggerAuth: () => void;
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  pendingOpportunitiesCount,
  activeAutomationsCount,
  onTriggerOnboarding,
  onTriggerSimulation,
  onTriggerAuth,
  onNavigateHome
}) => {
  const { state, logout } = useOtomatizonStore();
  const session = state.session;
  const user = session?.user;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.FC<{ className?: string }>; badge?: React.ReactNode }[] = [
    { 
      id: "home", 
      label: "Command Center", 
      icon: Home 
    },
    { 
      id: "report", 
      label: "Business Report", 
      icon: FileText 
    },
    { 
      id: "opportunities", 
      label: "Opportunities", 
      icon: Sparkles,
      badge: pendingOpportunitiesCount > 0 ? (
        <span className="px-1.5 py-0.5 rounded-full bg-[#15803D] text-white text-[10px] font-bold font-mono shadow-2xs">
          {pendingOpportunitiesCount}
        </span>
      ) : null
    },
    { 
      id: "automations", 
      label: "Automations", 
      icon: Zap,
      badge: (
        <span className="px-1.5 py-0.5 rounded-full bg-[#FAF9F5] border border-[#EAE7DF] text-[#75777E] text-[10px] font-mono">
          {activeAutomationsCount}
        </span>
      )
    },
    { 
      id: "apps", 
      label: "Apps & Systems", 
      icon: Grid 
    },
    { 
      id: "activity", 
      label: "Activity Log", 
      icon: Activity 
    },
    { 
      id: "settings", 
      label: "Settings", 
      icon: Settings 
    }
  ];

  return (
    <>
      {/* 1. TOP FULL-WIDTH DESKTOP & TABLET HEADER */}
      <header className="sticky top-0 z-40 w-full bg-[#FAF9F5]/90 backdrop-blur-xl border-b border-[#EAE7DF] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all">
        <div className="w-full max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Left: Brand Identity & Workspace Environment */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div 
              onClick={() => {
                if (onNavigateHome) {
                  onNavigateHome();
                } else {
                  onSelectTab("home");
                }
              }}
              className="flex items-center cursor-pointer select-none group shrink-0 transition-transform active:scale-[0.98]"
              title="Return to Otomatizon Home"
            >
              <BrandLogo variant="full" size="md" />
            </div>

            <div className="h-5 w-px bg-[#EAE7DF] hidden 2xl:block" />

            {/* Location & Live Status Pill */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F4F2EB] border border-[#E2DED5] text-[11px] font-mono text-[#5A5C63] select-none shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15803D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#15803D]"></span>
              </span>
              <span className="font-semibold text-[#121316]">{state.businessProfile.city || "Nairobi"}</span>
              <span className="text-[#A1A1AA]">&middot;</span>
              <span className="text-[#15803D] font-bold tracking-wider">{state.stats?.currentPlanId?.toUpperCase() || "GROWTH"}</span>
            </div>

            {/* Quick Link to Public Website */}
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                title="Return to Public Website"
                className="hidden 2xl:inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-[#75777E] hover:text-[#121316] px-2.5 py-1 rounded-full bg-transparent hover:bg-[#F4F2EB] border border-transparent hover:border-[#EAE7DF] transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Public Site</span>
              </button>
            )}
          </div>

          {/* Center: Desktop Segmented Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 bg-[#EFECE6]/80 p-1 rounded-full border border-[#E2DED5] shadow-2xs overflow-x-auto">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const IconComponent = item.icon;

              // Streamlined label for compact screens
              const compactLabel = 
                item.id === "home" ? "Overview" :
                item.id === "report" ? "Report" :
                item.id === "apps" ? "Apps" :
                item.id === "activity" ? "Activity" :
                item.label;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-2.5 xl:px-3.5 py-1.5 rounded-full text-[11px] xl:text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                    isActive
                      ? "bg-white text-[#121316] font-bold shadow-xs border border-[#EAE7DF] scale-[1.01]"
                      : "text-[#5A5C63] hover:text-[#121316] hover:bg-white/60"
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-[#15803D]" : "text-[#75777E]"}`} />
                  <span className="hidden 2xl:inline">{item.label}</span>
                  <span className="2xl:hidden">{compactLabel}</span>
                  {item.badge}
                </button>
              );
            })}
          </nav>

          {/* Right: Quick Action & User Profile Workspace */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pl-1">
            
            {/* Quick Simulate Lead Action (Dark Green / Black Pill) */}
            <button
              onClick={onTriggerSimulation}
              title="Simulate a live WhatsApp student inquiry"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold font-mono bg-[#002E25] hover:bg-[#15803D] text-white transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap border border-[#002E25]"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 fill-emerald-300 shrink-0" />
              <span>Simulate Lead</span>
            </button>

            <div className="h-5 w-px bg-[#EAE7DF] hidden sm:block" />

            {/* Auth / Account Profile Workspace */}
            {session?.isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2 sm:py-1 rounded-full hover:bg-[#F4F2EB] border border-transparent hover:border-[#EAE7DF] transition-all text-xs text-[#121316] cursor-pointer group select-none"
                  title="Open Account Menu"
                >
                  <div className="w-7 h-7 rounded-full bg-[#002E25] border border-[#15803D]/40 text-emerald-300 flex items-center justify-center font-bold font-mono text-xs shadow-2xs shrink-0">
                    {user?.fullName ? user.fullName[0] : "J"}
                  </div>
                  <div className="hidden xl:block text-left">
                    <span className="block text-xs font-bold text-[#121316] leading-none group-hover:text-[#15803D] transition-colors truncate max-w-[100px]">
                      {user?.fullName || "James Kamau"}
                    </span>
                    <span className="block text-[10px] font-mono text-[#75777E] leading-none mt-0.5">
                      {state.businessProfile.city || "Nairobi"}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-[#75777E] hidden xl:block group-hover:text-[#121316] transition-transform" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#EAE7DF] shadow-xl z-50 p-2 text-xs animate-fadeIn">
                      <div className="px-3 py-2 border-b border-[#EAE7DF] mb-1">
                        <p className="font-bold text-[#121316] truncate">{user?.fullName || "James Kamau"}</p>
                        <p className="text-[11px] font-mono text-[#75777E] truncate">{user?.email || "james@otomatizon.co.ke"}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] text-[9px] font-bold font-mono">
                            {state.stats?.currentPlanId?.toUpperCase() || "PRO"} TIER
                          </span>
                          <span className="text-[10px] font-mono text-[#75777E]">Nairobi, Kenya</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onSelectTab("settings");
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF9F5] text-[#121316] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#75777E]" />
                        <span>Settings & Billing</span>
                      </button>

                      {onNavigateHome && (
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigateHome();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#FAF9F5] text-[#121316] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#75777E]" />
                          <span>Return to Landing Page</span>
                        </button>
                      )}

                      <div className="my-1 border-t border-[#EAE7DF]" />

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          if (onNavigateHome) {
                            onNavigateHome();
                          }
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 font-medium flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onTriggerAuth}
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#121316] text-white hover:bg-[#002E25] transition-all cursor-pointer font-mono shadow-xs"
              >
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-[#75777E] hover:text-[#121316] hover:bg-[#F4F2EB] transition-colors cursor-pointer"
              title="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Dropdown Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EAE7DF] bg-[#FAF9F5] px-4 py-3 space-y-1 animate-fadeIn">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              const IconComponent = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                    isActive
                      ? "bg-white text-[#121316] font-bold shadow-xs border border-[#EAE7DF]"
                      : "text-[#5A5C63] hover:bg-white/60"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className={`w-4 h-4 ${isActive ? "text-[#15803D]" : "text-[#75777E]"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge}
                </button>
              );
            })}

            {onNavigateHome && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigateHome();
                }}
                className="w-full px-3 py-2 rounded-xl text-xs font-mono text-[#75777E] hover:text-[#121316] flex items-center gap-2 cursor-pointer mt-2 pt-2 border-t border-[#EAE7DF]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Website</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* 2. MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAE7DF] px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => onSelectTab("home")}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === "home" ? "text-[#15803D] font-bold" : "text-[#75777E]"
          }`}
        >
          <Home className="w-4 h-4" />
          <span>Command</span>
        </button>

        <button
          onClick={() => onSelectTab("report")}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === "report" ? "text-[#15803D] font-bold" : "text-[#75777E]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Report</span>
        </button>

        <button
          onClick={() => onSelectTab("opportunities")}
          className={`relative flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === "opportunities" ? "text-[#15803D] font-bold" : "text-[#75777E]"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Opps</span>
          {pendingOpportunitiesCount > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#15803D]" />
          )}
        </button>

        <button
          onClick={() => onSelectTab("automations")}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === "automations" ? "text-[#15803D] font-bold" : "text-[#75777E]"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Autos</span>
        </button>

        <button
          onClick={() => onSelectTab("apps")}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === "apps" ? "text-[#15803D] font-bold" : "text-[#75777E]"
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Apps</span>
        </button>

        <button
          onClick={() => onSelectTab("activity")}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === "activity" ? "text-[#15803D] font-bold" : "text-[#75777E]"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Activity</span>
        </button>

        <button
          onClick={() => onSelectTab("settings")}
          className={`flex flex-col items-center gap-0.5 p-1.5 text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === "settings" ? "text-[#15803D] font-bold" : "text-[#75777E]"
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>
    </>
  );
};
