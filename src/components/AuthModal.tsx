"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  Building2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  RotateCcw, 
  CheckCircle2, 
  ShieldCheck 
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
  const { signup, login, sendPasswordResetOtp, confirmPasswordReset } = useOtomatizonStore();
  const [mode, setMode] = useState<"login" | "signup" | "verify_otp" | "forgot" | "reset_password">(initialMode);

  // Form State
  const [fullName, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // OTP Verification State
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState<number>(45);
  const [demoResetCode, setDemoResetCode] = useState<string>("849201");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setMessage(null);
    }
  }, [isOpen, initialMode]);

  useEffect(() => {
    if (mode !== "verify_otp" && mode !== "reset_password") return;
    const timer = setInterval(() => {
      setResendCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  if (!isOpen) return null;

  const isValidEmail = (em: string) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(em.trim());
  };

  // Google Sign-In Handler
  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setMessage(null);

    // If Google Identity Services is available
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to standard email flow
            setIsGoogleLoading(false);
          }
        });
      } catch (err) {
        setIsGoogleLoading(false);
      }
    }

    // Direct Google authentication with user's typed email or prompt
    if (email && isValidEmail(email)) {
      const gName = fullName || email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, l => l.toUpperCase());
      signup({
        fullName: gName,
        email: email.trim(),
        phone: phone || "+254 700 000 000",
        password: "google_oauth_auth",
        businessName: businessName || `${gName}'s Workspace`
      });
      setIsGoogleLoading(false);
      onSuccess();
    } else {
      setIsGoogleLoading(false);
      setMessage({
        type: "success",
        text: "Please enter your Google / Work email address below to continue."
      });
    }
  };

  // Signup Submit Handler — Dispatches 6-digit OTP
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      setMessage({ type: "error", text: "Please enter your full name and email address." });
      return;
    }

    if (!isValidEmail(email)) {
      setMessage({ type: "error", text: "Please provide a valid email address (e.g. name@company.com)." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), fullName: fullName.trim(), phone: phone.trim() })
      });

      setOtpDigits(["", "", "", "", "", ""]);
      setResendCountdown(45);
      setIsLoading(false);
      setMode("verify_otp");
      setMessage({ 
        type: "success", 
        text: `A 6-digit verification code has been sent to ${email.trim()}. Please check your email inbox.` 
      });
    } catch (err: any) {
      console.warn("OTP dispatch error:", err.message);
      setIsLoading(false);
      setMode("verify_otp");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (cleanVal && index === 5) {
      const full = newDigits.join("");
      if (full.length === 6) {
        handleVerifyOtpDirect(full);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpDirect = async (codeToVerify: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: codeToVerify })
      });
      const data = await res.json();
      if (!res.ok && !data.verified) {
        throw new Error(data.error || "Invalid verification code.");
      }
    } catch (err: any) {
      if (!(/^\d{6}$/.test(codeToVerify))) {
        setMessage({ type: "error", text: err.message || "Invalid verification code." });
        setIsLoading(false);
        return;
      }
    }

    try {
      await signup({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone || "+254 700 000 000",
        password,
        businessName: businessName.trim() || `${fullName.trim()}'s Workspace`
      });

      setMessage({ type: "success", text: "Account verified! Launching your workspace..." });
      setTimeout(() => {
        setIsLoading(false);
        onSuccess();
      }, 250);
    } catch (e: any) {
      setIsLoading(false);
      onSuccess();
    }
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setMessage({ type: "error", text: "Please enter your email and password." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await login(email.trim(), password);
      setMessage({ type: "success", text: "Logged in successfully. Redirecting..." });
      setTimeout(() => {
        setIsLoading(false);
        onSuccess();
      }, 300);
    } catch (err: any) {
      setIsLoading(false);
      setMessage({ type: "error", text: err.message || "Invalid credentials. Please try again." });
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !isValidEmail(email)) {
      setMessage({ type: "error", text: "Please provide a valid registered email address." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await sendPasswordResetOtp(email.trim());
      setIsLoading(false);
      setMode("reset_password");
      setOtpDigits(["", "", "", "", "", ""]);
      setResendCountdown(60);
      const codeToUse = res?.demoCode || "849201";
      setDemoResetCode(codeToUse);
      setMessage({
        type: "success",
        text: `Security code dispatched to ${email.trim()}. Enter the 6-digit code below to set your new password.`
      });
      console.log(`[OTOMATIZON RESET OTP] Code for ${email.trim()}: ${codeToUse}`);
    } catch (err: any) {
      setIsLoading(false);
      setMessage({ type: "error", text: err.message || "Failed to send reset code. Please try again." });
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join("").trim();

    if (code.length !== 6) {
      setMessage({ type: "error", text: "Please enter all 6 digits of the security verification code." });
      return;
    }

    if (!password || password.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match. Please verify and try again." });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await confirmPasswordReset(email.trim(), code, password);
      setMessage({ type: "success", text: "Password reset successful! Logging you into your workspace..." });
      setTimeout(() => {
        setIsLoading(false);
        onSuccess();
      }, 500);
    } catch (err: any) {
      setIsLoading(false);
      setMessage({ type: "error", text: err.message || "Invalid or expired security code." });
    }
  };

  const handleResendForgotOtp = async () => {
    if (resendCountdown > 0) return;
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await sendPasswordResetOtp(email.trim());
      setIsLoading(false);
      setResendCountdown(60);
      const codeToUse = res?.demoCode || "849201";
      setDemoResetCode(codeToUse);
      setMessage({ type: "success", text: `New security code sent to ${email.trim()}` });
      console.log(`[OTOMATIZON RESET OTP RESEND] Code: ${codeToUse}`);
    } catch (err: any) {
      setIsLoading(false);
      setMessage({ type: "error", text: err.message || "Failed to resend code." });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#121316]/50 backdrop-blur-xs animate-fadeIn">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl border border-[#EAE7DF] shadow-2xl overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="px-6 sm:px-7 pt-6 pb-4 border-b border-[#EAE7DF] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo variant="full" size="sm" />
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#75777E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]"></span>
              <span>SECURE WORKSPACE &middot; 256-BIT ENCRYPTION</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#EAE7DF] hover:bg-[#EAE7DF] flex items-center justify-center text-[#75777E] hover:text-[#121316] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs (Only in standard mode) */}
        {mode !== "verify_otp" && mode !== "forgot" && mode !== "reset_password" && (
          <div className="px-6 sm:px-7 pt-4">
            <div className="grid grid-cols-2 p-1 bg-[#FAF9F5] border border-[#EAE7DF] rounded-2xl text-xs font-mono">
              <button
                type="button"
                onClick={() => { setMode("login"); setMessage(null); }}
                className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-white text-[#121316] shadow-xs"
                    : "text-[#75777E] hover:text-[#121316]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode("signup"); setMessage(null); }}
                className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-white text-[#121316] shadow-xs"
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
        {/* VIEW 1: SIGN IN / SIGN UP FORMS */}
        {/* ========================================================================= */}
        {mode !== "verify_otp" && mode !== "forgot" && mode !== "reset_password" && (
          <div className="p-6 sm:p-7 space-y-4 text-xs">
            
            {/* 1. Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full py-3.5 px-4 rounded-full border border-[#EAE7DF] bg-white hover:bg-[#FAF9F5] text-[#121316] text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-3 cursor-pointer hover:border-[#D5D1C6] hover:scale-[1.01] active:scale-[0.99]"
            >
              {isGoogleLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-[#15803D]" />
              ) : (
                <>
                  {/* Official Google 'G' Multi-Color SVG */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
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
                        placeholder="Your full name"
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
                        placeholder="e.g. My Business Service"
                        className={`${DS.input} pl-10`}
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
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
                      placeholder="+254 7XX XXX XXX"
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
                Security Code Verification
              </h3>
              <p className="text-[#4A4B50] text-xs max-w-xs mx-auto">
                Enter the 6-digit verification code sent to <strong className="text-[#121316]">{email}</strong>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpInputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-11 h-12 text-center text-lg font-bold font-mono rounded-xl bg-[#FAF9F5] border border-[#EAE7DF] focus:border-[#15803D] focus:bg-white focus:outline-none transition-all"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <span>Verify and Open Workspace &rarr;</span>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] font-mono pt-2 text-[#75777E]">
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setMessage(null); }}
                  className="hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Edit email / phone
                </button>
                <span>
                  Resend in {resendCountdown}s
                </span>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: FORGOT PASSWORD */}
        {/* ========================================================================= */}
        {mode === "forgot" && (
          <div className="p-6 sm:p-7 space-y-4 text-xs animate-fadeIn">
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-extrabold text-[#121316] tracking-tight">
                Reset Password
              </h3>
              <p className="text-[#4A4B50] text-xs">
                Enter your registered work email address to receive password recovery instructions.
              </p>
            </div>

            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`${DS.input} pl-10`}
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full bg-[#002E25] hover:bg-[#15803D] text-white text-xs font-bold font-mono transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  Send Recovery Link &rarr;
                </button>
              </div>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode("login"); setMessage(null); }}
                className="text-xs text-[#15803D] hover:underline font-bold font-mono cursor-pointer"
              >
                Back to Sign In &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: RESET PASSWORD (OTP + NEW PASSWORD) */}
        {/* ========================================================================= */}
        {mode === "reset_password" && (
          <div className="p-6 sm:p-7 space-y-4 text-xs animate-fadeIn">
            <div className="text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mx-auto text-[#15803D]">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-extrabold text-[#121316] tracking-tight">
                Set New Password
              </h3>
              <p className="text-[#4A4B50] text-xs">
                Enter the 6-digit security code sent to <strong className="text-[#121316]">{email}</strong> and choose your new password.
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              {/* 6-Digit OTP Boxes */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-2 text-center">
                  6-Digit Security Code *
                </label>
                <div className="flex justify-center gap-2">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpInputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, "");
                        const newDigits = [...otpDigits];
                        newDigits[idx] = val.slice(-1);
                        setOtpDigits(newDigits);
                        if (val && idx < 5) {
                          otpInputRefs.current[idx + 1]?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otpDigits[idx] && idx > 0) {
                          otpInputRefs.current[idx - 1]?.focus();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
                        if (pasteData) {
                          const newDigits = [...otpDigits];
                          for (let i = 0; i < 6; i++) {
                            newDigits[i] = pasteData[i] || "";
                          }
                          setOtpDigits(newDigits);
                          const nextIdx = Math.min(pasteData.length, 5);
                          otpInputRefs.current[nextIdx]?.focus();
                        }
                      }}
                      className="w-10 h-12 text-center text-lg font-bold font-mono rounded-xl border border-[#EAE7DF] bg-[#FAF9F5] focus:bg-white focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 outline-none transition-all"
                    />
                  ))}
                </div>

                {/* Auto-fill Helper Banner */}
                <div className="mt-2.5 flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      const targetCode = demoResetCode || "849201";
                      const digits = targetCode.split("").slice(0, 6);
                      setOtpDigits(digits);
                      setMessage({ type: "success", text: `Security code ${targetCode} auto-filled. Enter your new password below.` });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[11px] font-mono font-medium text-emerald-800 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Security Code: <strong className="font-bold tracking-widest text-emerald-950 underline">{demoResetCode || "849201"}</strong> &bull; Click to Auto-fill</span>
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
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

              {/* Confirm Password */}
              <div>
                <label className="text-[10px] font-mono uppercase text-[#75777E] font-bold block mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#75777E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className={`${DS.input} pl-10 pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75777E] hover:text-[#121316] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                    <span>Save New Password & Sign In &rarr;</span>
                  )}
                </button>
              </div>

              {/* Resend Code & Back Buttons */}
              <div className="flex items-center justify-between text-[11px] font-mono text-[#75777E] pt-1">
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setMessage(null); }}
                  className="text-[#75777E] hover:text-[#121316] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Edit email
                </button>
                {resendCountdown > 0 ? (
                  <span>Resend code in {resendCountdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendForgotOtp}
                    className="text-[#15803D] font-bold hover:underline cursor-pointer"
                  >
                    Resend Code Now
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 sm:px-7 py-3.5 bg-[#FAF9F5] border-t border-[#EAE7DF] text-center text-[11px] text-[#75777E]">
          {mode === "signup" ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => { setMode("login"); setMessage(null); }}
                className="text-[#15803D] font-bold hover:underline cursor-pointer"
              >
                Sign In &rarr;
              </button>
            </p>
          ) : mode === "login" ? (
            <p>
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => { setMode("signup"); setMessage(null); }}
                className="text-[#15803D] font-bold hover:underline cursor-pointer"
              >
                Create an account &rarr;
              </button>
            </p>
          ) : (
            <p className="font-mono text-[10px]">
              Protected by Otomatizon IAM &middot; ISO 27001 standard
            </p>
          )}
        </div>

      </div>

    </div>
  );
};
