"use client";

import { FormEvent, useMemo, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Apple } from "lucide-react";
import { GoogleIcon } from "@/components/shared/SocialAuth";
import { googleOAuthUrl } from "@/lib/api/auth-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  return (
    <div className="w-full space-y-5">
      {/* <div className="flex items-center gap-2 text-xs font-medium">
        <span className={step === 1 ? "text-redmix" : "text-muted-foreground"}>① Account</span>
        <span className="text-muted-foreground">→</span>
        <span className={step === 2 ? "text-redmix" : "text-muted-foreground"}>② Personal</span>
      </div> */}

      <form
        className="space-y-4"
        onSubmit={(e) =>
          step === 1 ? (e.preventDefault(), setStep(2)) : onSubmit(e)
        }
      >
        {step === 1 && (
          <>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-xl"
                onClick={() => (window.location.href = googleOAuthUrl())}
              >
                <GoogleIcon className="h-4 w-4" /> Continue with Google
              </Button>
              <Button
                type="button"
                className="h-12 w-full rounded-xl bg-black text-white hover:bg-black/90"
              >
                <Apple className="h-4 w-4" /> Continue with Apple
              </Button>
            </div>
            <motion.div variants={formItemVariants} className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </motion.div>
            <motion.div variants={formItemVariants} className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className="h-11 rounded-xl pr-10"
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
              <div className="flex gap-1 pt-1">
                {[1, 2, 3, 4].map((s) => (
                  <span
                    key={s}
                    className={`h-1 flex-1 rounded ${strength >= s ? (s <= 2 ? "bg-red-500" : s === 3 ? "bg-yellow-500" : "bg-green-500") : "bg-muted"}`}
                  />
                ))}
              </div>
            </motion.div>
            <motion.div variants={formItemVariants} className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-xl"
                required
              />
            </motion.div>
            <Button
              type="submit"
              className="h-11 w-full rounded-xl"
              disabled={
                disabled || !email || !password || confirmPassword !== password
              }
            >
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <Input
                  value={firstName}
                  onChange={(e) => onFirstNameChange(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input
                  value={lastName}
                  onChange={(e) => onLastNameChange(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger className="w-24 h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">+1</SelectItem>
                    <SelectItem value="+44">+44</SelectItem>
                    <SelectItem value="+971">+971</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nationality</label>
              <Select value={nationality} onValueChange={setNationality}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="pk">Pakistan</SelectItem>
                  <SelectItem value="ae">UAE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date of birth</label>
              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />{" "}
              I agree to Terms of Service and Privacy Policy
            </label>
            {error ? <p className="text-xs text-red-500">{error}</p> : null}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                className="h-11 flex-1 rounded-xl"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="brand-red"
                className="h-11 flex-1 rounded-xl"
                disabled={disabled || !agreed}
              >
                Create Account
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
