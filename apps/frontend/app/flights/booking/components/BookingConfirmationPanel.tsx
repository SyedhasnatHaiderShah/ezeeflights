"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  FlightCard,
  type FlightCardConfirmationPricing,
} from "@/components/flights/FlightCard";
import { TravelerPaymentList } from "@/components/flights/TravelerPaymentList";
import type { FlightListItem } from "@/lib/types/flight-api";
import type { InquiryTraveler } from "@/lib/api/inquiries";
import type { CurrencyCode } from "@/lib/store/currency-store";
import { useCurrencyStore, getCheckoutCurrency } from "@/lib/store/currency-store";
import {
  LOCALE_REGION_TO_CURRENCY,
  getCurrencySymbol,
} from "@/lib/currency/currency-meta";
import { cn } from "@/lib/utils";
import { isUSDomain } from "@/lib/utils/domain";

export type BookingAddon = {
  id: string;
  name: string;
  price: number;
  type: string;
};

const GROUP_SURFACE =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50 shadow-sm";

const INSET_GROUP =
  "overflow-hidden rounded-[10px] border border-border/50 bg-white dark:bg-card divide-y divide-border/50";

const SECTION_LABEL = "text-[12px] font-semibold text-foreground/80";

const SUMMARY_ROW =
  "flex min-h-[38px] items-center justify-between gap-3 px-3 py-2 text-[13px]";

type Props = {
  bookingRef: string;
  displayFlight: FlightListItem | null;
  travelers: InquiryTraveler[];
  cabinClass: string;
  totalPax: number;
  baseFareValue: number;
  taxValue: number;
  seatTotal: number;
  ancillaryTotal: number;
  addonsTotal: number;
  grandTotal: number;
  baseCurrency: string;
  formatPrice: (amount: number) => string;
  formatAddonPrice: (addon: BookingAddon) => string;
  getConvertedAmount: (
    amount: number,
    from: CurrencyCode | string,
    to: CurrencyCode | string,
  ) => number;
  flightDetails?: any;
  searchParams?: URLSearchParams | null;
  refundShieldOpted: boolean;
  refundShieldFee: number;
  affirmFee: number;
  selectedAddons: BookingAddon[];
  allDates?: string[];
  departDateLabel?: string;
  isBid?: boolean;
  standbyDeal?: any;
};

