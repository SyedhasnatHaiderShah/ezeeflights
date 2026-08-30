"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Check,
  Info,
  Luggage,
  Armchair,
  Star,
  Crown,
  Diamond,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatCabinClassLabel,
  normalizeCabinClassId,
  logCabinAvailability,
} from "@/lib/utils/cabin-class";

interface CabinOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface CabinClassSelectorProps {
  flightDetails: any | null;
  initialClass: string;
  cabinClass: string;
  onSelect: (id: string) => void;
  isBid?: boolean;
}

const GROUP_SURFACE =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50";

const CABIN_OPTIONS: CabinOption[] = [
  {
    id: "Economy",
    label: "Economy",
    icon: <Armchair className="h-4 w-4" />,
  },
  {
    id: "PremiumEconomy",
    label: "Premium Economy",
    icon: <Star className="h-4 w-4" />,
  },
  {
    id: "Business",
    label: "Business",
    icon: <Crown className="h-4 w-4" />,
  },
  {
    id: "First",
    label: "First Class",
    icon: <Diamond className="h-4 w-4" />,
  },
];

function formatBaggageAllowance(
  baggage: string | null | undefined,
  t: any,
): { text: string; included: boolean } {
  if (!baggage)
    return { text: t("Baggage info not available"), included: false };
  const trimBaggage = baggage.trim();
  const lower = trimBaggage.toLowerCase();

  if (
    lower === "0 pc" ||
    lower === "0pc" ||
    lower === "0" ||
    lower.startsWith("0")
  ) {
    return { text: t("No checked bag included"), included: false };
  }

  // Piece-based allowance: "1 PC", "2PC", "1pc"
  if (lower.endsWith("pc")) {
    const num = parseInt(trimBaggage) || 0;
    return {
      text: `${num} ${num > 1 ? t("checked bags") : t("checked bag")} ${t("included")}`,
      included: true,
    };
  }

  // Weight-based allowance: "20 KG", "30kg", "23K" etc.
  const weightMatch = trimBaggage.match(/^(\d+)\s*(kg|k|lbs?|lb)$/i);
  if (weightMatch) {
    return {
      text: `${weightMatch[1]}${weightMatch[2].toUpperCase()} ${t("checked bag")} ${t("included")}`,
      included: true,
    };
  }

  // Generic fallback — show raw value with "included"
  return {
    text: `${trimBaggage} ${t("included")}`,
    included: true,
  };
}

const isValidBaggage = (val: string | null | undefined): val is string =>
  !!val && val.trim().length > 0 && val.trim().toLowerCase() !== "undefined";

const getBaggageAllowance = (details: any): string | undefined => {
  if (!details) return undefined;
  if (isValidBaggage(details.baggageAllowance)) return details.baggageAllowance;
  if (isValidBaggage(details.baggage)) return details.baggage;

  if (details.flights && Array.isArray(details.flights)) {
    for (const f of details.flights) {
      const bag = getBaggageAllowance(f);
      if (bag) return bag;
    }
  }

  let segments = details.rawSegments || details.segments;
  if (typeof segments === "string") {
    try {
      segments = JSON.parse(segments);
    } catch {
      segments = undefined;
    }
  }

  if (Array.isArray(segments) && segments.length > 0) {
    const first = segments[0];
    const bag =
      first?.baggageAllowance || first?.BaggageAllowance || first?.baggage;
    if (isValidBaggage(bag)) return bag;
  }

  if (
    details.outbound &&
    Array.isArray(details.outbound) &&
    details.outbound.length > 0
  ) {
    const first = details.outbound[0];
    const bag =
      first?.baggageAllowance || first?.BaggageAllowance || first?.baggage;
    if (isValidBaggage(bag)) return bag;
  }

  return undefined;
};

