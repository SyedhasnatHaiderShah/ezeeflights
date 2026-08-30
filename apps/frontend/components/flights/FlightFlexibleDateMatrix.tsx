"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { generateFlexibleDates } from "@/data/mock-ux";
import { cn } from "@/lib/utils";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";

interface FlexibleDateMatrixProps {
  departureDate: string;
  basePrice: number;
  sourceCurrency?: string;
}

export function FlightFlexibleDateMatrix({
  departureDate,
  basePrice,
  sourceCurrency = "USD",
}: FlexibleDateMatrixProps) {
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const currencyMeta =
    SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES["USD"];
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const dates = React.useMemo(
    () => generateFlexibleDates(departureDate, basePrice),
    [departureDate, basePrice],
  );

  return (
    <div className="mx-auto w-full py-2">
      {!isMounted ? (
        <div className="flex h-24 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Loading flexible dates...
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="h-5 w-1 rounded-full bg-redmix" />
              <h3 className="text-sm font-bold uppercase tracking-tight text-slate-800 dark:text-slate-200">
                Flexible Dates{" "}
                <span className="font-medium text-slate-400 normal-case">
                  (Best Prices)
                </span>
              </h3>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />{" "}
                Cheap
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-400">
                <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700" />{" "}
                High
              </div>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4 px-1">
            {dates.map((item) => {
              const isSelected = item.date === departureDate;
              const isCheap = item.status === "cheap";
              const convertedPrice = getConvertedAmount(
                item.price,
                sourceCurrency as any,
                baseCurrency,
              );

              return (
                <motion.button
                  key={item.date}
                  whileHover={{ transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "group relative flex min-w-[150px] flex-col items-center justify-center rounded-md border p-2 transition-all duration-200",
                    isSelected
                      ? "border-redmix text-redmix shadow-xl"
                      : "border-foreground bg-white hover:border-foreground dark:bg-slate-900 dark:border-slate-800",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs font-semibold tracking-wider mb-1.5 opacity-90",
                      isSelected ? "text-redmix" : "text-foreground",
                    )}
                  >
                    {new Date(item.date)
                      .toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                      .toUpperCase()}
                  </span>

                  <span
                    className={cn(
                      "text-lg font-bold tracking-wider",
                      isSelected
                        ? "text-redmix"
                        : isCheap
                          ? "text-emerald-500"
                          : "text-foreground",
                    )}
                  >
                    {currencyMeta.symbol}
                    {Math.round(convertedPrice).toLocaleString()}
                  </span>

                  {isSelected && (
                    <div className="absolute bottom-1 h-1.5 w-8 rounded-full bg-redmix" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
