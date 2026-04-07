"use client";

import { FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { AppIcon } from "@/components/ui/app-icon";
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
  return (
    <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="space-y-1.5 mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground font-medium">
          Enter your flight dashboard with your credentials.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-xs font-semibold  tracking-widest text-muted-foreground/80 ml-1"
            >
              Email Address
            </label>
            <Input
              id="email"
              placeholder="e.g. name@example.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={disabled}
              required
              className="h-12 bg-muted/10 border-border/50 rounded-xl px-4 focus-visible:ring-redmix/20 transition-all font-medium"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label
                htmlFor="password"
                className="text-xs font-semibold  tracking-widest text-muted-foreground/80"
              >
                Password
              </label>
              <Link
                href={"/auth/forgot-password" as any}
                className="text-xs font-bold text-redmix hover:text-redmix-light transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative group">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                disabled={disabled}
                required
                className="h-12 bg-muted/20 border-border/50 rounded-xl px-4 pr-12 focus-visible:ring-redmix/20 transition-all font-medium"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2">
                <AppIcon
                  icon={showPassword ? EyeOff : Eye}
                  onClick={() => setShowPassword(!showPassword)}
                  animate={false}
                  className="w-10 h-10 bg-transparent border-none shadow-none hover:bg-muted/30 focus-within:ring-0 active:scale-90"
                  variant="default"
                />
              </div>
            </div>
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
          className="w-full h-12 rounded-xl text-base font-bold shadow-xl shadow-redmix/20 transition-all active:scale-[0.98]"
          type="submit"
          disabled={disabled}
        >
          {disabled ? "Creating Session..." : "Sign in to Ezee Flights"}
        </Button>
      </form>
    </div>
  );
}
