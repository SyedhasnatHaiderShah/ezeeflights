"use client";

import { FormEvent, useState } from "react";
import { motion, Variants } from "framer-motion";
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

const formItemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
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

  return (
    <div className="w-full space-y-8">
      <motion.div variants={formItemVariants} className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground/80 font-medium">
          Enter your flight dashboard with your credentials.
        </p>
      </motion.div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-5">
          {/* Email Field */}
          <motion.div variants={formItemVariants} className="space-y-2.5">
            <label
              htmlFor="email"
              className="text-xs font-semibold  tracking-widest text-muted-foreground/80 ml-1"
            >
              Email Address
            </label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={disabled}
              required
              className="h-14 bg-muted/5 border-border/40 rounded-2xl px-5 text-base focus-visible:ring-redmix/10 focus-visible:border-redmix/30 transition-colors font-medium placeholder:text-muted-foreground/40"
            />
          </motion.div>

          {/* Password Field */}
          <motion.div variants={formItemVariants} className="space-y-2.5">
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
                className="h-14 bg-muted/5 border-border/40 rounded-2xl px-5 pr-14 text-base focus-visible:ring-redmix/10 focus-visible:border-redmix/30 transition-colors font-medium placeholder:text-muted-foreground/40"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 rounded-xl text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-all active:scale-90"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-destructive/5 border border-destructive/10 rounded-2xl p-4"
          >
            <p className="text-xs text-destructive font-bold text-center">
              {error}
            </p>
          </motion.div>
        )}

        <motion.div variants={formItemVariants} className="pt-2">
          <Button
            variant="brand-red"
            className="w-full h-14 rounded-md text-base font-semibold shadow-xl shadow-redmix/10 transition-all hover:shadow-redmix/20 active:scale-[0.98] bg-redmix hover:bg-redmix-light"
            type="submit"
            disabled={disabled}
          >
            {disabled ? "Creating Session..." : "Sign in to Ezee Flights"}
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
