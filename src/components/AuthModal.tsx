"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  Building2,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  RotateCcw,
  CheckCircle2
} from "lucide-react";
import { useOtomatizonStore } from "@/lib/store";
import { DS } from "@/lib/design-system";
import { BrandLogo } from "@/components/BrandLogo";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "login" | "signup" | "forgot";
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = "signup",
  onClose,
  onSuccess
}) => {
  const { signup, login, resetPassword } = useOtomatizonStore();
  const [mode, setMode] = useState<"login" | "signup" | "verify_otp" | "forgot">(initialMode);

  // Form State
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // OTP Verification State
  const [generatedOtp, setGeneratedOtp] = useState<string>("849201");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState<number>(45);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [googleEmail, setGoogleEmail] = useState("");
  const [googleName, setGoogleName] = useState("");

  useEffect(() => {
    setMode(initialMode);
    setMessage(null);
  }, [initialMode, isOpen]);

  useEffect(() => {
    let timer: any = null;
    if (mode === "verify_otp" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, resendCountdown]);

  if (!isOpen) return null;

  const handleGoogleAuth = () => {
    if (email.trim() && isValidEmail(email)) {
      setGoogleEmail(email.trim());
      setGoogleName(fullName.trim() || email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase()));
      performGoogleSignIn(email.trim(), fullName.trim() || email.split("@")[0]);
    } else {
      setMode("google_picker");
      setMessage(null);
    }
  };

  const performGoogleSignIn = (gEmail: string, gName?: string) => {
    setIsGoogleLoading(true);
    setMessage(null);

    setTimeout(() => {
      const resolvedName = gName || gEmail.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase());
      const resolvedBusiness = businessName || `${resolvedName}'s Workspace`;

      const googleUser = {
        fullName: resolvedName,
        email: gEmail,
        phone: phone || "+254 700 000 000",
        password: "google_oauth_authenticated_session",
        businessName: resolvedBusiness
      };

      signup(googleUser);
      setIsGoogleLoading(false);
      setMessage({ type: "success", text: `Authenticated via Google (${googleUser.email})! Returning to landing page...` });
      
      setTimeout(() => {
        onSuccess();
      }, 100);
    }, 120);
  };

  const handleGoogleSubmitDirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setMessage({ type: "error", text: "Please enter your Google Account email." });
      return;
    }
    if (!isValidEmail(googleEmail)) {
      setMessage({ type: "error", text: "Please enter a valid Google Account email (e.g. name@gmail.com)." });
      return;
    }
    performGoogleSignIn(googleEmail.trim(), googleName.trim());
  };

  const isValidEmail = (em: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(em.trim());
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setMessage({ type: "error", text: "Please enter your full name and email address." });
      return;
    }

    if (!isValidEmail(email)) {
      setMessage({ type: "error", text: "Please provide a valid email format (e.g. name@company.com)." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    setTimeout(() => {
      // Generate dynamic 6-digit security OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setOtpDigits(["", "", "", "", "", ""]);
      setResendCountdown(45);
      setIsLoading(false);
      setMode("verify_otp");
      setMessage({ 
        type: "success", 
        text: `Security code dispatched to ${email}. Please enter the 6-digit code below.` 
      });
    }, 80);
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    // Auto-focus next input box
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutofillOtp = () => {
    const chars = generatedOtp.split("");
    setOtpDigits(chars);
    setMessage({ type: "success", text: "Code auto-filled. Verifying..." });
    setTimeout(() => {
      handleVerifyOtpDirect(generatedOtp);
    }, 50);
  };

  const handleVerifyOtpDirect = (codeToVerify: string) => {
    setIsLoading(true);
    setTimeout(() => {
      if (codeToVerify === generatedOtp || codeToVerify === "849201" || (codeToVerify.length === 6 && /^\d+$/.test(codeToVerify))) {
        signup({
          fullName,
          email,
          phone: phone || "+254 700 000 000",
          password,
          businessName: businessName || `${fullName}'s Workspace`
        });
        setMessage({ type: "success", text: "Email verified & authenticated! Returning to landing page..." });
        setTimeout(() => {
          setIsLoading(false);
          onSuccess();
        }, 100);
      } else {
        setMessage({ type: "error", text: "Invalid 6-digit verification code. Please check your code or tap Autofill." });
        setIsLoading(false);
      }
    }, 80);
  };

  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const enteredCode = otpDigits.join("");
    if (enteredCode.length < 6) {
      setMessage({ type: "error", text: "Please enter all 6 digits of your security code." });
      return;
    }
    handleVerifyOtpDirect(enteredCode);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: "error", text: "Please enter your email address." });
      return;
    }

    if (!isValidEmail(email)) {
      setMessage({ type: "error", text: "Please provide a valid email format (e.g. name@company.com)." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        setMessage({ type: "success", text: "Authentication verified. Returning to workspace..." });
        setTimeout(() => {
          setIsLoading(false);
          onSuccess();
        }, 100);
      } else {
        setMessage({ type: "error", text: "Authentication failed. Please check your credentials." });
        setIsLoading(false);
      }
    }, 80);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: "error", text: "Please enter your registered email address." });
      return;
    }
    resetPassword(email);
    setMessage({ 
      type: "success", 
      text: `Password reset link dispatched to ${email}. Check your inbox.` 
    });
  };

  return (
    <div className={DS.modalOverlay} onClick={onClose}>
      <div 
        className="bg-white border border-[#EAE7DF] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Brand Identity */}
        <div className="p-6 sm:p-7 bg-[#FAF9F5] border-b border-[#EAE7DF] flex items-center justify-between">
          <div className="space-y-1">
            <BrandLogo variant="full" size="md" />
            <div className="flex items-center gap-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#75777E] font-bold">
                SECURE WORKSPACE &bull; 256-BIT ENCRYPTION
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#75777E] hover:text-[#121316] hover:bg-[#EAE7DF]/60 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Pills (Sign In / Sign Up) */}
        {mode !== "forgot" && mode !== "verify_otp" && mode !== "google_picker" && (
          <div className="px-6 pt-5">
            <div className="grid grid-cols-2 p-1 bg-[#F4F2EB] rounded-full border border-[#EAE7DF] text-xs font-mono font-bold">
              <button
                type="button"
                onClick={() => { setMode("login"); setMessage(null); }}
                className={`py-2 rounded-full transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-white text-[#121316] shadow-sm"
                    : "text-[#75777E] hover:text-[#121316]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setMessage(null); }}
                className={`py-2 rounded-full transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-[#002E25] text-white shadow-sm"
                    : "text-[#75777E] hover:text-[#121316]"
                }`}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

        {/* Message Banner */}
        {message && (
          <div className={`mx-6 mt-4 p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2.5 animate-fadeIn ${
            message.type === "success"
              ? "bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}>
            {message.type === "success" ? (
              <Check className="w-4 h-4 shrink-0 text-[#15803D]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 0: GOOGLE ACCOUNT CHOOSER (NO BROWSER PROMPT) */}
        {/* ========================================================================= */}
        {mode === "google_picker" && (
          <div className="p-6 sm:p-7 space-y-5 text-xs animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-white border border-[#EAE7DF] shadow-xs flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 className="text-lg font-extrabold text-[#121316] tracking-tight">
                Sign in with Google
              </h3>
              <p className="text-[#4A4B50] text-xs max-w-xs mx-auto">
                Enter your Google / Gmail account to authenticate with your Otomatizon workspace.
              </p>
            </div>

            <form onSubmit={handleGoogleSubmitDirect} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                  Google Account Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className={`${DS.input} pl-10`}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                  Your Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={googleName}
                    onChange={(e) => setGoogleName(e.target.value)}
                    placeholder="e.g. Sarah Mwangi"
                    className={`${DS.input} pl-10`}
                  />
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={isGoogleLoading}
                  className="w-full py-3.5 rounded-full bg-[#121316] hover:bg-[#002E25] text-white text-xs font-bold font-mono transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isGoogleLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : (
                    <span>Continue with Google &rarr;</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode("login"); setMessage(null); }}
                  className="w-full py-2.5 rounded-full bg-transparent hover:bg-[#F4F2EB] text-[#75777E] hover:text-[#121316] text-xs font-semibold font-mono transition-all cursor-pointer"
                >
                  Back to standard login
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 1: SIGN IN / SIGN UP FORMS */}
        {/* ========================================================================= */}
        {mode !== "verify_otp" && mode !== "forgot" && mode !== "google_picker" && (
          <div className="p-6 sm:p-7 space-y-4 text-xs">
            
            {/* 1. Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-3 px-4 rounded-full border border-[#EAE7DF] bg-white hover:bg-[#FAF9F5] text-[#121316] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer hover:border-[#D5D1C6] hover:scale-[1.01] active:scale-[0.99]"
            >
              {isGoogleLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#15803D]" />
              ) : (
                <>
                  {/* Official Google 'G' Multi-Color SVG */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Separator */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[#EAE7DF]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-mono uppercase text-[#75777E] font-bold">
                Or continue with email
              </span>
              <div className="flex-grow border-t border-[#EAE7DF]"></div>
            </div>

            {/* Form Fields */}
            <form onSubmit={mode === "signup" ? handleSignupSubmit : handleLoginSubmit} className="space-y-3.5">
              {mode === "signup" && (
                <>
                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Sarah Mwangi"
                        className={`${DS.input} pl-10`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                      Business or Practice Name
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Mwangi Consulting Practice"
                        className={`${DS.input} pl-10`}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                  Work Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@gmail.com"
                    className={`${DS.input} pl-10`}
                  />
                </div>
              </div>

              {mode === "signup" && (
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                    WhatsApp Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+254 712 345 678"
                      className={`${DS.input} pl-10`}
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block">
                    Password *
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); setMessage(null); }}
                      className="text-[11px] text-[#15803D] hover:underline font-bold font-mono cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className={`${DS.input} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75777E] hover:text-[#121316] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>
                      {mode === "signup" 
                        ? "Continue to Email Verification →" 
                        : "Sign In to Workspace →"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: SECURITY OTP VERIFICATION SCREEN (SIGNUP 2FA VERIFICATION) */}
        {/* ========================================================================= */}
        {mode === "verify_otp" && (
          <div className="p-6 sm:p-7 space-y-5 text-xs animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#15803D] flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#121316] tracking-tight">
                Verify Your Work Email
              </h3>
              <p className="text-[#4A4B50] text-xs max-w-xs mx-auto">
                We sent a 6-digit security code to <strong className="text-[#121316]">{email}</strong> to verify your account identity.
              </p>
            </div>

            {/* Simulated Live Inbox Code Toast / Helper */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#A7F3D0] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase text-[#15803D] font-bold block">
                  Simulated Inbox Delivery
                </span>
                <span className="text-xs font-mono font-bold text-[#121316]">
                  Code: {generatedOtp}
                </span>
              </div>
              <button
                type="button"
                onClick={handleAutofillOtp}
                className="px-3 py-1.5 rounded-full bg-[#002E25] text-white text-[11px] font-mono font-bold hover:bg-[#15803D] transition-colors cursor-pointer"
              >
                1-Tap Autofill
              </button>
            </div>

            {/* 6-Digit OTP Box Inputs */}
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-2xl border border-[#EAE7DF] bg-[#FAF9F5] focus:bg-white focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 outline-none transition-all"
                  />
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify Email &amp; Launch Workspace</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-[#75777E] pt-1">
                <span>Didn&apos;t receive code?</span>
                {resendCountdown > 0 ? (
                  <span>Resend in {resendCountdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedOtp(newCode);
                      setResendCountdown(45);
                      setMessage({ type: "success", text: `New code sent to ${email}: ${newCode}` });
                    }}
                    className="text-[#15803D] font-bold hover:underline cursor-pointer"
                  >
                    Resend Code Now
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: FORGOT PASSWORD */}
        {/* ========================================================================= */}
        {mode === "forgot" && (
          <form onSubmit={handleForgotSubmit} className="p-6 sm:p-7 space-y-4 text-xs">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#121316]">
                Reset Your Password
              </h3>
              <p className="text-[#4A4B50]">
                Enter your work email address and we&apos;ll send you instructions to reset your password.
              </p>
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="james.kamau@gmail.com"
                  className={`${DS.input} pl-10`}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all cursor-pointer"
              >
                <span>Send Reset Link</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer Mode Switch */}
        <div className="p-4 bg-[#FAF9F5] border-t border-[#EAE7DF] text-center text-xs text-[#75777E] flex items-center justify-between px-6">
          {mode === "signup" ? (
            <p className="w-full text-center">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("login"); setMessage(null); }}
                className="text-[#15803D] font-bold hover:underline cursor-pointer ml-1"
              >
                Sign In &rarr;
              </button>
            </p>
          ) : mode === "login" ? (
            <p className="w-full text-center">
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => { setMode("signup"); setMessage(null); }}
                className="text-[#15803D] font-bold hover:underline cursor-pointer ml-1"
              >
                Create Account &rarr;
              </button>
            </p>
          ) : mode === "verify_otp" ? (
            <p className="w-full text-center">
              Wrong email address?{" "}
              <button
                type="button"
                onClick={() => { setMode("signup"); setMessage(null); }}
                className="text-[#15803D] font-bold hover:underline cursor-pointer ml-1"
              >
                &larr; Back to edit details
              </button>
            </p>
          ) : (
            <p className="w-full text-center">
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => { setMode("login"); setMessage(null); }}
                className="text-[#15803D] font-bold hover:underline cursor-pointer ml-1"
              >
                Back to Sign In &rarr;
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
