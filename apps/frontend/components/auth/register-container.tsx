"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { registerRequest } from "@/lib/api/auth-api";
import { queryClient } from "@/lib/query/query-client";

import Link from "next/link";

export function RegisterContainer() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await registerRequest({
        email,
        password,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      router.push("/dashboard" as any);
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <RegisterForm
        email={email}
        password={password}
        firstName={firstName}
        lastName={lastName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onFirstNameChange={setFirstName}
        onLastNameChange={setLastName}
        onSubmit={onSubmit}
        disabled={busy}
        error={error}
      />

      <div className="space-y-6">
        <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-4">
          By joining, you agree to our{" "}
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
            Already have an account?{" "}
            <Link
              href={"/auth/login" as any}
              className="text-redmix hover:underline font-bold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
