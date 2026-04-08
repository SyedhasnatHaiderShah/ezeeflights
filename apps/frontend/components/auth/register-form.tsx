"use client";

import { FormEvent } from "react";
import { motion, Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
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
  return (
    <div className="w-full space-y-8">
      <motion.div variants={formItemVariants} className="space-y-2">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          Join Ezee Flights
        </h1>
        <p className="text-sm text-muted-foreground/80 font-medium italic">
          Experience the modern way to navigate the skies.
        </p>
      </motion.div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="space-y-5">
          <motion.div variants={formItemVariants} className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <label className="text-xs font-semibold  tracking-widest text-muted-foreground/80 ml-1">
                First Name
              </label>
              <Input
                placeholder="First"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                disabled={disabled}
                className="h-14 bg-muted/5 border-border/40 rounded-2xl px-5 text-base focus-visible:ring-redmix/10 focus-visible:border-redmix/30 transition-colors font-medium placeholder:text-muted-foreground/40"
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-semibold  tracking-widest text-muted-foreground/80 ml-1">
                Last Name
              </label>
              <Input
                placeholder="Last"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                disabled={disabled}
                className="h-14 bg-muted/5 border-border/40 rounded-2xl px-5 text-base focus-visible:ring-redmix/10 focus-visible:border-redmix/30 transition-colors font-medium placeholder:text-muted-foreground/40"
              />
            </div>
          </motion.div>

          <motion.div variants={formItemVariants} className="space-y-2.5">
            <label className="text-xs font-semibold  tracking-widest text-muted-foreground/80 ml-1">
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
              className="h-14 bg-muted/5 border-border/40 rounded-2xl px-5 text-base focus-visible:ring-redmix/10 focus-visible:border-redmix/30 transition-colors font-medium placeholder:text-muted-foreground/40"
            />
          </motion.div>

          <motion.div variants={formItemVariants} className="space-y-2.5">
            <label className="text-xs font-semibold  tracking-widest text-muted-foreground/80 ml-1">
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
              className="h-14 bg-muted/5 border-border/40 rounded-2xl px-5 text-base focus-visible:ring-redmix/10 focus-visible:border-redmix/30 transition-colors font-medium placeholder:text-muted-foreground/40"
            />
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
            className="w-full h-14 rounded-md text-base font-semibold shadow-xl shadow-redmix/10 transition-all hover:shadow-redmix/20 active:scale-[0.98] bg-redmix hover:bg-redmix-light group"
            type="submit"
            disabled={disabled}
          >
            {disabled ? "Starting Journey..." : "Begin Your Journey"}
            <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </form>
    </div>
  );
}
