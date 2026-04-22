"use client";

import { FormEvent, useMemo, useState } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Lock, Mail, Loader2, Apple } from "lucide-react";
import { GoogleIcon } from "@/components/shared/SocialAuth";
import { Switch } from "@/components/ui/switch";
import { googleOAuthUrl } from "@/lib/api/auth-api";
import Link from "next/link";

export interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
  error?: string;
}

const formItemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

export function LoginForm({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  disabled,
  error,
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailError = useMemo(() => {
    if (!emailTouched) return "";
    if (!email.trim()) return "Email is required.";
    return /^\S+@\S+\.\S+$/.test(email)
      ? ""
      : "Please enter a valid email address.";
  }, [email, emailTouched]);

  const passwordError = useMemo(() => {
    if (!passwordTouched) return "";
    return password.trim() ? "" : "Password is required.";
  }, [password, passwordTouched]);

  return (
    <div className="w-full space-y-6">
      <motion.div variants={formItemVariants} className="space-y-1">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </motion.div>

      <div className="space-y-3">
        {/* <Button
          type="button"
          variant="outline"
          className="h-12 w-full rounded-xl bg-white border"
          onClick={() => (window.location.href = googleOAuthUrl())}
        >
          <GoogleIcon className="h-4 w-4" /> Continue with Google
        </Button> */}
        {/* <Button
          type="button"
          className="h-12 w-full rounded-xl bg-black text-white hover:bg-black/90"
        >
          <Apple className="h-4 w-4" /> Continue with Apple
        </Button> */}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        <span>or continue with email</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            Email address
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className={`h-11 rounded-xl pl-10 ${emailError ? "border-red-500" : ""}`}
            />
          </div>
          <AnimatePresence>
            {emailError && (
              <motion.p
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                className="text-xs text-red-500"
              >
                {emailError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              className={`h-11 rounded-xl pl-10 pr-10 ${passwordError ? "border-red-500" : ""}`}
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
          <AnimatePresence>
            {passwordError && (
              <motion.p
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                className="text-xs text-red-500"
              >
                {passwordError}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={rememberMe} onCheckedChange={setRememberMe} />{" "}
            Remember me
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-sm font-medium text-redmix hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {error ? <p className="text-xs text-red-500">{error}</p> : null}

        <Button
          variant="brand-red"
          type="submit"
          disabled={disabled || !!emailError || !!passwordError}
          className="h-12 w-full rounded-xl"
        >
          {disabled ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-semibold text-foreground hover:text-redmix"
        >
          Create one →
        </Link>
      </p>
    </div>
  );
}
