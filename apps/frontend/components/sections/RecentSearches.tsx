"use client";

import * as React from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import {
  useLocalRecentSearches,
} from "@/lib/api/search";
import { useRecentSearchStore } from "@/lib/store/recent-search-store";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { History, ArrowRight, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

function pillClasses(heroMode: boolean, active = false) {
  return cn(
    "rounded-full px-4 py-1.5 text-xs capitalize transition-all shrink-0",
    active
      ? "bg-redmix text-white shadow-sm"
      : heroMode
        ? "bg-[#0e0e0e]/60 text-white/80 hover:bg-white/10"
        : "bg-muted text-muted-foreground hover:bg-muted/80",
  );
}

const panelVariants = {
  hidden: { opacity: 0, y: 10, x: 12 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    y: 8,
    x: 8,
    transition: { duration: 0.18 },
  },
};

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -14 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export function RecentSearchesSkeleton({ heroMode = true }: { heroMode?: boolean }) {
  return (
    <div
      className={cn(
        "inline-flex h-[30px] w-36 animate-pulse rounded-full px-4 py-1.5 shrink-0",
        heroMode ? "bg-white/10" : "bg-muted",
      )}
    />
  );
}

function RecentSearchItem({
  search,
  onSelect,
  heroMode = true,
}: {
  search: any;
  onSelect: (search: any) => void;
  heroMode?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <motion.button
      type="button"
      variants={itemVariants}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(search)}
      className={cn(
        "group flex w-full items-center gap-2 text-left",
        pillClasses(heroMode),
      )}
    >
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "flex items-center gap-1.5 text-xs font-bold leading-tight",
            heroMode ? "text-white" : "text-foreground",
          )}
        >
          {search.searchType === "hotels" ? (
            <span className="truncate">{search.destination}</span>
          ) : search.searchType === "cars" &&
            (!search.destination || search.origin === search.destination) ? (
            <span className="truncate">{search.origin}</span>
          ) : (
            <>
              <span className="truncate">{search.origin}</span>
              <ArrowRight className="h-3 w-3 shrink-0 text-redmix-light" />
              <span className="truncate">{search.destination}</span>
            </>
          )}
        </span>

        <span
          className={cn(
            "mt-1 flex flex-wrap items-center gap-1 text-[10px] font-medium leading-none",
            heroMode ? "text-white/50" : "text-muted-foreground",
          )}
        >
          {search.searchDate ? (
            <span>
              {new Date(search.searchDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          ) : null}
          {search.metadata?.returnDate ? (
            <>
              <span className={heroMode ? "text-white/20" : "text-border"}>•</span>
              <span>
                {new Date(search.metadata.returnDate).toLocaleDateString(
                  "en-US",
                  { month: "short", day: "numeric" },
                )}
              </span>
            </>
          ) : null}
          {search.searchType === "flights" ? (
            <>
              {search.metadata?.cabinClass ? (
                <>
                  <span className={heroMode ? "text-white/20" : "text-border"}>•</span>
                  <span>{t(search.metadata.cabinClass)}</span>
                </>
              ) : null}
              {search.metadata?.passengers ? (
                <>
                  <span className={heroMode ? "text-white/20" : "text-border"}>•</span>
                  <span>
                    {search.metadata.passengers.adults +
                      (search.metadata.passengers.children || 0) +
                      (search.metadata.passengers.infants || 0)}{" "}
                    {t("Pax")}
                  </span>
                </>
              ) : null}
            </>
          ) : null}
          {search.searchType === "hotels" ? (
            <>
              {search.metadata?.guests ? (
                <>
                  <span className={heroMode ? "text-white/20" : "text-border"}>•</span>
                  <span>
                    {search.metadata.guests} {t("Guests")}
                  </span>
                </>
              ) : null}
              {search.metadata?.rooms ? (
                <>
                  <span className={heroMode ? "text-white/20" : "text-border"}>•</span>
                  <span>
                    {search.metadata.rooms} {t("Rooms")}
                  </span>
                </>
              ) : null}
            </>
          ) : null}
          {search.searchType === "cars" && search.metadata?.pickupTime ? (
            <>
              <span className={heroMode ? "text-white/20" : "text-border"}>•</span>
              <span>🕒 {search.metadata.pickupTime}</span>
            </>
          ) : null}
        </span>
      </span>

      <ChevronRight
        className={cn(
          "h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5",
          heroMode ? "text-white/35 group-hover:text-white/70" : "text-muted-foreground",
        )}
      />
    </motion.button>
  );
}

export function RecentSearches({ heroMode = true }: { heroMode?: boolean }) {
  const { t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "flights";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { data: rawData = [], isLoading } = useLocalRecentSearches();
  const { prefillSearch } = useRecentSearchStore();

  if (!mounted || isLoading) {
    return <RecentSearchesSkeleton heroMode={heroMode} />;
  }

  const filteredSearches = rawData.filter(
    (search: any) => search.searchType === activeTab,
  );

  if (filteredSearches.length === 0) {
    return null;
  }

  const handleCardClick = (search: any) => {
    prefillSearch(search);
    setOpen(false);
    const bookingForm = document.getElementById("booking-form");
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <motion.button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5",
              pillClasses(heroMode, open),
            )}
          >
            <History className="h-3.5 w-3.5 shrink-0" />
            <span>{t("Show Recent Searches")}</span>
          </motion.button>
        </PopoverTrigger>

        <PopoverContent
          side="top"
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-[60] w-[min(92vw,280px)] border-0 bg-[#0e0e0e]/60 p-0 shadow-none data-[state=open]:animate-none data-[state=closed]:animate-none"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="recent-searches-panel"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className={cn(
                  "overflow-hidden rounded-2xl p-3 shadow-2xl backdrop-blur-xl",
                  heroMode
                    ? "border border-white/20 bg-[#0e0e0e]/60 text-white/80"
                    : "border border-border bg-muted text-muted-foreground",
                )}
              >
                <div className="mb-2 flex items-center justify-end px-1">
                  <span className={pillClasses(heroMode)}>{t(activeTab)}</span>
                </div>

                <motion.div
                  className="flex flex-col gap-2"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredSearches.slice(0, 3).map((search: any, idx: number) => (
                    <RecentSearchItem
                      key={search.id || idx}
                      search={search}
                      onSelect={handleCardClick}
                      heroMode={heroMode}
                    />
                  ))}
                </motion.div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </motion.section>
  );
}
