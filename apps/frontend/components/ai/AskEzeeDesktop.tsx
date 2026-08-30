"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AskEzeeChatContent } from "./AskEzeeChatContent";
import { cn } from "@/lib/utils";
import { useNavChromeSurface } from "@/lib/hooks/use-nav-chrome-surface";

interface AskEzeeDesktopProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatProps: any;
}

export function AskEzeeDesktop({
  open,
  onOpenChange,
  chatProps,
}: AskEzeeDesktopProps) {
  const { isHeroMode } = useNavChromeSurface();
  const isGlass = isHeroMode;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
          className={cn(
            "fixed bottom-24 right-6 z-[120] w-[300px] h-[420px] flex flex-col rounded-md shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300",
            isGlass
              ? "bg-[#0e0e0e]/60 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] dark text-white"
              : "bg-white dark:bg-background border border-slate-100 dark:border-slate-800"
          )}
        >
          <AskEzeeChatContent
            {...chatProps}
            isGlass={isGlass}
            onClose={() => onOpenChange(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
