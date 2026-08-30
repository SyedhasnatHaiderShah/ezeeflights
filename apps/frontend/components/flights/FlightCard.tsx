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
import { isUSDomain } from "@/lib/utils/domain";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useIsAdmin } from "@/lib/hooks/use-is-admin";
import { cn } from "@/lib/utils";
import { AirlineLogo } from "./AirlineLogo";
import { Button } from "../ui/button";
import {
  getAirportByCode,
  Airport as AirportData,
} from "@/lib/utils/airport-search";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { FlightListItem, FlightSegment } from "@/lib/types/flight-api";
import { CheckCircle2, Clock, Coffee, ShieldCheck, Ticket } from "lucide-react";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { useLoadingStore } from "@/lib/store/use-loading-store";
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
  onTryBid?: (flight: FlightListItem) => void;
  onTryJetcost?: (flight: FlightListItem) => void;
}

function getBadge(
  flight: FlightListItem,
): { label: string; className: string } | null {
  if (flight.totalCost < 400)
    return { label: "Cheapest", className: "bg-sky-500/10 text-sky-500" };
  if (flight.totalTime < 420)
    return {
      label: "Fastest",
      className: "bg-white text-redmix dark:bg-card dark:text-white",
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
  const isEnglish = locale.startsWith("en");
  return new Date(iso).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: isEnglish,
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
    // Use elapsedTime (per-segment flight time only) or compute from dep/arr dates.
    // Do NOT fall back to seg.totalTime — the API sets that to the whole-leg total
    // on every segment, which would cause massive inflation of the displayed duration.
    const flightTime =
      parseDuration(seg.elapsedTime) ||
      parseDuration((seg as any).FlightTime) ||
      (seg.departureDate && seg.arrivalDate
        ? Math.round(
            (new Date(seg.arrivalDate).getTime() -
              new Date(seg.departureDate).getTime()) /
              60000,
          )
        : 0);
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

export function FlightCard({
  flight,
  bidDeal,
  isLowestPrice,
  isBooked,
  confirmationMode = false,
  confirmationPricing,
  previewMode = false,
  onTryBid,
  onTryJetcost,
}: Props) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(previewMode || false);
  const [showBidDetail, setShowBidDetail] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isJetcostModalOpen, setIsJetcostModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [airportNames, setAirportNames] = useState<Record<string, string>>({});
  const { startLoading, stopLoading } = useLoadingStore();
  const { t, i18n } = useTranslation();
  const locale = getLocaleFromLanguage(i18n.resolvedLanguage || i18n.language);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const setFlights = useBookingFlowStore((state) => state.setFlights);
  const setSelectedFlight = useBookingFlowStore(
    (state) => state.setSelectedFlight,
  );
  const selectingFlightId = useBookingFlowStore(
    (state) => state.selectingFlightId,
  );
  const setSelectingFlightId = useBookingFlowStore(
    (state) => state.setSelectingFlightId,
  );

  const standardFlightId =
    !previewMode && !confirmationMode && !!flight.cheapBidApplied
      ? flight.flightId.split("::cheap-bid-")[0]
      : flight.flightId;

  const isThisSelecting =
    isSelecting ||
    (selectingFlightId !== null && selectingFlightId === standardFlightId);

  const isSelectingBid =
    isPlacingBid ||
    (selectingFlightId !== null &&
      selectingFlightId === flight.flightId &&
      !previewMode &&
      !confirmationMode &&
      !!flight.cheapBidApplied);

  const isAnotherSelecting =
    selectingFlightId !== null &&
    selectingFlightId !== standardFlightId &&
    selectingFlightId !== flight.flightId;
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

  const [isMounted, setIsMounted] = React.useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = React.useState(false);
  const [isCardHovered, setIsCardHovered] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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

  // Use top-level cabinClass (from flight.flightClass numeric — authoritative).
  // Segment-level first.cabinClass is unreliable (GDS can say "First" for PE fare).
  const formatCabinLabel = (cabin?: string | null): string => {
    if (!cabin) return "Economy";
    const upper = cabin.toUpperCase().replace(/[\s-]+/g, "_");
    if (upper === "PREMIUM_ECONOMY") return "Premium Economy";
    if (upper === "BUSINESS") return "Business";
    if (upper === "FIRST") return "First";
    return "Economy";
  };
  const flightCabinLabel = formatCabinLabel(flight.cabinClass);

  const { baseCurrency, getConvertedAmount, getCurrency } = useCurrencyStore();
  const currencyMeta = getCurrency(baseCurrency) || SUPPORTED_CURRENCIES["USD"];
  const symbol = currencyMeta.symbol;
  const flightSourceCurrency = (flight.currency as string) || "USD";

  const formatCardPrice = (amount: number) =>
    `${symbol} ${amount.toLocaleString("en-US", {
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

    let logMsg = `[FlightCard] Flight ID: ${flight.flightId} | Price: ${userTotal.toFixed(2)} ${baseCurrency} | USD Price: ${usdTotal.toFixed(2)} USD`;
    if (flight.cheapBidApplied?.providerTotalFare) {
      const origUsd = getConvertedAmount(
        flight.cheapBidApplied.providerTotalFare,
        flightSourceCurrency,
        "USD",
      );
      logMsg += ` | Original USD: ${origUsd.toFixed(2)} USD`;
    } else if (flight.cheapBidApplied?.originalTotal) {
      const origUsd = getConvertedAmount(
        flight.cheapBidApplied.originalTotal,
        flightSourceCurrency,
        "USD",
      );
      logMsg += ` | Original USD: ${origUsd.toFixed(2)} USD`;
    }

    console.log(logMsg);
  }, [flight.flightId, flight.totalCost, baseCurrency, flightSourceCurrency]);

  const getSelectApiFareBreakdown = () => {
    // For bid flights: bidAdtPrice/bidChdPrice/bidInfPrice are the server-computed
    // discounted per-pax fares already in the bid's source currency (USD).
    // Use them directly instead of going through flightFare + flightSourceCurrency
    // conversion, which causes a double-conversion mismatch when the user's display
    // currency differs from USD.
    if (flight.cheapBidApplied) {
      const bidMeta = flight.cheapBidApplied;
      const adt = Number(
        searchParams.get("adt") || searchParams.get("adults") || 1,
      );
      const chd = Number(
        searchParams.get("chd") || searchParams.get("children") || 0,
      );
      const inf = Number(
        searchParams.get("inf") || searchParams.get("infants") || 0,
      );
      // Bid prices are always stored in USD by the server
      const bidCurrency = (bidMeta as any).currency || "USD";
      const bidTotal =
        adt * Number(bidMeta.bidAdtPrice ?? 0) +
        chd * Number(bidMeta.bidChdPrice ?? bidMeta.bidAdtPrice ?? 0) +
        inf * Number(bidMeta.bidInfPrice ?? 0);
      const fareTotal = getConvertedAmount(
        bidTotal,
        bidCurrency,
        SELECT_API_CURRENCY,
      );
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
    const origCurrency =
      (flight.cheapBidApplied as any)?.sourceCurrency || flightSourceCurrency;
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

    // For bid flights: use the per-pax bid prices (in USD) directly,
    // avoiding the double-conversion that happens when flightFare values
    // (stored in USD) are converted from flightSourceCurrency (display currency).
    if (flight.cheapBidApplied) {
      const bidMeta = flight.cheapBidApplied;
      const adt = Number(
        searchParams.get("adt") || searchParams.get("adults") || 1,
      );
      const chd = Number(
        searchParams.get("chd") || searchParams.get("children") || 0,
      );
      const inf = Number(
        searchParams.get("inf") || searchParams.get("infants") || 0,
      );
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

  const adultUnitPrice = React.useMemo(() => {
    const bidMeta = flight.cheapBidApplied;
    if (isCheapBidCard && bidMeta) {
      const bidCurrency = (bidMeta as any).currency || "USD";
      const bidAdt = Number(bidMeta.bidAdtPrice ?? 0);
      return getConvertedAmount(bidAdt, bidCurrency, baseCurrency);
    }

    const fare = flight.flightFare;
    if (fare) {
      const adt = Number(searchParams.get("adt") || fare.adult || 1);
      const chd = Number(searchParams.get("chd") || fare.child || 0);
      const inf = Number(searchParams.get("inf") || fare.infant || 0);
      const rawTotal = flight.totalCost || 0;

      const adultUnits = adt + chd * 0.75 + inf * 0.1;
      const totalUnits = adultUnits > 0 ? adultUnits : 1;
      const unitTotal = rawTotal / totalUnits;

      const adultFare = fare.adultFare ?? unitTotal * 0.85;
      return getConvertedAmount(adultFare, flightSourceCurrency, baseCurrency);
    }

    const rawTotal = flight.totalCost || 0;
    const adt = Number(searchParams.get("adt") || 1);
    const chd = Number(searchParams.get("chd") || 0);
    const inf = Number(searchParams.get("inf") || 0);
    const totalPax = adt + chd + inf;
    const divisor = totalPax > 0 ? totalPax : 1;
    const unitPrice = rawTotal / divisor;
    return getConvertedAmount(unitPrice * 0.85, flightSourceCurrency, baseCurrency);
  }, [flight, isCheapBidCard, baseCurrency, getConvertedAmount, flightSourceCurrency, searchParams]);

  const openAuthModal = useAuthModalStore((state: any) => state.open);

  const handleLockDeal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlacingBid) return;
    setIsPlacingBid(true);

    const first = flight.outbound[0];
    const last = flight.outbound[flight.outbound.length - 1];

    const adt =
      searchParams.get("adt") || String(flight.pricedFor?.adults ?? 1);
    const chd =
      searchParams.get("chd") ||
      searchParams.get("chld") ||
      String(flight.pricedFor?.children ?? 0);
    const inf =
      searchParams.get("inf") || String(flight.pricedFor?.infants ?? 0);
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
    const utmSource = searchParams.get("utm_source") || "web";
    const utmMedium = searchParams.get("utm_medium") || "ezeeflights";
    const utmCampaign = searchParams.get("utm_campaign") || "flight-search";

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
      flight.cabinClass || first.cabinClass || "Economy",
    );
    itineraryParams.set("searchId", flight.searchId || "");
    itineraryParams.set("tranId", sourceFlightId);
    itineraryParams.set("bid", "true");
    itineraryParams.set("bidId", bidId);
    itineraryParams.set("verified", "true");

    const targetUrl = `/flights/itinerary?${itineraryParams.toString()}`;

    // disable auth session
    // if (!session) {
    //   if (typeof window !== "undefined") {
    //     window.sessionStorage.setItem("oauth_redirect_back", targetUrl);
    //     document.cookie = `oauth_redirect_back=${encodeURIComponent(targetUrl)}; path=/; max-age=300; SameSite=Lax`;
    //   }
    //   openAuthModal("login");
    //   return;
    // }

    // Call select API to verify pricing before navigating
    setIsPlacingBid(true);
    setSelectingFlightId(flight.flightId);
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
        bidId: bidId ? Number(bidId) : undefined,
        currency: selectFare.currency,
        fareTotal: selectFare.fareTotal,
      };

      console.log(
        "[FlightCard] Place Bid — Sending Select Payload to Backend (USD):",
        selectPayload,
      );

      const selectBody = await apiFetch<{
        verified: boolean;
        message?: string;
      }>("/flights/bidselect", {
        method: "POST",
        body: JSON.stringify(selectPayload),
      });

      if (!selectBody?.verified) {
        selectSuccess = false;
        errorMsg =
          selectBody?.message ||
          t("Flight price could not be verified. Please search again.");
        console.warn(
          "[FlightCard] Place Bid Select API verification failed:",
          selectBody,
        );
      } else {
        console.log("[FlightCard] Place Bid Select API verified:", selectBody);
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
      console.warn("[FlightCard] Place Bid Select API error:", err);
    }

    if (!selectSuccess) {
      setIsPlacingBid(false);
      setSelectingFlightId(null);
      stopLoading();
      toast({
        title: t("Flight Selection Failed"),
        description:
          errorMsg || t("Could not verify this flight. Please try again."),
        variant: "destructive",
      });
      return;
    }

    // Keep button locked and show global loading overlay until the itinerary page renders
    startLoading(t("Please wait..."));

    setFlights([flight.flightId]);
    setSelectedFlight(flight);
    router.push(targetUrl);
  };

  const handleSelect = async () => {
    if (isSelecting) return;
    setIsSelecting(true);

    const first = flight.outbound[0];
    const last = flight.outbound[flight.outbound.length - 1];

    const adt =
      searchParams.get("adt") || String(flight.pricedFor?.adults ?? 1);
    const chd =
      searchParams.get("chd") ||
      searchParams.get("chld") ||
      String(flight.pricedFor?.children ?? 0);
    const inf =
      searchParams.get("inf") || String(flight.pricedFor?.infants ?? 0);
    const trip = searchParams.get("trip") || "one-way";
    const org = searchParams.get("org") || first.fromAirport.code;
    const des = searchParams.get("des") || last.toAirport.code;
    const dDate = searchParams.get("dDate") || first.departureDate;

    // For bid cards, use original prices and sourceFlightId for standard booking
    const selectFare = isCheapBidCard
      ? getOriginalFareBreakdown()
      : getSelectApiFareBreakdown();
    const selectFlightId = isCheapBidCard
      ? flight.flightId.split("::cheap-bid-")[0]
      : flight.flightId;

    const params = new URLSearchParams(searchParams.toString());
    params.set("id", selectFlightId);
    params.set("verified", "true");

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

    // if (!session) {
    //   if (typeof window !== "undefined") {
    //     window.sessionStorage.setItem("oauth_redirect_back", targetUrl);
    //     document.cookie = `oauth_redirect_back=${encodeURIComponent(targetUrl)}; path=/; max-age=300; SameSite=Lax`;
    //   }
    //   openAuthModal("login");
    //   return;
    // }

    if (isSelecting || selectingFlightId !== null) return;
    setIsSelecting(true);
    setSelectingFlightId(selectFlightId);
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
        bidId: flight.cheapBidApplied?.bidId
          ? Number(flight.cheapBidApplied.bidId)
          : undefined,
        currency: selectFare.currency,
        // Price verification in USD (base currency) — must match cached offer
        fareTotal: selectFare.fareTotal,
      };

      console.log(
        "[FlightCard:SelectAction] Sending Select Payload to Backend:",
        {
          isCheapBidCard,
          originalFlightId: flight.flightId,
          selectFlightId,
          selectFare,
          cheapBidApplied: flight.cheapBidApplied,
          payload: selectPayload,
        },
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
    }

    if (!selectSuccess) {
      setIsSelecting(false);
      setSelectingFlightId(null);
      stopLoading();
      toast({
        title: t("Flight Selection Failed"),
        description:
          errorMsg || t("Could not select this flight. Please try again."),
        variant: "destructive",
      });
      return;
    }

    // Keep button locked and show global loading overlay until the itinerary page renders
    startLoading(t("Please wait..."));

    const selectedFlightObj: FlightListItem = isCheapBidCard
      ? {
          ...flight,
          flightId: selectFlightId,
          totalCost: selectFare.fareTotal,
          baseFare: selectFare.baseFare,
          flightFare: {
            ...flight.flightFare,
            adult: Number(adt),
            child: Number(chd),
            infant: Number(inf),
            adultFare:
              flight.cheapBidApplied?.originalAdtPrice != null
                ? Number(flight.cheapBidApplied.originalAdtPrice)
                : selectFare.baseFare,
            childFare:
              flight.cheapBidApplied?.originalChdPrice != null
                ? Number(flight.cheapBidApplied.originalChdPrice)
                : flight.cheapBidApplied?.originalAdtPrice != null
                  ? Number(flight.cheapBidApplied.originalAdtPrice)
                  : selectFare.baseFare,
            infantFare:
              flight.cheapBidApplied?.originalInfPrice != null
                ? Number(flight.cheapBidApplied.originalInfPrice)
                : 0,
            adultTax:
              flight.cheapBidApplied?.originalAdtPrice != null
                ? 0
                : selectFare.tax,
            childTax:
              flight.cheapBidApplied?.originalChdPrice != null
                ? 0
                : selectFare.tax,
            infantTax:
              flight.cheapBidApplied?.originalInfPrice != null
                ? 0
                : selectFare.tax,
            grandTotal:
              flight.cheapBidApplied?.originalTotal || selectFare.fareTotal,
          },
          cheapBidApplied: undefined,
        }
      : flight;

    setFlights([selectFlightId]);
    setSelectedFlight(selectedFlightObj);

    // Build final booking/itinerary URL (itinerary per the requested metasearch deep link pattern)
    const itineraryParams = new URLSearchParams();

    const utmSource = searchParams.get("utm_source") || "web";
    const utmMedium = searchParams.get("utm_medium") || "ezeeflights";
    const utmCampaign = searchParams.get("utm_campaign") || "flight-search";

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
    itineraryParams.set("cabin", first.cabinClass || "Economy");
    itineraryParams.set("searchId", flight.searchId || "");
    itineraryParams.set("tranId", selectFlightId);

    router.push(`/flights/itinerary?${itineraryParams.toString()}`);
  };

  const originalFlightFare = React.useMemo(() => {
    if (!flight.cheapBidApplied) return flight.flightFare;
    const cb = flight.cheapBidApplied;
    const gdsCurrency = (cb as any).sourceCurrency || "USD";
    const conv = (amount: number) =>
      getConvertedAmount(amount, "USD", gdsCurrency);

    return {
      adult: adtCount,
      child: chdCount,
      infant: infCount,
      adultFare:
        cb.originalAdtPrice != null ? conv(Number(cb.originalAdtPrice)) : 0,
      childFare:
        cb.originalChdPrice != null
          ? conv(Number(cb.originalChdPrice))
          : cb.originalAdtPrice != null
            ? conv(Number(cb.originalAdtPrice))
            : 0,
      infantFare:
        cb.originalInfPrice != null ? conv(Number(cb.originalInfPrice)) : 0,
      adultTax: 0,
      childTax: 0,
      infantTax: 0,
      grandTotal: cb.originalTotal,
    };
  }, [
    flight.cheapBidApplied,
    flight.flightFare,
    adtCount,
    chdCount,
    infCount,
    getConvertedAmount,
  ]);

  const renderFareBreakdownBlock = () => {
    const useOriginalInDetails = isCheapBidCard;

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
            sourceCurrency={
              useOriginalInDetails
                ? (flight.cheapBidApplied as any)?.sourceCurrency || "USD"
                : flightSourceCurrency
            }
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
                  {isUSDomain() && baseCurrency !== "USD" && (
                    <span className="text-xs font-semibold text-foreground/90 text-right animate-in fade-in duration-300">
                      approx. $
                      {getConvertedAmount(
                        flight.cheapBidApplied?.originalTotal || 0,
                        (flight.cheapBidApplied as any)?.sourceCurrency ||
                          "USD",
                        "USD",
                      ).toFixed(2)}{" "}
                      USD
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
                  {isUSDomain() && baseCurrency !== "USD" && (
                    <span className="text-xs font-semibold text-foreground/90 text-right animate-in fade-in duration-300">
                      approx.{" "}
                      {flight.cheapBidApplied?.originalTotal &&
                        !isCheapBidCard && (
                          <span className="line-through text-muted-foreground mr-1">
                            $
                            {getConvertedAmount(
                              flight.cheapBidApplied.originalTotal,
                              (flight.cheapBidApplied as any).sourceCurrency ||
                                "USD",
                              "USD",
                            ).toFixed(2)}
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
                layoverText = `${durationFmt(diffMins)} ${t("layover in")} ${toCity} (${segment.toAirport.code})`;
              }

              return (
                <div key={idx} className="relative space-y-2">
                  {/* Circle marker on timeline */}
                  <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white dark:bg-card border-2 border-redmix" />

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground">
                      {segment.airline.name} • {segment.flightNo}
                    </span>
                    {/* <span className="px-1.5 py-0.5 rounded-full bg-muted font-semibold text-xs capitalize text-redmix/80">
                      {segment.cabinClass}
                    </span> */}
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
                          {String(segment.elapsedTime).includes("h")
                            ? segment.elapsedTime
                            : durationFmt(Number(segment.elapsedTime))}
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
                  layoverText = `${durationFmt(diffMins)} ${t("layover at")} ${toCity} (${segment.toAirport.code})`;
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
                            {String(segment.elapsedTime).includes("h")
                              ? segment.elapsedTime
                              : durationFmt(Number(segment.elapsedTime))}
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

  const renderPriceAndSelectBlock = (isBottomLayout: boolean) => (
    <>
      <div
        className={cn(
          "min-w-0 flex-1 xl:flex-none",
          isBottomLayout ? "text-left" : "text-left xl:text-center",
        )}
      >
        <p
          className={cn(
            "text-[10px] font-semibold capitalize tracking-wider mb-0.5 xl:mb-1",
            isCheapBidCard
              ? "text-slate-600 dark:text-slate-400"
              : "text-foreground",
          )}
        >
          {t("Price per adult")}
        </p>
        <div
          className={cn(
            "flex flex-col",
            isBottomLayout ? "items-start" : "items-start xl:items-center",
          )}
        >
          <CurrencyDisplay
            amount={adultUnitPrice}
            currency={fareBreakdown.currency}
            className={
              isBottomLayout ? "items-start" : "items-start xl:items-center"
            }
            amountClassName="text-[20px] xl:text-lg font-bold xl:font-extrabold animate-in fade-in duration-300 text-foreground"
            symbolClassName="text-[14px] xl:text-xs font-semibold xl:font-bold text-foreground/80"
            showComparison={false}
          />
          {isUSDomain() && baseCurrency !== "USD" && (
            <p className="text-[10px] font-semibold xl:font-semibold text-foreground/90 mt-0.5 whitespace-nowrap">
              ({t("approx.")} $
              {getConvertedAmount(
                adultUnitPrice,
                fareBreakdown.currency,
                "USD",
              ).toFixed(2)}{" "}
              USD)
            </p>
          )}
          {/* {isCheapBidCard && (
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
              ⚡ {t("Instant Confirmation")}
            </span>
          )} */}
        </div>
      </div>
      {isBooked ? (
        <Button
          className={cn(
            "min-w-[100px] bg-emerald-600/10 text-redmix dark:text-white font-semibold xl:font-bold h-10 xl:h-11 rounded-[10px] xl:rounded-xl shadow-none hover:bg-emerald-600/20 transition-all pointer-events-auto border border-emerald-600/30",
            isBottomLayout
              ? "w-auto sm:min-w-[140px] px-6"
              : "w-auto xl:w-full",
          )}
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
          className={cn(
            "min-w-[100px] bg-foreground/10 dark:bg-foreground/10 text-foreground/50 font-semibold xl:font-bold h-10 xl:h-11 rounded-[10px] xl:rounded-xl shadow-none pointer-events-none uppercase text-xs",
            isBottomLayout
              ? "w-auto sm:min-w-[140px] px-6"
              : "w-auto xl:w-full",
          )}
        >
          {t("Expired")}
        </Button>
      ) : !previewMode ? (
        <div
          className={cn(
            "relative group/select-btn flex items-center justify-center shrink-0",
            isBottomLayout ? "w-auto sm:min-w-[140px]" : "w-auto xl:w-full",
          )}
        >
          <Button
            className={cn(
              "min-w-[100px] font-semibold xl:font-bold text-[14px] xl:text-xs h-10 xl:h-11 rounded-[10px] xl:rounded-xl shadow-none pointer-events-auto cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed transition-all",
              "bg-redmix text-white hover:brightness-110 xl:shadow-lg xl:shadow-redmix/20 active:scale-[0.97] xl:active:scale-[0.98]",
              isBottomLayout ? "w-auto px-6" : "w-full",
            )}
            disabled={isThisSelecting || isAnotherSelecting || isSelectingBid}
            onClick={handleSelect}
          >
            {isThisSelecting ? (
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
                {t("Booking...")}
              </span>
            ) : isCheapBidCard ? (
              <span className="flex items-center gap-1">
                <span>{t("Book Now")}</span>
              </span>
            ) : (
              t("Book Now")
            )}
          </Button>
          <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 opacity-0 group-hover/select-btn:opacity-100 pointer-events-none transition-opacity duration-200 z-50 rounded-md border border-border bg-popover px-3 py-1 text-center text-[10px] font-semibold text-popover-foreground shadow-md w-max max-w-[220px]">
            {isCheapBidCard
              ? t("Book at regular fare.")
              : t("Proceed to book this.")}
          </div>
        </div>
      ) : null}
    </>
  );

  return (
    <article
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => setIsCardHovered(false)}
      className={cn(
        "relative rounded-2xl border transition-all mb-3 group",
        !showCheapBidHeader && "overflow-hidden",
        !!flight.cheapBidApplied && !confirmationMode
          ? "border-redmix/25 ring-1 ring-redmix/5 shadow-sm"
          : "border-border overflow-hidden hover:border-blue-500/30 hover:ring-2 hover:ring-blue-500/20 hover:shadow-md",
        confirmationMode && "mb-0 shadow-none border-border/50 rounded-[10px]",
        isExpired && !confirmationMode && !previewMode
          ? "opacity-60 pointer-events-none grayscale-[0.2]"
          : "",
      )}
    >
      {showCheapBidHeader && (
        <>
          {/* Soft Outer Glow Halo behind the header — only shows on header hover */}
          <div
            className={cn(
              "absolute -top-3 -left-3 -right-3 h-[78px] rounded-t-3xl bg-gradient-to-r from-[#1c2652] via-[#2563eb] to-[#38bdf8] blur-xl -z-10 transition-opacity duration-300 pointer-events-none",
              isHeaderHovered ? "opacity-100 animate-pulse" : "opacity-0",
            )}
          />

          {/* Sharp top/header highlight border — overlays top/left/right borders of header on hover */}
          <div
            className={cn(
              "absolute -top-[1.5px] -left-[1.5px] -right-[1.5px] h-[66px] rounded-t-2xl border-t-2 border-l-2 border-r-2 border-[#1c2652]/70 pointer-events-none transition-opacity duration-200 z-10",
              isHeaderHovered ? "opacity-100" : "opacity-0",
            )}
          />

          {/* Soft Outer Glow Halo behind the bottom half — only shows on lower part hover */}
          <div
            className={cn(
              "absolute top-[70px] -bottom-3 -left-3 -right-3 rounded-b-3xl bg-gradient-to-r from-redmix via-red-500 to-orange-500 blur-xl -z-10 transition-opacity duration-300 pointer-events-none",
              isCardHovered && !isHeaderHovered
                ? "opacity-100 animate-pulse"
                : "opacity-0",
            )}
          />

          {/* Sharp Bottom highlight border — overlays bottom/left/right borders of lower part on hover */}
          <div
            className={cn(
              "absolute top-[70px] -bottom-[1.5px] -left-[1.5px] -right-[1.5px] rounded-b-2xl border-b-2 border-l-2 border-r-2 border-redmix pointer-events-none transition-opacity duration-200 z-10",
              isCardHovered && !isHeaderHovered ? "opacity-100" : "opacity-0",
            )}
          />

          <div
            onMouseEnter={() => setIsHeaderHovered(true)}
            onMouseLeave={() => setIsHeaderHovered(false)}
            className="relative overflow-hidden rounded-t-md p-[1px] bg-slate-200 dark:bg-slate-800 group/header border-b border-border"
          >
            {/* Animated Gradient Border Glow — spins all the time, opacity toggled on hover */}
            <motion.span
              className={cn(
                "absolute -inset-[100%] bg-gradient-to-r from-redmix via-yellow to-sky-400 blur-sm transition-opacity duration-300 pointer-events-none",
                isHeaderHovered ? "opacity-100" : "opacity-0",
              )}
              animate={{ rotate: [0, 360] }}
              transition={{
                rotate: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              style={{
                originX: "50%",
                originY: "50%",
              }}
            />
            {/* Extra pulse layer — brightens on hover */}
            <span
              className="absolute -inset-[100%] bg-gradient-to-r from-redmix via-red-300 to-orange-400 opacity-0 group-hover/header:opacity-60 transition-opacity duration-500 blur-md"
              style={{ transform: "rotate(-25deg)" }}
            />

            {/* Inner Content Container */}
            <div className="relative z-10 bg-white dark:bg-card rounded-t-md px-4 lg:px-5 pt-3 pb-3 flex flex-col gap-3">
              {/* Top Row: Info + Price + Book by Bid */}
              <div className="flex items-center justify-between w-full">
                {/* Left: Info */}
                <div className="flex items-center gap-3">
                  <div className="bg-[#1c2652] text-white p-2 rounded-lg shadow-md shrink-0 flex items-center justify-center">
                    <Ticket className="w-4 h-4" />
                  </div>
                  <TooltipProvider>
                    <div className="flex flex-col min-w-0 shrink-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs font-semibold tracking-wider text-[#1c2652] dark:text-[#93c5fd] leading-none flex items-center gap-1 cursor-help hover:opacity-80 transition-opacity">
                            {t("Get this")}
                            <span className="inline-block px-1 py-0.2 text-xs bg-[#1c2652] text-white rounded font-bold uppercase tracking-normal">
                              {t("Hot Offer")}
                            </span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-card border border-border shadow-lg p-2.5 max-w-[240px] z-50">
                          <p className="text-xs font-semibold text-foreground/95 leading-snug">
                            {originalTotalInBase !== null &&
                            originalTotalInBase > fareBreakdown.fareTotal
                              ? `${t("Save")} ${formatCardPrice(originalTotalInBase - fareBreakdown.fareTotal)} ${t("compared to standard booking!")}`
                              : t(
                                  "Vibrant bidding ticket option with huge discount potentials.",
                                )}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs font-semibold text-foreground/70 tracking-tight leading-none mt-1 flex items-center gap-1 cursor-help hover:opacity-85 transition-opacity">
                            <span className="h-1 w-1 rounded-full bg-foreground/20" />
                            <span className="text-[#1c2652] dark:text-[#93c5fd] font-semibold">
                              {t("Requires 24h Approval")}
                            </span>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-card border border-border shadow-lg p-2.5 max-w-[240px] z-50">
                          <div className="space-y-1 text-xs">
                            <p className="font-bold text-amber-600 dark:text-amber-400">
                              ⏱️ {t("24h Window")}
                            </p>
                            <p className="text-foreground/80 leading-normal">
                              {t(
                                "Bidding Ticket Option requires 24h approval from the provider. Fully refundable if rejected.",
                              )}
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>

                {/* Right: Price + Book by Bid */}
                <div className="flex items-center gap-4 shrink-0">
                  {/* Bid price */}
                  <div className="flex flex-col items-end">
                    {/* <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/60 leading-none">
                      {t("Bid Price")}
                    </span> */}
                    <span className="text-lg font-bold text-[#1c2652] dark:text-[#93c5fd] leading-tight">
                      {formatCardPrice(adultUnitPrice)}
                    </span>
                    {isUSDomain() && baseCurrency !== "USD" && (
                      <span className="text-[10px] font-semibold text-[#1c2652] dark:text-[#93c5fd] leading-none mt-0.5">
                        {t("approx.")} $
                        {getConvertedAmount(
                          adultUnitPrice,
                          fareBreakdown.currency,
                          "USD",
                        ).toFixed(2)}{" "}
                        USD
                      </span>
                    )}
                  </div>
                  {/* test */}

                  {/* Book by Bid button */}
                  <div className="relative group/bid-btn overflow-hidden rounded-full p-[1.5px] shrink-0 bg-slate-200 dark:bg-slate-800 group-hover/header:bg-redmix transition-colors duration-300">
                    {/* Pulsing Inner Border Glow */}
                    <motion.span
                      className="absolute -inset-[50%] bg-gradient-to-r from-redmix via-yellow to-sky-400 opacity-0 group-hover/header:opacity-100 transition-opacity duration-300"
                      animate={{
                        rotate: [0, 360],
                      }}
                      transition={{
                        rotate: {
                          duration: 4,
                          repeat: Infinity,
                          ease: "linear",
                        },
                      }}
                      style={{ originX: "50%", originY: "50%" }}
                    />

                    {/* Book by Bid button */}
                    <Button
                      disabled={
                        isSelectingBid || isThisSelecting || isAnotherSelecting
                      }
                      onClick={handleLockDeal}
                      variant="ghost"
                      shimmer={false}
                      className="relative z-10 bg-[#1c2652] text-white dark:bg-[#93c5fd] dark:text-[#1c2652] font-extrabold text-[12px] h-9 px-5 rounded-full pointer-events-auto cursor-pointer shrink-0 disabled:opacity-70 min-w-[120px] sm:min-w-[140px] justify-center text-center"
                    >
                      {isSelectingBid ? (
                        <span className="flex items-center gap-1.5">
                          <svg
                            className="animate-spin h-3 w-3 text-white"
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
                          {t("Processing...")}
                        </span>
                      ) : (
                        <>{t("Book Now")}</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Centered toggle details button */}
              {/* <div className="flex justify-center w-full pt-1.5 border-t border-border/50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBidDetail((v) => !v);
                }}
                className="flex items-center justify-center gap-1.5 w-full md:w-auto h-7 px-4 rounded-full border border-redmix/30 bg-background text-redmix text-[10px] font-bold hover:bg-redmix/5 hover:text-white active:scale-95 transition-all pointer-events-auto cursor-pointer shrink-0"
              >
                {showBidDetail ? t("Hide Details") : t("Price Details")}
                <svg
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200 text-redmix/70",
                    showBidDetail && "rotate-180",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div> */}
            </div>
          </div>

          {/* ── Bid Detail Panel (inline, below banner) ── */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out border-t",
              showBidDetail
                ? "max-h-[500px] border-[#1c2652]/15"
                : "max-h-0 border-transparent",
            )}
          >
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Left Column: Bid Details & Badges */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-[#1c2652] dark:text-[#93c5fd] uppercase tracking-wider mb-2">
                      {t("Bid Price Breakdown")}
                    </p>
                    {originalTotalInBase !== null &&
                      originalTotalInBase > fareBreakdown.fareTotal && (
                        <div className="mt-1">
                          <span className="inline-block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 px-2.5 py-1 rounded-full shadow-sm">
                            🎉 {t("Save")}{" "}
                            {formatCardPrice(
                              originalTotalInBase - fareBreakdown.fareTotal,
                            )}{" "}
                            vs standard
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Benefit badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 dark:bg-amber-950/30">
                      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 tracking-tight">
                        {t("24h Window")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 dark:bg-emerald-950/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 tracking-tight">
                        {t("Fully Refundable")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Pricing Breakdown */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-bold text-foreground/70">
                      {t("Price per adult")}
                    </span>
                    <div className="text-right">
                      <CurrencyDisplay
                        amount={adultUnitPrice}
                        currency={fareBreakdown.currency}
                        amountClassName="text-xl font-extrabold text-[#1c2652] dark:text-[#93c5fd]"
                        symbolClassName="text-base font-bold text-[#1c2652] dark:text-[#93c5fd]"
                        showComparison={false}
                      />
                      {isUSDomain() && baseCurrency !== "USD" && (
                        <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                          {t("approx.")} $
                          {getConvertedAmount(
                            adultUnitPrice,
                            fareBreakdown.currency,
                            "USD",
                          ).toFixed(2)}{" "}
                          USD
                        </p>
                      )}
                      {originalTotalInBase !== null &&
                        originalTotalInBase > fareBreakdown.fareTotal && (
                          <div className="flex items-center justify-end gap-1.5 mt-0.5">
                            <CurrencyDisplay
                              amount={originalTotalInBase}
                              currency={baseCurrency}
                              amountClassName="text-xs font-semibold text-muted-foreground line-through"
                              symbolClassName="text-[10px] font-semibold text-muted-foreground line-through"
                              showComparison={false}
                            />
                            {baseCurrency !== "USD" && (
                              <span className="text-[9px] font-semibold text-muted-foreground line-through">
                                ($
                                {getConvertedAmount(
                                  originalTotalInBase,
                                  baseCurrency,
                                  "USD",
                                ).toFixed(2)}{" "}
                                USD)
                              </span>
                            )}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Per-passenger breakdown */}
                  <PassengerFareBreakdown
                    flightFare={flight.flightFare}
                    searchParams={searchParams}
                    targetTotal={fareBreakdown.fareTotal}
                    sourceCurrency={flightSourceCurrency}
                    displayCurrency={baseCurrency}
                    formatPrice={formatCardPrice}
                    getConvertedAmount={getConvertedAmount}
                    className="space-y-1.5"
                    compact
                    cheapBidApplied={flight.cheapBidApplied}
                    isBid={!!flight.cheapBidApplied}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Divider between bid section and standard card */}
          <div className="border-b border-border/60" />
        </>
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

      <div
        className={cn(
          "group/std-zone relative flex transition-colors duration-200",
          showCheapBidHeader &&
            "hover:bg-foreground/[0.025] dark:hover:bg-foreground/[0.04] cursor-pointer",
          "flex-col xl:flex-row",
        )}
      >
        {/* Standard zone hover hint — only when a bid card */}
        {/* {showCheapBidHeader && !isDetailsOpen && (
          <div className="pointer-events-none absolute inset-0 z-10 opacity-0 group-hover/std-zone:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <span className="bg-foreground/80 dark:bg-foreground/70 text-white dark:text-background text-[10px] font-bold px-3 py-1 rounded-full shadow-md tracking-wide">
              Standard Booking
            </span>
          </div>
        )} */}
        {/* Left: Content */}
        <div className="flex-1 px-4 xl:px-5 py-1 xl:py-3">
          <div className="flex items-start justify-between mb-3 xl:mb-2 pr-10 xl:pr-0">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 xl:h-10 xl:w-10 rounded-full xl:rounded-lg bg-background dark:bg-muted/50 p-1.5 xl:p-1  flex items-center justify-center shrink-0">
                <AirlineLogo
                  code={first.airline.code}
                  name={first.airline.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] xl:text-sm font-semibold xl:font-bold text-foreground truncate flex items-center gap-2">
                  {first.airline.name}
                  {flight.cabinClass && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-white text-redmix dark:bg-blue-900/30 dark:text-white capitalize">
                      {flightCabinLabel}
                    </span>
                  )}
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
                  "rounded-full xl:rounded-md px-2.5 xl:px-2 py-0.5 text-[10px] font-semibold tracking-wider",
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
            baggageAllowance={flight.outbound?.[0]?.baggageAllowance}
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
                baggageAllowance={flight.inbound?.[0]?.baggageAllowance}
              />
            </div>
          )}

          {!confirmationMode && (
            <div className="border-t border-border/40 hidden xl:flex justify-center py-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDetailsOpen(true);
                }}
                className="text-xs font-semibold text-[#1c2652] dark:text-[#93c5fd] hover:underline flex items-center justify-center gap-2 py-1 cursor-pointer"
              >
                {t("View Flight Details")}
              </button>
            </div>
          )}
        </div>

        {/* Right sidebar when closed on desktop */}
        {!confirmationMode && (
          <div className="hidden xl:flex w-48 shrink-0 border-l border-border dark:bg-muted/20 p-3 flex-col justify-center items-center gap-3">
            {renderPriceAndSelectBlock(false)}
          </div>
        )}

        {/* Bottom bar when closed on mobile/tablet (< xl) */}
        {!confirmationMode && (
          <div className="flex xl:hidden w-full shrink-0 border-t border-border/50 px-4 py-3.5 flex-row justify-between items-center gap-3 sm:px-6">
            {renderPriceAndSelectBlock(true)}
          </div>
        )}

        {/* Accordion trigger for mobile/tablet when closed (< xl) */}
        {!confirmationMode && (
          <div className="border-t border-border/50 xl:hidden flex justify-between items-center px-4 py-3.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailsOpen(true);
              }}
              className="text-[15px] font-normal text-redmix tracking-normal hover:underline flex justify-between items-center w-full cursor-pointer"
            >
              <span>{t("View Flight Details")}</span>
              <span className="flex h-5 w-5 items-center justify-center text-redmix/70">
                →
              </span>
            </button>
          </div>
        )}

        {isAdmin && isJetcostModalOpen && (
          <JetcostAddRuleModal
            isOpen={isJetcostModalOpen}
            onOpenChange={setIsJetcostModalOpen}
            initialForm={flightToJetcostForm(flight)}
            isPrefilled={true}
          />
        )}

        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] rounded-3xl p-6 bg-background flex flex-col overscroll-contain">
            <DialogHeader className="shrink-0 pr-8">
              <DialogTitle className="text-xl font-bold text-foreground mb-4">
                {t("Flight Details")}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto overscroll-contain pr-2 space-y-6 animate-in fade-in duration-200">
              {renderExpandedDetails()}
            </div>
          </DialogContent>
        </Dialog>
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
  baggageAllowance?: string;
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
  baggageAllowance = "",
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
              <span className="text-foreground font-semibold ml-0.5 xl:ml-1">
                {fromCity}
              </span>
            )}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center px-1 sm:px-4 relative group/path min-w-[90px] sm:min-w-[100px]">
          <div className="text-[11px] xl:text-xs font-semibold xl:font-bold text-foreground mb-1 flex items-center gap-1 whitespace-nowrap">
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
                "text-xs font-semibold tracking-wide xl:tracking-wider block",
                stops === 0 ? "text-emerald-600" : "text-foreground",
              )}
            >
              {stops === 0 ? (
                t("Direct")
              ) : (
                <div className="flex flex-col items-center leading-tight sm:leading-none gap-0.5 w-full">
                  <span className="whitespace-nowrap normal-case xl:uppercase font-semibold">
                    {stops} {stops > 1 ? t("Stops") : t("Stop")} (
                    {stopCodes.join(" → ")})
                  </span>
                  {stopCities.length > 0 && (
                    <span className="text-[10px] font-semibold text-foreground truncate w-full max-w-[100px] sm:max-w-[150px] normal-case">
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
                <span className="text-foreground font-medium mr-0.5 xl:mr-1">
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

        {/* Baggage - Industry standard: single icon + allowance label, only when included */}
        {(() => {
          if (!baggageAllowance) return null;
          const lower = baggageAllowance.toLowerCase().trim();
          if (
            lower === "0 pc" ||
            lower === "0pc" ||
            lower === "0" ||
            lower.startsWith("0")
          ) {
            return null;
          }

          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden sm:flex items-center gap-1.5 px-2 border-l border-border/50 ml-2 cursor-help">
                    <div className="relative">
                      <Luggage className="h-4 w-4 text-emerald-500" />
                      <Check className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-emerald-500 text-white rounded-full p-0.5" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {baggageAllowance}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {t("Checked Baggage Included")}: {baggageAllowance}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })()}
      </div>
    </div>
  );
}
