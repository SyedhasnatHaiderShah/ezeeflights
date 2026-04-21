"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export interface TwoFactorFormProps {
  code: string;
  onCodeChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled?: boolean;
  error?: string;
}

export function TwoFactorForm({ code, onCodeChange, onSubmit, disabled, error }: TwoFactorFormProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const initial = useMemo(() => Array.from({ length: 6 }, (_, i) => code[i] ?? ""), [code]);
  const [digits, setDigits] = useState<string[]>(initial);
  const [countdown, setCountdown] = useState(57);

  useEffect(() => setDigits(Array.from({ length: 6 }, (_, i) => code[i] ?? "")), [code]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(id);
  }, [countdown]);

  const sync = (next: string[]) => {
    setDigits(next);
    onCodeChange(next.join(""));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-redmix"><ShieldCheck className="h-5 w-5" /><h1 className="text-xl font-bold">Two-factor verification</h1></div>
        <p className="text-sm text-muted-foreground">Enter the 6-digit code from your authenticator app.</p>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="flex justify-between gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              value={digit}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(-1);
                const next = [...digits];
                next[i] = value;
                sync(next);
                if (value && i < 5) refs.current[i + 1]?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              onPaste={(e) => {
                const raw = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                if (!raw) return;
                e.preventDefault();
                const next = Array.from({ length: 6 }, (_, index) => raw[index] ?? "");
                sync(next);
                refs.current[Math.min(raw.length, 5)]?.focus();
              }}
              inputMode="numeric"
              maxLength={1}
              className="h-14 w-12 rounded-xl border-2 text-center text-xl font-bold focus:border-brand-red focus:outline-none"
            />
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {countdown > 0 ? `Resend code in 0:${String(countdown).padStart(2, "0")}` : <button type="button" className="text-redmix" onClick={() => setCountdown(57)}>Resend</button>}
        </p>

        {error ? <p className="text-xs font-medium text-red-500">{error}</p> : null}

        <Button variant="brand-red" size="lg" className="h-12 w-full rounded-xl" type="submit" disabled={disabled || code.length !== 6}>
          {disabled ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>
    </div>
  );
}
