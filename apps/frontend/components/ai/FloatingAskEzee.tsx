"use client";

import React, { useState } from "react";
import { Mic, X } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { AskEzeeAi } from "./AskEzeeAi";
import { cn } from "@/lib/utils";
import { requestMicrophoneAccess } from "@/lib/capacitor";

export function FloatingAskEzee() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRequestingMic, setIsRequestingMic] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();

  if (pathname !== "/") return null;

  const handleToggle = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsRequestingMic(true);
    try {
      const granted = await requestMicrophoneAccess({
        onGranted: () => setIsOpen(true),
      });
      if (granted) {
        setIsOpen(true);
      }
    } finally {
      setIsRequestingMic(false);
    }
  };

  return (
    <>
      <div className="fixed md:bottom-6 md:right-6 bottom-16 right-5 z-40 group hidden md:block">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ y: -3 }}
          className="relative"
        >
          {!isOpen && (
            <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-card/90 backdrop-blur-xl border border-white/20 px-3 py-2 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] max-w-[220px] opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none hidden md:block translate-x-2 group-hover:translate-x-0">
              <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 whitespace-nowrap">
                {t("AI Voice Search")}
              </p>
            </div>
          )}

          {!isOpen && (
            <>
              <div className="absolute inset-[-3px] bg-redmix/30 rounded-full animate-ping" />
              <div className="absolute inset-[-6px] bg-redmix/10 rounded-full animate-pulse blur-md" />
            </>
          )}

          <button
            type="button"
            onClick={() => void handleToggle()}
            disabled={isRequestingMic}
            aria-label={
              isOpen
                ? t("Close Ask Ezee")
                : t("Open Ask Ezee voice search")
            }
            className={cn(
              "h-10 w-10 rounded-full text-white shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 relative z-10 border border-white/20 backdrop-blur-sm disabled:opacity-70 disabled:hover:scale-100",
              "bg-gradient-to-br from-redmix to-[#d32f2f] shadow-[0_15px_40px_rgba(235,53,53,0.3)] hover:shadow-[0_15px_40px_rgba(235,53,53,0.5)]",
            )}
          >
            {isOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        </motion.div>
      </div>

      <AskEzeeAi open={isOpen} onOpenChange={setIsOpen} autoStart={true} />
    </>
  );
}
