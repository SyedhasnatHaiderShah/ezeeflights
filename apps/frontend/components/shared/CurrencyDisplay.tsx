"use client";

import React from "react";
import { useCurrencyStore, SUPPORTED_CURRENCIES } from "@/lib/store/currency-store";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  currency: string; // The currency the amount is currently in
  className?: string;
  showComparison?: boolean;
}

export function CurrencyDisplay({
  amount,
  currency: sourceCurrencyCode,
  className,
  showComparison = true,
}: CurrencyDisplayProps) {
  const { baseCurrency, comparisonCurrencies, getConvertedAmount } = useCurrencyStore();

  const primaryAmount = getConvertedAmount(
    amount,
    sourceCurrencyCode as any,
    baseCurrency
  );
  const primaryCurrency = SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES['USD'];

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-bold opacity-70">{primaryCurrency.symbol}</span>
        <span className="text-xl font-black tracking-tight">
          {Math.round(primaryAmount).toLocaleString()}
        </span>
      </div>

      {showComparison && comparisonCurrencies.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {comparisonCurrencies.map((code) => {
            if (code === baseCurrency) return null;
            const converted = getConvertedAmount(
              amount,
              sourceCurrencyCode as any,
              code
            );
            const meta = SUPPORTED_CURRENCIES[code];
            if (!meta) return null;
            
            return (
              <span
                key={code}
                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter text-muted-foreground border border-border/50"
              >
                {meta.symbol}{Math.round(converted).toLocaleString()} {code}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
