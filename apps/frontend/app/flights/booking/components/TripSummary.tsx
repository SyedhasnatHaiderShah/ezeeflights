"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Trash2, ShieldCheck } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { CurrencyCode, getCheckoutCurrency } from "@/lib/store/currency-store";
import { PassengerFareBreakdown } from "@/components/flights/PassengerFareBreakdown";
import { isUSDomain, getActiveHostname } from "@/lib/utils/domain";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import { HoverTooltip } from "@/components/ui/hover-tooltip";
import { fmtTime, calculateLegDuration } from "@/components/flights/FlightCard";
import type { FlightListItem, FlightSegment } from "@/lib/types/flight-api";
import { AirlineLogo } from "@/components/flights/AirlineLogo";
import { getCurrencySymbol } from "@/lib/currency/currency-meta";

const GROUP_SURFACE =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50";

const INSET_GROUP =
  "overflow-hidden rounded-[10px] border border-border/50 bg-white dark:bg-card divide-y divide-border/50";

function CompactFlightLeg({
  first,
  last,
  durationMins,
  stops,
  stopCodes,
}: {
  first: FlightSegment;
  last: FlightSegment;
  durationMins: number;
  stops: number;
  stopCodes: string[];
}) {
  const { t } = useTranslation();
  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-1.5 sm:gap-2">
        <div className="shrink-0 text-left">
          <p className="text-xs sm:text-sm md:text-[17px] font-semibold leading-none text-foreground">
            {fmtTime(first.departureDate)}
          </p>
          <p className="mt-1 text-[10px] sm:text-xs font-semibold text-foreground/90">
            {first.fromAirport.code}
          </p>
        </div>

        <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 pb-1">
          <p className="whitespace-nowrap text-[10px] sm:text-xs font-semibold text-foreground/90">
            {hours > 0 ? `${hours}h ` : ""}
            {mins}m
          </p>
          <div className="flex w-full items-center gap-1">
            <div className="h-px flex-1 bg-border/60" />
            {stops > 0 && (
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
            )}
            <div className="h-px flex-1 bg-border/60" />
          </div>
          <p className="w-full truncate text-center text-[9px] sm:text-xs font-semibold text-foreground/90">
            {stops === 0
              ? t("Nonstop")
              : `${stops} ${stops === 1 ? t("stop") : t("stops")} · ${stopCodes.join(", ")}`}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-xs sm:text-sm md:text-[17px] font-semibold leading-none text-foreground">
            {fmtTime(last.arrivalDate)}
          </p>
          <p className="mt-1 text-[10px] sm:text-xs font-semibold text-foreground/90">
            {last.toAirport.code}
          </p>
        </div>
      </div>
    </div>
  );
}

interface TripSummaryProps {
  flightDetails: any;
  displayFlight: FlightListItem | null;
  searchParams: any;
  cabinClass: string;
  totalPax: number;
  travelers: any[];
  baseFareValue: number;
  taxValue: number;
  seatTotal: number;
  ancillaryTotal: number;
  selectedAddons: any[];
  isBid: boolean;
  standbyDeal?: any;
  grandTotal: number;
  formatPrice: (amount: number) => string;
  getConvertedAmount: (
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
  ) => number;
  baseCurrency: CurrencyCode;
  refundShieldOpted?: boolean;
  onRefundShieldToggle?: (opted: boolean) => void;
  refundShieldFee?: number;
  affirmFee: number;
  paymentMethod: "standard" | "affirm";
  onPaymentMethodChange: (method: "standard" | "affirm") => void;
  isPricingLoading?: boolean;
}

