"use client";

import { FormEvent, useMemo, useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Phone,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Check,
} from "lucide-react";
import { GoogleIcon } from "@/components/shared/SocialAuth";
import { googleOAuthUrl } from "@/lib/api/auth-api";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { COUNTRIES } from "@/lib/countries";

export interface RegisterFormProps {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onPhoneChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
  error?: string;
  agreed?: boolean;
}

const formItemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

const DIAL_CODES: Record<string, string> = {}; // Removed hardcode, using COUNTRIES instead

// Converts country alpha-2 code into emoji flag
function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode.length !== 2) return "🌍";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌍";
  }
}

export function RegisterForm({
  email,
  password,
  firstName,
  lastName,
  phone,
  onEmailChange,
  onPasswordChange,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onSubmit,
  disabled,
  error,
  agreed,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
  const [phoneInput, setPhoneInput] = useState("");
  const [localAgreed, setLocalAgreed] = useState(false);
  const isAgreed = agreed !== undefined ? agreed : localAgreed;
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  // Parse phone from prop
  useEffect(() => {
    const rawPhone = phone ?? "";
    if (rawPhone.startsWith("+")) {
      const sortedDialCodes = Array.from(
        new Set(COUNTRIES.map((c) => c.value)),
      ).sort((a, b) => b.length - a.length);
      const matched = sortedDialCodes.find((code) => rawPhone.startsWith(code));
      if (matched) {
        setCountryCode(matched);
        setPhoneInput(rawPhone.slice(matched.length));
        return;
      }
    }
    // Default fallback
    setCountryCode("+1");
    setPhoneInput(rawPhone);
  }, [phone]);

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode);
    onPhoneChange(newCode + phoneInput);
  };

  const handlePhoneInputChange = (newVal: string) => {
    const onlyDigits = newVal.replace(/\D/g, "");
    setPhoneInput(onlyDigits);
    onPhoneChange(countryCode + onlyDigits);
  };

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
    <div className="w-full space-y-3">
      <motion.div variants={formItemVariants} className="space-y-1">
        <h1 className="text-2xl font-bold">
          {step === 1 ? "Create an account" : "Complete your profile"}
        </h1>
        <p className="text-sm text-foreground opacity-50">
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
            <motion.div variants={formItemVariants} className="space-y-1.5">
              <label className="text-sm font-medium">Email address</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground opacity-50" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  className={cn(
                    "h-11 md:h-12 rounded-xl md:rounded-2xl pl-10 bg-black/5 dark:bg-white/5 border-transparent focus:bg-transparent dark:focus:bg-transparent transition-all",
                    emailError && "border-red-500 focus-visible:ring-red-500",
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
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground opacity-50" />
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  className={cn(
                    "h-11 md:h-12 rounded-xl md:rounded-2xl pl-10 pr-10 bg-black/5 dark:bg-white/5 border-transparent focus:bg-transparent dark:focus:bg-transparent transition-all",
                    passwordError && "border-red-500 focus-visible:ring-red-500",
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground opacity-50"
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
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground opacity-50" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "h-11 md:h-12 rounded-xl md:rounded-2xl pl-10 pr-10 bg-black/5 dark:bg-white/5 border-transparent focus:bg-transparent dark:focus:bg-transparent transition-all",
                    confirmPassword &&
                      confirmPassword !== password &&
                      "border-red-500 focus-visible:ring-red-500",
                  )}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-xs text-red-500">Passwords do not match.</p>
              )}
            </motion.div>

            <Button
              type="submit"
              variant="brand-red"
              className="h-11 md:h-12 w-full rounded-full bg-redmix hover:bg-redmix/90 text-white font-semibold transition-transform active:scale-[0.98] shadow-md shadow-redmix/20"
              disabled={
                disabled ||
                !isAgreed ||
                !email ||
                !password ||
                confirmPassword !== password ||
                !!emailError ||
                !!passwordError
              }
            >
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>

            {/* <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-foreground opacity-50">
                <span className="h-px flex-1 bg-border" />
                <span>or</span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-xl border-border bg-background text-foreground"
                onClick={() => (window.location.href = googleOAuthUrl())}
              >
                <GoogleIcon className="h-4 w-4" /> Continue with Google
              </Button>
            </div> */}
          </>
        )}

        {step === 2 && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">First Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground opacity-50" />
                  <Input
                    value={firstName}
                    onChange={(e) => onFirstNameChange(e.target.value)}
                    className="h-11 md:h-12 rounded-xl md:rounded-2xl pl-10 bg-black/5 dark:bg-white/5 border-transparent focus:bg-transparent dark:focus:bg-transparent transition-all"
                    placeholder="John"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Last Name</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground opacity-50" />
                  <Input
                    value={lastName}
                    onChange={(e) => onLastNameChange(e.target.value)}
                    className="h-11 md:h-12 rounded-xl md:rounded-2xl pl-10 bg-black/5 dark:bg-white/5 border-transparent focus:bg-transparent dark:focus:bg-transparent transition-all"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone Number</label>
              <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 md:h-12 w-24 rounded-xl md:rounded-2xl flex items-center justify-between px-3 bg-black/5 dark:bg-white/5 border-transparent text-foreground select-none transition-all"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <span>
                          {COUNTRIES.find((c) => c.value === countryCode)
                            ?.flag || "🌍"}
                        </span>
                        <span className="font-semibold text-xs">
                          {countryCode}
                        </span>
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[300px] p-0 rounded-xl bg-white dark:bg-zinc-900 border border-border shadow-md z-[9999]"
                    align="start"
                  >
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                      <Search className="h-4 w-4 text-foreground opacity-50 shrink-0" />
                      <input
                        type="text"
                        placeholder="Search country or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-foreground opacity-50 text-foreground"
                      />
                    </div>
                    <div className="max-h-[250px] overflow-y-auto p-1 text-sm">
                      {COUNTRIES.filter(
                        (c) =>
                          c.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          c.value.includes(searchTerm) ||
                          c.label
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      ).map((c, idx) => {
                        const isSelected = c.value === countryCode;
                        return (
                          <div
                            key={`${c.label}-${c.value}-${idx}`}
                            onClick={() => {
                              handleCountryCodeChange(c.value);
                              setOpen(false);
                              setSearchTerm("");
                            }}
                            className={cn(
                              "flex items-center justify-between p-2.5 cursor-pointer rounded-lg hover:bg-muted select-none transition-colors",
                              isSelected && "bg-muted font-bold",
                            )}
                          >
                            <span className="flex items-center gap-2 truncate flex-1">
                              <span>{c.flag}</span>
                              <span className="truncate font-medium">
                                {c.name}
                              </span>
                            </span>
                            <span className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-bold text-foreground opacity-50">
                                {c.value}
                              </span>
                              {isSelected && (
                                <Check className="h-4 w-4 text-redmix shrink-0" />
                              )}
                            </span>
                          </div>
                        );
                      })}
                      {COUNTRIES.filter(
                        (c) =>
                          c.name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          c.value.includes(searchTerm) ||
                          c.label
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      ).length === 0 && (
                        <div className="p-3 text-center text-xs text-foreground opacity-50 select-none">
                          No results found.
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="relative flex-1">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground opacity-50" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={phoneInput}
                    onChange={(e) => {
                      handlePhoneInputChange(e.target.value);
                    }}
                    className="h-11 md:h-12 rounded-xl md:rounded-2xl pl-10 bg-black/5 dark:bg-white/5 border-transparent focus:bg-transparent dark:focus:bg-transparent transition-all"
                    placeholder="555-0123"
                  />
                </div>
              </div>
            </div>

            {agreed === undefined && (
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={localAgreed}
                  onCheckedChange={(v) => setLocalAgreed(v as boolean)}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-foreground opacity-50 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  I agree to the{" "}
                  <Link
                    href={"/terms-and-conditions" as any}
                    target="_blank"
                    className="text-redmix hover:underline font-medium"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href={"/privacy-policy" as any}
                    target="_blank"
                    className="text-redmix hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            )}

            {error ? (
              <p className="text-xs text-red-500 font-medium">{error}</p>
            ) : null}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 md:h-12 w-24 rounded-full border-border/50 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                onClick={() => setStep(1)}
                disabled={disabled}
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                variant="brand-red"
                className="h-11 md:h-12 flex-1 rounded-full bg-redmix hover:bg-redmix/90 text-white font-semibold transition-transform active:scale-[0.98] shadow-md shadow-redmix/20"
                disabled={disabled || !isAgreed}
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
    </div>
  );
}
