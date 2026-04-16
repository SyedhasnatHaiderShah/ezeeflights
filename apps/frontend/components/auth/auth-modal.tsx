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
import { loginRequest, registerRequest } from "@/lib/api/auth-api";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/lib/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";

export function AuthModal() {
  const { isOpen, view, close, setView } = useAuthModalStore();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();

  // Login Form State
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");

  // Register Form State
  const [regEmail, setRegEmail] = React.useState("");
  const [regPassword, setRegPassword] = React.useState("");
  const [regFirstName, setRegFirstName] = React.useState("");
  const [regLastName, setRegLastName] = React.useState("");

  // Reset state when view changes or modal closes
  React.useEffect(() => {
    setError("");
  }, [view, isOpen]);

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

      if ("requiresTwoFactor" in result && result.requiresTwoFactor) {
        close();
        router.push("/2fa");
        return;
      }

      close();
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
        variant: "success",
      });
    } catch {
      setError("Sign-in failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await registerRequest({
        email: regEmail,
        password: regPassword,
        firstName: regFirstName || undefined,
        lastName: regLastName || undefined,
      });

      toast({
        title: "Registration successful",
        description: "Welcome to Ezee Flights!",
        variant: "success",
      });

      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-background border-none shadow-2xl">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            Sign in or create an account to access your flight bookings.
          </DialogDescription>
        </DialogHeader>
        <div className="p-6 sm:p-8 space-y-6">
          <AnimatePresence mode="wait">
            {view === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <LoginForm
                  email={loginEmail}
                  password={loginPassword}
                  onEmailChange={setLoginEmail}
                  onPasswordChange={setLoginPassword}
                  onSubmit={handleLoginSubmit}
                  disabled={busy}
                  error={error}
                />

                <div className="space-y-4">
                  <OAuthButtons />

                  <p className="text-[11px] text-center text-muted-foreground leading-relaxed px-4">
                    By continuing, you agree to our{" "}
                    <Link
                      href={"/terms" as any}
                      className="text-redmix hover:underline font-semibold"
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      href={"/privacy" as any}
                      className="text-redmix hover:underline font-semibold"
                    >
                      Privacy
                    </Link>
                    .
                  </p>

                  <div className="pt-4 text-center border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      New to Ezee Flights?{" "}
                      <button
                        onClick={() => setView("register")}
                        className="text-redmix hover:underline font-bold"
                      >
                        Create account
                      </button>
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <RegisterForm
                  email={regEmail}
                  password={regPassword}
                  firstName={regFirstName}
                  lastName={regLastName}
                  onEmailChange={setRegEmail}
                  onPasswordChange={setRegPassword}
                  onFirstNameChange={setRegFirstName}
                  onLastNameChange={setRegLastName}
                  onSubmit={handleRegisterSubmit}
                  disabled={busy}
                  error={error}
                />

                <div className="space-y-4">
                  <p className="text-[11px] text-center text-muted-foreground leading-relaxed px-4">
                    By joining, you agree to our{" "}
                    <Link
                      href={"/terms" as any}
                      className="text-redmix hover:underline font-semibold"
                    >
                      Terms
                    </Link>{" "}
                    and{" "}
                    <Link
                      href={"/privacy" as any}
                      className="text-redmix hover:underline font-semibold"
                    >
                      Privacy
                    </Link>
                    .
                  </p>

                  <div className="pt-4 text-center border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        onClick={() => setView("login")}
                        className="text-redmix hover:underline font-bold"
                      >
                        Sign in
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
