"use client";

import React, { useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlightListItem } from "@/lib/types/flight-api";
import type { FlightSearchAirlineSummary } from "@/lib/api/flights";
import { useFlightFilterStore } from "@/lib/store/flight-filter-store";
import { resolveAirlineName } from "@/lib/utils/airline-names";
import { AirlineLogo } from "./AirlineLogo";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

interface AirlineSummary {
  code: string;
  name: string;
  minPrice: number;
  currency: string;
}

interface AirlineMatrixProps {
  flights: FlightListItem[];
  airlineSummary?: FlightSearchAirlineSummary[];
  className?: string;
}

export function FlightAirlineMatrix({
  flights,
  airlineSummary = [],
  className,
}: AirlineMatrixProps) {
  const { t } = useTranslation();
  const { filters, setFilter } = useFlightFilterStore();

  const airlineStats = useMemo(() => {
    if (airlineSummary.length > 0) {
      return airlineSummary.map((airline) => ({
        code: airline.code,
        name: resolveAirlineName(airline.code, airline.name),
        minPrice: airline.lowestFare,
        currency: airline.currency || "USD",
      }));
    }

    const stats: Record<string, AirlineSummary> = {};

    flights.forEach((flight) => {
      if (!flight.outbound || flight.outbound.length === 0) return;
      const firstLeg = flight.outbound[0];
      const airline = firstLeg.airline;
      const code = airline.code || "XX";

      if (!stats[code] || flight.totalCost < stats[code].minPrice) {
        stats[code] = {
          code,
          name: resolveAirlineName(code, airline.name),
          minPrice: flight.totalCost,
          currency: flight.currency || "USD",
        };
      }
    });

    return Object.values(stats).sort((a, b) => a.minPrice - b.minPrice);
  }, [airlineSummary, flights]);

  const handleToggleAirline = (code: string) => {
    const currentAirlines = [...filters.airlines];
    if (currentAirlines.includes(code)) {
      setFilter(
        "airlines",
        currentAirlines.filter((c) => c !== code),
      );
    } else {
      setFilter("airlines", [...currentAirlines, code]);
    }
  };

  const hasSelection = filters.airlines.length > 0;

  if (airlineStats.length <= 1) return null;

  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-hidden rounded-[12px] border border-border/50 bg-white dark:bg-card px-2.5 py-2">
        {/* <p className="mb-2 px-1 text-[12px] font-semibold text-foreground/80">
          {t("Airlines")}
        </p> */}
        <TooltipProvider delayDuration={200}>
          <div className="flex items-start gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {airlineStats.map((airline) => {
              const isActive = filters.airlines.includes(airline.code);
              const isDimmed = hasSelection && !isActive;

              return (
                <Tooltip key={airline.code}>
                  <TooltipTrigger asChild>
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleToggleAirline(airline.code)}
                      aria-label={`${airline.name} (${airline.code})`}
                      className={cn(
                        "flex min-w-[68px] max-w-[80px] shrink-0 flex-col items-center gap-1.5 rounded-[10px] px-1 py-1.5 transition-all active:bg-foreground/5",
                        isDimmed && "opacity-45",
                      )}
                    >
                      <div
                        className={cn(
                          "relative flex h-11 w-11 items-center justify-center rounded-full bg-white p-2 transition-all dark:bg-card",
                          isActive
                            ? "border-redmix border-2 ring-redmix/15"
                            : "",
                        )}
                      >
                        <AirlineLogo
                          code={airline.code}
                          name={airline.name}
                          className="h-full w-full object-contain"
                        />
                        {isActive && (
                          <div className="absolute -right-0.5 -top-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 border-white bg-redmix text-white dark:border-card">
                            <Check className="h-2.5 w-2.5" strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="flex w-full flex-col items-center gap-0.5">
                        <p className="w-full truncate text-center text-[11px] font-medium leading-tight text-foreground sm:text-[12px]">
                          <span className="sm:hidden">{airline.code}</span>
                          <span className="hidden sm:inline">
                            {airline.name}
                          </span>
                        </p>
                        {/* <CurrencyDisplay
                          amount={airline.minPrice}
                          currency={airline.currency}
                          amountClassName="text-[11px] font-semibold leading-none"
                          symbolClassName="text-[10px] font-medium text-foreground/80"
                          className="items-center"
                          showComparison={false}
                        /> */}
                      </div>
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    className="rounded-[10px] border border-border/50 bg-white px-2.5 py-1.5 text-foreground shadow-lg dark:bg-card"
                  >
                    <p className="max-w-[200px] text-center text-[12px] font-medium leading-snug">
                      {airline.name}
                    </p>
                    {/* <p className="mt-0.5 text-center text-[11px] text-foreground/80">
                      {airline.code}
                    </p> */}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