export function BookingConfirmationPanel({
  bookingRef,
  displayFlight,
  travelers,
  cabinClass,
  totalPax,
  baseFareValue,
  taxValue,
  seatTotal,
  ancillaryTotal,
  addonsTotal,
  grandTotal,
  baseCurrency,
  formatPrice,
  formatAddonPrice,
  getConvertedAmount,
  flightDetails,
  searchParams,
  refundShieldOpted,
  refundShieldFee,
  affirmFee,
  selectedAddons,
  allDates,
  departDateLabel,
  isBid,
  standbyDeal,
}: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const geoLocation = useCurrencyStore((s) => s.geoLocation);
  const geoCurrency = useMemo(() => {
    if (geoLocation?.countryCode) {
      const code =
        LOCALE_REGION_TO_CURRENCY[geoLocation.countryCode.toUpperCase()];
      if (code) return code;
    }
    return "USD";
  }, [geoLocation]);

  const checkoutCurrency = useMemo(() => getCheckoutCurrency(), []);
  const majorCurrency =
    isUSDomain() && geoCurrency !== checkoutCurrency
      ? geoCurrency
      : checkoutCurrency;
  const minorCurrency =
    isUSDomain() && majorCurrency !== checkoutCurrency
      ? checkoutCurrency
      : null;

  const toMajor = (amt: number) =>
    getConvertedAmount(amt, baseCurrency, majorCurrency);
  const toMinor = (amt: number) => getConvertedAmount(amt, baseCurrency, checkoutCurrency);

  const isBidVal =
    isBid ||
    searchParams?.get("bid") === "true" ||
    displayFlight?.flightId?.includes("cheap-bid") ||
    flightDetails?.id?.includes("cheap-bid") ||
    flightDetails?.flightId?.includes("cheap-bid");

  const effectiveCheapBidApplied = useMemo(() => {
    if (isBidVal && standbyDeal) {
      const origAdt =
        standbyDeal.originalAdtPrice != null
          ? Number(standbyDeal.originalAdtPrice)
          : flightDetails?.flightFare?.adultFare ||
            displayFlight?.flightFare?.adultFare ||
            null;
      const origChd =
        standbyDeal.originalChdPrice != null
          ? Number(standbyDeal.originalChdPrice)
          : flightDetails?.flightFare?.childFare ||
            displayFlight?.flightFare?.childFare ||
            origAdt;
      const origInf =
        standbyDeal.originalInfPrice != null
          ? Number(standbyDeal.originalInfPrice)
          : flightDetails?.flightFare?.infantFare ||
            displayFlight?.flightFare?.infantFare ||
            0;

      const discountType = standbyDeal.discountType || "replace";
      const appliedMeta =
        flightDetails?.cheapBidApplied || displayFlight?.cheapBidApplied;

      let resolvedBidAdtPrice: number;
      let resolvedBidChdPrice: number;
      let resolvedBidInfPrice: number;

      if (appliedMeta && appliedMeta.bidAdtPrice !== undefined) {
        resolvedBidAdtPrice = Number(appliedMeta.bidAdtPrice);
        resolvedBidChdPrice = Number(
          appliedMeta.bidChdPrice ??
            appliedMeta.originalChdPrice ??
            appliedMeta.bidAdtPrice,
        );
        resolvedBidInfPrice = Number(
          appliedMeta.bidInfPrice ?? appliedMeta.originalInfPrice ?? 0,
        );
      } else {
        const rawAdt =
          standbyDeal.bidAdtPrice != null
            ? Number(standbyDeal.bidAdtPrice)
            : Number(origAdt || 0);
        const rawChd =
          standbyDeal.bidChdPrice != null
            ? Number(standbyDeal.bidChdPrice)
            : Number(origChd || 0);
        const rawInf =
          standbyDeal.bidInfPrice != null
            ? Number(standbyDeal.bidInfPrice)
            : Number(origInf || 0);

        if (discountType === "percentage") {
          resolvedBidAdtPrice =
            Number(origAdt || 0) > 0
              ? Math.max(0, Number(origAdt) * (1 - rawAdt / 100))
              : 0;
          resolvedBidChdPrice =
            Number(origChd || 0) > 0
              ? Math.max(0, Number(origChd) * (1 - rawChd / 100))
              : 0;
          resolvedBidInfPrice =
            Number(origInf || 0) > 0
              ? Math.max(0, Number(origInf) * (1 - rawInf / 100))
              : 0;
        } else if (discountType === "fixed") {
          resolvedBidAdtPrice =
            Number(origAdt || 0) > 0
              ? Math.max(0, Number(origAdt) - rawAdt)
              : 0;
          resolvedBidChdPrice =
            Number(origChd || 0) > 0
              ? Math.max(0, Number(origChd) - rawChd)
              : 0;
          resolvedBidInfPrice =
            Number(origInf || 0) > 0
              ? Math.max(0, Number(origInf) - rawInf)
              : 0;
        } else {
          resolvedBidAdtPrice = rawAdt;
          resolvedBidChdPrice = rawChd;
          resolvedBidInfPrice = rawInf;
        }
      }

      return {
        bidAdtPrice: resolvedBidAdtPrice,
        bidChdPrice: resolvedBidChdPrice,
        bidInfPrice: resolvedBidInfPrice,
        originalAdtPrice: origAdt,
        originalChdPrice: origChd,
        originalInfPrice: origInf,
        bidId: standbyDeal.bidId,
        discountType,
        currency: standbyDeal.currency || "USD",
      };
    }
    return flightDetails?.cheapBidApplied || displayFlight?.cheapBidApplied;
  }, [isBidVal, standbyDeal, flightDetails, displayFlight]);

  const getCurrency = useCurrencyStore((s) => s.getCurrency);
  const formatForCurrency = (amount: number, currencyCode: string) => {
    const curr = getCurrency(currencyCode) || { symbol: currencyCode };
    return `${curr.symbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const confirmationPricing: FlightCardConfirmationPricing = {
    total: toMajor(grandTotal - (affirmFee || 0)),
    currency: majorCurrency,
    baseFare: toMajor(baseFareValue),
    tax: toMajor(taxValue),
  };

  const hotelAddons = selectedAddons.filter((a) => a.type === "HOTEL");

  const hasExtraCharges =
    seatTotal > 0 ||
    ancillaryTotal > 0 ||
    addonsTotal > 0 ||
    (refundShieldOpted && refundShieldFee > 0) ||
    affirmFee > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(GROUP_SURFACE, "mx-auto max-w-5xl")}
    >
      <div className="space-y-4 p-0 md:space-y-5 md:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 px-0.5">
            <p className="text-[15px] font-semibold text-foreground">
              {t("Your request has been received")}
            </p>
            <p className="mt-0.5 text-[12px] leading-snug text-foreground/90">
              {t(
                "We will contact you shortly to confirm payment and issue your ticket.",
              )}
            </p>
          </div>

          {bookingRef && (
            <div className="flex shrink-0 items-center justify-between gap-3 rounded-[10px] border border-border/50 bg-white px-3 py-2 dark:bg-card sm:min-w-[220px]">
              <p className="text-xs font-semibold tracking-wide text-foreground/90">
                {t("Ref Number")}
              </p>
              <div className="flex items-center gap-1.5">
                <p className="select-all text-sm font-semibold tracking-wide bg-redmix/5 dark:bg-foreground text-redmix px-2 py-1 rounded-md ">
                  {bookingRef}
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 shrink-0 rounded-[8px] p-0 hover:bg-redmix/10"
                  onClick={() => {
                    navigator.clipboard.writeText(bookingRef);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <ClipboardList className="h-3.5 w-3.5 text-foreground/80" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 md:gap-5">
          {displayFlight?.outbound?.length ? (
            <div className="pointer-events-auto">
              <p className={cn(SECTION_LABEL, "mb-2 px-0.5")}>
                {t("Flight Details")}
              </p>
              <FlightCard
                flight={displayFlight}
                confirmationMode
                confirmationPricing={confirmationPricing}
              />
            </div>
          ) : (
            <div />
          )}

          <div className={cn(INSET_GROUP, "h-fit w-full")}>
            <div className="px-3 py-2.5">
              <p className="text-sm font-semibold text-foreground">
                {t("Passengers & Payment")}
              </p>
              <p className="mt-0.5 text-xs font-medium tracking-wide text-foreground/90">
                {t(cabinClass)} · {totalPax}{" "}
                {totalPax === 1 ? t("Passenger") : t("Passengers")}
                {departDateLabel ? ` · ${departDateLabel}` : ""}
              </p>
            </div>

            <div className="px-3 pb-1">
              <TravelerPaymentList
                travelers={travelers}
                flightFare={
                  effectiveCheapBidApplied
                    ? {
                        adultFare: isBidVal
                          ? (effectiveCheapBidApplied.bidAdtPrice ??
                            effectiveCheapBidApplied.originalAdtPrice)
                          : (effectiveCheapBidApplied.originalAdtPrice ??
                            effectiveCheapBidApplied.bidAdtPrice),
                        childFare: isBidVal
                          ? (effectiveCheapBidApplied.bidChdPrice ??
                            effectiveCheapBidApplied.originalChdPrice ??
                            effectiveCheapBidApplied.bidAdtPrice)
                          : (effectiveCheapBidApplied.originalChdPrice ??
                            effectiveCheapBidApplied.bidChdPrice),
                        infantFare: isBidVal
                          ? (effectiveCheapBidApplied.bidInfPrice ??
                            effectiveCheapBidApplied.originalInfPrice ??
                            0)
                          : (effectiveCheapBidApplied.originalInfPrice ??
                            effectiveCheapBidApplied.bidInfPrice),
                        adultTax: 0,
                        childTax: 0,
                        infantTax: 0,
                      }
                    : ((flightDetails?.flightFare ||
                        displayFlight?.flightFare) as any)
                }
                searchParams={searchParams}
                targetTotal={baseFareValue + taxValue}
                sourceCurrency={
                  flightDetails?.currency || displayFlight?.currency || "USD"
                }
                displayCurrency={baseCurrency as CurrencyCode}
                formatPrice={formatPrice}
                getConvertedAmount={getConvertedAmount}
                isBid={isBidVal}
              />
            </div>

            {hasExtraCharges && (
              <>
                {seatTotal > 0 && (
                  <div className={SUMMARY_ROW}>
                    <span className="text-foreground/80">{t("Seating")}</span>
                    <span className="font-semibold text-foreground">
                      {formatForCurrency(toMajor(seatTotal), majorCurrency)}
                    </span>
                  </div>
                )}
                {ancillaryTotal > 0 && (
                  <div className={SUMMARY_ROW}>
                    <span className="text-foreground/80">{t("Extras")}</span>
                    <span className="font-semibold text-foreground">
                      {formatForCurrency(
                        toMajor(ancillaryTotal),
                        majorCurrency,
                      )}
                    </span>
                  </div>
                )}
                {addonsTotal > 0 && (
                  <div className={SUMMARY_ROW}>
                    <span className="text-foreground/80">{t("Add-ons")}</span>
                    <span className="font-semibold text-foreground">
                      {formatForCurrency(toMajor(addonsTotal), majorCurrency)}
                    </span>
                  </div>
                )}
                {refundShieldOpted && refundShieldFee > 0 && (
                  <div className={SUMMARY_ROW}>
                    <span className="text-foreground/80">
                      {t("Refund Shield Protection")}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-foreground">
                        +
                        {formatForCurrency(
                          toMajor(refundShieldFee),
                          majorCurrency,
                        )}
                      </span>
                      {minorCurrency && (
                        <span className="mt-0.5 text-[10px] text-foreground/90 font-semibold">
                          {t("approx.")}{" "}
                          {formatForCurrency(toMinor(refundShieldFee), checkoutCurrency)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="flex items-end justify-between gap-3 px-3 py-3">
              <span className="text-[15px] font-semibold text-foreground">
                {t("Total Amount")}
              </span>
              <div className="flex flex-col items-end">
                <span className="text-[22px] font-bold tracking-tight bg-redmix/5 dark:bg-foreground text-redmix px-2 py-1 rounded-md">
                  {formatForCurrency(toMajor(grandTotal - (affirmFee || 0)), majorCurrency)}
                </span>
                {minorCurrency && (
                  <span className="mt-0.5 text-xs font-semibold text-foreground/90">
                    {t("approx.")} {formatForCurrency(toMinor(grandTotal - (affirmFee || 0)), checkoutCurrency)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {hotelAddons.length > 0 && (
          <div className="space-y-2 border-t border-border/50 pt-3">
            <p className={cn(SECTION_LABEL, "px-0.5")}>
              {t("Hotel Add-on Details")}
            </p>
            <div className="space-y-2">
              {hotelAddons.map((addon) => (
                <div
                  key={addon.id}
                  className="flex flex-row items-center justify-between gap-4 rounded-[10px] border border-border/50 bg-white p-3 dark:bg-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold text-foreground">
                      {addon.name}
                    </p>
                    <p className="mt-0.5 text-[12px] text-foreground/75">
                      {t("Stay synchronized with departure on")}{" "}
                      {allDates?.[0] || departDateLabel || t("selected date")}
                    </p>
                  </div>
                  <p className="shrink-0 text-[14px] font-bold text-redmix">
                    {formatAddonPrice(addon)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pointer-events-auto flex flex-col justify-center gap-2.5 border-t border-border/50 pt-2 sm:flex-row pb-12 md:pb-0">
          <Button
            variant="outline"
            onClick={() => router.push("/flights")}
            className="h-11 w-full rounded-[12px] border-border/50 bg-white px-6 text-[14px] font-semibold hover:bg-foreground/5 sm:w-auto dark:bg-card"
          >
            {t("Browse More Flights")}
          </Button>
          {/* <Button
            onClick={() => router.push("/my-trips")}
            className="h-11 w-full rounded-[12px] bg-redmix px-6 text-[14px] font-semibold text-white shadow-sm transition-transform hover:bg-redmix/90 active:scale-[0.98] sm:w-auto"
          >
            {t("View My Trip")}
          </Button> */}
        </div>
      </div>
    </motion.div>
  );
}
