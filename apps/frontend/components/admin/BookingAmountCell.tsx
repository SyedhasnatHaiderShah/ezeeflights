"use client";

import {
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
  useCurrencyStore,
} from "@/lib/store/currency-store";

interface BookingAmountCellProps {
  total: number;
  /** User-facing / payment currency stored on the booking */
  currency?: string;
  /** Provider currency at booking time (e.g. AED for Dubai hotels) */
  defaultCurrency?: string;
}

function formatAmount(amount: number, code: string): string {
  const meta = SUPPORTED_CURRENCIES[code as CurrencyCode];
  const symbol = meta?.symbol ?? code;
  const rounded = Math.round(amount * 100) / 100;
  return `${symbol} ${rounded.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
}

export function BookingAmountCell({
  total,
  currency = "USD",
  defaultCurrency,
}: BookingAmountCellProps) {
  const getConvertedAmount = useCurrencyStore((s) => s.getConvertedAmount);

  const displayCode = (currency || "USD").toUpperCase();
  const providerCode = (defaultCurrency || displayCode).toUpperCase();
  const usdTotal = getConvertedAmount(
    total,
    displayCode as CurrencyCode,
    "USD",
  );

  const lines: { label: string; value: string }[] = [
    { label: displayCode, value: formatAmount(total, displayCode) },
  ];

  if (providerCode !== displayCode) {
    const providerTotal = getConvertedAmount(
      total,
      displayCode as CurrencyCode,
      providerCode as CurrencyCode,
    );
    lines.push({
      label: `Provider (${providerCode})`,
      value: formatAmount(providerTotal, providerCode),
    });
  }

  if (displayCode !== "USD") {
    lines.push({
      label: "USD",
      value: formatAmount(usdTotal, "USD"),
    });
  }

  return (
    <div className="space-y-0.5">
      {lines.map((line, idx) => (
        <p
          key={line.label}
          className={
            idx === 0
              ? "text-xs font-bold text-foreground leading-tight"
              : "text-[10px] text-muted-foreground leading-tight"
          }
        >
          <span className="font-semibold uppercase tracking-wide">
            {line.label}:
          </span>{" "}
          {line.value}
        </p>
      ))}
    </div>
  );
}
