"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  forgotPasswordOtpRequest,
  verifyPasswordResetOtp,
  resetPassword,
} from "@/lib/api/auth-api";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Step = "email" | "otp" | "reset" | "success";

export function ForgotPasswordFlow() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // OTP Handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Password Strength Logic
  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getStrength(newPassword);

  // Submissions
  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await forgotPasswordOtpRequest(email);
      setStep("otp");
      setTimer(300);
    } catch (err: any) {
      setError(err.message || "Failed to send reset code.");
    } finally {
      setBusy(false);
    }
  };

  const handleOtpSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) return;
    setBusy(true);
    setError("");
    try {
      await verifyPasswordResetOtp(email, code);
      setStep("reset");
    } catch (err: any) {
      setError(err.message || "Invalid or expired code.");
    } finally {
      setBusy(false);
    }
  };

  const handleResetSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (strength < 3) {
      setError("Please choose a stronger password.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await resetPassword(email, otp.join(""), newPassword);
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setBusy(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.div
            key="email"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="space-y-2">
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark">
                Reset your password
              </h1>
              <p className="text-xs text-brand-dark-light font-medium">
                Enter your email address and we'll send you a 6-digit
                verification code.
              </p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold tracking-wider text-brand-dark-light ml-1">
                  Email Address
                </label>
                <Input
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 bg-muted/5 border-border/40 rounded-xl px-4 text-sm font-medium"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 font-bold px-1">{error}</p>
              )}

              <Button
                type="submit"
                disabled={busy}
                className="w-full h-12 bg-redmix hover:bg-redmix-light text-white rounded-xl font-semibold shadow-lg shadow-redmix/10 transition-all hover:translate-y-[-1px] active:translate-y-[0px] group"
              >
                {busy ? "Sending Code..." : "Send Verification Code"}
                <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>

              <div className="pt-4 text-center">
                <Link
                  href="/auth/login"
                  className="text-xs font-bold text-brand-dark-light hover:text-brand-dark flex items-center justify-center gap-2 group"
                >
                  <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
                  Back to Login
                </Link>
              </div>
            </form>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div
            key="otp"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="space-y-2">
              <button
                onClick={() => setStep("email")}
                className="text-xs font-bold text-brand-dark-light hover:text-brand-dark flex items-center gap-1 mb-2"
              >
                <ArrowLeft className="w-3 h-3" /> Change email
              </button>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark">
                Enter verification code
              </h1>
              <p className="text-xs text-brand-dark-light font-medium">
                We've sent a 6-digit code to{" "}
                <span className="font-bold text-brand-dark">{email}</span>.
              </p>
            </div>

            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-10 h-12 text-center text-lg font-bold bg-muted/5 border border-border/40 rounded-xl focus:border-redmix/50 focus:ring-1 focus:ring-redmix/10 outline-none transition-all"
                  />
                ))}
              </div>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-xs text-brand-dark-light font-medium">
                    Resend code available in{" "}
                    <span className="font-bold text-brand-dark">
                      {formatTime(timer)}
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      forgotPasswordOtpRequest(email);
                      setTimer(300);
                    }}
                    className="text-xs font-bold text-redmix hover:underline"
                  >
                    Resend verification code
                  </button>
                )}
              </div>

              {/* {error && <p className="text-xs text-red-500 font-bold px-1 text-center">{error}</p>} */}
              {error && (
                <p className="text-xs text-red-500 font-bold px-1 text-center">
                  Something went wrong. Please try again later.
                </p>
              )}

              <Button
                type="submit"
                disabled={busy || otp.join("").length !== 6}
                className="w-full h-12 bg-redmix hover:bg-redmix-light text-white rounded-xl font-semibold shadow-lg shadow-redmix/10 transition-all hover:translate-y-[-1px] active:translate-y-[0px] group"
              >
                {busy ? "Verifying..." : "Verify Code"}
                <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </form>
          </motion.div>
        )}

        {step === "reset" && (
          <motion.div
            key="reset"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
              </div>
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark">
                Choose a new password
              </h1>
              <p className="text-xs text-brand-dark-light font-medium">
                Make sure your new password is secure and includes special
                characters.
              </p>
            </div>

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold tracking-wider text-brand-dark-light ml-1">
                    New Password
                  </label>
                  <div className="relative group">
                    <Input
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 bg-muted/5 border-border/40 rounded-xl px-4 pr-12 text-sm font-medium"
                      required
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1.5 rounded-lg text-brand-dark/40 hover:text-brand-dark transition-all"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Strength Meter */}
                <div className="px-1 space-y-2">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 rounded-full transition-all duration-500",
                          strength >= i
                            ? i <= 2
                              ? "bg-red-500"
                              : i === 3
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            : "bg-muted",
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] uppercase font-bold tracking-wider opacity-60">
                    {strength <= 1
                      ? "Weak"
                      : strength === 2
                        ? "Fair"
                        : strength === 3
                          ? "Good"
                          : "Very Strong"}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold tracking-wider text-brand-dark-light ml-1">
                    Confirm Password
                  </label>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-11 bg-muted/5 border-border/40 rounded-xl px-4 text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-500 font-bold px-1">{error}</p>
              )}

              <Button
                type="submit"
                disabled={
                  busy || strength < 3 || newPassword !== confirmPassword
                }
                className="w-full h-12 bg-redmix hover:bg-redmix-light text-white rounded-xl font-semibold shadow-lg shadow-redmix/10 transition-all hover:translate-y-[-1px] active:translate-y-[0px] group"
              >
                {busy ? "Updating..." : "Reset Password"}
                <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </form>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div
            key="success"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="text-center space-y-6 py-4"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark">
                Password reset successful
              </h1>
              <p className="text-xs text-brand-dark-light font-medium px-4">
                Your password has been securely updated. You can now sign in to
                your dashboard with your new credentials.
              </p>
            </div>

            <Button
              asChild
              className="w-full h-12 bg-redmix hover:bg-redmix-light text-white rounded-xl font-semibold shadow-lg shadow-redmix/10 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
            >
              <Link href="/auth/login">Back to Sign in</Link>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
