"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { loginRequest } from "@/lib/api/auth-api";
import { queryClient } from "@/lib/query/query-client";

import Link from "next/link";

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
    <div className="space-y-3">
      <LoginForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={onSubmit}
        disabled={busy}
        error={error}
      />

      <div className="space-y-6">
        <OAuthButtons />

        <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-4">
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

        <div className="pt-4 text-center border-t border-border/50">
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
      </div>
    </div>
  );
}
