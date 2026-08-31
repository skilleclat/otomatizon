"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Calendar, 
  FileSpreadsheet, 
  Mail, 
  CreditCard,
  HardDrive,
  MapPin
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { Opportunity } from "@/types";
import { AutomationPreviewModal } from "./AutomationPreviewModal";
import { DS } from "@/lib/design-system";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const { state, activateOpportunity, updateBusinessProfile } = useOtomatizonStore();
  const [step, setStep] = useState(1);

  // Step inputs
  const [whatYouDo, setWhatYouDo] = useState("Private tutor and professional exam coach in Nairobi");
  const [channels, setChannels] = useState<string[]>(["WhatsApp", "Google", "Referrals"]);
  const [selectedApps, setSelectedApps] = useState<string[]>([
    "WhatsApp Business",
    "Google Calendar",
    "Gmail",
    "Google Sheets",
    "M-Pesa"
  ]);
  const [wishAutomation, setWishAutomation] = useState(
    "When someone asks about my rates on WhatsApp, send the info and follow up if they don't book within 24 hours."
  );

  const [selectedOppForPreview, setSelectedOppForPreview] = useState<Opportunity | null>(null);

  if (!isOpen) return null;

  const toggleChannel = (item: string) => {
    setChannels((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleApp = (app: string) => {
    setSelectedApps((prev) =>
      prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]
    );
  };

  const channelOptions = [
    { name: "Google", icon: MapPin },
    { name: "WhatsApp", icon: MessageSquare },
    { name: "Instagram", icon: Mail },
    { name: "Facebook", icon: Mail },
    { name: "Referrals", icon: CheckCircle2 },
    { name: "Other", icon: Sparkles }
  ];

  const appOptions = [
    { name: "WhatsApp Business", icon: MessageSquare },
    { name: "Google Calendar", icon: Calendar },
    { name: "Gmail", icon: Mail },
    { name: "Google Sheets", icon: FileSpreadsheet },
    { name: "Google Drive", icon: HardDrive },
    { name: "M-Pesa", icon: CreditCard }
  ];

  const handleFinishOnboarding = () => {
    updateBusinessProfile({
      businessType: whatYouDo,
      toolsUsed: selectedApps,
      customerAcquisitionChannels: channels,
      biggestRepetitiveTask: wishAutomation
    });
    onComplete();
  };

  return (
    <div className={DS.modalOverlay} onClick={onClose}>
      <div 
        className={DS.modalDialog}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className={DS.modalHeader}>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-[#15803D] font-bold uppercase tracking-wider">
              {step <= 4 ? `Step ${step} of 4` : "Discovery"}
            </span>
            <span className="w-1 h-1 rounded-full bg-[#EAE7DF]" />
            <span className="text-xs text-[#75777E]">
              {step <= 4 ? "Simple setup" : "Your automations are ready"}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#75777E] hover:text-[#121316] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          
          {/* STEP 1: WHAT DO YOU DO? */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121316] tracking-tight">
                  What do you do?
                </h2>
                <p className="text-sm text-[#4A4B50] mt-1.5">
                  Tell us in everyday words. No business jargon needed.
                </p>
              </div>

              <textarea
                value={whatYouDo}
                onChange={(e) => setWhatYouDo(e.target.value)}
                placeholder="e.g. I run a private language coaching service in Nairobi for adults and exam students."
                rows={4}
                className={DS.textarea}
              />

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!whatYouDo.trim()}
                  className={DS.btnPrimary}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: HOW DO CUSTOMERS FIND YOU? */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121316] tracking-tight">
                  How do customers find you?
                </h2>
                <p className="text-sm text-[#4A4B50] mt-1.5">
                  Select all channels where inquiries arrive.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {channelOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = channels.includes(opt.name);

                  return (
                    <button
                      key={opt.name}
                      type="button"
                      onClick={() => toggleChannel(opt.name)}
                      className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? "bg-[#ECFDF5] border-[#15803D] text-[#15803D] font-bold"
                          : "bg-[#FAF9F5] border-[#EAE7DF] text-[#121316] hover:bg-stone-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-semibold">{opt.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#15803D] ml-auto" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className={DS.btnGhost}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={channels.length === 0}
                  className={DS.btnPrimary}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: WHAT TOOLS DO YOU ALREADY USE? */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121316] tracking-tight">
                  What tools do you already use?
                </h2>
                <p className="text-sm text-[#4A4B50] mt-1.5">
                  Pick the apps where your business data already lives.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {appOptions.map((app) => {
                  const Icon = app.icon;
                  const isSelected = selectedApps.includes(app.name);

                  return (
                    <button
                      key={app.name}
                      type="button"
                      onClick={() => toggleApp(app.name)}
                      className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        isSelected
                          ? "bg-[#ECFDF5] border-[#15803D] text-[#15803D] font-bold"
                          : "bg-[#FAF9F5] border-[#EAE7DF] text-[#121316] hover:bg-stone-50"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="text-xs font-semibold">{app.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#15803D] ml-auto" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className={DS.btnGhost}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={selectedApps.length === 0}
                  className={DS.btnPrimary}
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: WHAT DO YOU WISH HAPPENED AUTOMATICALLY? */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121316] tracking-tight">
                  What&apos;s one thing you wish happened automatically?
                </h2>
                <p className="text-sm text-[#4A4B50] mt-1.5">
                  Describe what drains your time or causes you to lose clients.
                </p>
              </div>

              <textarea
                value={wishAutomation}
                onChange={(e) => setWishAutomation(e.target.value)}
                placeholder="e.g. Following up with people who ask for prices on WhatsApp but never book."
                rows={4}
                className={DS.textarea}
              />

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(3)}
                  className={DS.btnGhost}
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  disabled={!wishAutomation.trim()}
                  className={DS.btnPrimary}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Analyze My Business</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: SIGNATURE MOMENT — OPPORTUNITY DISCOVERY */}
          {step === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1">
                <span className={DS.monoEyebrow}>
                  Discovery Complete
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#121316] tracking-tight">
                  We found {state.opportunities.length} things you could automate.
                </h2>
                <p className="text-sm text-[#4A4B50]">
                  Based on your connected tools and customer channels.
                </p>
              </div>

              {/* Signature Highlight Banner */}
              <div className="p-6 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-3">
                <div className="flex items-center justify-between">
                  <span className={DS.badgeSuccess}>
                    WE FOUND SOMETHING
                  </span>
                  <span className={DS.badgeHighImpact}>
                    HIGH IMPACT
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#121316]">
                    You may be losing leads between inquiry and booking.
                  </h3>
                  <p className="text-xs text-[#4A4B50] leading-relaxed">
                    Automatically follow up after 24 hours if the customer hasn&apos;t booked.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setSelectedOppForPreview(state.opportunities[0])}
                    className={DS.btnPrimary}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Automate this</span>
                  </button>
                </div>
              </div>

              {/* All other detected opportunities list */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-mono uppercase text-[#75777E] font-semibold tracking-wider block">
                  Other detected opportunities
                </span>
                {state.opportunities.slice(1, 3).map((opp, idx) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-[#121316]">{opp.problem}</h4>
                      <p className="text-[#4A4B50] text-[11px] mt-0.5">{opp.recommendation}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOppForPreview(opp)}
                      className={DS.btnSecondary}
                    >
                      Preview
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#EAE7DF] flex justify-end">
                <button
                  onClick={handleFinishOnboarding}
                  className={DS.btnPrimary}
                >
                  <span>Go to Command Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal from Step 5 */}
      <AutomationPreviewModal
        isOpen={!!selectedOppForPreview}
        onClose={() => setSelectedOppForPreview(null)}
        opportunity={selectedOppForPreview}
        onActivate={() => {
          if (selectedOppForPreview) {
            activateOpportunity(selectedOppForPreview.id);
            setSelectedOppForPreview(null);
            handleFinishOnboarding();
          }
        }}
      />
    </div>
  );
};
