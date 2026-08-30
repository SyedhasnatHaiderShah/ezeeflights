"use client";

import * as React from "react";
import { useCurrencyStore } from "@/lib/store/currency-store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { isUSDomain } from "@/lib/utils/domain";

const POPULAR_CODES = [
  "USD",
  "PKR",
  "INR",
  "AED",
  "EUR",
  "GBP",
  "SAR",
  "CAD",
  "AUD",
  "QAR",
];

export function CurrencySwitcher() {
  const baseCurrency = useCurrencyStore((s) => s.baseCurrency);
  const currencies = useCurrencyStore((s) => s.currencies);
  const setBaseCurrency = useCurrencyStore((s) => s.setBaseCurrency);
  const [mounted, setMounted] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (typeof window !== "undefined" && !isUSDomain()) {
    return null;
  }

  const list = React.useMemo(() => {
    const popular = POPULAR_CODES.map((code) => currencies[code]).filter(Boolean);
    if (!showAll) return popular;
    return Object.values(currencies).sort((a, b) =>
      a.code.localeCompare(b.code),
    );
  }, [currencies, showAll]);

  if (!mounted) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Display Currency
        </h4>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-[10px] font-bold text-redmix hover:underline"
        >
          {showAll ? "Popular" : `All (${Object.keys(currencies).length})`}
        </button>
      </div>
      <div
        className={cn(
          "grid gap-2",
          showAll ? "grid-cols-2 max-h-48 overflow-y-auto pr-1" : "grid-cols-3",
        )}
      >
        {list.map((curr) => (
          <button
            key={curr.code}
            type="button"
            onClick={() => setBaseCurrency(curr.code, true)}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all duration-200 active:scale-95",
              baseCurrency === curr.code
                ? "bg-redmix/10 border-redmix/50 text-redmix shadow-sm"
                : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50 hover:border-border",
            )}
          >
            <span className="text-xs font-black">{curr.code}</span>
            <span className="text-[9px] font-bold opacity-70 truncate w-full text-center">
              {curr.label.split(" ")[0]}
            </span>
            {baseCurrency === curr.code && (
              <div className="absolute top-1 right-1">
                <Check className="h-2.5 w-2.5" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
