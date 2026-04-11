"use client";

import { FormEvent, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
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

const formItemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full space-y-4">
      <motion.div variants={formItemVariants} className="space-y-2">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-brand-dark">
          Join Ezee Flights
        </h1>
        <p className="text-xs text-brand-dark-light font-medium">
          Experience the modern way to navigate the skies.
        </p>
      </motion.div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-3">
          <motion.div
            variants={formItemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <div className="space-y-1">
              <label className="text-xs font-bold tracking-wider text-brand-dark-light ml-1">
                First Name
              </label>
              <Input
                placeholder="First"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                disabled={disabled}
                className="h-11 bg-muted/5 border-border/40 rounded-xl px-4 text-sm focus-visible:ring-redmix/10 focus-visible:border-redmix/30 transition-colors font-medium placeholder:text-brand-dark/80"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold tracking-wider text-brand-dark-light ml-1">
                Last Name
              </label>
              <Input
                placeholder="Last"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                disabled={disabled}
                className="h-11 bg-muted/5 border-border/40 rounded-xl px-4 text-sm focus-visible:ring-redmix/10 focus-visible:border-redmix/30 transition-colors font-medium placeholder:text-brand-dark/80"
              />
            </div>
          </motion.div>

          <motion.div variants={formItemVariants} className="space-y-1">
            <label className="text-xs font-bold tracking-wider text-brand-dark-light ml-1">
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
              className="h-11 bg-muted/5 border-border/40 rounded-xl px-4 text-sm focus-visible:ring-redmix/10 focus-visible:border-redmix/30 transition-colors font-medium placeholder:text-brand-dark/80"
            />
          </motion.div>

          <motion.div variants={formItemVariants} className="space-y-1">
            <label className="text-xs font-bold tracking-wider text-brand-dark-light ml-1">
              Create Password
            </label>
            <div className="relative group">
              <Input
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                disabled={disabled}
                required
                className="h-11 bg-muted/5 border-border/40 rounded-xl px-4 pr-12 text-sm focus-visible:ring-redmix/10 focus-visible:border-redmix/30 transition-colors font-medium placeholder:text-brand-dark/80"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 rounded-lg text-brand-dark/40 hover:text-brand-dark hover:bg-muted/50 transition-all active:scale-90"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-destructive/5 border border-destructive/10 rounded-xl p-3"
          >
            <p className="text-[11px] text-destructive font-bold text-center">
              {error}
            </p>
          </motion.div>
        )}

        <motion.div variants={formItemVariants} className="pt-1">
          <Button
            variant="brand-red"
            className="w-full h-12 cursor-pointer rounded-xl text-sm font-semibold shadow-lg shadow-redmix/10 transition-all hover:translate-y-[-1px] active:translate-y-[0px] active:scale-[0.98] bg-redmix hover:bg-redmix-light group"
            type="submit"
            disabled={disabled}
          >
            {disabled ? "Joining..." : "Begin Your Journey"}
            <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
