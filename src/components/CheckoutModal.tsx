"use client";

import React, { useState } from "react";
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight,
  Copy,
  CheckCircle2,
  ExternalLink,
  Lock,
  Globe
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { getPlanConfig } from "@/lib/billing/config";
import { trackFunnelEvent } from "@/lib/analytics/funnel";
import { DS } from "@/lib/design-system";
import { BrandLogo } from "@/components/BrandLogo";

interface CheckoutModalProps {
  isOpen: boolean;
  planId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export type PaymentMethod = "mpesa" | "paypal" | "stripe";

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  planId = "growth",
  onClose,
  onSuccess
}) => {
  const { upgradePlan } = useOtomatizonStore();
  const plan = getPlanConfig(planId);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"checkout" | "mpesa_prompt_sent" | "success">("checkout");

  // Form states
  // M-Pesa state
  const [mpesaPhone, setMpesaPhone] = useState("+254 722 000 123");
  const [mpesaTransCode, setMpesaTransCode] = useState("");
  const [mpesaMode, setMpesaMode] = useState<"stk" | "paybill">("paybill");

  // PayPal state
  const [paypalPayerEmail, setPaypalPayerEmail] = useState("");
  const [paypalTxId, setPaypalTxId] = useState("");

  // Stripe state
  const [cardName, setCardName] = useState("James Kamau");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("382");

  if (!isOpen) return null;

  const amountKes = plan.priceKesMonthly;
  const amountUsd = (amountKes / 128).toFixed(2); // approximate KES to USD rate for global payers

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFreeActivation = () => {
    setIsProcessing(true);
    setTimeout(() => {
      upgradePlan("free");
      trackFunnelEvent("free_plan_activated", { planId: "free" });
      setIsProcessing(false);
      setStep("success");
      setTimeout(() => {
        onSuccess();
      }, 600);
    }, 300);
  };

  const handleMpesaStkPush = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setStep("mpesa_prompt_sent");

      setTimeout(() => {
        upgradePlan(plan.id as any);
        trackFunnelEvent("paid_subscription", { planId: plan.id, method: "mpesa_stk", amountKes });
        setStep("success");
        setTimeout(() => {
          onSuccess();
        }, 600);
      }, 1800);
    }, 400);
  };

  const handleMpesaPaybillVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      upgradePlan(plan.id as any);
      trackFunnelEvent("paid_subscription", { planId: plan.id, method: "mpesa_paybill", amountKes, txCode: mpesaTransCode });
      setIsProcessing(false);
      setStep("success");
      setTimeout(() => {
        onSuccess();
      }, 600);
    }, 400);
  };

  const handlePaypalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      upgradePlan(plan.id as any);
      trackFunnelEvent("paid_subscription", { planId: plan.id, method: "paypal", amountUsd, payer: paypalPayerEmail });
      setIsProcessing(false);
      setStep("success");
      setTimeout(() => {
        onSuccess();
      }, 600);
    }, 400);
  };

  const handleStripeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      upgradePlan(plan.id as any);
      trackFunnelEvent("paid_subscription", { planId: plan.id, method: "stripe_card", amountKes });
      setIsProcessing(false);
      setStep("success");
      setTimeout(() => {
        onSuccess();
      }, 600);
    }, 400);
  };

  return (
    <div className={DS.modalOverlay} onClick={onClose}>
      <div 
        className="bg-white border border-[#EAE7DF] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 sm:p-7 bg-[#FAF9F5] border-b border-[#EAE7DF] flex items-center justify-between">
          <div className="space-y-1">
            <BrandLogo variant="full" size="md" />
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold">
                SUBSCRIBE TO {plan.name.toUpperCase()} PLAN &bull; INSTANT ACTIVATION
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="p-2 rounded-full text-[#75777E] hover:text-[#121316] hover:bg-[#EAE7DF]/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Plan Summary Banner */}
        <div className="px-6 py-4 bg-white border-b border-[#EAE7DF] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#121316]">{plan.name} Plan</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] text-[10px] font-mono font-bold">
                {plan.id === "free" ? "Free Forever" : "Billed Monthly"}
              </span>
            </div>
            <p className="text-xs text-[#4A4B50] mt-0.5">{plan.tagline}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-extrabold text-[#121316]">
              {amountKes === 0 ? "KES 0" : `KES ${amountKes.toLocaleString()}`}
            </div>
            <div className="text-[11px] font-mono text-[#75777E]">
              {amountKes === 0 ? "No credit card needed" : `~ $${amountUsd} USD / mo`}
            </div>
          </div>
        </div>

        {/* Free Plan Instant Activation */}
        {step === "checkout" && plan.id === "free" && (
          <div className="p-6 space-y-5 text-xs">
            <div className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#EAE7DF] space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-[#121316]">
                <Sparkles className="w-4 h-4 text-[#15803D]" />
                <span>Free Plan Includes:</span>
              </div>
              <ul className="space-y-2 text-[#4A4B50]">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={handleFreeActivation}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-full bg-[#002E25] hover:bg-[#001D17] text-white text-xs font-bold font-mono transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isProcessing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Activate Free Workspace Now &rarr;</span>
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-[#75777E]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
              <span>No payment info required &bull; Upgrade anytime</span>
            </div>
          </div>
        )}

        {/* Payment Method Selector Tabs */}
        {step === "checkout" && plan.id !== "free" && (
          <div className="p-6 space-y-5 text-xs">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-[#F4F2EB] rounded-2xl border border-[#EAE7DF]">
                
                {/* 1. M-PESA */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("mpesa")}
                  className={`py-2.5 px-3 rounded-xl font-bold font-mono transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === "mpesa"
                      ? "bg-white text-[#15803D] shadow-sm border border-[#A7F3D0]"
                      : "text-[#75777E] hover:text-[#121316]"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>M-Pesa</span>
                  </div>
                  <span className="text-[9px] font-normal opacity-80">Paybill &bull; STK</span>
                </button>

                {/* 2. PAYPAL */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`py-2.5 px-3 rounded-xl font-bold font-mono transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === "paypal"
                      ? "bg-white text-[#003087] shadow-sm border border-[#003087]/30"
                      : "text-[#75777E] hover:text-[#121316]"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>PayPal</span>
                  </div>
                  <span className="text-[9px] font-normal opacity-80">Global &bull; USD</span>
                </button>

                {/* 3. STRIPE (CARD) */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("stripe")}
                  className={`py-2.5 px-3 rounded-xl font-bold font-mono transition-all flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === "stripe"
                      ? "bg-white text-[#635BFF] shadow-sm border border-[#635BFF]/30"
                      : "text-[#75777E] hover:text-[#121316]"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Stripe</span>
                  </div>
                  <span className="text-[9px] font-normal opacity-80">Cards &bull; Apple Pay</span>
                </button>
              </div>
            </div>

            {/* ================================================================= */}
            {/* METHOD 1: SAFARICOM M-PESA */}
            {/* ================================================================= */}
            {paymentMethod === "mpesa" && (
              <div className="space-y-4 animate-fadeIn">
                
                {/* Official Paybill Reference Box */}
                <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#A7F3D0]/60 pb-2.5">
                    <span className="text-xs font-bold text-[#15803D] flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4" />
                      Safaricom Lipa Na M-Pesa Details
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#15803D] bg-white px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                      Official Paybill
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-[#A7F3D0] space-y-1">
                      <span className="text-[10px] font-mono text-[#75777E] uppercase block">
                        Pay Bill Number
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold font-mono text-[#121316]">
                          247247
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("247247", "paybill")}
                          className="p-1 text-[#15803D] hover:bg-[#ECFDF5] rounded-md cursor-pointer"
                          title="Copy Paybill"
                        >
                          {copiedField === "paybill" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-[#A7F3D0] space-y-1">
                      <span className="text-[10px] font-mono text-[#75777E] uppercase block">
                        Account Number
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold font-mono text-[#121316]">
                          0743898803
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("0743898803", "account")}
                          className="p-1 text-[#15803D] hover:bg-[#ECFDF5] rounded-md cursor-pointer"
                          title="Copy Account Number"
                        >
                          {copiedField === "account" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#4A4B50] space-y-1 pt-1">
                    <p className="font-semibold text-[#121316]">How to complete payment:</p>
                    <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-[#4A4B50]">
                      <li>Go to M-Pesa &rarr; Lipa na M-Pesa &rarr; <strong>Pay Bill</strong></li>
                      <li>Enter Business Number: <strong>247247</strong></li>
                      <li>Enter Account Number: <strong>0743898803</strong></li>
                      <li>Enter Amount: <strong>KES {amountKes.toLocaleString()}</strong> &amp; your M-Pesa PIN</li>
                    </ol>
                  </div>
                </div>

                {/* Sub-tabs: Instant STK Push or Enter Confirmation Code */}
                <div className="flex items-center gap-2 pt-1 border-t border-[#EAE7DF]">
                  <button
                    type="button"
                    onClick={() => setMpesaMode("paybill")}
                    className={`flex-1 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                      mpesaMode === "paybill"
                        ? "bg-[#002E25] text-white shadow-xs"
                        : "bg-[#FAF9F5] text-[#75777E] hover:text-[#121316] border border-[#EAE7DF]"
                    }`}
                  >
                    I Have Paid (Enter M-Pesa Code)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMpesaMode("stk")}
                    className={`flex-1 py-2 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                      mpesaMode === "stk"
                        ? "bg-[#002E25] text-white shadow-xs"
                        : "bg-[#FAF9F5] text-[#75777E] hover:text-[#121316] border border-[#EAE7DF]"
                    }`}
                  >
                    Send STK Push Prompt
                  </button>
                </div>

                {mpesaMode === "paybill" ? (
                  <form onSubmit={handleMpesaPaybillVerify} className="space-y-3 pt-1">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                        M-Pesa Confirmation Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={mpesaTransCode}
                        onChange={(e) => setMpesaTransCode(e.target.value.toUpperCase())}
                        placeholder="e.g. QKD7819H7Z"
                        className={`${DS.input} uppercase font-mono`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold font-mono transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify &amp; Activate Subscription</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleMpesaStkPush} className="space-y-3 pt-1">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                        M-Pesa Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={mpesaPhone}
                        onChange={(e) => setMpesaPhone(e.target.value)}
                        placeholder="+254 712 345 678"
                        className={DS.input}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-full bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold font-mono transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Send Lipa Na M-Pesa STK Prompt &rarr;</span>
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ================================================================= */}
            {/* METHOD 2: PAYPAL */}
            {/* ================================================================= */}
            {paymentMethod === "paypal" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-[#003087]/5 border border-[#003087]/20 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#003087]/20 pb-2">
                    <span className="text-xs font-bold text-[#003087] flex items-center gap-1.5">
                      <Globe className="w-4 h-4" />
                      PayPal Transfer Reference
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[#003087] bg-white px-2 py-0.5 rounded-full border border-[#003087]/20">
                      ${amountUsd} USD
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#003087]/20 space-y-1">
                    <span className="text-[10px] font-mono text-[#75777E] uppercase block">
                      Official PayPal Email Address
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold font-mono text-[#121316] break-all">
                        herimaliyabwana@gmail.com
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("herimaliyabwana@gmail.com", "paypal_email")}
                        className="p-1 text-[#003087] hover:bg-[#003087]/10 rounded-md cursor-pointer shrink-0 ml-2"
                        title="Copy PayPal Email"
                      >
                        {copiedField === "paypal_email" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#4A4B50]">
                    Send <strong>${amountUsd} USD</strong> (or KES {amountKes.toLocaleString()}) to <strong>herimaliyabwana@gmail.com</strong> with your business name in the transfer note.
                  </p>
                </div>

                <form onSubmit={handlePaypalSubmit} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                      Your PayPal Account Email / Name *
                    </label>
                    <input
                      type="email"
                      required
                      value={paypalPayerEmail}
                      onChange={(e) => setPaypalPayerEmail(e.target.value)}
                      placeholder="your.paypal.account@gmail.com"
                      className={DS.input}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-full bg-[#003087] hover:bg-[#002266] text-white text-xs font-bold font-mono transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm PayPal Payment &amp; Activate</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ================================================================= */}
            {/* METHOD 3: STRIPE (CREDIT / DEBIT CARD / APPLE PAY) */}
            {/* ================================================================= */}
            {paymentMethod === "stripe" && (
              <form onSubmit={handleStripeSubmit} className="space-y-3.5 animate-fadeIn">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] font-bold text-[#121316]">
                    Credit or Debit Card
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold bg-[#635BFF]/10 text-[#635BFF] px-2 py-0.5 rounded">
                      STRIPE SECURE
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className={DS.input}
                    placeholder="James Kamau"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                    Card Number
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className={`${DS.input} pl-10 font-mono`}
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                      Expiry (MM/YY)
                    </label>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className={`${DS.input} font-mono`}
                      placeholder="12/28"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                      CVC / CVV
                    </label>
                    <div className="relative">
                      <Lock className="w-3.5 h-3.5 text-[#75777E] absolute right-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        maxLength={4}
                        required
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className={`${DS.input} font-mono`}
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-full bg-[#635BFF] hover:bg-[#4E44E6] text-white text-xs font-bold font-mono transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Pay KES {amountKes.toLocaleString()} (~${amountUsd} USD)</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Security Guarantee Footer */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[10px] font-mono text-[#75777E]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#15803D]" />
              <span>256-bit SSL &bull; Instant plan upgrade &bull; Cancel anytime</span>
            </div>
          </div>
        )}

        {/* M-PESA STK Push Waiting State */}
        {step === "mpesa_prompt_sent" && (
          <div className="p-8 text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] flex items-center justify-center mx-auto animate-pulse">
              <Smartphone className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#121316]">
                Check Your Mobile Handset
              </h3>
              <p className="text-xs text-[#4A4B50]">
                A prompt for <strong>KES {amountKes.toLocaleString()}</strong> was sent to <strong>{mpesaPhone}</strong>.
              </p>
              <p className="text-[11px] font-mono text-[#75777E] pt-2">
                Enter your M-Pesa PIN on your phone to approve.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-[#15803D]">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Awaiting Safaricom confirmation...</span>
            </div>
          </div>
        )}

        {/* SUCCESS STATE */}
        {step === "success" && (
          <div className="p-8 text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#121316]">
                Subscription Activated!
              </h3>
              <p className="text-xs text-[#4A4B50]">
                Welcome to <strong>{plan.name} Plan</strong>. Your workspace capacity has been upgraded.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
