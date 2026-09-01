"use client";

import React, { useState, useEffect } from "react";
import { Navbar, NavTab } from "@/components/Navbar";
import { LandingPage } from "@/components/LandingPage";
import { HomeCommandCenter } from "@/components/HomeCommandCenter";
import { OpportunitiesView } from "@/components/OpportunitiesView";
import { AutomationsView } from "@/components/AutomationsView";
import { AppsView } from "@/components/AppsView";
import { ActivityView } from "@/components/ActivityView";
import { SettingsView } from "@/components/SettingsView";
import { BusinessReportView } from "@/components/BusinessReportView";
import { OnboardingModal } from "@/components/OnboardingModal";
import { AuthModal } from "@/components/AuthModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { useOtomatizonStore } from "@/lib/store";
import { Sparkles, ArrowLeft, ShieldAlert } from "lucide-react";

export default function AppRoot() {
  const [view, setView] = useState<"landing" | "app">("landing");
  const [currentTab, setCurrentTab] = useState<NavTab>("home");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState("starter");

  const { state, simulateNewLead } = useOtomatizonStore();

  // Route Synchronization with Browser URL Path
  const applyRoute = (pathname: string) => {
    const clean = (pathname || "/").toLowerCase();

    if (clean === "/login") {
      setView("landing");
      setAuthMode("login");
      setIsAuthOpen(true);
      setIsOnboardingOpen(false);
      setIsCheckoutOpen(false);
    } else if (clean === "/signup") {
      setView("landing");
      setAuthMode("signup");
      setIsAuthOpen(true);
      setIsOnboardingOpen(false);
      setIsCheckoutOpen(false);
    } else if (clean === "/onboarding") {
      setView("landing");
      setIsOnboardingOpen(true);
      setIsAuthOpen(false);
      setIsCheckoutOpen(false);
    } else if (clean.startsWith("/app/settings/billing")) {
      setView("app");
      setCurrentTab("settings");
      setIsCheckoutOpen(true);
    } else if (clean.startsWith("/app/report")) {
      setView("app");
      setCurrentTab("report");
    } else if (clean.startsWith("/app/opportunities")) {
      setView("app");
      setCurrentTab("opportunities");
    } else if (clean.startsWith("/app/automations")) {
      setView("app");
      setCurrentTab("automations");
    } else if (clean.startsWith("/app/apps")) {
      setView("app");
      setCurrentTab("apps");
    } else if (clean.startsWith("/app/activity")) {
      setView("app");
      setCurrentTab("activity");
    } else if (clean.startsWith("/app/settings")) {
      setView("app");
      setCurrentTab("settings");
    } else if (clean.startsWith("/app")) {
      setView("app");
      setCurrentTab("home");
    } else {
      setView("landing");
      setIsAuthOpen(false);
      setIsOnboardingOpen(false);
      setIsCheckoutOpen(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      applyRoute(window.location.pathname);
      const onPop = () => applyRoute(window.location.pathname);
      window.addEventListener("popstate", onPop);
      return () => window.removeEventListener("popstate", onPop);
    }
  }, []);

  const navigateTo = (path: string) => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", path);
      applyRoute(path);
    }
  };

  const pendingOpportunitiesCount = state.opportunities.filter(
    (o) => o.status === "detected" || o.status === "new"
  ).length;
  const activeAutomationsCount = state.workflows.filter((w) => w.active).length;

  const handleSimulateLeadFromNav = () => {
    simulateNewLead({
      name: "Mercy Chebet",
      phone: "+254 719 552 108",
      service: "Executive Exam Prep (90 min)",
      source: "whatsapp"
    });
    navigateTo("/app/activity");
  };

  const handleOnboardingComplete = () => {
    setIsOnboardingOpen(false);
    navigateTo("/app/apps");
  };

  const handleOpenAuth = (mode: "login" | "signup" = "signup") => {
    navigateTo(mode === "login" ? "/login" : "/signup");
  };

  const handleAuthSuccess = () => {
    setIsAuthOpen(false);
    navigateTo("/app");
  };

  const handleOpenCheckout = (planId: string = "starter") => {
    setSelectedCheckoutPlan(planId);
    navigateTo("/app/settings/billing");
  };

  if (view === "landing") {
    return (
      <main className="min-h-screen">
        <LandingPage
          onOpenOnboarding={() => navigateTo("/onboarding")}
          onEnterDashboard={() => navigateTo("/app")}
          onOpenCheckout={handleOpenCheckout}
          onTriggerAuth={(mode = "login") => handleOpenAuth(mode)}
        />
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => navigateTo("/")}
          onComplete={handleOnboardingComplete}
          onTriggerAuth={(mode = "signup") => handleOpenAuth(mode)}
        />
        <AuthModal
          isOpen={isAuthOpen}
          initialMode={authMode}
          onClose={() => navigateTo("/")}
          onSuccess={handleAuthSuccess}
        />
        <CheckoutModal
          isOpen={isCheckoutOpen}
          planId={selectedCheckoutPlan}
          onClose={() => navigateTo("/")}
          onSuccess={() => {
            setIsCheckoutOpen(false);
            navigateTo("/app");
          }}
        />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F5] text-[#121316] pb-28 md:pb-16 font-sans">
      {/* App Floating Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => navigateTo(`/app/${tab}`)}
        pendingOpportunitiesCount={pendingOpportunitiesCount}
        activeAutomationsCount={activeAutomationsCount}
        onTriggerOnboarding={() => navigateTo("/onboarding")}
        onTriggerSimulation={handleSimulateLeadFromNav}
        onTriggerAuth={() => handleOpenAuth("login")}
        onNavigateHome={() => navigateTo("/")}
      />

      {/* Active Tab View */}
      <main className="flex-1 w-full pt-2">
        {currentTab === "home" && (
          <HomeCommandCenter
            onNavigate={(tab) => navigateTo(`/app/${tab}`)}
            onOpenOnboarding={() => navigateTo("/onboarding")}
          />
        )}

        {currentTab === "report" && (
          <BusinessReportView
            onNavigateToAutomations={() => navigateTo("/app/automations")}
            onNavigateToApps={() => navigateTo("/app/apps")}
          />
        )}

        {currentTab === "opportunities" && (
          <OpportunitiesView
            onNavigateToAutomations={() => navigateTo("/app/automations")}
          />
        )}

        {currentTab === "automations" && (
          <AutomationsView
            onNavigateToActivity={() => navigateTo("/app/activity")}
          />
        )}

        {currentTab === "apps" && (
          <AppsView onNavigateToAutomations={() => navigateTo("/app/automations")} />
        )}

        {currentTab === "activity" && <ActivityView />}

        {currentTab === "settings" && <SettingsView />}
      </main>

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => navigateTo("/app")}
        onComplete={handleOnboardingComplete}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => navigateTo("/app")}
        onSuccess={handleAuthSuccess}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        planId={selectedCheckoutPlan}
        onClose={() => navigateTo("/app/settings")}
        onSuccess={() => {
          setIsCheckoutOpen(false);
          navigateTo("/app");
        }}
      />
    </div>
  );
}