export function CabinClassSelector({
  flightDetails,
  initialClass,
  cabinClass,
  onSelect,
  isBid,
}: CabinClassSelectorProps) {
  const { t } = useTranslation();
  const [baggageLoading, setBaggageLoading] = useState(false);
  const preferredFromSearch = normalizeCabinClassId(initialClass);
  const availableIds = [preferredFromSearch];
  const cabins = CABIN_OPTIONS.filter((opt) => availableIds.includes(opt.id));
  const singleCabin = true;

  // Trigger shimmer whenever the selected cabin changes
  useEffect(() => {
    setBaggageLoading(true);
    const timer = setTimeout(() => setBaggageLoading(false), 700);
    return () => clearTimeout(timer);
  }, [cabinClass]);

  const handleSelect = (id: string) => {
    if (!availableIds.includes(id)) return;
    onSelect(id);
  };

  useEffect(() => {
    if (!flightDetails) return;
    logCabinAvailability("CabinClassSelector render", flightDetails, {
      searchPreference: preferredFromSearch,
      selectedInUi: cabinClass,
      cardsShown: cabins.map((c) => c.id),
    });
  }, [
    flightDetails?.availableCabinClasses,
    flightDetails?.cabinClass,
    flightDetails?.flightId,
    flightDetails?.id,
    preferredFromSearch,
    cabinClass,
    cabins.length,
  ]);

  return (
    <div className={cn(GROUP_SURFACE, "p-3 md:p-4 space-y-3 shadow-sm")}>
      <div className="space-y-1 px-0.5">
        <p className="text-[12px] font-semibold text-foreground/80">
          {t("Cabin preference")}
        </p>
        <h3 className="text-[17px] font-semibold leading-tight text-foreground tracking-tight">
          {singleCabin ? (
            <>
              {t("Your")} <span className={cn(isBid ? "text-[#1c2652]" : "text-redmix")}>{t("cabin")}</span>
            </>
          ) : (
            <>
              {t("Choose your")}{" "}
              <span className={cn(isBid ? "text-[#1c2652]" : "text-redmix")}>{t("experience")}</span>
            </>
          )}
        </h3>
        <p className="text-[12px] leading-snug text-foreground/80">
          {singleCabin ? (
            <>
              {t("Only")}{" "}
              <span className="font-semibold text-foreground">
                {t(cabins[0]?.label)}
              </span>{" "}
              {t("is available for this flight")}
              {preferredFromSearch !== cabins[0]?.id ? (
                <>
                  {" "}
                  ({t("your search preference was")}{" "}
                  <span className="font-semibold text-foreground">
                    {t(formatCabinClassLabel(preferredFromSearch))}
                  </span>
                  )
                </>
              ) : null}
              .
            </>
          ) : (
            <>
              {cabins.length}{" "}
              {cabins.length === 1 ? t("cabin option") : t("cabin options")}{" "}
              {t("available for this flight. Your search preference was")}{" "}
              <span className="font-semibold text-foreground">
                {t(formatCabinClassLabel(preferredFromSearch))}
              </span>
              .
            </>
          )}
        </p>
      </div>

      <div
        className={cn(
          "grid gap-2 py-2",
          singleCabin ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-4",
        )}
      >
        {cabins.map((cls) => {
          const isSelected = cabinClass === cls.id;
          const isAvailable = availableIds.includes(cls.id);
          const baggageValue = getBaggageAllowance(flightDetails);
          const baggageResult = formatBaggageAllowance(baggageValue, t);
          const baggageText = isSelected
            ? baggageResult.text
            : t("Select to check");
          const baggageIncluded = isSelected ? baggageResult.included : false;

          return (
            <motion.button
              key={cls.id}
              type="button"
              disabled={!isAvailable}
              whileTap={isAvailable ? { scale: 0.98 } : undefined}
              onClick={() => handleSelect(cls.id)}
              className={cn(
                "group relative flex flex-col gap-2 rounded-[10px] border p-2.5 text-left transition-all duration-200 active:bg-foreground/5",
                isSelected
                  ? isBid ? "border-[#1c2652] dark:border-white bg-white ring-2 ring-[#1c2652]/15 dark:bg-card" : "border-redmix dark:border-white bg-white ring-2 ring-redmix/15 dark:bg-card"
                  : isAvailable
                    ? "border-border/50 bg-white hover:border-border dark:bg-card"
                    : "cursor-not-allowed border-border/40 bg-muted/20 opacity-50",
              )}
            >
              <div className="flex w-full items-start justify-between gap-1">
                <div
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors",
                    isSelected
                      ? isBid ? "border-[#1c2652]/30 bg-[#1c2652]/10 dark:bg-card dark:border-white bg-[#1c2652]/5 dark:bg-foreground text-[#1c2652]" : "border-redmix/30 bg-redmix/10 dark:bg-card dark:border-white bg-redmix/5 dark:bg-foreground text-redmix"
                      : "border-border/50 bg-white text-foreground/85 dark:bg-card",
                  )}
                >
                  {cls.icon}
                </div>

                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    isSelected
                      ? isBid ? "border-[#1c2652] bg-[#1c2652] text-white" : "border-redmix bg-redmix text-white"
                      : "border-foreground/20 bg-white dark:bg-card",
                  )}
                  aria-hidden
                >
                  {isSelected ? (
                    <Check className="h-3 w-3" strokeWidth={3} />
                  ) : null}
                </span>
              </div>

              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-[13px] font-semibold leading-tight",
                    isSelected
                      ? isBid ? "text-[#1c2652] dark:text-white" : "text-redmix dark:text-white"
                      : "text-foreground",
                  )}
                >
                  {t(cls.label)}
                </p>
              </div>

              <div className="w-full mt-1 rounded-[8px] border border-border/40 bg-muted/25 px-2 py-1.5 dark:bg-muted/15">
                {isSelected && baggageLoading ? (
                  /* Shimmer skeleton while confirming baggage */
                  <div className="flex items-center gap-1.5">
                    <div className="h-3.5 w-3.5 rounded bg-muted-foreground/20 animate-pulse shrink-0" />
                    <div className="h-2.5 w-24 rounded bg-muted-foreground/20 animate-pulse" />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-foreground/85">
                    <Luggage
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isSelected && baggageIncluded
                          ? "text-emerald-500 dark:text-white"
                          : isSelected
                            ? "text-muted-foreground"
                            : "text-foreground/60",
                      )}
                    />
                    <p
                      className={cn(
                        "truncate text-[10px] py-1 font-medium leading-none",
                        isSelected && baggageIncluded
                          ? "text-emerald-600 dark:text-white"
                          : "",
                      )}
                    >
                      {baggageText}
                    </p>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-[10px] border border-border/40 bg-muted/20 px-2.5 py-2 dark:bg-muted/10">
        <Info className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", isBid ? "text-[#1c2652]" : "text-redmix")} />
        <p className="text-[11px] font-medium leading-relaxed text-foreground/85">
          {t("Cabin features shown are based on airline policy for flight")}{" "}
          <span className="font-semibold text-foreground">
            {flightDetails?.flightNumber || "TRV-01"}
          </span>
          {t(
            ". Our agents will confirm the final amenity list before ticketing.",
          )}
        </p>
      </div>
    </div>
  );
}
