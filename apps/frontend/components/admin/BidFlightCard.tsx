"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Heart,
  Check,
  X as XIcon,
  Info,
  Sparkles,
  Briefcase,
  Luggage,
  Tag,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { mockFareTiers } from "@/data/mock-ux";
import { useState, useEffect } from "react";
import {
  JetcostAddRuleModal,
  flightToJetcostForm,
} from "@/components/admin/JetcostAddRuleModal";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import { apiFetch } from "@/lib/api/client";
import { applyFlightBookingCabinParams } from "@/lib/utils/cabin-class";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useIsAdmin } from "@/lib/hooks/use-is-admin";
import { cn } from "@/lib/utils";
import { AirlineLogo } from "../flights/AirlineLogo";
import { Button } from "../ui/button";
import {
  getAirportByCode,
  Airport as AirportData,
} from "@/lib/utils/airport-search";
import { FlightListItem, FlightSegment } from "@/lib/types/flight-api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AppIcon } from "../ui/app-icon";
import { AnimatePresence, motion } from "framer-motion";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { PassengerFareBreakdown } from "@/components/flights/PassengerFareBreakdown";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
  SELECT_API_CURRENCY,
} from "@/lib/store/currency-store";

import { BidDeal } from "@/lib/api/bid-deals";
import { CheckCircle2, Clock, Coffee, ShieldCheck, Ticket } from "lucide-react";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { useTranslation } from "react-i18next";
import { useToast } from "@/lib/hooks/use-toast";

export type FlightCardConfirmationPricing = {
  total: number;
  currency: string;
  baseFare: number;
  tax: number;
};

interface Props {
  flight: FlightListItem;
  bidDeal?: BidDeal;
  isLowestPrice?: boolean;
  isBooked?: boolean;
  /** Booking success screen: same card UI, no actions, fixed display totals */
  confirmationMode?: boolean;
  confirmationPricing?: FlightCardConfirmationPricing;
  /** Admin preview: customer card UI without select / place-bid actions */
  previewMode?: boolean;
}

function getBadge(
  flight: FlightListItem,
): { label: string; className: string } | null {
  if (flight.totalCost < 400)
    return { label: "Cheapest", className: "bg-sky-500/10 text-sky-500" };
  if (flight.totalTime < 420)
    return { label: "Fastest", className: "bg-redmix/10 text-redmix" };
  if (flight.totalCost / Math.max(1, flight.totalTime) < 1.2)
    return {
      label: "Best Value",
      className: "bg-emerald-500/10 text-emerald-500",
    };
  return null;
}

function getTimeEmoji(iso: string): string {
  if (!iso) return "✈️";
  const h = new Date(iso).getHours();
  if (h >= 0 && h < 5) return "🌙";
  if (h >= 5 && h < 10) return "🌅";
  if (h >= 10 && h < 16) return "☀️";
  if (h >= 16 && h < 20) return "🌆";
  if (h >= 20 && h < 22) return "🌙";
  return "🕛";
}

function getDurationEmoji(mins: number): string {
  if (mins < 120) return "⚡";
  if (mins < 360) return "✈️";
  return "🌍";
}

export const fmtTime = (iso: string, locale = "en-US") => {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
export const durationFmt = (mins: number) =>
  `${Math.floor(mins / 60)}h ${mins % 60}m`;

export const calculateLegDuration = (segments: FlightSegment[]): number => {
  if (!segments || segments.length === 0) return 0;

  let totalMins = 0;

  const parseDuration = (str: string | number) => {
    if (typeof str === "number") return str;
    if (!str) return 0;
    const match = str.match(/(\d+)h\s*(\d+)m/i);
    if (match) return parseInt(match[1]) * 60 + parseInt(match[2]);
    return parseInt(str) || 0;
  };

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const flightTime =
      parseDuration(seg.elapsedTime) ||
      parseDuration(seg.totalTime) ||
      parseDuration((seg as any).FlightTime) ||
      0;
    totalMins += flightTime;

    if (i < segments.length - 1) {
      const currentArr = new Date(seg.arrivalDate).getTime();
      const nextDep = new Date(segments[i + 1].departureDate).getTime();
      if (!isNaN(currentArr) && !isNaN(nextDep) && nextDep > currentArr) {
        totalMins += Math.round((nextDep - currentArr) / 60000);
      }
    }
  }

  return totalMins;
};

const getLocaleFromLanguage = (language?: string) => {
  if (!language) return "en-US";
  const normalizedLanguage = language.toLowerCase();

  if (normalizedLanguage === "zh-hans") return "zh-CN";
  if (normalizedLanguage === "zh-hant") return "zh-TW";

  return normalizedLanguage;
};

