"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Calendar,
  CreditCard,
  FileSpreadsheet,
  Mail,
  MapPin,
  CheckCircle2,
  Zap,
  Info
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { Opportunity } from "@/types";
import { AutomationPreviewModal } from "./AutomationPreviewModal";
import { DS } from "@/lib/design-system";

interface OpportunitiesViewProps {
  onNavigateToAutomations: () => void;
}

interface OpportunityContent {
  title: string;
  titleFr?: string;
  evidence: string;
  evidenceFr?: string;
  whyItMatters: string;
  whyItMattersFr?: string;
  recommendation: string;
  recommendationFr?: string;
  impactFormattedKes: string;
}

const localizedOpportunities: Record<string, OpportunityContent> = {
  opp_lead_leakage: {
    title: "14 Leads Are Not Being Followed Up",
    titleFr: "14 Leads Are Not Being Followed Up",
    evidence: "We detected 14 inquiries that did not receive a follow-up 24 hours after their initial message.",
    evidenceFr: "We detected 14 inquiries that did not receive a follow-up 24 hours after their initial message.",
    whyItMatters: "You are losing qualified prospective students between their first inquiry and booking.",
    whyItMattersFr: "You are losing qualified prospective students between their first inquiry and booking.",
    recommendation: "Automatically follow up 24h after inquiry if no booking is detected on Google Calendar.",
    recommendationFr: "Automatically follow up 24h after inquiry if no booking is detected on Google Calendar.",
    impactFormattedKes: "KES 49,000 +"
  },
  opp_mpesa_friction: {
    title: "Unconfirmed Tuition Payments Before Sessions",
    titleFr: "Unconfirmed Tuition Payments Before Sessions",
    evidence: "6 tutoring sessions occurred without a verified Safaricom M-Pesa receipt.",
    evidenceFr: "6 tutoring sessions occurred without a verified Safaricom M-Pesa receipt.",
    whyItMatters: "Sessions take place without guaranteed settlement, causing cash flow delays.",
    whyItMattersFr: "Sessions take place without guaranteed settlement, causing cash flow delays.",
    recommendation: "Automatically verify M-Pesa transaction codes before confirming each lesson.",
    recommendationFr: "Automatically verify M-Pesa transaction codes before confirming each lesson.",
    impactFormattedKes: "KES 45,000 +"
  },
  opp_review_leakage: {
    title: "Unsolicited Google Maps Reviews After Sessions",
    titleFr: "Unsolicited Google Maps Reviews After Sessions",
    evidence: "18 completed sessions with zero review requests sent.",
    evidenceFr: "18 completed sessions with zero review requests sent.",
    whyItMatters: "Local Google Maps visibility stalls even though students are completely satisfied.",
    whyItMattersFr: "Local Google Maps visibility stalls even though students are completely satisfied.",
    recommendation: "Send a 1-click Google Maps review link 2 hours after each lesson cycle concludes.",
    recommendationFr: "Send a 1-click Google Maps review link 2 hours after each lesson cycle concludes.",
    impactFormattedKes: "KES 15,000 +"
  }
};

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({
  onNavigateToAutomations
}) => {
  const { state, activateOpportunity, dismissOpportunity } = useOtomatizonStore();
  const [selectedOppForPreview, setSelectedOppForPreview] = useState<Opportunity | null>(null);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [isActivatingId, setIsActivatingId] = useState<string | null>(null);

  const filteredOpportunities = state.opportunities.filter((o) => {
    if (filter === "all") return true;
    if (filter === "high") return o.impactLevel.toLowerCase().includes("high");
    if (filter === "medium") return o.impactLevel.toLowerCase().includes("medium");
    if (filter === "low") return o.impactLevel.toLowerCase().includes("low");
    return true;
  });

  const getAppIcon = (appId: string) => {
    const low = appId.toLowerCase();
    if (low.includes("whatsapp")) return <MessageSquare className="w-4 h-4 text-[#15803D]" />;
    if (low.includes("calendar")) return <Calendar className="w-4 h-4 text-blue-600" />;
    if (low.includes("sheet")) return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    if (low.includes("mpesa") || low.includes("payment")) return <CreditCard className="w-4 h-4 text-emerald-700" />;
    if (low.includes("business") || low.includes("map")) return <MapPin className="w-4 h-4 text-blue-600" />;
    if (low.includes("mail") || low.includes("gmail")) return <Mail className="w-4 h-4 text-red-600" />;
    return <Sparkles className="w-4 h-4 text-[#15803D]" />;
  };

  const getRequiredAppList = (opp: Opportunity) => {
    if (opp.id === "opp_lead_leakage") {
      return ["whatsapp_business", "google_sheets", "google_calendar"];
    }
    if (opp.id === "opp_mpesa_friction") {
      return ["mpesa", "google_sheets", "google_calendar"];
    }
    return opp.requiredIntegrations || ["whatsapp_business", "google_calendar"];
  };

  const handleCreateAutomation = async (opp: Opportunity) => {
    setIsActivatingId(opp.id);
    
    // Carry opportunity ID and context directly into active automation
    await activateOpportunity(opp.id);

    setTimeout(() => {
      setIsActivatingId(null);
      onNavigateToAutomations();
    }, 450);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* 1. HEADER matching Reference Image 4 */}
      <div className="border-b border-[#EAE7DF] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#121316] tracking-tight">
            Discovered Opportunities
          </h1>
          <p className="text-[#4A4B50] text-xs sm:text-sm mt-1 font-normal">
            {filteredOpportunities.length} {filteredOpportunities.length === 1 ? "opportunity discovered" : "opportunities discovered"}
          </p>
        </div>

        {/* Filter Pills matching Reference Image 4 */}
        <div className="flex items-center gap-1.5 bg-[#F4F2EB] p-1.5 rounded-full border border-[#EAE7DF] text-xs font-mono">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1 rounded-full transition-all text-xs font-medium ${
              filter === "all"
                ? "bg-white text-[#121316] font-bold shadow-2xs"
                : "text-[#75777E] hover:text-[#121316]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("high")}
            className={`px-3.5 py-1 rounded-full transition-all text-xs font-medium ${
              filter === "high"
                ? "bg-white text-[#121316] font-bold shadow-2xs"
                : "text-[#75777E] hover:text-[#121316]"
            }`}
          >
            High Impact
          </button>
          <button
            onClick={() => setFilter("medium")}
            className={`px-3.5 py-1 rounded-full transition-all text-xs font-medium ${
              filter === "medium"
                ? "bg-white text-[#121316] font-bold shadow-2xs"
                : "text-[#75777E] hover:text-[#121316]"
            }`}
          >
            Medium Impact
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`px-3.5 py-1 rounded-full transition-all text-xs font-medium ${
              filter === "low"
                ? "bg-white text-[#121316] font-bold shadow-2xs"
                : "text-[#75777E] hover:text-[#121316]"
            }`}
          >
            Low Impact
          </button>
        </div>
      </div>

      {/* 2. OPPORTUNITY CARDS matching Reference Image 4 */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#EAE7DF] shadow-sm p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-center mx-auto text-[#75777E]">
            <Sparkles className="w-5 h-5 text-[#15803D]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-[#121316]">
              No opportunities match this filter
            </h3>
            <p className="text-xs text-[#4A4B50] max-w-sm mx-auto">
              Select &laquo; All &raquo; to view all operational opportunities discovered by Otomatizon.
            </p>
          </div>
          <button
            onClick={() => setFilter("all")}
            className={DS.btnSecondary}
          >
            Show all opportunities
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOpportunities.map((opp, idx) => {
            const loc = localizedOpportunities[opp.id] || {
              title: opp.title,
              evidence: opp.evidence,
              whyItMatters: opp.problem,
              recommendation: opp.recommendation,
              impactFormattedKes: opp.monthlyValueKes 
                ? `KES ${opp.monthlyValueKes.toLocaleString()} +` 
                : `KES ${opp.estimatedRevenueAtRiskKes.toLocaleString()} +`
            };

            const isHigh = opp.impactLevel.toLowerCase().includes("high") || opp.impactScore >= 85;
            const rankNumber = idx + 1;
            const requiredApps = getRequiredAppList(opp);

            return (
              <div 
                key={opp.id}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE7DF] hover:border-[#D5D1C6] transition-all shadow-sm space-y-6 animate-fadeIn"
              >
                {/* Top Row: Impact Level Badge & Rank */}
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-full ${
                    isHigh 
                      ? "bg-rose-50 text-rose-700 border border-rose-200" 
                      : "bg-amber-50 text-amber-800 border border-amber-200"
                  }`}>
                    {isHigh ? "HIGH IMPACT" : "MEDIUM IMPACT"}
                  </span>

                  <span className="text-xs font-mono font-bold text-[#75777E]">
                    {`#${rankNumber}`}
                  </span>
                </div>

                {/* Second Row: Title, Evidence & Big Impact Box matching Image 4 */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 max-w-2xl">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#121316] tracking-tight">
                      {loc.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#4A4B50] leading-relaxed">
                      {loc.evidence}
                    </p>
                  </div>

                  {/* Impact Box */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] text-right shrink-0 self-start md:self-auto min-w-[140px]">
                    <div className="text-[10px] font-mono text-[#75777E] uppercase tracking-wider">
                      Estimated impact &gt;
                    </div>
                    <div className="text-xl font-extrabold text-[#121316] font-mono mt-0.5">
                      {loc.impactFormattedKes}
                    </div>
                    <div className="text-[10px] font-mono text-[#75777E]">
                      / mo
                    </div>
                  </div>
                </div>

                {/* Section: WHY IT MATTERS */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
                    WHY IT MATTERS
                  </span>
                  <p className="text-xs sm:text-sm text-[#121316] font-normal leading-relaxed">
                    {loc.whyItMatters}
                  </p>
                </div>

                {/* Section: RECOMMENDED AUTOMATION */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
                    RECOMMENDED AUTOMATION
                  </span>
                  <p className="text-xs sm:text-sm text-[#121316] font-normal leading-relaxed">
                    {loc.recommendation}
                  </p>
                </div>

                {/* Bottom Row: REQUIRED APPLICATIONS & ACTION BUTTON matching Image 4 */}
                <div className="pt-3 border-t border-[#EAE7DF] flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  
                  {/* Left: REQUIRED APPLICATIONS with visual interconnected pills */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold block">
                      REQUIRED APPLICATIONS
                    </span>

                    <div className="flex items-center gap-2">
                      {requiredApps.map((appId, i) => (
                        <React.Fragment key={appId}>
                          <div 
                            className="w-9 h-9 rounded-xl bg-white border border-[#EAE7DF] shadow-2xs flex items-center justify-center"
                            title={appId.replace(/_/g, " ")}
                          >
                            {getAppIcon(appId)}
                          </div>
                          {i < requiredApps.length - 1 && (
                            <span className="w-3 h-0.5 bg-[#D5D1C6] rounded-full" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* Right: Primary Action Button: BUILD THIS AUTOMATION */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <button
                      onClick={() => setSelectedOppForPreview(opp)}
                      className="text-xs font-mono text-[#75777E] hover:text-[#121316] underline"
                      title="Review automation details before activation"
                    >
                      Flow details
                    </button>

                    <button
                      onClick={() => handleCreateAutomation(opp)}
                      disabled={isActivatingId === opp.id}
                      className="px-6 py-3 rounded-full bg-[#002E25] hover:bg-[#004034] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                    >
                      <span>
                        {isActivatingId === opp.id ? "Building automation..." : "Build this automation"}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    </button>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Preview & Detailed Step Review Modal */}
      {selectedOppForPreview && (
        <AutomationPreviewModal
          isOpen={true}
          onClose={() => setSelectedOppForPreview(null)}
          opportunity={selectedOppForPreview}
          onActivate={() => {
            if (selectedOppForPreview) {
              handleCreateAutomation(selectedOppForPreview);
              setSelectedOppForPreview(null);
            }
          }}
        />
      )}

    </div>
  );
};
