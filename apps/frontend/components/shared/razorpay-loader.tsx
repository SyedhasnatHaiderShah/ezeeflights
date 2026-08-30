"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, CreditCard, Lock } from "lucide-react";
import { useEffect, useState } from "react";

export type RazorpayLoadStage =
  | "idle"
  | "creating-order" // backend call to create Razorpay order
  | "loading-sdk" // injecting checkout.js
  | "securing" // SDK loaded, building options
  | "opening" // rzp.open() called — modal about to appear
  | "verifying"; // payment done, verifying signature on backend

interface StageConfig {
  label: string;
  sub: string;
  icon: React.ElementType;
  progress: number; // 0-100
}

const STAGE_CONFIG: Record<Exclude<RazorpayLoadStage, "idle">, StageConfig> = {
  "creating-order": {
    label: "Initializing Payment",
    sub: "Creating a secure order on our server…",
    icon: Lock,
    progress: 20,
  },
  "loading-sdk": {
    label: "Loading Payment Gateway",
    sub: "Connecting to Razorpay checkout…",
    icon: CreditCard,
    progress: 50,
  },
  securing: {
    label: "Securing Connection",
    sub: "Establishing encrypted payment session…",
    icon: ShieldCheck,
    progress: 75,
  },
  opening: {
    label: "Opening Checkout",
    sub: "Razorpay payment window is launching…",
    icon: CreditCard,
    progress: 95,
  },
  verifying: {
    label: "Verifying Payment",
    sub: "Confirming payment with our server…",
    icon: ShieldCheck,
    progress: 90,
  },
};

interface RazorpayLoaderProps {
  stage: RazorpayLoadStage;
  onCancel?: () => void;
}

export function RazorpayLoader({ stage, onCancel }: RazorpayLoaderProps) {
  const visible = stage !== "idle";
  const config = stage !== "idle" ? STAGE_CONFIG[stage] : null;
  const Icon = config?.icon ?? Lock;

  // Animated progress value — smoothly interpolates between stage values
  const [displayProgress, setDisplayProgress] = useState(0);
  useEffect(() => {
    if (config) {
      setDisplayProgress(config.progress);
    }
  }, [config]);

  return (
    <AnimatePresence>
      {visible && config && (
        <motion.div
          key="razorpay-loader-overlay"
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="flex flex-col items-center gap-3 p-5 relative overflow-hidden min-w-[200px] md:min-w-[280px] max-w-[80vw] bg-background/95 backdrop-blur-xl rounded-[20px] md:rounded-[28px] shadow-2xl shadow-black/20"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Simple CSS spin matching global-loader */}
            <div className="h-9 w-9 rounded-full border-4 animate-spin border-redmix/30 dark:border-white/30 border-t-redmix dark:border-t-white mt-2" />

            <div className="flex flex-col items-center gap-1.5 relative z-10 w-full px-2 mt-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-1 text-center w-full"
                >
                  <h3 className="text-sm font-semibold tracking-tight text-redmix/90 dark:text-white">
                    {config.label}
                  </h3>
                  <p className="text-xs text-foreground/80 leading-snug">
                    {config.sub}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Secured badge */}
            <motion.div
              className="relative z-10 flex items-center gap-1 text-[10px] text-foreground/60 mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <ShieldCheck className="w-3 h-3 text-green-500/70 shrink-0" />
              <span>Secured by Razorpay</span>
            </motion.div>

            {onCancel && stage !== "verifying" && (
              <button
                type="button"
                onClick={onCancel}
                className="relative z-10 mt-2 text-xs font-medium text-foreground hover:text-redmix transition-colors px-4 py-1.5 rounded-full bg-muted/30 hover:bg-muted/50"
              >
                Cancel
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
