"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CurrencyCode, getCheckoutCurrency } from "@/lib/store/currency-store";
import type { FlightFareShape } from "@/lib/utils/booking-fare";
import { isUSDomain } from "@/lib/utils/domain";
import {
  computePassengerFareLines,
  readPassengerCountsFromSearch,
} from "@/lib/utils/passenger-fare-display";

type Props = {
  flightFare?: FlightFareShape | null;
  searchParams?:
    | URLSearchParams
    | Record<string, string | null | undefined>
    | null;
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
  compact?: boolean;
  isBid?: boolean;
  cheapBidApplied?: {
    bidId: number;
    bidToken: string;
    sourceFlightId?: string;
    originalTotal: number;
    bidAdtPrice: number;
    bidChdPrice: number;
    bidInfPrice: number;
    originalAdtPrice?: number | null;
    originalChdPrice?: number | null;
    originalInfPrice?: number | null;
    linkExpiryDate: string | null;
  } | null;
};

export function PassengerFareBreakdown({
  flightFare,
  searchParams,
  targetTotal,
  sourceCurrency = "USD",
  displayCurrency,
  formatPrice,
  getConvertedAmount,
  className,
  compact = false,
  cheapBidApplied,
  isBid = false,
}: Props) {
  const { t } = useTranslation();
  const checkoutCurrency = useMemo(() => getCheckoutCurrency(), []);

  const lines = useMemo(() => {
    const counts = readPassengerCountsFromSearch(searchParams, flightFare);

    let effectiveFlightFare = flightFare;
    if (cheapBidApplied) {
      if (isBid) {
        effectiveFlightFare = {
          ...(flightFare || {}),
          adultFare: cheapBidApplied.bidAdtPrice,
          childFare: cheapBidApplied.bidChdPrice,
          infantFare: cheapBidApplied.bidInfPrice,
        } as any;
      } else if (cheapBidApplied.originalAdtPrice != null) {
        effectiveFlightFare = {
          ...(flightFare || {}),
          adultFare: cheapBidApplied.originalAdtPrice,
          childFare: cheapBidApplied.originalChdPrice ?? cheapBidApplied.originalAdtPrice,
          infantFare: cheapBidApplied.originalInfPrice ?? 0,
        } as any;
      }
    }

    return computePassengerFareLines({
      flightFare: effectiveFlightFare,
      counts,
      targetTotal,
      sourceCurrency,
      displayCurrency,
      convert: getConvertedAmount,
      labels: {
        adult: t("Adult(s)"),
        child: t("Child(ren)"),
        infant: t("Infant(s)"),
      },
      isBid,
    });
  }, [
    flightFare,
    cheapBidApplied,
    isBid,
    searchParams,
    targetTotal,
    sourceCurrency,
    displayCurrency,
    getConvertedAmount,
    t,
  ]);

  const getOriginalPriceForLine = (key: string, count: number) => {
    if (!cheapBidApplied) return null;
    let priceUsd = 0;
    if (key === "adults") {
      priceUsd = Number(cheapBidApplied.originalAdtPrice ?? 0);
    } else if (key === "children") {
      priceUsd = Number(cheapBidApplied.originalChdPrice ?? cheapBidApplied.originalAdtPrice ?? 0);
    } else if (key === "infants") {
      priceUsd = Number(cheapBidApplied.originalInfPrice ?? 0);
    }
    if (priceUsd <= 0) return null;
    return getConvertedAmount(priceUsd * count, "USD", displayCurrency);
  };

  const getOriginalPriceUsdForLine = (key: string, count: number) => {
    if (!cheapBidApplied) return null;
    let priceUsd = 0;
    if (key === "adults") {
      priceUsd = Number(cheapBidApplied.originalAdtPrice ?? 0);
    } else if (key === "children") {
      priceUsd = Number(cheapBidApplied.originalChdPrice ?? cheapBidApplied.originalAdtPrice ?? 0);
    } else if (key === "infants") {
      priceUsd = Number(cheapBidApplied.originalInfPrice ?? 0);
    }
    if (priceUsd <= 0) return null;
    return priceUsd * count;
  };

  if (lines.length === 0) return null;

  return (
    <div className={className}>
      {lines.map((line) => (
        <div
          key={line.key}
          className={
            compact
              ? "flex justify-between items-start gap-2 text-xs font-semibold min-w-0"
              : "flex justify-between items-start gap-3 min-w-0"
          }
        >
          <span
            className={
              compact
                ? "text-foreground shrink min-w-0 pr-1"
                : "shrink min-w-0 pr-2"
            }
          >
            {line.count} x {line.label}
          </span>
          <div className="flex flex-col items-end shrink-0 max-w-[65%]">
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              {/* cheapBidApplied && (() => {
                const orig = getOriginalPriceForLine(line.key, line.count);
                if (orig && orig > line.amount) {
                  return (
                    <span className="text-muted-foreground line-through font-semibold text-right break-all">
                      {formatPrice(orig)}
                    </span>
                  );
                }
                return null;
              })() */}
              <span className="text-foreground/90 font-semibold text-right break-all">
                {formatPrice(line.amount)}
              </span>
            </div>
            {isUSDomain() && displayCurrency !== checkoutCurrency && (
              <span className="text-[10px] font-semibold text-foreground/90 text-right leading-tight">
                {t("approx.")}{" "}
                {checkoutCurrency === "GBP" ? "£" : "$"}
                {Math.round(
                  getConvertedAmount(line.amount, displayCurrency, checkoutCurrency)
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}{" "}
                {checkoutCurrency}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
