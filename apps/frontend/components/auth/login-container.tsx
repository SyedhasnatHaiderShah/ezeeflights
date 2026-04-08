"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { loginRequest } from "@/lib/api/auth-api";
import { queryClient } from "@/lib/query/query-client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 15, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    } as const,
  },
};

export function LoginContainer() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await loginRequest({ email, password });
      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      if ("requiresTwoFactor" in result && result.requiresTwoFactor) {
        router.push("/2fa" as any);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError(
        "Sign-in failed. Check credentials or complete two-factor if required.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <LoginForm
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={onSubmit}
          disabled={busy}
          error={error}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6">
        <OAuthButtons />

        <p className="text-xs text-center font-medium text-muted-foreground/60 leading-relaxed px-4">
          By continuing, you agree to our{" "}
          <Link
            href={"/terms" as any}
            className="text-primary hover:underline font-semibold"
          >
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link
            href={"/privacy" as any}
            className="text-primary hover:underline font-semibold"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="pt-5 text-center border-t border-border/50">
          <p className="text-xs text-muted-foreground font-medium">
            New to Ezee Flights?{" "}
            <Link
              href={"/auth/signup" as any}
              className="text-redmix hover:underline font-bold"
            >
              Create account
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
