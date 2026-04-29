"use client";

import * as React from "react";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
  CurrencyCode,
} from "@/lib/store/currency-store";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function CurrencySwitcher() {
  const { baseCurrency, setBaseCurrency } = useCurrencyStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Display Currency
        </h4>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
          <button
            key={curr.code}
            onClick={() => setBaseCurrency(curr.code)}
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
