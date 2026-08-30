"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { registerRequest } from "@/lib/api/auth-api";
import { queryClient } from "@/lib/query/query-client";
import { useToast } from "@/lib/hooks/use-toast";

export function RegisterContainer() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
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
        phone: phone || undefined,
      });
      toast({ title: "Registration successful", description: "Welcome! Your account has been created.", variant: "success" });
      await queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      router.push("/" as any);
    } catch (err: any) {
      let message = "Registration failed. Email may already be in use.";
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.message) message = Array.isArray(parsed.message) ? parsed.message[0] : parsed.message;
      } catch {
        if (err.message && !err.message.includes("{")) message = err.message;
      }
      setError(message);
      toast({ title: "Registration Error", description: message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <RegisterForm
      email={email}
      password={password}
      firstName={firstName}
      lastName={lastName}
      phone={phone}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      onPhoneChange={setPhone}
      onSubmit={onSubmit}
      disabled={busy}
      error={error}
    />
  );
}
