"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Globe,
  Calendar,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { GoogleIcon } from "@/components/shared/SocialAuth";
import { googleOAuthUrl } from "@/lib/api/auth-api";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface RegisterFormProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
  error?: string;
}

const formItemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

export function RegisterForm({
  email,
  password,
  firstName,
  lastName,
  onEmailChange,
  onPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onSubmit,
  disabled,
  error,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [dob, setDob] = useState("");
  const [agreed, setAgreed] = useState(false);

  const emailError = useMemo(() => {
    if (!email.trim()) return "";
    return /^\S+@\S+\.\S+$/.test(email) ? "" : "Invalid email address.";
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password.trim()) return "";
    return password.length >= 8
      ? ""
      : "Password must be at least 8 characters.";
  }, [password]);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  return (
    <div className="w-full space-y-6">
      <motion.div variants={formItemVariants} className="space-y-1">
        <h1 className="text-2xl font-bold">
          {step === 1 ? "Create an account" : "Complete your profile"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === 1 ? "Start your journey today" : "Just a few more details"}
        </p>
      </motion.div>

      <form
        className="space-y-5"
        onSubmit={(e) =>
          step === 1 ? (e.preventDefault(), setStep(2)) : onSubmit(e)
        }
      >
        {step === 1 && (
          <>
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-xl border-border bg-white text-foreground"
                onClick={() => (window.location.href = googleOAuthUrl())}
              >
                <GoogleIcon className="h-4 w-4" /> Continue with Google
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              <span>or continue with email</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <motion.div variants={formItemVariants} className="space-y-1.5">
              <label className="text-sm font-medium">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  className={cn(
                    "h-11 rounded-xl pl-10",
                    emailError && "border-red-500",
                  )}
                  required
                />
              </div>
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500"
                  >
                    {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={formItemVariants} className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className={cn(
                    "h-11 rounded-xl pl-10 pr-10",
                    passwordError && "border-red-500",
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex gap-1 pt-1.5">
                {[1, 2, 3, 4].map((s) => (
                  <span
                    key={s}
                    className={`h-1 flex-1 rounded transition-colors ${strength >= s ? (s <= 2 ? "bg-red-500" : s === 3 ? "bg-yellow-500" : "bg-green-500") : "bg-muted"}`}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div variants={formItemVariants} className="space-y-1.5">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "h-11 rounded-xl pl-10",
                    confirmPassword &&
                      confirmPassword !== password &&
                      "border-red-500",
                  )}
                  required
                />
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-500">Passwords do not match.</p>
              )}
            </motion.div>

            <Button
              type="submit"
              variant="brand-red"
              className="h-12 w-full rounded-xl text-foreground font-semibold"
              disabled={
                disabled ||
                !email ||
                !password ||
                confirmPassword !== password ||
                !!emailError ||
                !!passwordError
              }
            >
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">First Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={firstName}
                    onChange={(e) => onFirstNameChange(e.target.value)}
                    className="h-11 rounded-xl pl-10"
                    placeholder="John"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Last Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={lastName}
                    onChange={(e) => onLastNameChange(e.target.value)}
                    className="h-11 rounded-xl pl-10"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone Number</label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-[100px] h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+971">+971</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 rounded-xl pl-10"
                    placeholder="555-0123"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Nationality</label>
              <div className="relative">
                <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                <Select value={nationality} onValueChange={setNationality}>
                  <SelectTrigger className="h-11 rounded-xl pl-10">
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us">United States</SelectItem>
                    <SelectItem value="pk">Pakistan</SelectItem>
                    <SelectItem value="ae">UAE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Date of Birth</label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="h-11 rounded-xl pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="terms"
                checked={agreed}
                onCheckedChange={(v) => setAgreed(v as boolean)}
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link
                  href={"/terms" as any}
                  className="text-redmix hover:underline font-medium"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href={"/privacy" as any}
                  className="text-redmix hover:underline font-medium"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {error ? (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-24 rounded-xl border-border"
                onClick={() => setStep(1)}
                disabled={disabled}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                variant="brand-red"
                className="h-12 flex-1 rounded-xl text-foreground font-semibold shadow-lg shadow-redmix/10"
                disabled={disabled || !agreed}
              >
                {disabled ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </>
        )}
      </form>

      {/* <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-semibold text-foreground hover:text-redmix"
        >
          Sign in →
        </Link>
      </p> */}
    </div>
  );
}
