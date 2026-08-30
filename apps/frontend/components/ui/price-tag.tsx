"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  useCurrencyStore,
  type CurrencyCode,
} from "@/lib/store/currency-store";

interface PriceTagProps {
  amount: number;
  currency?: string;
  originalAmount?: number;
  savingsPercent?: number;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "inverse";
  className?: string;
  showComparison?: boolean;
}

const sizeMap = {
  xs: {
    amount: "text-sm sm:text-base",
    currency: "text-[10px]",
    prefix: "text-[8px] sm:text-[9px]",
  },
  sm: {
    amount: "text-xl",
    currency: "text-xs",
    prefix: "text-[10px]",
  },
  md: {
    amount: "text-3xl",
    currency: "text-sm",
    prefix: "text-xs",
  },
  lg: {
    amount: "text-4xl",
    currency: "text-base",
    prefix: "text-sm",
  },
} as const;

export function PriceTag({
  amount,
  currency = "USD",
  originalAmount,
  savingsPercent,
  size = "md",
  variant = "default",
  className,
  showComparison = true,
}: PriceTagProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const baseCurrency = useCurrencyStore((s) => s.baseCurrency);
  const comparisonCurrencies = useCurrencyStore((s) => s.comparisonCurrencies);
  const getConvertedAmount = useCurrencyStore((s) => s.getConvertedAmount);
  const getCurrency = useCurrencyStore((s) => s.getCurrency);

  const base = mounted ? baseCurrency : currency;
  const comps = mounted ? comparisonCurrencies : [];

  const finalAmount = React.useMemo(() => {
    if (!mounted) return amount;
    return getConvertedAmount(
      amount,
      currency.toUpperCase() as CurrencyCode,
      base as CurrencyCode,
    );
  }, [mounted, amount, currency, base, getConvertedAmount]);

  const finalOriginalAmount = React.useMemo(() => {
    if (typeof originalAmount !== "number") return null;
    if (!mounted) return originalAmount;
    return getConvertedAmount(
      originalAmount,
      currency.toUpperCase() as CurrencyCode,
      base as CurrencyCode,
    );
  }, [mounted, originalAmount, currency, base, getConvertedAmount]);

  const targetCurrencyMeta = getCurrency(base) || {
    code: base,
    symbol: "$",
    label: "Currency",
    rate: 1,
  };

  const formattedAmount = `${targetCurrencyMeta.symbol}${Math.round(
    finalAmount,
  ).toLocaleString()}`;

  const formattedOriginalAmount =
    typeof finalOriginalAmount === "number"
      ? `${targetCurrencyMeta.symbol}${Math.round(
          finalOriginalAmount,
        ).toLocaleString()}`
      : null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span
        className={cn(
          sizeMap[size].prefix,
          variant === "inverse" ? "text-white/50" : "text-muted-foreground"
        )}
      >
        {/* t("From") is not available here since no translation hook, hardcoding for now or keeping it as "From" */}
        From
      </span>
      <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
        <p className="font-bold leading-none">
          <span
            className={cn(
              sizeMap[size].amount,
              variant === "inverse" ? "text-white" : "text-foreground"
            )}
          >
            {formattedAmount}
          </span>
          <span
            className={cn(
              "ml-1 align-baseline",
              sizeMap[size].currency,
              variant === "inverse" ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {base}
          </span>
        </p>

        {formattedOriginalAmount && (
          <span
            className={cn(
              "text-sm line-through",
              variant === "inverse" ? "text-white/50" : "text-muted-foreground"
            )}
          >
            {formattedOriginalAmount}
          </span>
        )}

        {typeof savingsPercent === "number" && savingsPercent > 0 && (
          <Badge variant="brand" size="sm" className="whitespace-nowrap">
            Save {savingsPercent}%
          </Badge>
        )}
      </div>

      {showComparison && comps.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {comps.map((code) => {
            if (code === base) return null;
            const converted = getConvertedAmount(
              amount,
              currency.toUpperCase() as CurrencyCode,
              code as CurrencyCode,
            );
            const meta = getCurrency(code);
            if (!meta) return null;

            return (
              <span
                key={code}
                className={cn(
                  "inline-flex items-center rounded-full font-black uppercase tracking-tighter border",
                  size === "xs" ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-0.5 text-[10px] sm:text-xs",
                  variant === "inverse"
                    ? "bg-white/10 text-white border-white/15"
                    : "bg-muted text-muted-foreground border-border/50"
                )}
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