export function BidFlightCard({
  flight,
  bidDeal,
  isLowestPrice,
  isBooked,
  confirmationMode = false,
  confirmationPricing,
  previewMode = false,
}: Props) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isJetcostModalOpen, setIsJetcostModalOpen] = useState(false);
  const [showBidPrice, setShowBidPrice] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [airportNames, setAirportNames] = useState<Record<string, string>>({});
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.resolvedLanguage || i18n.language);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const setFlights = useBookingFlowStore((state) => state.setFlights);
  const setSelectedFlight = useBookingFlowStore(
    (state) => state.setSelectedFlight,
  );
  const effectiveBidDeal = React.useMemo((): BidDeal | undefined => {
    if (bidDeal) return bidDeal;
    const cb = flight.cheapBidApplied;
    if (!cb) return undefined;
    const origin = flight.outbound[0]?.fromAirport.code || "";
    const destination =
      flight.outbound[flight.outbound.length - 1]?.toAirport.code || "";
    return {
      id: `bid-${cb.bidToken || cb.bidId}`,
      origin,
      destination,
      bidPrice: cb.bidAdtPrice,
      depositAmount: cb.bidAdtPrice,
      currency: flight.currency || "USD",
    };
  }, [bidDeal, flight]);

  const isCheapBidCard =
    !confirmationMode && !previewMode && !!flight.cheapBidApplied;

  const showCheapBidHeader = !!flight.cheapBidApplied && !confirmationMode;

  const badge = getBadge(flight);
  const { data: session } = useAuthSession();
  const isAdmin = useIsAdmin();
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlistItems = useWishlistStore((state) => state.items);

  const isWishlisted = wishlistItems.some(
    (item) =>
      item.entityId === flight.flightId && item.entityType === "flights",
  );

  const adtCount = Number(
    searchParams.get("adt") || flight.flightFare?.adult || 1,
  );
  const chdCount = Number(
    searchParams.get("chd") || flight.flightFare?.child || 0,
  );
  const infCount = Number(
    searchParams.get("inf") || flight.flightFare?.infant || 0,
  );
  const totalPax = adtCount + chdCount + infCount;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(
      {
        entityId: flight.flightId,
        entityType: "flights",
        data: flight,
      },
      session?.id,
    );
  };

  useEffect(() => {
    const resolveNames = async () => {
      const codes = new Set<string>();
      flight.outbound?.forEach((s) => {
        codes.add(s.fromAirport.code);
        codes.add(s.toAirport.code);
      });
      flight.inbound?.forEach((s) => {
        codes.add(s.fromAirport.code);
        codes.add(s.toAirport.code);
      });

      const names: Record<string, string> = {};
      await Promise.all(
        Array.from(codes).map(async (code) => {
          const airport = await getAirportByCode(code);
          if (airport) {
            names[code] = airport.municipality || airport.name.split(" ")[0];
          }
        }),
      );
      setAirportNames(names);
    };
    resolveNames();
  }, [flight]);

  if (!flight.outbound || flight.outbound.length === 0) return null;

  const first = flight.outbound[0];
  const last = flight.outbound[flight.outbound.length - 1];
  const overnight =
    last?.arrivalDate && first?.departureDate
      ? new Date(last.arrivalDate).getDate() !==
        new Date(first.departureDate).getDate()
      : false;
  const stops = Math.max(0, flight.outbound.length - 1);

  const { baseCurrency, getConvertedAmount, getCurrency } = useCurrencyStore();
  const currencyMeta = getCurrency(baseCurrency) || SUPPORTED_CURRENCIES["USD"];
  const symbol = currencyMeta.symbol;
  const flightSourceCurrency = (flight.currency as string) || "USD";

  const formatCardPrice = (amount: number) =>
    `${symbol} ${amount.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  useEffect(() => {
    const rawTotal = flight.totalCost || (flight as any).price || 0;
    const usdTotal = getConvertedAmount(rawTotal, flightSourceCurrency, "USD");
    const userTotal = getConvertedAmount(
      rawTotal,
      flightSourceCurrency,
      baseCurrency,
    );
    console.log(
      `[FlightCard] Flight ID: ${flight.flightId} | Price: ${userTotal.toFixed(2)} ${baseCurrency} | USD Price: ${usdTotal.toFixed(2)} USD`,
    );
  }, [
    flight.flightId,
    flight.totalCost,
    baseCurrency,
    flightSourceCurrency,
    getConvertedAmount,
  ]);

  const getSelectApiFareBreakdown = () => {
    // For bid flights: bidAdtPrice/bidChdPrice/bidInfPrice are the server-computed
    // discounted per-pax fares already in the bid's source currency (USD).
    // Use them directly instead of going through flightFare + flightSourceCurrency
    // conversion, which causes a double-conversion mismatch.
    if (flight.cheapBidApplied) {
      const bidMeta = flight.cheapBidApplied;
      const adt = Number(searchParams.get("adt") || searchParams.get("adults") || 1);
      const chd = Number(searchParams.get("chd") || searchParams.get("children") || 0);
      const inf = Number(searchParams.get("inf") || searchParams.get("infants") || 0);
      const bidCurrency = (bidMeta as any).currency || "USD";
      const bidTotal =
        adt * Number(bidMeta.bidAdtPrice ?? 0) +
        chd * Number(bidMeta.bidChdPrice ?? bidMeta.bidAdtPrice ?? 0) +
        inf * Number(bidMeta.bidInfPrice ?? 0);
      const fareTotal = getConvertedAmount(bidTotal, bidCurrency, SELECT_API_CURRENCY);
      console.log(
        `[FlightCard:FareDebug] getSelectApiFareBreakdown (BID direct) -> flightId=${flight.flightId}, adt=${adt} chd=${chd} inf=${inf}, bidTotal=${bidTotal} ${bidCurrency}, fareTotal=${fareTotal} ${SELECT_API_CURRENCY}`,
      );
      return {
        fareTotal,
        baseFare: fareTotal,
        tax: 0,
        currency: SELECT_API_CURRENCY,
      };
    }

    const rawTotal = flight.totalCost || 0;
    let baseP = null;
    let taxP = null;

    const fare = flight.flightFare;
    if (fare) {
      const adt = Number(searchParams.get("adt") || fare.adult || 1);
      const chd = Number(searchParams.get("chd") || fare.child || 0);
      const inf = Number(searchParams.get("inf") || fare.infant || 0);

      const adultFare = fare.adultFare ?? 0;
      const childFare = fare.childFare ?? adultFare * 0.75;
      const infantFare = fare.infantFare ?? adultFare * 0.1;

      const adultTax = fare.adultTax ?? 0;
      const childTax = fare.childTax ?? adultTax * 0.75;
      const infantTax = fare.infantTax ?? adultTax * 0.1;

      const adultBase = adultFare;
      const childBase = childFare;
      const infantBase = infantFare;

      baseP = adt * adultBase + chd * childBase + inf * infantBase;
      taxP = adt * adultTax + chd * childTax + inf * infantTax;
    }

    if (baseP == null) baseP = rawTotal * 0.85;
    if (taxP == null) taxP = rawTotal * 0.15;

    const result = {
      fareTotal: getConvertedAmount(
        rawTotal,
        flightSourceCurrency,
        SELECT_API_CURRENCY,
      ),
      baseFare: getConvertedAmount(
        baseP,
        flightSourceCurrency,
        SELECT_API_CURRENCY,
      ),
      tax: getConvertedAmount(taxP, flightSourceCurrency, SELECT_API_CURRENCY),
      currency: SELECT_API_CURRENCY,
    };

    console.log(
      `[FlightCard:FareDebug] getSelectApiFareBreakdown (BID PRICE) -> flightId=${flight.flightId}, rawTotal=${rawTotal} ${flightSourceCurrency}, convertedTotal=${result.fareTotal} USD`,
      result,
    );

    return result;
  };

  /** For bid cards, return the original (non-bid) fare for standard booking. */
  const getOriginalFareBreakdown = () => {
    const originalTotal =
      flight.cheapBidApplied?.originalTotal ||
      flight.cheapBidApplied?.providerTotalFare ||
      flight.totalCost ||
      0;
    // originalTotal is stored in the flight's source currency (from the provider)
    const origCurrency = (flight.cheapBidApplied as any)?.sourceCurrency || flightSourceCurrency;
    const fareTotal = getConvertedAmount(
      originalTotal,
      origCurrency,
      SELECT_API_CURRENCY,
    );
    const result = {
      fareTotal,
      baseFare: fareTotal * 0.85,
      tax: fareTotal * 0.15,
      currency: SELECT_API_CURRENCY,
    };

    console.log(
      `[FlightCard:FareDebug] getOriginalFareBreakdown (ORIGINAL PRICE) -> flightId=${flight.flightId}, providerTotalFare=${flight.cheapBidApplied?.providerTotalFare}, originalTotal=${flight.cheapBidApplied?.originalTotal}, sourceTotal=${originalTotal} ${origCurrency}, convertedTotal=${fareTotal} USD`,
      result,
    );

    return result;
  };

  const getDisplayFareBreakdown = () => {
    if (confirmationMode && confirmationPricing) {
      return {
        fareTotal: confirmationPricing.total,
        baseFare: confirmationPricing.baseFare,
        tax: confirmationPricing.tax,
        currency: confirmationPricing.currency,
      };
    }

    // For bid flights: use per-pax bid prices (in USD) directly,
    // avoiding the double-conversion that happens when flightFare values
    // (stored in USD) are converted from flightSourceCurrency (display currency).
    if (flight.cheapBidApplied) {
      const bidMeta = flight.cheapBidApplied;
      const adt = Number(searchParams.get("adt") || searchParams.get("adults") || 1);
      const chd = Number(searchParams.get("chd") || searchParams.get("children") || 0);
      const inf = Number(searchParams.get("inf") || searchParams.get("infants") || 0);
      const bidCurrency = (bidMeta as any).currency || "USD";
      const bidTotal =
        adt * Number(bidMeta.bidAdtPrice ?? 0) +
        chd * Number(bidMeta.bidChdPrice ?? bidMeta.bidAdtPrice ?? 0) +
        inf * Number(bidMeta.bidInfPrice ?? 0);
      const fareTotal = getConvertedAmount(bidTotal, bidCurrency, baseCurrency);
      return {
        fareTotal,
        baseFare: fareTotal,
        tax: 0,
        currency: baseCurrency,
      };
    }

    const rawTotal = flight.totalCost || 0;
    let baseP = null;
    let taxP = null;

    const fare = flight.flightFare;
    if (fare) {
      const adt = Number(searchParams.get("adt") || fare.adult || 1);
      const chd = Number(searchParams.get("chd") || fare.child || 0);
      const inf = Number(searchParams.get("inf") || fare.infant || 0);

      const adultUnits = adt + chd * 0.75 + inf * 0.1;
      const totalUnits = adultUnits > 0 ? adultUnits : 1;
      const unitTotal = rawTotal / totalUnits;

      const adultFare = fare.adultFare ?? unitTotal * 0.85;
      const childFare = fare.childFare ?? adultFare * 0.75;
      const infantFare = fare.infantFare ?? adultFare * 0.1;

      const adultTax = fare.adultTax ?? unitTotal * 0.15;
      const childTax = fare.childTax ?? adultTax * 0.75;
      const infantTax = fare.infantTax ?? adultTax * 0.1;

      // EzeeFlights: adultFare is base; taxes are separate (see flightFare.grandTotal).
      const adultBase = adultFare;
      const childBase = childFare;
      const infantBase = infantFare;

      baseP = adt * adultBase + chd * childBase + inf * infantBase;
      taxP = adt * adultTax + chd * childTax + inf * infantTax;
    }

    if (baseP == null) {
      baseP = rawTotal * 0.85;
    }
    if (taxP == null) {
      taxP = rawTotal * 0.15;
    }

    return {
      fareTotal: getConvertedAmount(
        rawTotal,
        flightSourceCurrency,
        baseCurrency,
      ),
      baseFare: getConvertedAmount(baseP, flightSourceCurrency, baseCurrency),
      tax: getConvertedAmount(taxP, flightSourceCurrency, baseCurrency),
      currency: baseCurrency,
    };
  };

  const isExpired = new Date(first.departureDate) < new Date();
  const fareBreakdown = getDisplayFareBreakdown();

  const originalTotalInBase = React.useMemo(() => {
    if (!flight.cheapBidApplied?.originalTotal) return null;
    return getConvertedAmount(
      flight.cheapBidApplied.originalTotal,
      (flight.cheapBidApplied as any).sourceCurrency || "USD",
      baseCurrency,
    );
  }, [flight.cheapBidApplied, baseCurrency, getConvertedAmount]);

  const openAuthModal = useAuthModalStore((state: any) => state.open);

  const handleLockDeal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelecting) return;

    const first = flight.outbound[0];
    const last = flight.outbound[flight.outbound.length - 1];

    const adt = searchParams.get("adt") || "1";
    const chd = searchParams.get("chd") || "0";
    const inf = searchParams.get("inf") || "0";
    const trip = searchParams.get("trip") || "one-way";
    const org = first.fromAirport.code;
    const des = last.toAirport.code;
    const dDate = first.departureDate;

    // Use sourceFlightId (real ID) for the select API call, not the synthetic cheap-bid ID
    const sourceFlightId =
      flight.cheapBidApplied?.sourceFlightId || flight.flightId;
    const bidId = String(
      flight.cheapBidApplied?.bidId ??
        effectiveBidDeal?.id?.replace(/^bid-/, "") ??
        "",
    );

    // Build the itinerary URL for auth redirect
    const itineraryParams = new URLSearchParams();
    const utmSource = searchParams.get("utm_source") || "JetCost";
    const utmMedium = searchParams.get("utm_medium") || "cpc";
    const utmCampaign =
      searchParams.get("utm_campaign") || "flight-search-deeplink";

    itineraryParams.set("utm_source", utmSource);
    itineraryParams.set("utm_medium", utmMedium);
    itineraryParams.set("utm_campaign", utmCampaign);
    itineraryParams.set("org", org);
    itineraryParams.set("des", des);
    itineraryParams.set("dDate", dDate);

    const rDate =
      searchParams.get("rDate") ||
      searchParams.get("returnDate") ||
      (flight.inbound && flight.inbound.length > 0
        ? flight.inbound[0].departureDate.split("T")[0]
        : undefined);
    if (rDate) {
      itineraryParams.set("rDate", rDate);
    }

    itineraryParams.set("adt", adt);
    itineraryParams.set("chld", chd);
    itineraryParams.set("inf", inf);
    itineraryParams.set(
      "cabin",
      searchParams.get("prefClass") || searchParams.get("class") || "Economy",
    );
    itineraryParams.set("searchId", flight.searchId || "");
    itineraryParams.set("tranId", flight.flightId);
    itineraryParams.set("bid", "true");
    itineraryParams.set("bidId", bidId);

    const targetUrl = `/flights/itinerary?${itineraryParams.toString()}`;

    if (!session) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("oauth_redirect_back", targetUrl);
        document.cookie = `oauth_redirect_back=${encodeURIComponent(targetUrl)}; path=/; max-age=300; SameSite=Lax`;
      }
      openAuthModal("login");
      return;
    }

    // Call select API to verify pricing before navigating
    setIsSelecting(true);
    let selectSuccess = true;
    let errorMsg = "";

    try {
      const flightWay = trip === "round-trip" ? 2 : 1;
      const rDateSelect = searchParams.get("rDate") || undefined;

      // Use bid fare for the select API when placing a bid
      const selectFare = getSelectApiFareBreakdown();

      const selectPayload = {
        searchId: flight.searchId ?? "",
        flightId: sourceFlightId,
        from: org,
        to: des,
        depDate: dDate,
        retDate: rDateSelect,
        adults: Number(adt),
        children: Number(chd),
        infants: Number(inf),
        flightWay,
        flightClass: 0,
        currency: selectFare.currency,
        fareTotal: selectFare.fareTotal,
      };

      console.log(
        "[BidFlightCard] Place Bid — Sending Select Payload to Backend (USD):",
        selectPayload,
      );

      const selectBody = await apiFetch<{
        verified: boolean;
        message?: string;
      }>("/flights/select", {
        method: "POST",
        body: JSON.stringify(selectPayload),
      });

      if (!selectBody?.verified) {
        selectSuccess = false;
        errorMsg =
          selectBody?.message ||
          t("Flight price could not be verified. Please search again.");
        console.warn(
          "[BidFlightCard] Place Bid Select API verification failed:",
          selectBody,
        );
      } else {
        console.log(
          "[BidFlightCard] Place Bid Select API verified:",
          selectBody,
        );
      }
    } catch (err: any) {
      selectSuccess = false;
      let errMsgString = err?.message || String(err);
      try {
        const parsed = JSON.parse(errMsgString);
        if (parsed && parsed.message) {
          errMsgString = parsed.message;
        }
      } catch {}
      errorMsg = errMsgString;
      console.warn("[BidFlightCard] Place Bid Select API error:", err);
    } finally {
      setIsSelecting(false);
    }

    if (!selectSuccess) {
      toast({
        title: t("Flight Selection Failed"),
        description:
          errorMsg || t("Could not verify this flight. Please try again."),
        variant: "destructive",
      });
      return;
    }

    setFlights([flight.flightId]);
    setSelectedFlight(flight);
    router.push(targetUrl);
  };

  const handleSelect = async () => {
    if (isSelecting) return;

    const first = flight.outbound[0];
    const last = flight.outbound[flight.outbound.length - 1];

    const adt = searchParams.get("adt") || "1";
    const chd = searchParams.get("chd") || "0";
    const inf = searchParams.get("inf") || "0";
    const trip = searchParams.get("trip") || "one-way";
    const org = searchParams.get("org") || first.fromAirport.code;
    const des = searchParams.get("des") || last.toAirport.code;
    const dDate = searchParams.get("dDate") || first.departureDate;

    const selectFare = getOriginalFareBreakdown();
    const selectFlightId = isCheapBidCard
      ? flight.flightId.split("::cheap-bid-")[0]
      : flight.flightId;

    const params = new URLSearchParams(searchParams.toString());
    params.set("id", selectFlightId);

    const rDateVal =
      params.get("rDate") ||
      params.get("returnDate") ||
      (flight.inbound && flight.inbound.length > 0
        ? flight.inbound[0].departureDate.split("T")[0]
        : undefined);
    if (rDateVal) {
      params.set("rDate", rDateVal);
    }

    applyFlightBookingCabinParams(params, searchParams);

    const targetUrl = `/flights/itinerary?${params.toString()}`;

    if (!session) {
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("oauth_redirect_back", targetUrl);
        document.cookie = `oauth_redirect_back=${encodeURIComponent(targetUrl)}; path=/; max-age=300; SameSite=Lax`;
      }
      openAuthModal("login");
      return;
    }

    setIsSelecting(true);
    let selectSuccess = true;
    let errorMsg = "";

    try {
      // Build the Select payload from search params + flight data
      const flightWay = trip === "round-trip" ? 2 : 1;
      const rDate = searchParams.get("rDate") || undefined;

      const selectPayload = {
        searchId: flight.searchId ?? "",
        flightId: selectFlightId,
        from: org,
        to: des,
        depDate: dDate,
        retDate: rDate,
        adults: Number(adt),
        children: Number(chd),
        infants: Number(inf),
        flightWay,
        flightClass: 0,
        bidId: flight.cheapBidApplied?.bidId ? Number(flight.cheapBidApplied.bidId) : undefined,
        currency: selectFare.currency,
        // Price verification in USD (base currency) — must match cached offer
        fareTotal: selectFare.fareTotal,
      };

      console.log(
        "[FlightCard] Sending Select Payload to Backend (USD):",
        selectPayload,
      );

      const selectBody = await apiFetch<{
        verified: boolean;
        message?: string;
      }>("/flights/select", {
        method: "POST",
        body: JSON.stringify(selectPayload),
      });

      if (!selectBody?.verified) {
        selectSuccess = false;
        errorMsg =
          selectBody?.message ||
          t("Flight price could not be verified. Please search again.");
        console.warn(
          "[FlightCard] Select API verification failed:",
          selectBody,
        );
      } else {
        console.log("[FlightCard] Select API verified:", selectBody);
      }
    } catch (err: any) {
      selectSuccess = false;
      let errMsgString = err?.message || String(err);
      try {
        const parsed = JSON.parse(errMsgString);
        if (parsed && parsed.message) {
          errMsgString = parsed.message;
        }
      } catch {}
      errorMsg = errMsgString;
      console.warn("[FlightCard] Select API error:", err);
    } finally {
      setIsSelecting(false);
    }

    if (!selectSuccess) {
      toast({
        title: t("Flight Selection Failed"),
        description:
          errorMsg || t("Could not select this flight. Please try again."),
        variant: "destructive",
      });
      return;
    }
    const selectedFlightObj: FlightListItem = isCheapBidCard
      ? {
          ...flight,
          flightId: selectFlightId,
          totalCost: selectFare.fareTotal,
          baseFare: selectFare.baseFare,
          flightFare: {
            ...(flight.flightFare ?? {
              adultFare: selectFare.baseFare,
              adultTax: selectFare.tax,
              grandTotal: selectFare.fareTotal,
            }),
            grandTotal: selectFare.fareTotal,
            adultFare: selectFare.baseFare,
            adultTax: selectFare.tax,
          },
          cheapBidApplied: undefined,
        }
      : flight;

    setFlights([selectFlightId]);
    setSelectedFlight(selectedFlightObj);

    // Build final booking/itinerary URL (itinerary per the requested metasearch deep link pattern)
    const itineraryParams = new URLSearchParams();

    const utmSource = searchParams.get("utm_source") || "JetCost";
    const utmMedium = searchParams.get("utm_medium") || "cpc";
    const utmCampaign =
      searchParams.get("utm_campaign") || "flight-search-deeplink";

    itineraryParams.set("utm_source", utmSource);
    itineraryParams.set("utm_medium", utmMedium);
    itineraryParams.set("utm_campaign", utmCampaign);
    itineraryParams.set("org", org);
    itineraryParams.set("des", des);
    itineraryParams.set("dDate", dDate);

    const rDateBooking =
      searchParams.get("rDate") ||
      searchParams.get("returnDate") ||
      (flight.inbound && flight.inbound.length > 0
        ? flight.inbound[0].departureDate.split("T")[0]
        : undefined);
    if (rDateBooking) {
      itineraryParams.set("rDate", rDateBooking);
    }

    itineraryParams.set("adt", adt);
    itineraryParams.set("chld", chd);
    itineraryParams.set("inf", inf);
    itineraryParams.set(
      "cabin",
      searchParams.get("prefClass") || searchParams.get("class") || "Economy",
    );
    itineraryParams.set("searchId", flight.searchId || "");
    itineraryParams.set("tranId", selectFlightId);

    router.push(`/flights/itinerary?${itineraryParams.toString()}`);
  };

  const originalFlightFare = React.useMemo(() => {
    if (!flight.cheapBidApplied) return flight.flightFare;
    const cb = flight.cheapBidApplied;
    const gdsCurrency = (cb as any).sourceCurrency || "USD";
    const conv = (amount: number) => getConvertedAmount(amount, "USD", gdsCurrency);

    return {
      adult: adtCount,
      child: chdCount,
      infant: infCount,
      adultFare: cb.originalAdtPrice != null ? conv(Number(cb.originalAdtPrice)) : 0,
      childFare: cb.originalChdPrice != null ? conv(Number(cb.originalChdPrice)) : (cb.originalAdtPrice != null ? conv(Number(cb.originalAdtPrice)) : 0),
      infantFare: cb.originalInfPrice != null ? conv(Number(cb.originalInfPrice)) : 0,
      adultTax: 0,
      childTax: 0,
      infantTax: 0,
      grandTotal: cb.originalTotal,
    };
  }, [flight.cheapBidApplied, flight.flightFare, adtCount, chdCount, infCount, getConvertedAmount]);

  const renderFareBreakdownBlock = () => {
    const useOriginalInDetails = isCheapBidCard && !showBidPrice;

    return (
      <div className="w-full space-y-1.5 p-0 rounded-xl md:p-3">
        <p className="text-sm font-semibold text-foreground tracking-wider mb-1 border-b border-border/50 pb-1">
          {t("Fare Breakdown")}
        </p>
        <div className="space-y-1.5 text-xs">
          <PassengerFareBreakdown
            flightFare={
              useOriginalInDetails ? originalFlightFare : flight.flightFare
            }
            searchParams={searchParams}
            targetTotal={
              useOriginalInDetails && originalTotalInBase
                ? originalTotalInBase
                : fareBreakdown.fareTotal
            }
            sourceCurrency={useOriginalInDetails ? ((flight.cheapBidApplied as any)?.sourceCurrency || "USD") : flightSourceCurrency}
            displayCurrency={baseCurrency}
            formatPrice={formatCardPrice}
            getConvertedAmount={getConvertedAmount}
            className="space-y-1.5"
            compact
            cheapBidApplied={null}
          />
          <div className="border-t border-dashed border-border/50 pt-1.5 flex justify-between items-start gap-2 font-bold">
            <span className="text-foreground shrink-0">{t("Total")}</span>
            <div className="flex flex-col items-end min-w-0">
              {useOriginalInDetails && originalTotalInBase ? (
                <>
                  <span className="text-foreground/90 text-xs break-all text-right animate-in fade-in duration-300">
                    {formatCardPrice(originalTotalInBase)}
                  </span>
                  {baseCurrency !== "USD" && (
                    <span className="text-xs font-semibold text-foreground/90 text-right animate-in fade-in duration-300">
                      approx. $
                      {getConvertedAmount(
                        flight.cheapBidApplied?.originalTotal || 0,
                        (flight.cheapBidApplied as any)?.sourceCurrency || "USD",
                        "USD",
                      ).toFixed(2)} USD
                    </span>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 flex-wrap justify-end animate-in fade-in duration-300">
                    {originalTotalInBase &&
                      originalTotalInBase > fareBreakdown.fareTotal &&
                      !isCheapBidCard && (
                        <span className="text-muted-foreground line-through text-xs font-semibold text-right break-all">
                          {formatCardPrice(originalTotalInBase)}
                        </span>
                      )}
                    <span
                      className={cn(
                        "text-xs break-all text-right",
                        isCheapBidCard
                          ? "text-redmix font-bold"
                          : "text-foreground",
                      )}
                    >
                      {formatCardPrice(fareBreakdown.fareTotal)}
                    </span>
                  </div>
                  {baseCurrency !== "USD" && (
                    <span className="text-xs font-semibold text-foreground/90 text-right animate-in fade-in duration-300">
                      approx.{" "}
                      {flight.cheapBidApplied?.originalTotal &&
                        !isCheapBidCard && (
                          <span className="line-through text-muted-foreground mr-1">
                            ${flight.cheapBidApplied.originalTotal.toFixed(2)}
                          </span>
                        )}
                      $
                      {getConvertedAmount(
                        fareBreakdown.fareTotal,
                        fareBreakdown.currency,
                        "USD",
                      ).toFixed(2)}{" "}
                      USD
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailsContent = () => {
    return (
      <div className="space-y-0 md:space-y-4 text-xs normal-case tracking-normal">
        {/* Outbound Timeline */}
        <div>
          <h4 className="text-xs font-bold text-foreground tracking-wider mb-2 md:mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-redmix" />
            {t("Outbound Flight")}
          </h4>
          <div className="space-y-4 relative pl-4 border-l border-dashed border-border ml-2">
            {flight.outbound.map((segment, idx) => {
              const depTime = fmtTime(segment.departureDate, locale);
              const arrTime = fmtTime(segment.arrivalDate, locale);
              const depDate = new Date(
                segment.departureDate,
              ).toLocaleDateString(locale, {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              const arrDate = new Date(segment.arrivalDate).toLocaleDateString(
                locale,
                { weekday: "short", month: "short", day: "numeric" },
              );
              const showLayover = idx < flight.outbound.length - 1;
              let layoverText = "";
              if (showLayover) {
                const nextSeg = flight.outbound[idx + 1];
                const diffMs =
                  new Date(nextSeg.departureDate).getTime() -
                  new Date(segment.arrivalDate).getTime();
                const diffMins = Math.round(diffMs / 60000);
                const toCity =
                  airportNames[segment.toAirport.code] ||
                  segment.toAirport.cityName ||
                  segment.toAirport.name;
                layoverText = `${durationFmt(diffMins)} layover in ${toCity} (${segment.toAirport.code})`;
              }

              return (
                <div key={idx} className="relative space-y-2">
                  {/* Circle marker on timeline */}
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-card border-2 border-redmix" />

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground">
                      {segment.airline.name} • {segment.flightNo}
                    </span>
                    <span className="px-1.5 py-0.5 rounded-full bg-muted font-semibold text-xs capitalize text-redmix/80">
                      {segment.cabinClass}
                    </span>
                    {segment.operatingAirline &&
                      segment.operatingAirline.name &&
                      segment.operatingAirline.name !==
                        segment.airline.name && (
                        <span className="text-xs text-foreground">
                          {t("Operated by")} {segment.operatingAirline.name}
                        </span>
                      )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                    <div>
                      <p className="text-foreground/90 font-medium">
                        {t("Departure")}
                      </p>
                      <p className="font-bold text-foreground/90">
                        {depTime} — {depDate}
                      </p>
                      <p className="text-foreground/90 font-semibold">
                        {airportNames[segment.fromAirport.code] ||
                          segment.fromAirport.name}{" "}
                        ({segment.fromAirport.code})
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/90 font-medium">
                        {t("Arrival")}
                      </p>
                      <p className="font-bold text-foreground/90">
                        {arrTime} — {arrDate}
                      </p>
                      <p className="text-foreground/90 font-semibold">
                        {airportNames[segment.toAirport.code] ||
                          segment.toAirport.name}{" "}
                        ({segment.toAirport.code})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-foreground/90 pt-1 pl-1">
                    <span>
                      {t("Aircraft")}:{" "}
                      <strong className="text-foreground/90">
                        {segment.equipmentType || t("N/A")}
                      </strong>
                    </span>
                    <span>
                      {t("Baggage")}:{" "}
                      <strong className="text-foreground/90">
                        {segment.baggageAllowance || t("N/A")}
                      </strong>
                    </span>
                    {segment.elapsedTime && (
                      <span>
                        {t("Duration")}:{" "}
                        <strong className="text-foreground/90">
                          {segment.elapsedTime}
                        </strong>
                      </span>
                    )}
                  </div>

                  {showLayover && (
                    <div className="my-3 py-1.5 w-full px-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5 shadow-sm w-fit">
                      <Coffee className="w-3.5 h-3.5" />
                      {layoverText}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Inbound Timeline */}
        {flight.inbound && flight.inbound.length > 0 && (
          <div className="pt-4 border-t border-dashed border-border">
            <h4 className="text-xs font-bold text-foreground tracking-wider mb-2 md:mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {t("Return Flight")}
            </h4>
            <div className="space-y-4 relative md:pl-4 border-l border-dashed border-border ml-0 md:ml-2">
              {flight.inbound.map((segment, idx) => {
                const depTime = fmtTime(segment.departureDate, locale);
                const arrTime = fmtTime(segment.arrivalDate, locale);
                const depDate = new Date(
                  segment.departureDate,
                ).toLocaleDateString(locale, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                const arrDate = new Date(
                  segment.arrivalDate,
                ).toLocaleDateString(locale, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                const showLayover = idx < flight.inbound.length - 1;
                let layoverText = "";
                if (showLayover) {
                  const nextSeg = flight.inbound[idx + 1];
                  const diffMs =
                    new Date(nextSeg.departureDate).getTime() -
                    new Date(segment.arrivalDate).getTime();
                  const diffMins = Math.round(diffMs / 60000);
                  const toCity =
                    airportNames[segment.toAirport.code] ||
                    segment.toAirport.cityName ||
                    segment.toAirport.name;
                  layoverText = `${durationFmt(diffMins)} layover at ${toCity} (${segment.toAirport.code})`;
                }

                return (
                  <div key={idx} className="relative space-y-2">
                    {/* Circle marker on timeline */}
                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-card border-2 border-emerald-500" />

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground">
                        {segment.airline.name} • {segment.flightNo}
                      </span>
                      <span className="px-1.5 py-0.5 rounded-full bg-muted font-semibold text-xs capitalize text-redmix/80">
                        {segment.cabinClass}
                      </span>
                      {segment.operatingAirline &&
                        segment.operatingAirline.name &&
                        segment.operatingAirline.name !==
                          segment.airline.name && (
                          <span className="text-xs text-foreground">
                            {t("Operated by")} {segment.operatingAirline.name}
                          </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                      <div>
                        <p className="text-foreground/90 font-medium">
                          {t("Departure")}
                        </p>
                        <p className="font-bold text-foreground/90">
                          {depTime} — {depDate}
                        </p>
                        <p className="text-foreground/90 font-semibold">
                          {airportNames[segment.fromAirport.code] ||
                            segment.fromAirport.name}{" "}
                          ({segment.fromAirport.code})
                        </p>
                      </div>
                      <div>
                        <p className="text-foreground/90 font-medium">
                          {t("Arrival")}
                        </p>
                        <p className="font-bold text-foreground/90">
                          {arrTime} — {arrDate}
                        </p>
                        <p className="text-foreground/90 font-semibold">
                          {airportNames[segment.toAirport.code] ||
                            segment.toAirport.name}{" "}
                          ({segment.toAirport.code})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-foreground/90 pt-1 pl-1">
                      <span>
                        {t("Aircraft")}:{" "}
                        <strong className="text-foreground/90">
                          {segment.equipmentType || t("N/A")}
                        </strong>
                      </span>
                      <span>
                        {t("Baggage")}:{" "}
                        <strong className="text-foreground/90">
                          {segment.baggageAllowance || t("N/A")}
                        </strong>
                      </span>
                      {segment.elapsedTime && (
                        <span>
                          {t("Duration")}:{" "}
                          <strong className="text-foreground/90">
                            {segment.elapsedTime}
                          </strong>
                        </span>
                      )}
                    </div>

                    {showLayover && (
                      <div className="my-3 py-1.5 px-3 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1.5 shadow-sm w-fit">
                        <Coffee className="w-3.5 h-3.5" />
                        {layoverText}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderExpandedDetails = () => (
    <>
      {renderDetailsContent()}
      {!confirmationMode && (
        <div className="mt-6 pt-4 border-t border-border/40">
          {renderFareBreakdownBlock()}
        </div>
      )}
    </>
  );

  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-white dark:bg-card shadow-sm transition-all mb-3 group",
        !!flight.cheapBidApplied &&
          !confirmationMode &&
          "border-redmix/30 ring-1 ring-redmix/10",
        confirmationMode && "mb-0 shadow-none border-border/50 rounded-[10px]",
        isExpired && !confirmationMode && !previewMode
          ? "opacity-60 pointer-events-none grayscale-[0.2]"
          : !confirmationMode && "hover:shadow-md",
      )}
    >
      {/* Cheap Bid header */}
      {showCheapBidHeader && (
        <div className="bg-redmix/[0.03] border-b border-redmix/10 p-3 lg:px-5 lg:py-3 flex items-center gap-4 flex-wrap">
          <div className="bg-redmix text-white p-2.5 rounded-full shadow-lg shadow-redmix/20 shrink-0">
            <Ticket className="w-5 h-5" />
          </div>

          <div className="flex flex-col gap-0.5 min-w-0">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
              <span className="text-xs font-semibold tracking-wide text-redmix">
                {t("Cheap Bid")}
              </span>
              <span className="hidden sm:inline h-1 w-1 rounded-full bg-border shrink-0" />
              <span className="text-xs font-semibold text-foreground/80 tracking-tight">
                {t("Lowest Price Guaranteed")}
              </span>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-6 ml-auto">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-foreground/80 tracking-tight">
                {t("24h Window")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-semibold text-foreground/80 tracking-tight">
                {t("Fully Refundable")}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Wishlist Heart (Floating - Hidden if Bit Deal header is present to avoid double heart) */}
      {/* {!confirmationMode && !(isLowestPrice && bidDeal) && (
        <button
          onClick={handleToggleWishlist}
          className="absolute right-3 top-3 xl:right-4 xl:top-4 z-20 rounded-full bg-background/90 p-2 backdrop-blur-md shadow-none xl:shadow-sm transition-all active:scale-95 border border-border/40 xl:border-border/50 pointer-events-auto"
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isWishlisted
                ? "fill-redmix text-redmix"
                : "dark:text-background text-foreground",
            )}
          />
        </button>
      )} */}
      {isAdmin && !previewMode && !confirmationMode && !isCheapBidCard && (
          <div
            className={cn(
              "absolute right-3 top-3 xl:right-4 xl:top-4 z-10 transition-opacity pointer-events-auto",
              menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-full bg-redmix text-white shadow-md flex items-center justify-center hover:bg-redmix/90 active:scale-95 transition-all">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-44 rounded-xl shadow-lg p-1"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    localStorage.setItem(
                      "prefill_cheap_bid",
                      JSON.stringify(flight),
                    );
                    router.push("/dashboard?tab=cheap-bid");
                  }}
                  className="flex items-center gap-2 cursor-pointer font-semibold text-xs py-2 px-3 rounded-lg text-foreground hover:bg-muted"
                >
                  <Tag className="w-3.5 h-3.5 text-redmix" />
                  Try BID
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsJetcostModalOpen(true);
                  }}
                  className="flex items-center gap-2 cursor-pointer font-semibold text-xs py-2 px-3 rounded-lg text-foreground hover:bg-muted"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Try Jetcost
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      <div className="flex flex-col xl:flex-row">
        {/* Left: Content */}
        <div className="flex-1 px-4 xl:px-5 py-1 xl:py-3">
          <div className="flex items-start justify-between mb-3 xl:mb-2 pr-10 xl:pr-0">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 xl:h-10 xl:w-10 rounded-full xl:rounded-lg bg-background dark:bg-muted/50 p-1.5 xl:p-1 border border-border/40 xl:border-border/50 flex items-center justify-center shrink-0">
                <AirlineLogo
                  code={first.airline.code}
                  name={first.airline.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] xl:text-sm font-semibold xl:font-bold text-foreground truncate">
                  {first.airline.name}
                </p>
                <p className="text-[11px] xl:text-[10px] text-foreground/80 xl:text-foreground font-semibold xl:font-bold tracking-wide xl:tracking-widest">
                  {first.flightNo || `EF-${flight.flightId.slice(0, 4)}`}
                </p>
              </div>
            </div>
            {isExpired && !previewMode ? (
              <span className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {t("Expired")}
              </span>
            ) : badge && !confirmationMode && !previewMode ? (
              <span
                className={cn(
                  "rounded-full xl:rounded-md px-2.5 xl:px-2 py-0.5 text-[10px] font-semibold xl:font-bold uppercase tracking-tight",
                  badge.className,
                )}
              >
                {t(badge.label)}
              </span>
            ) : null}
          </div>

          <FlightLeg
            from={first.fromAirport.code}
            fromName={first.fromAirport.name}
            fromTime={fmtTime(first.departureDate, locale)}
            fromIso={first.departureDate}
            to={last.toAirport.code}
            toName={last.toAirport.name}
            toTime={fmtTime(last.arrivalDate, locale)}
            durationMins={calculateLegDuration(flight.outbound)}
            stops={stops}
            stopCodes={flight.outbound
              .slice(0, -1)
              .map((s) => s.toAirport.code)}
            overnight={overnight}
          />

          {((flight.inbound && flight.inbound.length > 0) ||
            searchParams.get("trip") === "round-trip" ||
            searchParams.get("rDate")) && (
            <div className="mt-4 pt-4 border-t border-dashed border-border">
              <FlightLeg
                from={
                  flight.inbound?.[0]?.fromAirport?.code || last.toAirport.code
                }
                fromName={
                  flight.inbound?.[0]?.fromAirport?.name || last.toAirport.name
                }
                fromTime={
                  flight.inbound?.[0]
                    ? fmtTime(flight.inbound[0].departureDate, locale)
                    : "20:45"
                }
                fromIso={
                  flight.inbound?.[0]?.departureDate ||
                  (searchParams.get("rDate")
                    ? `${searchParams.get("rDate")}T20:45:00`
                    : new Date().toISOString())
                }
                to={
                  flight.inbound?.[flight.inbound.length - 1]?.toAirport
                    ?.code || first.fromAirport.code
                }
                toName={
                  flight.inbound?.[flight.inbound.length - 1]?.toAirport
                    ?.name || first.fromAirport.name
                }
                toTime={
                  flight.inbound?.[flight.inbound.length - 1]
                    ? fmtTime(
                        flight.inbound[flight.inbound.length - 1].arrivalDate,
                        locale,
                      )
                    : "01:30"
                }
                durationMins={
                  flight.inbound && flight.inbound.length > 0
                    ? calculateLegDuration(flight.inbound)
                    : flight.totalTime
                }
                stops={
                  flight.inbound?.[0]
                    ? Math.max(0, flight.inbound.length - 1)
                    : stops
                }
                stopCodes={
                  flight.inbound?.[0]
                    ? flight.inbound.slice(0, -1).map((s) => s.toAirport.code)
                    : flight.outbound.slice(0, -1).map((s) => s.toAirport.code)
                }
              />
            </div>
          )}

          {/* <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-foreground tracking-wider">
            <span>{first.cabinClass}</span>
            <span>•</span>
            <span>{first.baggageAllowance || "15kg Bag"}</span>
          </div> */}

          {!confirmationMode && (
            <Accordion
              type="single"
              collapsible
              defaultValue={previewMode ? "details" : undefined}
              className="mt-0 border-t border-border/40 hidden xl:block"
            >
              <AccordionItem value="details" className="border-b-0">
                <AccordionTrigger className="text-xs font-medium text-foreground tracking-wider hover:no-underline flex justify-center gap-2">
                  {t("View Flight Details")}
                </AccordionTrigger>
                <AccordionContent className="pt-0 px-4">
                  {renderExpandedDetails()}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>

        {/* Right: price & select */}
        {!confirmationMode && (
          <div className="w-full xl:w-48 shrink-0 border-t border-border/50 xl:dark:bg-muted/20 xl:border-t-0 xl:border-l xl:border-border px-4 py-3.5 xl:p-3 flex flex-row xl:flex-col justify-between xl:justify-center items-center gap-3">
            <div className="text-left xl:text-center min-w-0 flex-1 xl:flex-none">
              <p className="text-[11px] xl:text-xs font-medium xl:font-semibold capitalize text-foreground/80 xl:text-foreground mb-0.5 xl:mb-1">
                {totalPax > 1
                  ? `${t("Total")} · ${totalPax} ${t("Passengers")}`
                  : t("Total")}
              </p>
              {showBidPrice ? (
                <div className="flex flex-col xl:items-center items-start">
                  <CurrencyDisplay
                    amount={fareBreakdown.fareTotal}
                    currency={fareBreakdown.currency}
                    className="items-start xl:items-center"
                    amountClassName="text-[22px] xl:text-xl font-bold xl:font-black text-redmix animate-in fade-in duration-300"
                    symbolClassName="text-[15px] xl:text-sm font-semibold xl:font-bold text-redmix"
                    showComparison={false}
                  />
                  {baseCurrency !== "USD" && (
                    <p className="text-[10px] font-medium xl:font-semibold text-foreground/80 xl:text-foreground/90 mt-0.5 whitespace-nowrap">
                      ({t("approx.")} $
                      {getConvertedAmount(
                        fareBreakdown.fareTotal,
                        fareBreakdown.currency,
                        "USD",
                      ).toFixed(2)}{" "}
                      USD)
                    </p>
                  )}
                  {isCheapBidCard && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBidPrice(false);
                      }}
                      className="mt-1.5 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold underline pointer-events-auto cursor-pointer transition-colors"
                    >
                      {t("View Original Prices")}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col xl:items-center items-start">
                  <CurrencyDisplay
                    amount={originalTotalInBase || fareBreakdown.fareTotal}
                    currency={fareBreakdown.currency}
                    className="items-start xl:items-center"
                    amountClassName="text-[22px] xl:text-xl font-bold xl:font-black animate-in fade-in duration-300"
                    symbolClassName="text-[15px] xl:text-sm font-semibold xl:font-bold text-foreground/80"
                    showComparison={false}
                  />
                  {baseCurrency !== "USD" && (
                    <p className="text-[10px] font-medium xl:font-semibold text-foreground/80 xl:text-foreground/90 mt-0.5 whitespace-nowrap">
                      ({t("approx.")} $
                      {getConvertedAmount(
                        originalTotalInBase || fareBreakdown.fareTotal,
                        fareBreakdown.currency,
                        "USD",
                      ).toFixed(2)}{" "}
                      USD)
                    </p>
                  )}
                  {isCheapBidCard && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBidPrice(true);
                      }}
                      className="mt-1.5 text-xs text-redmix hover:text-red-700 font-semibold underline pointer-events-auto cursor-pointer flex items-center gap-1 xl:justify-center transition-colors group/toggle"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-pulse group-hover/toggle:scale-110 transition-transform" />
                      {t("View Bid Prices")}
                    </button>
                  )}
                </div>
              )}
              {/* {totalPax > 1 && (
                <p className="text-[11px] xl:text-xs font-medium xl:font-semibold text-foreground/80 xl:text-foreground/90 mt-1 leading-snug xl:leading-none">
                  {totalPax} {t("Passengers")} · {t("Includes taxes and fees")}
                </p>
              )} */}
              {/* {totalPax <= 1 && (
                <p className="text-[11px] xl:text-xs font-medium text-foreground/80 mt-1 xl:mt-1.5 leading-none">
                  {t("Includes taxes and fees")}
                </p>
              )} */}
            </div>
            {isBooked ? (
              <Button
                className="w-auto xl:w-full min-w-[100px] bg-emerald-600/10 text-redmix dark:text-white font-semibold xl:font-bold h-10 xl:h-11 rounded-[10px] xl:rounded-xl shadow-none hover:bg-emerald-600/20 transition-all pointer-events-auto border border-emerald-600/30"
                onClick={() => {
                  setFlights([flight.flightId]);
                  setSelectedFlight(flight);
                  const params = new URLSearchParams(searchParams.toString());
                  params.set("id", flight.flightId);
                  applyFlightBookingCabinParams(params, searchParams);

                  const rDateVal =
                    params.get("rDate") ||
                    params.get("returnDate") ||
                    (flight.inbound && flight.inbound.length > 0
                      ? flight.inbound[0].departureDate.split("T")[0]
                      : undefined);
                  if (rDateVal) {
                    params.set("rDate", rDateVal);
                  }

                  router.push(`/flights/booking?${params.toString()}`);
                }}
              >
                {t("Booked")}
              </Button>
            ) : isExpired && !previewMode ? (
              <Button
                disabled
                className="w-auto xl:w-full min-w-[100px] bg-foreground/10 dark:bg-foreground/10 text-foreground/50 font-semibold xl:font-bold h-10 xl:h-11 rounded-[10px] xl:rounded-xl shadow-none pointer-events-none uppercase text-xs"
              >
                {t("Expired")}
              </Button>
            ) : !previewMode ? (
              <div className="relative group/select-btn flex items-center justify-center w-auto xl:w-full shrink-0">
                {showBidPrice ? (
                  <Button
                    className="w-full min-w-[100px] bg-redmix text-white font-semibold xl:font-bold text-[15px] xl:text-sm h-10 xl:h-11 rounded-[10px] xl:rounded-xl shadow-none xl:shadow-lg xl:shadow-redmix/20 hover:brightness-110 active:scale-[0.97] xl:active:scale-[0.98] transition-all pointer-events-auto cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isSelecting}
                    onClick={handleLockDeal}
                  >
                    {isSelecting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        {t("Selecting...")}
                      </span>
                    ) : (
                      <>
                        <Ticket className="w-3.5 h-3.5 mr-1.5 inline xl:hidden" />
                        {t("Place Bid")}
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    className="w-full min-w-[100px] bg-redmix text-white font-semibold xl:font-bold text-[15px] xl:text-sm h-10 xl:h-11 rounded-[10px] xl:rounded-xl shadow-none xl:shadow-lg xl:shadow-redmix/20 hover:brightness-110 active:scale-[0.97] xl:active:scale-[0.98] transition-all pointer-events-auto cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isSelecting}
                    onClick={handleSelect}
                  >
                    {isSelecting ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                          />
                        </svg>
                        {t("Selecting...")}
                      </span>
                    ) : (
                      t("Select")
                    )}
                  </Button>
                )}
                <div className="absolute top-full mt-2 right-0 opacity-0 group-hover/select-btn:opacity-100 pointer-events-none transition-opacity duration-200 z-50 rounded-lg border border-border bg-popover px-3 py-1.5 text-center text-xs font-semibold text-popover-foreground shadow-md w-max max-w-[220px]">
                  {showBidPrice
                    ? t("Lock in this fare with a fully refundable deposit.")
                    : t("Proceed to book this flight.")}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <Accordion
          type="single"
          collapsible
          defaultValue={previewMode ? "details" : undefined}
          className="mt-0 border-t border-border/50 xl:hidden block"
        >
          <AccordionItem
            value="details"
            className="border-b-0 hover:border-transparent data-[state=open]:bg-transparent data-[state=open]:border-transparent"
          >
            <AccordionTrigger className="text-[15px] font-normal text-redmix tracking-normal hover:no-underline flex justify-between gap-2 px-4 py-3.5 [&>span]:flex-1 [&>span]:justify-start [&>span]:font-normal [&>div]:bg-transparent [&>div]:shadow-none [&>div]:w-5 [&>div]:h-5 [&>div]:text-redmix/70 [&>div]:group-hover:bg-transparent [&>div]:group-hover:text-redmix [&[data-state=open]]:text-redmix">
              {t("View Flight Details")}
            </AccordionTrigger>
            <AccordionContent className="pt-1 px-4 pb-4 text-foreground/90 font-normal">
              {renderExpandedDetails()}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {isAdmin && isJetcostModalOpen && (
          <JetcostAddRuleModal
            isOpen={isJetcostModalOpen}
            onOpenChange={setIsJetcostModalOpen}
            initialForm={flightToJetcostForm(flight)}
            isPrefilled={true}
          />
        )}
      </div>
    </article>
  );
}

/* ── Leg Row ─────────────────────────────────────────── */
interface LegProps {
  from: string;
  fromName: string;
  fromTime: string;
  fromIso: string;
  to: string;
  toName: string;
  toTime: string;
  durationMins: number;
  stops: number;
  stopCodes?: string[];
  overnight?: boolean;
}

export function FlightLeg({
  from,
  fromName,
  fromTime,
  fromIso,
  to,
  toName,
  toTime,
  durationMins,
  stops,
  stopCodes = [],
  overnight,
}: LegProps) {
  const { t } = useTranslation();
  const [fromCity, setFromCity] = React.useState("");
  const [toCity, setToCity] = React.useState("");
  const [stopCities, setStopCities] = React.useState<string[]>([]);

  const stopCodesStr = stopCodes.join(",");

  React.useEffect(() => {
    const resolveNames = async () => {
      const f = await getAirportByCode(from);
      if (f) setFromCity(f.municipality || f.name.split(" ")[0]);

      const t = await getAirportByCode(to);
      if (t) setToCity(t.municipality || t.name.split(" ")[0]);

      if (stops > 0 && stopCodes.length > 0) {
        const resolvedCities = await Promise.all(
          stopCodes.map(async (code) => {
            const s = await getAirportByCode(code);
            return s ? s.municipality || s.name.split(" ")[0] : "";
          }),
        );
        setStopCities(resolvedCities.filter(Boolean));
      }
    };
    resolveNames();
  }, [from, to, stopCodesStr, stops]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 xl:gap-4">
      <div className="flex items-center justify-between gap-2 sm:gap-4 flex-1 w-full">
        <div className="min-w-[70px]">
          <p className="text-[17px] sm:text-lg font-semibold xl:font-bold leading-none whitespace-nowrap tracking-tight">
            {fromTime}
            <span className="hidden sm:inline ml-0.5">
              {getTimeEmoji(fromIso)}
            </span>
          </p>
          <p className="text-[11px] xl:text-xs font-semibold xl:font-bold text-foreground mt-1 truncate max-w-[80px] sm:max-w-[120px] flex items-center gap-1 flex-wrap">
            {from}{" "}
            {fromCity && (
              <span className="text-foreground/80 xl:text-foreground font-medium ml-0.5 xl:ml-1">
                {fromCity}
              </span>
            )}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center px-1 sm:px-4 relative group/path min-w-[90px] sm:min-w-[100px]">
          <div className="text-[11px] xl:text-xs font-semibold xl:font-bold text-foreground/80 xl:text-foreground mb-1 flex items-center gap-1 whitespace-nowrap">
            <span>{durationFmt(durationMins)}</span>
            <span className="hidden sm:inline">
              {getDurationEmoji(durationMins)}
            </span>
          </div>

          <div className="w-full flex items-center gap-1.5">
            <div className="h-px xl:h-0.5 flex-1 bg-border/70 xl:bg-border rounded-full" />
            {stops > 0 ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-redmix shrink-0" />
                <div className="h-px xl:h-0.5 flex-1 bg-border/70 xl:bg-border rounded-full" />
              </>
            ) : null}
          </div>

          <div className="mt-1 w-full text-center">
            <span
              className={cn(
                "text-[10px] sm:text-xs font-medium xl:font-semibold uppercase tracking-wide xl:tracking-wider block",
                stops === 0
                  ? "text-emerald-600"
                  : "text-foreground/80 xl:text-foreground",
              )}
            >
              {stops === 0 ? (
                t("Direct")
              ) : (
                <div className="flex flex-col items-center leading-tight sm:leading-none gap-0.5 w-full">
                  <span className="whitespace-nowrap normal-case xl:uppercase font-medium xl:font-semibold">
                    {stops} {stops > 1 ? t("Stops") : t("Stop")} (
                    {stopCodes.join(" → ")})
                  </span>
                  {stopCities.length > 0 && (
                    <span className="text-[10px] font-medium text-foreground/70 xl:text-foreground truncate w-full max-w-[100px] sm:max-w-[150px] normal-case">
                      ({stopCities.join(" → ")})
                    </span>
                  )}
                </div>
              )}
            </span>
          </div>
        </div>

        <div className="min-w-[70px] text-right">
          <p className="text-[17px] sm:text-lg font-semibold xl:font-bold leading-none whitespace-nowrap tracking-tight">
            {toTime}
          </p>
          <div className="flex items-center justify-end gap-1 mt-1 flex-wrap">
            <p className="text-[11px] xl:text-xs font-semibold xl:font-bold text-foreground truncate max-w-[80px] sm:max-w-[120px] flex items-center gap-1 flex-wrap justify-end">
              {to}{" "}
              {toCity && (
                <span className="text-foreground/80 xl:text-foreground font-medium mr-0.5 xl:mr-1">
                  {toCity}
                </span>
              )}{" "}
            </p>
            {overnight && (
              <span className="text-[10px] font-bold text-redmix dark:text-white whitespace-nowrap">
                {t("+1d")}
              </span>
            )}
          </div>
        </div>

        {/* Baggage Icons - Right Aligned as in image */}
        <div className="hidden sm:flex items-center gap-2 px-2 border-l border-border/50 ml-2">
          <div className="relative group/bag">
            <Briefcase className="h-4 w-4 text-muted-foreground/60" />
            <Check className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-emerald-500 text-white rounded-full p-0.5" />
          </div>
          <div className="relative group/bag">
            <Luggage className="h-4 w-4 text-muted-foreground/60" />
            <Check className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-emerald-500 text-white rounded-full p-0.5" />
          </div>
          <div className="relative group/bag opacity-40">
            <Luggage className="h-4 w-4 text-muted-foreground/60" />
            <XIcon className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-muted-foreground text-white rounded-full p-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
