"use client";

import { useLoadingStore } from "@/lib/store/use-loading-store";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const MESSAGES = [
  "Searching flights...",
  "Checking availability...",
  "Almost there...",
];

const SEARCH_RESULT_ROUTES = [
  "/flights/result",
  "/hotels/results",
  "/cars/result",
  "/packages/result",
];

export function GlobalLoader() {
  const { isLoading, message, stopLoading, isSimple, heroMode } =
    useLoadingStore();
  const [msgIdx, setMsgIdx] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const manualLoadingRoutes = SEARCH_RESULT_ROUTES;
    if (!manualLoadingRoutes.some((route) => pathname.includes(route))) {
      stopLoading();
    }
  }, [pathname, stopLoading]);

  useEffect(() => {
    if (!isLoading) return;
    const t = setInterval(
      () => setMsgIdx((i) => (i + 1) % MESSAGES.length),
      2500,
    );
    return () => clearInterval(t);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <LoaderUI
          message={message ?? MESSAGES[msgIdx]}
          isSimple={isSimple}
          heroMode={heroMode}
        />
      )}
    </AnimatePresence>
  );
}

export function LoaderUI({
  message,
  isSimple,
  heroMode,
}: {
  message?: string;
  isSimple?: boolean;
  heroMode?: boolean;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const lowerMessage = message?.toLowerCase() || "";
  const isSearchResultPage = SEARCH_RESULT_ROUTES.some((route) =>
    pathname.includes(route),
  );
  const isSearchLoading =
    lowerMessage.includes("searching") ||
    lowerMessage.includes("checking availability");

  return (
    <motion.div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        isSearchResultPage || isSearchLoading
          ? "bg-transparent"
          : heroMode
            ? "bg-black/60 backdrop-blur-md"
            : "bg-black/40 backdrop-blur-sm",
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={cn(
          "flex flex-col items-center gap-4 p-5 relative overflow-hidden min-w-[200px] md:min-w-[280px] max-w-[80vw]",
          isSearchResultPage || isSearchLoading
            ? "bg-transparent shadow-none"
            : heroMode
              ? "bg-[#0e0e0e]/85 backdrop-blur-2xl rounded-[20px] md:rounded-[28px] shadow-2xl shadow-black/40 border border-white/20 text-white"
              : "bg-background/95 backdrop-blur-xl rounded-[20px] md:rounded-[28px] shadow-2xl shadow-black/20 border border-border/50",
        )}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Simple CSS spin, matching the filtering-overlay style */}
        <div
          className={cn(
            "h-9 w-9 rounded-full border-4 animate-spin",
            heroMode
              ? "border-white/20 border-t-white"
              : "border-redmix/30 border-t-redmix dark:border-white/20 dark:border-t-white",
          )}
        />

        <div className="flex flex-col items-center gap-1.5 relative z-10 w-full px-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-1 text-center w-full"
            >
              <h3
                className={cn(
                  "text-xs md:text-sm font-semibold tracking-tight",
                  heroMode ? "text-white" : "text-redmix/90 dark:text-white",
                )}
              >
                {t(message || "Loading...")}
              </h3>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
