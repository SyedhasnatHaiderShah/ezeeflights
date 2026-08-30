"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, Mail, ShieldCheck } from "lucide-react";
import { forgotPasswordOtpRequest, verifyPasswordResetOtp, resetPassword } from "@/lib/api/auth-api";
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
  const [timer, setTimer] = useState(57);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "otp" && timer > 0) interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [step, timer]);

  const getStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^a-zA-Z0-9]/.test(pass)) score++;
    return score;
  };
  const strength = getStrength(newPassword);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await forgotPasswordOtpRequest(email);
      setStep("otp");
      setTimer(57);
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
    if (newPassword !== confirmPassword) return setError("Passwords do not match.");
    if (strength < 3) return setError("Please choose a stronger password.");
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

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.div key="email" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold">Forgot your password?</h1>
              <p className="text-sm text-muted-foreground">Enter your account email and we’ll send a reset link.</p>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input placeholder="name@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" required />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button type="submit" variant="brand-red" disabled={busy} className="h-11 w-full rounded-xl">{busy ? "Sending..." : "Send reset link"}</Button>
            </form>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div key="otp" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="space-y-2 text-center">
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-redmix/10">
                <Mail className="h-6 w-6 text-redmix" />
              </motion.div>
              <h2 className="text-2xl font-bold">Check your inbox</h2>
              <p className="text-sm text-muted-foreground">We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span></p>
            </div>
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input key={i} ref={(el) => { otpRefs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(-1);
                      const next = [...otp];
                      next[i] = value;
                      setOtp(next);
                      if (value && i < 5) otpRefs.current[i + 1]?.focus();
                    }}
                    className="h-12 w-11 rounded-xl border-2 text-center text-lg font-bold"
                  />
                ))}
              </div>
              <div className="text-center text-sm text-muted-foreground">
                {timer > 0 ? `Resend code in 0:${String(timer).padStart(2, "0")}` : <button type="button" className="text-redmix" onClick={() => { forgotPasswordOtpRequest(email); setTimer(57); }}>Resend</button>}
              </div>
              {error && <p className="text-xs text-red-500 text-center">{error}</p>}
              <Button type="submit" variant="brand-red" disabled={busy || otp.join("").length !== 6} className="h-11 w-full rounded-xl">{busy ? "Verifying..." : "Verify code"}</Button>
              <Link href="/auth/login" className="flex items-center justify-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Back to login</Link>
            </form>
          </motion.div>
        )}

        {step === "reset" && (
          <motion.div key="reset" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Set new password</h2>
              <p className="text-sm text-muted-foreground">Create a strong password for your account.</p>
            </div>
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="h-11 rounded-xl pr-10" />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => setShowPassword((s) => !s)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
              <div className="flex gap-1">{[1,2,3,4].map((i) => <span key={i} className={cn("h-1 flex-1 rounded", strength >= i ? i <= 2 ? "bg-red-500" : i === 3 ? "bg-yellow-500" : "bg-green-500" : "bg-muted")} />)}</div>
              <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="h-11 rounded-xl" />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button type="submit" variant="brand-red" className="h-11 w-full rounded-xl" disabled={busy || strength < 3 || newPassword !== confirmPassword}>{busy ? "Updating..." : "Set new password"}</Button>
            </form>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-2xl font-bold">Password reset complete</h2>
            <p className="text-sm text-muted-foreground">Your password has been updated successfully.</p>
            <Button asChild variant="brand-red" className="w-full rounded-xl"><Link href="/auth/login">Back to login</Link></Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
