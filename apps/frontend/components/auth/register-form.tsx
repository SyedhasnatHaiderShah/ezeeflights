"use client";

import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

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
  const FEATURES = [
    "Member-only flight discounts",
    "Fast one-click bookings",
    "Synced trip planning",
  ];

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="space-y-1.5 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
          Join Ezee Flights
        </h1>
        <p className="text-sm text-muted-foreground font-medium italic">
          Experience the modern way to navigate the skies.
        </p>
      </div>

      {/* <div className="grid grid-cols-1 gap-2.5 pb-2">
        {FEATURES.map((feature, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <CheckCircle2 className="w-3.5 h-3.5 text-redmix shrink-0 transition-transform group-hover:scale-110" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {feature}
            </span>
          </div>
        ))}
      </div> */}

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                First Name
              </label>
              <Input
                placeholder="First"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                disabled={disabled}
                className="h-12 bg-muted/20 border-border/50 rounded-xl px-4 focus-visible:ring-redmix/20 transition-all font-medium"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
                Last Name
              </label>
              <Input
                placeholder="Last"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                disabled={disabled}
                className="h-12 bg-muted/20 border-border/50 rounded-xl px-4 focus-visible:ring-redmix/20 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
              Email Address
            </label>
            <Input
              placeholder="name@example.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={disabled}
              required
              className="h-12 bg-muted/20 border-border/50 rounded-xl px-4 focus-visible:ring-redmix/20 transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 ml-1">
              Create Password
            </label>
            <Input
              placeholder="••••••••"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              disabled={disabled}
              required
              className="h-12 bg-muted/20 border-border/50 rounded-xl px-4 focus-visible:ring-redmix/20 transition-all font-medium"
            />
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3 animate-shake">
            <p className="text-xs text-destructive font-bold text-center">
              {error}
            </p>
          </div>
        )}

        <Button
          variant="brand-red"
          size="lg"
          className="w-full h-12 rounded-xl text-base font-bold shadow-xl shadow-redmix/20 transition-all active:scale-[0.98] group"
          type="submit"
          disabled={disabled}
        >
          {disabled ? "Starting Journey..." : "Begin Your Journey"}
          <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </form>
    </div>
  );
}
