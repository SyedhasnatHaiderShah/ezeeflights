"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { CurrencyCode } from "@/lib/store/currency-store";
import { useCurrencyStore, getCheckoutCurrency } from "@/lib/store/currency-store";
import { LOCALE_REGION_TO_CURRENCY, getCurrencySymbol } from "@/lib/currency/currency-meta";
import type { FlightFareShape } from "@/lib/utils/booking-fare";
import { buildNamedTravelerFares } from "@/lib/utils/passenger-fare-display";
import { cn } from "@/lib/utils";
import { isUSDomain } from "@/lib/utils/domain";

type Traveler = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
};

type Props = {
  travelers: Traveler[];
  flightFare?: FlightFareShape | null;
  searchParams?:
    | URLSearchParams
    | Record<string, string | null | undefined>
    | null
    | undefined;
  targetTotal: number;
  sourceCurrency?: string;
  displayCurrency: CurrencyCode;
  formatPrice: (amount: number) => string;
  getConvertedAmount: (
    amount: number,
    from: CurrencyCode | string,
    to: CurrencyCode | string,
  ) => number;
  className?: string;
  isBid?: boolean;
};

export function TravelerPaymentList({
  travelers,
  flightFare,
  searchParams,
  targetTotal,
  sourceCurrency = "USD",
  displayCurrency,
  formatPrice,
  getConvertedAmount,
  className,
  isBid,
}: Props) {
  const { t } = useTranslation();
  const geoLocation = useCurrencyStore((s) => s.geoLocation);
  const geoCurrency = useMemo(() => {
    if (geoLocation?.countryCode) {
      const code = LOCALE_REGION_TO_CURRENCY[geoLocation.countryCode.toUpperCase()];
      if (code) return code;
    }
    return "USD";
  }, [geoLocation]);

  const rows = useMemo(
    () =>
      buildNamedTravelerFares({
        travelers,
        flightFare,
        searchParams,
        targetTotal,
        sourceCurrency,
        displayCurrency,
        convert: getConvertedAmount,
        categoryLabels: {
          adult: t("Adult"),
          child: t("Child"),
          infant: t("Infant"),
        },
        isBid,
      }),
    [
      travelers,
      flightFare,
      searchParams,
      targetTotal,
      sourceCurrency,
      displayCurrency,
      getConvertedAmount,
      t,
      isBid,
    ],
  );

  const checkoutCurrency = useMemo(() => getCheckoutCurrency(), []);
  const majorCurrency =
    isUSDomain() && geoCurrency !== checkoutCurrency
      ? geoCurrency
      : displayCurrency;
  const minorCurrency =
    isUSDomain() && majorCurrency !== checkoutCurrency
      ? checkoutCurrency
      : null;

  const toMajor = (amt: number) => getConvertedAmount(amt, displayCurrency, majorCurrency);
  const toMinor = (amt: number) => getConvertedAmount(amt, displayCurrency, checkoutCurrency);

  const getCurrency = useCurrencyStore((s) => s.getCurrency);
  const formatForCurrency = (amount: number, currencyCode: string) => {
    const curr = getCurrency(currencyCode) || { symbol: currencyCode };
    return `${curr.symbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (rows.length === 0) return null;

  return (
    <div className={cn("divide-y divide-border/50", className)}>
      {rows.map((row) => (
        <div
          key={`${row.index}-${row.name}`}
          className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border/50 bg-white dark:bg-card">
              <span className="text-[10px] font-bold text-foreground/75">
                {row.index}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold capitalize text-foreground">
                {row.name}
              </p>
              <span className="mt-1 inline-flex items-center rounded-md bg-redmix/5 dark:bg-foreground text-redmix px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tight ">
                {row.categoryLabel}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <span className="text-[14px] font-semibold text-foreground">
              {formatForCurrency(toMajor(row.amount), majorCurrency)}
            </span>
            {minorCurrency && (
              <span className="mt-0.5 text-[10px] font-semibold text-foreground/90">
                approx. {formatForCurrency(toMinor(row.amount), checkoutCurrency)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