export const TripSummary: React.FC<TripSummaryProps> = ({
  flightDetails,
  displayFlight,
  searchParams,
  cabinClass,
  totalPax,
  travelers,
  baseFareValue,
  taxValue,
  seatTotal,
  ancillaryTotal,
  selectedAddons,
  isBid,
  standbyDeal,
  grandTotal,
  formatPrice,
  getConvertedAmount,
  baseCurrency,
  refundShieldOpted,
  onRefundShieldToggle,
  refundShieldFee,
  affirmFee,
  paymentMethod,
  onPaymentMethodChange,
  isPricingLoading = false,
}) => {
  const formatPriceRound = (amount: number) => {
    const symbol = getCurrencySymbol(baseCurrency);
    const rounded = Math.round(amount);
    return `${symbol} ${rounded.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const isAllowedDomain = useMemo(() => {
    if (typeof window === "undefined") return false;
    const host = getActiveHostname();

    if (
      host.includes("uk.ezeeflights.com") ||
      host.includes("tr.ezeeflights.com") ||
      host.includes("in.ezeeflights.com")
    ) {
      return false;
    }

    const allowedDomains = [
      "ezeeflights.com",
      "ezeeflights.ca",
      "localhost",
      "127.0.0.1",
    ];
    return allowedDomains.some((domain) => host.includes(domain));
  }, []);

  // When isBid && standbyDeal, synthesize cheapBidApplied from the deal record
  // so PassengerFareBreakdown shows bid prices even though flightDetails is the original flight
  const effectiveCheapBidApplied = useMemo(() => {
    if (isBid && standbyDeal) {
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

      const adtCount = Number(
        searchParams?.get?.("adt") || searchParams?.get?.("adults") || 1,
      );
      const chdCount = Number(
        searchParams?.get?.("chld") ||
          searchParams?.get?.("chd") ||
          searchParams?.get?.("children") ||
          0,
      );
      const infCount = Number(
        searchParams?.get?.("inf") || searchParams?.get?.("infants") || 0,
      );

      const originalTotal =
        standbyDeal.originalTotal ||
        Number(origAdt || 0) * adtCount +
          Number(origChd || 0) * chdCount +
          Number(origInf || 0) * infCount;

      // For 'percentage' or 'fixed' discountType, the DB stores the relative discount value,
      // NOT the absolute ticket price. The server computed actual dollar fares in cheapBidApplied.
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
        originalTotal,
        bidId: standbyDeal.bidId,
        discountType: standbyDeal.discountType || "replace",
        currency:
          standbyDeal.currency ||
          flightDetails?.currency ||
          displayFlight?.currency ||
          "USD",
      };
    }
    return flightDetails?.cheapBidApplied || displayFlight?.cheapBidApplied;
  }, [isBid, standbyDeal, flightDetails, displayFlight, searchParams]);
  const { t } = useTranslation();
  const toggleAddon = useBookingFlowStore((s) => s.toggleAddon);
  const checkoutCurrency = useMemo(() => getCheckoutCurrency(), []);

  const effectiveGrandTotal = useMemo(() => {
    if (isBid && effectiveCheapBidApplied) {
      const adtCount = Number(
        searchParams?.get?.("adt") || searchParams?.get?.("adults") || 1,
      );
      const chdCount = Number(
        searchParams?.get?.("chld") ||
          searchParams?.get?.("chd") ||
          searchParams?.get?.("children") ||
          0,
      );
      const infCount = Number(
        searchParams?.get?.("inf") || searchParams?.get?.("infants") || 0,
      );

      const bidAdt = Number(effectiveCheapBidApplied.bidAdtPrice ?? 0);
      const bidChd = Number(effectiveCheapBidApplied.bidChdPrice ?? bidAdt);
      const bidInf = Number(effectiveCheapBidApplied.bidInfPrice ?? 0);

      const dealTotal =
        adtCount * bidAdt + chdCount * bidChd + infCount * bidInf;
      const dealCurrency = (effectiveCheapBidApplied as any).currency || "USD";
      return getConvertedAmount(dealTotal, dealCurrency, baseCurrency);
    }
    return paymentMethod === "affirm" ? grandTotal - affirmFee : grandTotal;
  }, [
    isBid,
    effectiveCheapBidApplied,
    grandTotal,
    paymentMethod,
    affirmFee,
    searchParams,
    baseCurrency,
    getConvertedAmount,
  ]);

  const totalUsdAccurate = getConvertedAmount(
    effectiveGrandTotal,
    baseCurrency,
    "USD",
  );
  const totalUsdCents = Math.round(totalUsdAccurate * 100);

  const legSummary = useMemo(() => {
    const outbound = displayFlight?.outbound;
    if (!outbound?.length) return null;

    const first = outbound[0];
    const last = outbound[outbound.length - 1];
    const inbound = displayFlight?.inbound;
    let inboundLeg: {
      first: FlightSegment;
      last: FlightSegment;
      stops: number;
      stopCodes: string[];
      durationMins: number;
    } | null = null;

    if (inbound?.length) {
      const inFirst = inbound[0];
      const inLast = inbound[inbound.length - 1];
      inboundLeg = {
        first: inFirst,
        last: inLast,
        stops: Math.max(0, inbound.length - 1),
        stopCodes: inbound.slice(0, -1).map((s) => s.toAirport.code),
        durationMins: calculateLegDuration(inbound),
      };
    }

    const durationMins = calculateLegDuration(outbound);

    return {
      first,
      last,
      stops: Math.max(0, outbound.length - 1),
      stopCodes: outbound.slice(0, -1).map((s) => s.toAirport.code),
      durationMins,
      airlineCode: first.airline?.code || displayFlight?.airline?.code || "XX",
      airlineName:
        first.airline?.name || displayFlight?.airline?.name || t("Airline"),
      flightNo: first.flightNo || displayFlight?.flightId?.slice(0, 8),
      inboundLeg,
    };
  }, [displayFlight]);

  React.useEffect(() => {
    const usdTotal = getConvertedAmount(
      effectiveGrandTotal,
      baseCurrency,
      "USD",
    );
    console.log(
      `[TripSummary] Grand Total: ${effectiveGrandTotal.toFixed(2)} ${baseCurrency} | USD Price: ${usdTotal.toFixed(2)} USD`,
    );
  }, [effectiveGrandTotal, baseCurrency, getConvertedAmount]);

  const summaryRowClass =
    "flex min-h-[38px] items-center justify-between gap-3 px-3 py-2 text-[13px]";

  return (
    <div className={cn(GROUP_SURFACE, "relative shadow-sm")}>
      {isPricingLoading && (
        <div
          className={cn(
            "absolute left-0 right-0 top-0 z-50 h-0.5 overflow-hidden",
            isBid ? "bg-[#1c2652]/20" : "bg-redmix/20",
          )}
        >
          <div
            className={cn(
              "h-full w-full animate-pulse",
              isBid ? "bg-[#1c2652]" : "bg-redmix",
            )}
          />
        </div>
      )}

      <div
        className={cn(
          "p-2.5 sm:p-3 md:p-4 transition-opacity duration-200",
          isPricingLoading && "opacity-90",
        )}
      >
        <p className="px-0.5 text-[12px] font-semibold text-foreground/80">
          {t("Booking")}
        </p>
        <h3 className="mb-3 px-0.5 text-[17px] font-semibold tracking-tight text-foreground">
          {t("Trip Summary")}
        </h3>

        {legSummary ? (
          <div className={cn(INSET_GROUP, "mb-3 p-2 sm:p-3 space-y-3 w-full")}>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-1.5 dark:bg-card">
                <AirlineLogo
                  code={legSummary.airlineCode}
                  name={legSummary.airlineName}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold text-foreground">
                  {legSummary.airlineName}
                </p>
                <p className="text-[11px] font-semibold tracking-wide text-foreground/75">
                  {legSummary.flightNo}
                </p>
              </div>
            </div>

            <CompactFlightLeg
              first={legSummary.first}
              last={legSummary.last}
              durationMins={legSummary.durationMins}
              stops={legSummary.stops}
              stopCodes={legSummary.stopCodes}
            />

            {legSummary.inboundLeg && (
              <div className="space-y-3 border-t border-dashed border-border/50 pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/75">
                  {t("Return")}
                </p>
                <CompactFlightLeg
                  first={legSummary.inboundLeg.first}
                  last={legSummary.inboundLeg.last}
                  durationMins={legSummary.inboundLeg.durationMins}
                  stops={legSummary.inboundLeg.stops}
                  stopCodes={legSummary.inboundLeg.stopCodes}
                />
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center rounded-md dark:bg-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                  isBid
                    ? "bg-[#1c2652]/5 text-[#1c2652]"
                    : "bg-redmix/5 text-redmix",
                )}
              >
                {t("Total Price")}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground/75">
                · {totalPax} {totalPax === 1 ? t("Passenger") : t("Passengers")}
              </span>
            </div>
          </div>
        ) : (
          <div className={cn(INSET_GROUP, "mb-3 flex items-center gap-3 p-3")}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/50 bg-white p-1.5 dark:bg-card">
              <AirlineLogo
                code={
                  flightDetails?.airlineCode ||
                  flightDetails?.airline?.code ||
                  "XX"
                }
                className="h-full w-full object-contain"
                alt="airline logo"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold text-foreground/80">
                {t("Flight Route & Class")}
              </span>
              <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[14px] font-semibold text-foreground">
                {flightDetails?.departureAirport?.includes("→") ||
                searchParams.get("org")?.includes("→") ? (
                  <span>
                    {flightDetails?.departureAirport || searchParams.get("org")}
                  </span>
                ) : (
                  <>
                    <span>
                      {flightDetails?.departureAirport ||
                        searchParams.get("org") ||
                        "---"}
                    </span>
                    <span className="font-normal text-foreground/60">→</span>
                    <span>
                      {flightDetails?.arrivalAirport ||
                        searchParams.get("des") ||
                        "---"}
                    </span>
                  </>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                    isBid
                      ? "bg-[#1c2652]/10 text-[#1c2652]"
                      : "bg-redmix/10 text-redmix",
                  )}
                >
                  {t("Cheap Bid")}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground/75">
                  · {totalPax}{" "}
                  {totalPax === 1 ? t("Passenger") : t("Passengers")}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className={cn(INSET_GROUP, "mb-3")}>
          <div className="px-3 py-2">
            <h4 className="text-[13px] font-semibold text-foreground">
              {t("Fare Summary")}
            </h4>
          </div>

          <div className="px-3 pb-2 font-semibold text-xs text-foreground/90">
            {isPricingLoading || !flightDetails ? (
              <div className="space-y-3 p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-border/30" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-border/30" />
              </div>
            ) : (
              <PassengerFareBreakdown
                flightFare={
                  isBid && effectiveCheapBidApplied
                    ? {
                        adultFare: effectiveCheapBidApplied.bidAdtPrice,
                        childFare: effectiveCheapBidApplied.bidChdPrice,
                        infantFare: effectiveCheapBidApplied.bidInfPrice,
                        adultTax: 0,
                        childTax: 0,
                        infantTax: 0,
                      }
                    : ((flightDetails?.flightFare ||
                        displayFlight?.flightFare) as any)
                }
                searchParams={searchParams}
                targetTotal={
                  isBid ? effectiveGrandTotal : baseFareValue + taxValue
                }
                sourceCurrency={
                  (isBid && effectiveCheapBidApplied
                    ? (effectiveCheapBidApplied as any).currency
                    : undefined) ||
                  flightDetails?.currency ||
                  displayFlight?.currency ||
                  "USD"
                }
                displayCurrency={baseCurrency}
                formatPrice={formatPriceRound}
                getConvertedAmount={getConvertedAmount}
                className="space-y-2"
                cheapBidApplied={isBid ? effectiveCheapBidApplied : null}
                isBid={isBid}
              />
            )}
            {seatTotal > 0 && (
              <div className={summaryRowClass}>
                <span>{t("Seating")}</span>
                <span className="font-semibold text-foreground">
                  {formatPriceRound(seatTotal)}
                </span>
              </div>
            )}
            {ancillaryTotal > 0 && (
              <div className={summaryRowClass}>
                <span>{t("Extras")}</span>
                <span className="font-semibold text-foreground">
                  {formatPriceRound(ancillaryTotal)}
                </span>
              </div>
            )}
            {selectedAddons.map((addon) => {
              const convertedAddonPrice = getConvertedAmount(
                addon.price,
                "USD",
                baseCurrency,
              );
              return (
                <div key={addon.id} className={summaryRowClass}>
                  <span
                     className="min-w-0 flex-1 truncate pr-2 text-[12px] font-medium"
                     title={addon.name}
                  >
                    {addon.type === "HOTEL" && `${t("Hotel")}: `}
                    {addon.type === "CAR" && `${t("Car")}: `}
                    {addon.type === "INSURANCE" && `${t("Insurance")}: `}
                    {addon.type === "ATTRACTION" && `${t("Attraction")}: `}
                    {addon.name}
                  </span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[12px] font-semibold text-foreground">
                      {formatPriceRound(convertedAddonPrice)}
                    </span>
                    <HoverTooltip
                      content={`${t("Remove")} ${addon.type === "HOTEL" ? t("Hotel Add-on") : addon.type === "CAR" ? t("Car Rental") : t("Add-on")}`}
                      position="top-left"
                    >
                      <button
                        type="button"
                        onClick={() => toggleAddon(addon)}
                        className={cn(
                          "rounded-md p-1 text-foreground/50 transition-colors",
                          isBid
                            ? "hover:bg-[#1c2652]/10 hover:text-[#1c2652]"
                            : "hover:bg-redmix/10 hover:text-redmix",
                        )}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </HoverTooltip>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Refund Shield (Preserved for future use) */}
        {/* <div className={INSET_GROUP}>
          {!isBid && onRefundShieldToggle && (
            <div className="flex min-h-[52px] items-center justify-between gap-3 px-3 py-2">
              <div className="min-w-0 pr-2">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  <span
                    className={cn(
                      "inline-flex items-center rounded dark:bg-foreground px-1.5",
                      isBid
                        ? "bg-[#1c2652]/10 text-[#1c2652]"
                        : "bg-redmix/10 text-redmix",
                    )}
                  >
                    {t("Refund Shield")}
                  </span>
                </span>
                <span className="mt-0.5 block text-[11px] font-medium leading-snug text-foreground/75">
                  {t("Get a refund if you need to cancel your trip.")}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {refundShieldOpted &&
                  refundShieldFee !== undefined &&
                  refundShieldFee !== 0 && (
                    <div className="flex flex-col items-end">
                      <span className="text-[13px] font-semibold text-foreground">
                        {refundShieldFee < 0 ? "-" : "+"}
                        {formatPrice(Math.abs(refundShieldFee))}
                      </span>
                      {isUSDomain() && baseCurrency !== checkoutCurrency && (
                        <span className="mt-0.5 text-[10px] text-foreground/75">
                          {t("approx.")} {checkoutCurrency === "GBP" ? "£" : "$"}
                          {getConvertedAmount(
                            refundShieldFee,
                            "USD",
                            checkoutCurrency,
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}
                <Switch
                  id="refund-shield-toggle"
                  checked={refundShieldOpted}
                  onCheckedChange={onRefundShieldToggle}
                  className={cn(
                    "shrink-0",
                    isBid
                      ? "data-[state=checked]:bg-[#1c2652]"
                      : "data-[state=checked]:bg-redmix",
                  )}
                />
              </div>
            </div>
          )}
        </div> */}

        <div className={INSET_GROUP}>
          {!isBid && isAllowedDomain && (
            <div className="flex min-h-[52px] items-center justify-between gap-3 px-3 py-2">
              <div className="min-w-0 pr-2">
                <span className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
                  <span className="flex h-4 w-11 shrink-0 items-center justify-center rounded bg-[#060809] px-1">
                    <span className="text-[10px] font-extrabold italic tracking-tight text-white">
                      affirm
                    </span>
                  </span>
                  {t("Pay over time")}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-foreground/75">
                  {t("Pay in installments with Affirm.")}
                </span>
              </div>
              <Switch
                value="affirm"
                id="pm-affirm"
                checked={paymentMethod === "affirm"}
                onCheckedChange={(checked) =>
                  onPaymentMethodChange(checked ? "affirm" : "standard")
                }
                className={cn(
                  "shrink-0",
                  isBid
                    ? "data-[state=checked]:bg-[#1c2652]"
                    : "data-[state=checked]:bg-redmix",
                )}
              />
            </div>
          )}
        </div>

        <div className="mt-3 border-t border-border/50 pt-3">
          <div className="flex items-end justify-between gap-3">
            <Label className="text-[15px] font-semibold text-foreground">
              {t("Estimated Total")}
            </Label>
            <div className="text-right">
              {isPricingLoading || !flightDetails ? (
                <div className="h-6 w-24 animate-pulse rounded bg-border/30 ml-auto" />
              ) : (
                <>
                  <span
                    className={cn(
                      "text-[22px] font-bold tracking-tight dark:bg-foreground px-2 py-1 rounded-md",
                      isBid
                        ? "bg-[#1c2652]/10 text-[#1c2652]"
                        : "bg-redmix/10 text-redmix",
                    )}
                  >
                    {formatPriceRound(effectiveGrandTotal)}
                  </span>
                  {isUSDomain() && baseCurrency !== checkoutCurrency && (
                    <span className="mt-0.5 block text-xs font-medium text-foreground/90">
                      ({t("approx.")} {checkoutCurrency === "GBP" ? "£" : "$"}
                      {getConvertedAmount(
                        effectiveGrandTotal,
                        baseCurrency,
                        checkoutCurrency,
                      ).toFixed(0)}{" "}
                      {checkoutCurrency})
                    </span>
                  )}
                </>
              )}
            </div>
          </div>{" "}
        </div>

        {paymentMethod === "affirm" && (
          <p
            className={cn(
              "mt-1 text-right text-[11px] font-medium",
              isBid ? "text-[#1c2652]" : "text-redmix",
            )}
          >
            ✓ {t("Paying via Affirm installments")}
          </p>
        )}

        {(isBid || paymentMethod === "standard") &&
          paymentMethod !== "affirm" && (
            <div className="mt-4 flex items-start gap-2 rounded-[8px] bg-muted/30 p-2 border border-border/50">
              <ShieldCheck
                className={cn(
                  "h-3.5 w-3.5 shrink-0 mt-0.5",
                  isBid ? "text-[#1c2652]" : "text-redmix",
                )}
              />
              <p className="text-[10px] leading-snug text-foreground/80">
                {t("Your payment will be securely processed by")}{" "}
                <span
                  className={cn(
                    "font-semibold",
                    isBid ? "text-[#1c2652]" : "text-redmix",
                  )}
                >
                  Razorpay
                </span>
                .
              </p>
            </div>
          )}
      </div>
    </div>
  );
};
