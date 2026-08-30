"use client";

import React from "react";
import { useCurrencyStore, type CurrencyCode } from "@/lib/store/currency-store";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number;
  currency: string; // The currency the amount is currently in
  className?: string;
  amountClassName?: string;
  symbolClassName?: string;
  showComparison?: boolean;
  bypassConversion?: boolean;
}

export function CurrencyDisplay({
  amount,
  currency: sourceCurrencyCode,
  className,
  amountClassName,
  symbolClassName,
  showComparison = true,
  bypassConversion = false,
}: CurrencyDisplayProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const baseCurrency = useCurrencyStore((s) => s.baseCurrency);
  const comparisonCurrencies = useCurrencyStore((s) => s.comparisonCurrencies);
  const getConvertedAmount = useCurrencyStore((s) => s.getConvertedAmount);
  const getCurrency = useCurrencyStore((s) => s.getCurrency);

  const base = mounted && !bypassConversion ? baseCurrency : (sourceCurrencyCode || "USD");
  const comps = mounted && !bypassConversion ? comparisonCurrencies : [];

  // Use a stable calculation for the initial render to avoid hydration mismatch
  const primaryAmount = React.useMemo(() => {
    if (bypassConversion) return amount;
    if (!mounted) {
      return amount;
    }
    return getConvertedAmount(
      amount,
      (sourceCurrencyCode || "USD").toUpperCase() as CurrencyCode,
      base as CurrencyCode,
    );
  }, [
    mounted,
    amount,
    sourceCurrencyCode,
    base,
    getConvertedAmount,
    bypassConversion,
  ]);

  const primaryCurrency =
    getCurrency(base) ||
    getCurrency("USD") || {
      code: "USD",
      symbol: "$",
      label: "US Dollar",
      rate: 1,
    };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-baseline gap-1">
        <span className={cn("text-sm font-bold text-foreground/80", symbolClassName)}>
          {primaryCurrency.symbol}
        </span>
        <span
          className={cn("text-xl font-black tracking-tight", amountClassName)}
        >
          {Math.round(primaryAmount).toLocaleString()}
        </span>
      </div>

      {showComparison && comps.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {comps.map((code) => {
            if (code === base) return null;
            const converted = getConvertedAmount(
              amount,
              sourceCurrencyCode as any,
              code,
            );
            const meta = getCurrency(code);
            if (!meta) return null;

            return (
              <span
                key={code}
                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-muted-foreground border border-border/50"
              >
                {meta.symbol}
                {Math.round(converted).toLocaleString()} {code}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
