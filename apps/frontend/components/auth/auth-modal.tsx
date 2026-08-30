"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import {
  loginRequest,
  registerRequest,
  googleOAuthUrl,
  forgotPasswordOtpRequest,
  verifyPasswordResetOtp,
  resetPassword,
  nativeGoogleLoginRequest,
} from "@/lib/api/auth-api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/lib/hooks/use-toast";
import { isNative } from "@/lib/capacitor";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { validatePassword } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { Mail, ArrowLeft, Apple } from "lucide-react";
import { GoogleIcon } from "@/components/shared/SocialAuth";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useNavChromeSurface } from "@/lib/hooks/use-nav-chrome-surface";
import {
  applyNativeChrome,
  resolveChromeFromSurface,
  resolveNativeChromeAppearance,
} from "@/lib/capacitor/native-chrome";
import { NAV_HERO_GLASS, NAV_SCROLLED } from "@/lib/constants/nav-chrome";

export function AuthModal() {
  const { t } = useTranslation();
  const { isOpen, view, close, setView, open } = useAuthModalStore();

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("auth") === "login") {
        open("login");
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("auth");
        newUrl.searchParams.delete("reason");
        window.history.replaceState({}, "", newUrl);
      }
    }
  }, [open]);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  const {
    mounted: chromeMounted,
    pathname,
    isScrolled,
    resolvedTheme,
    isDarkMode,
    useDarkChrome,
  } = useNavChromeSurface();

  const socialButtonClass = cn(
    "w-full h-11 md:h-12 cursor-pointer rounded-full flex items-center justify-center gap-2.5 md:gap-3 border font-semibold transition-all shadow-sm active:scale-[0.98]",
    useDarkChrome
      ? "border-white/15 bg-white text-black hover:bg-white/90"
      : "border-border/50 bg-[#0e0e0e] text-white hover:bg-[#0e0e0e]/90",
  );

  const AUTH_MODAL_SUPPRESS_KEY = "auth-modal-suppress-next-open";

  // If the user just signed out, ensure we don't immediately re-open the auth modal
  // due to redirects (e.g. `/auth/login` -> opens modal -> redirects to `/`).
  React.useEffect(() => {
    if (!isOpen) return;
    try {
      const suppressed =
        typeof window !== "undefined" &&
        window.sessionStorage.getItem(AUTH_MODAL_SUPPRESS_KEY) === "1";
      if (!suppressed) return;

      window.sessionStorage.removeItem(AUTH_MODAL_SUPPRESS_KEY);
      close();
      router.replace("/");
    } catch {
      // Ignore storage errors (private mode / disabled storage)
    }
  }, [close, isOpen, router]);

  React.useEffect(() => {
    if (!isNative() || !chromeMounted) return;

    if (isOpen) {
      void applyNativeChrome(
        resolveChromeFromSurface({ useDarkChrome, isDarkMode }),
      );
      return;
    }

    void applyNativeChrome(
      resolveNativeChromeAppearance({
        pathname,
        isScrolled,
        theme: resolvedTheme,
      }),
    );
  }, [
    chromeMounted,
    isDarkMode,
    isOpen,
    isScrolled,
    pathname,
    resolvedTheme,
    useDarkChrome,
  ]);

  // Login Form State
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [agreed, setAgreed] = React.useState(false);

  // Register Form State
  const [regEmail, setRegEmail] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");
  const [regFirstName, setRegFirstName] = React.useState("");
  const [regLastName, setRegLastName] = React.useState("");
  const [regPhone, setRegPhone] = React.useState("");

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = React.useState(false);
  const [forgotStep, setForgotStep] = React.useState<
    "email" | "otp" | "password"
  >("email");
  const [resetEmail, setResetEmail] = React.useState("");
  const [resetOtp, setResetOtp] = React.useState("");
  const [resetNewPassword, setResetNewPassword] = React.useState("");
  const [otpDigits, setOtpDigits] = React.useState<string[]>(Array(6).fill(""));
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const [cooldown, setCooldown] = React.useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Reset state when view changes or modal closes
  React.useEffect(() => {
    setError("");
    setShowEmailForm(false);
    setShowForgotPassword(false);
    setForgotStep("email");
    setResetEmail("");
    setResetOtp("");
    setResetNewPassword("");
    setOtpDigits(Array(6).fill(""));
    setCooldown(0);
  }, [view, isOpen]);

  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    if (!cleaned) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      setResetOtp(newDigits.join(""));
      return;
    }

    const digit = cleaned[cleaned.length - 1];
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setResetOtp(newDigits.join(""));

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        setResetOtp(newDigits.join(""));
        otpRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = "";
        setOtpDigits(newDigits);
        setResetOtp(newDigits.join(""));
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .trim()
      .replace(/[^0-9]/g, "");
    if (pastedData) {
      const newDigits = Array(6).fill("");
      for (let i = 0; i < 6; i++) {
        if (pastedData[i]) {
          newDigits[i] = pastedData[i];
        }
      }
      setOtpDigits(newDigits);
      setResetOtp(newDigits.join(""));
      const focusIndex = Math.min(pastedData.length - 1, 5);
      otpRefs.current[focusIndex]?.focus();
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await loginRequest({
        email: loginEmail,
        password: loginPassword,
      });
      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });

      if ("requiresTwoFactor" in result && result.requiresTwoFactor) {
        close();
        router.push("/2fa");
        return;
      }

      close();
      if (typeof window !== "undefined") {
        const savedPath = window.sessionStorage.getItem("oauth_redirect_back");
        if (savedPath) {
          window.sessionStorage.removeItem("oauth_redirect_back");
          router.push(savedPath as any);
        }
      }
      // Toast removed in favor of Header notification strip
    } catch {
      setError("Sign-in failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdError = validatePassword(regPassword);
    if (pwdError) {
      setError(pwdError);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await registerRequest({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName || undefined,
        lastName: regLastName || undefined,
        phone: regPhone || undefined,
      });

      toast({
        title: "Registration successful",
        description: "Welcome to Ezee Flights!",
        variant: "success",
      });

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      close();
    } catch (err: any) {
      let message = "Registration failed. Email may already be in use.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.message) {
          message = Array.isArray(parsed.message)
            ? parsed.message[0]
            : parsed.message;
        }
      } catch {
        if (err.message && !err.message.includes("{")) {
          message = err.message;
        }
      }
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await forgotPasswordOtpRequest(resetEmail);
      toast({
        title: "OTP Sent",
        description: "Check your email for the verification code.",
        variant: "success",
      });
      setCooldown(180);
      setForgotStep("otp");
    } catch (err: any) {
      let message = "Failed to send OTP.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.message) {
          message = Array.isArray(parsed.message)
            ? parsed.message[0]
            : parsed.message;
        }
      } catch {
        if (err.message && !err.message.includes("{")) {
          message = err.message;
        }
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await verifyPasswordResetOtp(resetEmail, resetOtp);
      toast({
        title: "OTP Verified",
        description: "You can now enter a new password.",
        variant: "success",
      });
      setForgotStep("password");
    } catch (err: any) {
      let message = "Invalid or expired OTP.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.message) {
          message = Array.isArray(parsed.message)
            ? parsed.message[0]
            : parsed.message;
        }
      } catch {
        if (err.message && !err.message.includes("{")) {
          message = err.message;
        }
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pwdError = validatePassword(resetNewPassword);
    if (pwdError) {
      setError(pwdError);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await resetPassword(resetEmail, resetOtp, resetNewPassword);
      toast({
        title: "Password Reset Successful",
        description: "You can now sign in with your new password.",
        variant: "success",
      });
      setLoginEmail(resetEmail);
      setShowForgotPassword(false);
      setForgotStep("email");
      setShowEmailForm(true);
      setResetOtp("");
      setResetNewPassword("");
    } catch (err: any) {
      let message = "Failed to reset password.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.message) {
          message = Array.isArray(parsed.message)
            ? parsed.message[0]
            : parsed.message;
        }
      } catch {
        if (err.message && !err.message.includes("{")) {
          message = err.message;
        }
      }
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent
        className={cn(
          "w-[calc(100%-1.5rem)] max-w-[calc(100%-1.5rem)] sm:max-w-[420px] p-0 overflow-hidden shadow-2xl rounded-[32px] md:rounded-[40px] transition-all duration-500 [&>button]:right-4 [&>button]:top-4 md:[&>button]:right-5 md:[&>button]:top-5",
          useDarkChrome
            ? cn(
                "bg-[#0e0e0e]/70 backdrop-blur-3xl border border-white/15 text-white",
                "shadow-[0_16px_64px_-12px_rgba(0,0,0,0.6)] [&>button]:text-white/70 [&>button]:hover:text-white [&>button]:bg-white/10 [&>button]:backdrop-blur-md [&>button]:rounded-full [&>button]:p-1.5 [&_.text-foreground]:text-white [&_.text-foreground\\/80]:text-white/80 [&_.text-muted-foreground]:text-white/65 [&_.border-border]:border-white/10 [&_.border-border\\/50]:border-white/10 [&_input]:bg-white/5 [&_input]:text-white [&_input]:border-white/10 [&_input]:placeholder:text-white/40",
              )
            : cn(
                "bg-white/75 backdrop-blur-3xl border border-black/5 text-foreground",
                "shadow-[0_16px_64px_-12px_rgba(0,0,0,0.15)] [&>button]:text-foreground/70 [&>button]:hover:text-foreground [&>button]:bg-black/5 [&>button]:backdrop-blur-md [&>button]:rounded-full [&>button]:p-1.5",
              ),
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{t("Authentication")}</DialogTitle>
          <DialogDescription>
            {t("Sign in or create an account to access your flight bookings.")}
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 py-3 md:p-5 space-y-2 md:space-y-3">
          <AnimatePresence mode="wait">
            {view === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="space-y-3 md:space-y-6"
              >
                {showForgotPassword ? (
                  <div className="space-y-4 py-1 md:space-y-6 md:py-4">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 transition-transform text-foreground/80 font-semibold hover:text-foreground group-hover:-translate-x-0.5" />
                      <span>{t("Back to sign-in")}</span>
                    </button>

                    <div className="space-y-1 text-center">
                      <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                        {forgotStep === "email" && t("Forgot your password?")}
                        {forgotStep === "otp" && t("Enter verification code")}
                        {forgotStep === "password" && t("Reset your password")}
                      </h1>
                      <p className="text-xs md:text-sm text-neutral-400">
                        {forgotStep === "email" &&
                          t(
                            "Enter your account email and we'll send a reset link.",
                          )}
                        {forgotStep === "otp" &&
                          t("Enter the 6-digit OTP code sent to your email.")}
                        {forgotStep === "password" &&
                          t("Enter a new secure password for your account.")}
                      </p>
                    </div>

                    {forgotStep === "email" && (
                      <form
                        onSubmit={handleForgotEmailSubmit}
                        className="space-y-3 md:space-y-5"
                      >
                        <div className="space-y-1.5">
                          <div className="relative">
                            <Input
                              type="email"
                              required
                              placeholder={t("name@example.com")}
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              className="h-10 md:h-12 w-full rounded-full bg-neutral-900/50 border border-neutral-800 focus:border-neutral-700 text-center placeholder:text-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={busy || !resetEmail}
                          className="h-10 md:h-12 w-full rounded-full bg-transparent border border-transparent text-white font-bold hover:bg-neutral-800/80 transition-all cursor-pointer flex items-center justify-center text-sm disabled:opacity-50"
                        >
                          {busy ? t("Sending...") : t("Send OTP")}
                        </button>
                      </form>
                    )}

                    {forgotStep === "otp" && (
                      <form
                        onSubmit={handleVerifyOtpSubmit}
                        className="space-y-4 md:space-y-6"
                      >
                        <div className="flex justify-center gap-1.5 md:gap-2">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                otpRefs.current[idx] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handleOtpChange(idx, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              onPaste={handleOtpPaste}
                              className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-neutral-900/50 border border-neutral-800 focus:border-neutral-700 text-center text-lg md:text-xl font-bold text-white focus:outline-none focus:ring-0 focus-visible:ring-0"
                            />
                          ))}
                        </div>
                        <div className="space-y-2 md:space-y-3">
                          <button
                            type="submit"
                            disabled={busy || resetOtp.length !== 6}
                            className="h-10 md:h-12 w-full rounded-full bg-transparent border border-transparent text-white font-bold hover:bg-neutral-800/80 transition-all cursor-pointer flex items-center justify-center text-sm disabled:opacity-50"
                          >
                            {busy ? t("Verifying...") : t("Verify OTP")}
                          </button>

                          <div className="text-center">
                            {cooldown > 0 ? (
                              <p className="text-xs text-neutral-400">
                                {t("Didn't get code? Resend OTP in")}{" "}
                                <span className="font-semibold text-white">
                                  {formatCooldown(cooldown)}
                                </span>
                              </p>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => handleForgotEmailSubmit(e)}
                                className="text-xs font-semibold text-redmix hover:underline cursor-pointer text-red-500"
                              >
                                {t("Resend verification code")}
                              </button>
                            )}
                          </div>
                        </div>
                      </form>
                    )}

                    {forgotStep === "password" && (
                      <form
                        onSubmit={handleResetPasswordSubmit}
                        className="space-y-3 md:space-y-5"
                      >
                        <div className="space-y-1.5">
                          <Input
                            type="password"
                            required
                            value={resetNewPassword}
                            onChange={(e) =>
                              setResetNewPassword(e.target.value)
                            }
                            className="h-10 md:h-12 w-full rounded-full bg-neutral-900/50 border border-neutral-800 focus:border-neutral-700 text-center placeholder:text-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-white"
                            placeholder={t("New password")}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={busy || !resetNewPassword}
                          className="h-10 md:h-12 w-full rounded-full bg-transparent border border-transparent text-white font-bold hover:bg-neutral-800/80 transition-all cursor-pointer flex items-center justify-center text-sm disabled:opacity-50"
                        >
                          {busy ? t("Resetting...") : t("Set New Password")}
                        </button>
                      </form>
                    )}
                  </div>
                ) : !showEmailForm ? (
                  <div className="space-y-3 md:space-y-5">
                    <div className="space-y-0.5 md:space-y-1 text-center py-0 md:py-2">
                      <h1 className="text-xl md:text-2xl font-bold">
                        {t("Welcome back")}
                      </h1>
                      <p className="text-xs md:text-sm ">
                        {t("Sign in to your account")}
                      </p>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                      <button
                        className={socialButtonClass}
                        onClick={async () => {
                          if (typeof window !== "undefined") {
                            const path = window.location.pathname;
                            if (!path.includes("/auth/")) {
                              const target = path + window.location.search;
                              sessionStorage.setItem(
                                "oauth_redirect_back",
                                target,
                              );
                              document.cookie = `oauth_redirect_back=${encodeURIComponent(target)}; path=/; max-age=300; SameSite=Lax`;
                            }
                          }

                          if (isNative()) {
                            try {
                              setBusy(true);
                              // Needs import { GoogleSignIn } from "@capawesome/capacitor-google-sign-in";
                              const GoogleSignIn =
                                require("@capawesome/capacitor-google-sign-in").GoogleSignIn;
                              try {
                                await GoogleSignIn.initialize({
                                  clientId: isNative()
                                    ? "593693636053-t2dgq0rjj27unpmjboba26m6g0kefqta.apps.googleusercontent.com"
                                    : "1099115700327-vcq7hlpbi16rsecg4l5ie80m01j3pank.apps.googleusercontent.com",
                                });
                              } catch (initErr: any) {
                                console.warn(
                                  "GoogleSignIn initialize failed or already initialized:",
                                  initErr,
                                );
                                const msg = initErr?.message || String(initErr);
                                if (
                                  !msg
                                    .toLowerCase()
                                    .includes("already initialized") &&
                                  !msg.toLowerCase().includes("initialized")
                                ) {
                                  toast({
                                    title: "Google Sign-In Init Error",
                                    description: `Initialization failed: ${msg}. Please make sure to rebuild the Android project in Android Studio (or via 'npx cap run android') to compile the newly linked plugin.`,
                                    variant: "destructive",
                                  });
                                  return;
                                }
                              }
                              const result = await GoogleSignIn.signIn();
                              const idToken = result.idToken;
                              if (!idToken) {
                                toast({
                                  title: "Google Sign-In Error",
                                  description:
                                    "No ID token returned. Please check Google Cloud configuration.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              const loginRes =
                                await nativeGoogleLoginRequest(idToken);
                              await queryClient.invalidateQueries({
                                queryKey: ["auth-session"],
                              });
                              await queryClient.invalidateQueries({
                                queryKey: ["profile"],
                              });

                              if (typeof window !== "undefined") {
                                window.sessionStorage.setItem(
                                  "show_login_success_toast",
                                  "google",
                                );
                                setTimeout(() => {
                                  window.sessionStorage.removeItem(
                                    "show_login_success_toast",
                                  );
                                }, 2000);
                              }

                              toast({
                                title: t("Welcome back!"),
                                description: t(
                                  "You have successfully signed in with Google.",
                                ),
                              });
                              if (
                                "requiresTwoFactor" in loginRes &&
                                loginRes.requiresTwoFactor
                              ) {
                                close();
                                router.push("/2fa");
                                return;
                              }
                              close();
                              if (typeof window !== "undefined") {
                                const savedPath = window.sessionStorage.getItem(
                                  "oauth_redirect_back",
                                );
                                if (savedPath) {
                                  window.sessionStorage.removeItem(
                                    "oauth_redirect_back",
                                  );
                                  router.push(savedPath as any);
                                }
                              }
                            } catch (err: any) {
                              console.error(
                                "[capacitor] Native Google Sign In Error:",
                                typeof err === "object"
                                  ? JSON.stringify(err)
                                  : err,
                                err?.message,
                              );
                              toast({
                                title: "Google Sign-In Error",
                                description:
                                  err?.message ||
                                  "Failed to sign in with Google.",
                                variant: "destructive",
                              });
                            } finally {
                              setBusy(false);
                            }
                          } else {
                            window.location.href = googleOAuthUrl();
                          }
                        }}
                      >
                        <GoogleIcon className="w-4 h-4" />
                        <span className="text-sm">
                          {t("Continue with Google")}
                        </span>
                      </button>

                      {/* <button
                        type="button"
                        className="h-11 w-full rounded-xl cursor-pointer bg-black text-white hover:bg-black/90 flex items-center justify-center gap-3 font-semibold transition-all"
                      >
                        <Apple className="h-4 w-4" />
                        <span className="text-sm">Continue with Apple</span>
                      </button> */}

                      <div className="flex items-center justify-center gap-2 py-0.5 md:pt-2">
                        <span className="flex-1 border-t border-border/50" />
                        <span className="text-xs font-semibold tracking-wider">
                          {t("or")}
                        </span>
                        <span className="flex-1 border-t border-border/50" />
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowEmailForm(true)}
                        className={socialButtonClass}
                      >
                        <Mail className="w-4 h-4" />
                        <span className="text-sm">
                          {t("Continue with Email")}
                        </span>
                      </button>
                    </div>
                    {/* 
                    <p className="text-xs text-center text-foreground/80 font-semibold leading-relaxed px-4">
                      {t("By continuing, you agree to our")}{" "}
                      <Link
                        target="_blank"
                        href={"/terms-and-conditions" as any}
                        className="text-redmix hover:underline font-semibold"
                      >
                        {t("Terms")}
                      </Link>{" "}
                      {t("and")}{" "}
                      <Link
                        target="_blank"
                        href={"/privacy-policy" as any}
                        className="text-redmix hover:underline font-semibold"
                      >
                        {t("Privacy")}
                      </Link>
                      .
                    </p> */}

                    <div
                      className={cn(
                        "pt-2 md:pt-4 text-center border-t",
                        useDarkChrome ? "border-white/10" : "border-border/50",
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-semibold",
                          useDarkChrome
                            ? "text-white/80"
                            : "text-foreground/80",
                        )}
                      >
                        {t("New to Ezee Flights?")}{" "}
                        <button
                          onClick={() => setView("register")}
                          className="text-redmix hover:underline font-bold cursor-pointer"
                        >
                          {t("Create account")}
                        </button>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 md:space-y-4">
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                      <span className="text-foreground/80 font-semibold">
                        {t("Back to sign-in options")}
                      </span>
                    </button>

                    <LoginForm
                      email={loginEmail}
                      password={loginPassword}
                      onEmailChange={setLoginEmail}
                      onPasswordChange={setLoginPassword}
                      onSubmit={handleLoginSubmit}
                      onForgotPassword={() => setShowForgotPassword(true)}
                      disabled={busy}
                      error={error}
                    />

                    <p className="text-[11px] text-center text-muted-foreground leading-relaxed px-4 pt-2">
                      {t("By continuing, you agree to our")}{" "}
                      <Link
                        href={"/terms" as any}
                        className="text-redmix hover:underline font-semibold"
                      >
                        {t("Terms")}
                      </Link>{" "}
                      {t("and")}{" "}
                      <Link
                        href={"/privacy" as any}
                        className="text-redmix hover:underline font-semibold"
                      >
                        {t("Privacy")}
                      </Link>
                      .
                    </p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="space-y-3 md:space-y-6"
              >
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform text-foreground/80 font-semibold hover:text-foreground group-hover:-translate-x-0.5" />
                  <span className="text-foreground/80 font-semibold">
                    {t("Back to sign-in options")}
                  </span>
                </button>

                <RegisterForm
                  email={regEmail}
                  password={regPassword}
                  firstName={regFirstName}
                  lastName={regLastName}
                  phone={regPhone}
                  onEmailChange={setRegEmail}
                  onPasswordChange={setRegPassword}
                  onFirstNameChange={setRegFirstName}
                  onLastNameChange={setRegLastName}
                  onPhoneChange={setRegPhone}
                  onSubmit={handleRegisterSubmit}
                  disabled={busy}
                  error={error}
                  agreed={agreed}
                />

                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-start gap-2.5 px-2 md:px-4 pt-1 md:pt-2">
                    <Checkbox
                      id="register-terms"
                      checked={agreed}
                      onCheckedChange={(v) => setAgreed(v as boolean)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor="register-terms"
                      className="text-xs text-foreground/80 font-semibold leading-relaxed select-none cursor-pointer"
                    >
                      {t("By joining, you agree to our")}{" "}
                      <Link
                        href={"/terms-and-conditions" as any}
                        target="_blank"
                        className="text-redmix hover:underline font-semibold"
                      >
                        {t("Terms & Conditions")}
                      </Link>{" "}
                      {t("and")}{" "}
                      <Link
                        href={"/privacy-policy" as any}
                        target="_blank"
                        className="text-redmix hover:underline font-semibold"
                      >
                        {t("Privacy")}
                      </Link>
                      .
                    </label>
                  </div>

                  <div className="pt-4 text-center border-t border-border/50">
                    <p className="text-xs text-foreground/80 font-semibold">
                      {t("Already have an account?")}{" "}
                      <button
                        onClick={() => setView("login")}
                        className="text-redmix hover:underline font-bold cursor-pointer"
                      >
                        {t("Sign in")}
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
