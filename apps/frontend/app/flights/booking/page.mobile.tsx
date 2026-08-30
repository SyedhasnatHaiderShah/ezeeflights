"use client";

import { Suspense } from "react";

import {
  CheckCircle,
  Check,
  ChevronRight,
  User as UserIcon,
  ClipboardList,
  Info,
  ShieldCheck,
  CalendarDays,
  Plane,
  Ticket,
  Clock,
  Briefcase,
  Utensils,
  Armchair,
  Trash2,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { HoverTooltip } from "@/components/ui/hover-tooltip";
import {
  getBidDeal,
  createBidDepositOrder,
  verifyBidDeposit,
} from "@/lib/api/bid-deals";
import { useEffect, useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api/client";
import { submitInquiry, type InquiryTraveler } from "@/lib/api/inquiries";
import {
  createAdvancePaymentOrder,
  verifyAdvancePayment,
  recordRazorpayPayment,
  openRazorpayCheckout,
  convertToUsdCents,
  computeAffirmFee,
} from "@/lib/utils/flight-booking-checkout";
import {
  RazorpayLoader,
  type RazorpayLoadStage,
} from "@/components/shared/razorpay-loader";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import { useLoadingStore } from "@/lib/store/use-loading-store";
import { mergeDisplayFlight } from "@/lib/utils/flight-display";
import {
  computeBookingFareTotals,
  computeUsdLedgerTotals,
} from "@/lib/utils/booking-fare";
import { SELECT_API_CURRENCY } from "@/lib/store/currency-store";
import { CurrencySwitcher } from "@/components/shared/CurrencySwitcher";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { cn } from "@/lib/utils";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { Progress } from "@/components/ui/Progress";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TripSummary } from "@/app/flights/booking/components/TripSummary";
import { BookingConfirmationPanel } from "@/app/flights/booking/components/BookingConfirmationPanel";
import { CabinClassSelector } from "@/app/flights/booking/components/CabinClassSelector";
import {
  formatCabinClassLabel,
  normalizeCabinClassId,
  logCabinAvailability,
  pickInitialCabinForFlight,
  resolveAvailableCabinSelectorIds,
  resolvePreferredCabinClass,
} from "@/lib/utils/cabin-class";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookingTravelersForm } from "@/components/flights/BookingTravelersForm";
import {
  emptyTraveler,
  MOCK_TRAVELERS_ENABLED,
  MOCK_CONTACT,
} from "@/lib/dev/mock-travelers";
import { BookingContactForm } from "@/components/flights/BookingContactForm";
import { Badge } from "@/components/ui/badge";
import { useAffirm } from "@/lib/hooks/useAffirm";
import { useToast } from "@/lib/hooks/use-toast";
import {
  getContactValidationError,
  getTravelerValidationError,
} from "@/lib/validation/flight-traveler";
import { TravelerForm } from "@/components/packages/TravelerForm";
import { MAX_SEATED_PASSENGERS, type FlightPassengers } from "@/lib/passengers";
import {
  buildTravelerSlots,
  getSlotLabel,
  remapTravelersForCounts,
  suggestCountsAfterReclassification,
  PASSENGER_AGE_RULES,
  type PassengerCategory,
  type TravelerSlot,
} from "@/lib/validation/flight-passenger";
import { useRouter, useSearchParams } from "next/navigation";
const steps = [{ label: "Travelers", icon: UserIcon }];

/** Auto-fires payment success after a short countdown — no user interaction needed in sandbox mode. */
function SimulatorAutoSuccessModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [countdown, setCountdown] = useState(2);

  useEffect(() => {
    if (countdown <= 0) {
      onConfirm();
      return;
    }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, onConfirm]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop — clicking it cancels */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Card */}
      <div className="relative w-full max-w-sm rounded-3xl border border-border bg-card shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Spinning success icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 mx-auto">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            Sandbox Payment
          </h3>
          <p className="text-sm text-foreground/80  leading-relaxed">
            Auto-completing payment in{" "}
            <span className="font-bold text-green-500 tabular-nums">
              {countdown}s
            </span>
            …
          </p>
          {/* Progress bar */}
          <div className="w-full h-1.5 rounded-full bg-border overflow-hidden mt-3">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((2 - countdown) / 2) * 100}%` }}
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-xl text-xs font-semibold"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

function BookingPageContent() {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const { startLoading, stopLoading } = useLoadingStore();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const urlFlightId =
    searchParams.get("id") ||
    searchParams.get("tranId") ||
    searchParams.get("flightId");
  const urlOrg = searchParams.get("org") || "";
  const urlDes = searchParams.get("des") || "";

  const selectedFlightIds = useBookingFlowStore((s) => s.selectedFlightIds);
  const selectedFlightFromStore = useBookingFlowStore((s) => s.selectedFlight);
  const selectedSeats = useBookingFlowStore((s) => s.selectedSeats);
  const ancillaries = useBookingFlowStore((s) => s.ancillaries);
  const selectedAddons = useBookingFlowStore((s) => s.selectedAddons);
  const toggleAddon = useBookingFlowStore((s) => s.toggleAddon);

  const adt =
    parseInt(
      searchParams.get("adt") ??
        searchParams.get("adults") ??
        searchParams.get("adult") ??
        "1",
      10,
    ) || 1;
  const chd =
    parseInt(
      searchParams.get("chd") ??
        searchParams.get("chld") ??
        searchParams.get("children") ??
        searchParams.get("child") ??
        "0",
      10,
    ) || 0;
  const inf =
    parseInt(
      searchParams.get("inf") ??
        searchParams.get("infants") ??
        searchParams.get("infant") ??
        "0",
      10,
    ) || 0;
  const totalPax = adt + chd + inf;
  const departDate = searchParams.get("dDate") || null;

  const travelerSlots = useMemo(
    () => buildTravelerSlots(adt, chd, inf),
    [adt, chd, inf],
  );

  const passengerCounts = useMemo(
    () => ({ adults: adt, children: chd, infants: inf }),
    [adt, chd, inf],
  );

  const lastPaxCountsRef = useRef({ adt, chd, inf });

  const allDates = useMemo(() => {
    const dates: string[] = [];
    const dDate = searchParams.get("dDate");
    if (dDate) dates.push(dDate);

    for (let i = 0; i < 10; i++) {
      const d = searchParams.get(`dDate${i}`);
      if (d && !dates.includes(d)) dates.push(d);
    }
    return dates;
  }, [searchParams]);

  const [travelers, setTravelers] = useState<InquiryTraveler[]>(() =>
    buildTravelerSlots(adt, chd, inf).map((slot) => emptyTraveler(slot)),
  );

  function clampPassengerCounts(p: FlightPassengers): FlightPassengers {
    let next = { ...p };
    if (next.adults < 1) next.adults = 1;
    const seated = next.adults + next.children;
    if (seated > MAX_SEATED_PASSENGERS) {
      next.children = Math.max(
        0,
        next.children - (seated - MAX_SEATED_PASSENGERS),
      );
    }
    if (next.infants > next.adults) next.infants = next.adults;
    return next;
  }

  function updatePassengerUrlCounts(next: FlightPassengers) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("adt", String(next.adults));
    params.set("chd", String(next.children));
    params.set("inf", String(next.infants));
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function handlePassengerCountsChange(counts: {
    adult: number;
    child: number;
    infant: number;
  }) {
    const next = clampPassengerCounts({
      adults: counts.adult,
      children: counts.child,
      infants: counts.infant,
    });
    updatePassengerUrlCounts(next);
  }

  function handleDobTypeMismatch(
    _globalIndex: number,
    slot: TravelerSlot,
    classified: PassengerCategory,
  ) {
    const suggested = suggestCountsAfterReclassification(
      { adults: adt, children: chd, infants: inf },
      slot.type,
      classified,
    );
    if (
      suggested.adults === adt &&
      suggested.children === chd &&
      suggested.infants === inf
    ) {
      if (slot.type === "adult" && adt <= 1) {
        toast({
          title: t("Cannot change passenger type"),
          description: t(
            "At least one adult (12+ years) is required for booking.",
          ),
          variant: "destructive",
        });
      }
      return;
    }
    updatePassengerUrlCounts(suggested);
    const slotLabel = getSlotLabel(slot, t);
    const newLabel =
      classified === "infant"
        ? t("Infant")
        : classified === "child"
          ? t("Child")
          : t("Adult");
    toast({
      title: t("Passenger count updated"),
      description: t(
        "{{name}} is not a {{expected}} based on date of birth. Updated booking to {{count}} {{actual}}(s).",
        {
          name: slotLabel,
          expected:
            slot.type === "infant"
              ? t("Infant")
              : slot.type === "child"
                ? t("Child")
                : t("Adult"),
          count:
            classified === "infant"
              ? suggested.infants
              : classified === "child"
                ? suggested.children
                : suggested.adults,
          actual: newLabel,
          defaultValue: `${slotLabel} is not a ${slot.type} based on date of birth. Updated booking to include ${newLabel}.`,
        },
      ),
    });
  }

  function handleRemoveSlot(globalIndex: number, slot: TravelerSlot) {
    if (slot.type === "adult" && adt <= 1) {
      toast({
        title: t("Cannot remove"),
        description: t("At least one adult is required for booking."),
        variant: "destructive",
      });
      return;
    }

    const next = { adult: adt, child: chd, infant: inf };
    if (slot.type === "adult") next.adult -= 1;
    if (slot.type === "child") next.child -= 1;
    if (slot.type === "infant") next.infant -= 1;

    handlePassengerCountsChange(next);
    toast({
      title: t("Traveler removed"),
      description: t("Removed 1 {{type}} from booking.", {
        type: t(slot.type),
      }),
    });
  }

  useEffect(() => {
    const last = lastPaxCountsRef.current;
    if (last.adt === adt && last.chd === chd && last.inf === inf) {
      return;
    }
    lastPaxCountsRef.current = { adt, chd, inf };
    setTravelers((prev) =>
      remapTravelersForCounts(
        prev,
        buildTravelerSlots(last.adt, last.chd, last.inf),
        adt,
        chd,
        inf,
        emptyTraveler,
      ),
    );
  }, [adt, chd, inf]);

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [flightDetails, setFlightDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [inquiryResult, setInquiryResult] = useState<any>(null);
  const isBid =
    searchParams.get("bid") === "true" ||
    urlFlightId?.includes("cheap-bid") ||
    selectedFlightIds[0]?.includes("cheap-bid");
  const bidId = searchParams.get("bidId");
  const [standbyDeal, setStandbyDeal] = useState<any>(null);
  const [isProfileChecking, setIsProfileChecking] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true);

  const initialClass = normalizeCabinClassId(
    resolvePreferredCabinClass(
      searchParams.get("prefClass"),
      searchParams.get("class"),
      searchParams.get("cabin"),
    ),
  );

  const [cabinClass, setCabinClass] = useState<string>(initialClass);
  const cabinInitializedRef = useRef(false);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  // Affirm + Refund Shield state
  const [paymentMethod, setPaymentMethod] = useState<"standard" | "affirm">(
    "standard",
  );
  const [affirmToken, setAffirmToken] = useState<string | null>(null);
  const [affirmVcnData, setAffirmVcnData] = useState<any>(null);
  const [isAffirmLoading, setIsAffirmLoading] = useState(false);

  const handlePaymentMethodChange = (method: "standard" | "affirm") => {
    setPaymentMethod(method);
    if (method === "affirm") {
      toast({
        title: t("Affirm Selected"),
        description: refundShieldOpted
          ? t("Paying via Affirm installment plan with Refund Shield protection.")
          : t("Confirm booking by selecting the available installment plan."),
      });
    } else {
      setAffirmToken(null);
    }
  };

  const [refundShieldOpted, setRefundShieldOpted] = useState(false);

  const handleRefundShieldToggle = (opted: boolean) => {
    setRefundShieldOpted(opted);
    if (opted) {
      toast({
        title: t("Refund Shield Protection Opted"),
        description:
          paymentMethod === "affirm"
            ? t("Refund Shield protection added to your Affirm installment plan.")
            : t("Refund Shield protection added. Advance payment will be processed via Razorpay."),
      });
    }
  };

  // Payment simulator modal state (replaces window.confirm)
  const [simulatorModal, setSimulatorModal] = useState<{
    open: boolean;
    onConfirm: (() => void) | null;
    onCancel: (() => void) | null;
  }>({ open: false, onConfirm: null, onCancel: null });

  // Razorpay SDK loading stage — drives the animated overlay
  const [razorpayStage, setRazorpayStage] = useState<RazorpayLoadStage>("idle");
  const [onRazorpayCancel, setOnRazorpayCancel] = useState<(() => void) | null>(
    null,
  );

  const { data: session, isLoading } = useAuthSession();
  const storeBaseCurrency = useCurrencyStore((s) => s.baseCurrency);
  const getConvertedAmount = useCurrencyStore((s) => s.getConvertedAmount);
  const getCurrency = useCurrencyStore((s) => s.getCurrency);
  // Default to the user's preferred currency setting, ignore URL currency so we can convert it for them!
  const baseCurrency = storeBaseCurrency;
  const currentCurrency =
    getCurrency(baseCurrency) || SUPPORTED_CURRENCIES["USD"];

  const formatPrice = (amount: number) => {
    return `${currentCurrency.symbol} ${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const seatTotal = useMemo(() => {
    const total = Object.values(selectedSeats).reduce((s, v) => s + v.price, 0);
    return getConvertedAmount(
      total,
      (flightDetails?.currency as any) || "USD",
      baseCurrency,
    );
  }, [selectedSeats, flightDetails, baseCurrency, getConvertedAmount]);

  const ancillaryTotal = useMemo(() => {
    const total = ancillaries.reduce((s, a) => s + a.quantity * a.unitPrice, 0);
    return getConvertedAmount(
      total,
      (flightDetails?.currency as any) || "USD",
      baseCurrency,
    );
  }, [ancillaries, flightDetails, baseCurrency, getConvertedAmount]);

  const addonsTotal = useMemo(() => {
    const total = selectedAddons.reduce((s, a) => s + a.price, 0);
    return getConvertedAmount(total, "USD", baseCurrency);
  }, [selectedAddons, baseCurrency, getConvertedAmount]);

  const displayFlight = useMemo(
    () =>
      mergeDisplayFlight(selectedFlightFromStore, flightDetails, {
        flightId: urlFlightId || selectedFlightIds[0] || null,
        searchedOrigin: searchParams.get("org"),
        searchedDestination: searchParams.get("des"),
      }),
    [
      selectedFlightFromStore,
      flightDetails,
      urlFlightId,
      selectedFlightIds,
      searchParams,
    ],
  );

  const fareSource = useMemo(() => {
    if (isBid && standbyDeal) {
      // For 'percentage' or 'fixed' discountType the DB stores the relative discount value,
      // NOT a dollar amount. The server already computed the real discounted
      // dollar fares and stored them in cheapBidApplied on the flight entity.
      // Prefer those computed values; fall back to raw DB values for 'replace'.
      const isPercentage = (standbyDeal.discountType || "replace") === "percentage";
      const isRelative =
        isPercentage || (standbyDeal.discountType || "replace") === "fixed";
      const appliedMeta =
        flightDetails?.cheapBidApplied || displayFlight?.cheapBidApplied;

      const resolvedAdtFare = appliedMeta && appliedMeta.bidAdtPrice !== undefined
        ? appliedMeta.bidAdtPrice
        : standbyDeal.bidAdtPrice;
      const resolvedChdFare = appliedMeta && appliedMeta.bidChdPrice !== undefined
        ? appliedMeta.bidChdPrice
        : (standbyDeal.bidChdPrice ?? standbyDeal.bidAdtPrice);
      const resolvedInfFare = appliedMeta && appliedMeta.bidInfPrice !== undefined
        ? appliedMeta.bidInfPrice
        : (standbyDeal.bidInfPrice ?? 0);

      const src = {
        baseFare: 0,
        tax: 0,
        totalFare: 0,
        currency: standbyDeal.currency || "USD",
        flightFare: {
          adultFare: resolvedAdtFare,
          childFare: resolvedChdFare,
          infantFare: resolvedInfFare,
          adultTax: 0,
          childTax: 0,
          infantTax: 0,
        },
        pricedFor: passengerCounts,
      };
      console.log('[PriceTrace] fareSource (BID):', {
        bidId: standbyDeal.id,
        discountType: standbyDeal.discountType,
        isPercentage,
        isRelative,
        adultFare: resolvedAdtFare,
        childFare: resolvedChdFare,
        infantFare: resolvedInfFare,
        currency: src.currency,
        rawBidAdtPrice: standbyDeal.bidAdtPrice,
      });
      return src;
    }
    // Standard (non-bid) booking: always prefer the ORIGINAL search-result prices
    // (displayFlight) over the live re-priced values (flightDetails).  The live
    // /flights/price call may apply markups a second time, pushing the total much
    // higher than what was shown on the search page.  displayFlight carries the
    // correct offer price that was already marked-up once during search.
    const hasCheapBid = !!displayFlight?.cheapBidApplied;
    const originalMeta = displayFlight?.cheapBidApplied;

    const src = {
      baseFare:
        (hasCheapBid && originalMeta ? originalMeta.originalAdtPrice : displayFlight?.flightFare?.adultFare) ||
        (flightDetails?.baseFare && flightDetails.baseFare > 0
          ? flightDetails.baseFare
          : undefined),
      tax:
        (hasCheapBid && originalMeta ? 0 : displayFlight?.flightFare?.adultTax) ||
        (flightDetails?.tax && flightDetails.tax > 0
          ? flightDetails.tax
          : undefined),
      totalFare: hasCheapBid && originalMeta
        ? (flightDetails?.totalFare ?? originalMeta.originalTotal)
        : (displayFlight?.totalCost ?? flightDetails?.totalFare),
      totalCost: hasCheapBid && originalMeta
        ? (flightDetails?.totalFare ?? originalMeta.originalTotal)
        : (displayFlight?.totalCost ?? flightDetails?.totalFare),
      currency: displayFlight?.currency ?? flightDetails?.currency,
      flightFare: flightDetails?.flightFare || (hasCheapBid && originalMeta
        ? {
            adultFare: originalMeta.originalAdtPrice,
            childFare: originalMeta.originalChdPrice ?? originalMeta.originalAdtPrice,
            infantFare: originalMeta.originalInfPrice ?? 0,
            adultTax: 0,
            childTax: 0,
            infantTax: 0,
          }
        : displayFlight?.flightFare),
      pricedFor: flightDetails?.pricedFor,
    };
    console.log('[PriceTrace] fareSource (STANDARD):', {
      'displayFlight.totalCost': displayFlight?.totalCost,
      'displayFlight.currency': displayFlight?.currency,
      'displayFlight.flightFare': displayFlight?.flightFare,
      'flightDetails.totalFare': flightDetails?.totalFare,
      'flightDetails.baseFare': flightDetails?.baseFare,
      'flightDetails.tax': flightDetails?.tax,
      'flightDetails.currency': flightDetails?.currency,
      '→ fareSource.totalFare (used)': src.totalFare,
      '→ fareSource.currency': src.currency,
      '→ fareSource.flightFare': src.flightFare,
    });
    return src;
  }, [flightDetails, displayFlight, isBid, standbyDeal, passengerCounts]);

  const computedFare = useMemo(() => {
    const result = computeBookingFareTotals(fareSource, passengerCounts, isBid);
    console.log('[PriceTrace] computedFare:', {
      baseFare: result.baseFare,
      tax: result.tax,
      total: result.total,
      currency: result.currency,
      passengerCounts,
    });
    return result;
  }, [fareSource, passengerCounts]);

  const baseFareValue = useMemo(() => {
    const currencyToUse = (computedFare.currency || "USD") as any;
    const val = getConvertedAmount(computedFare.baseFare, currencyToUse, baseCurrency);
    console.log('[PriceTrace] baseFareValue:', {
      from: computedFare.baseFare, fromCurrency: currencyToUse,
      to: val, toCurrency: baseCurrency,
    });
    return val;
  }, [computedFare, baseCurrency, getConvertedAmount]);

  const taxValue = useMemo(() => {
    const currencyToUse = (computedFare.currency || "USD") as any;
    const val = getConvertedAmount(computedFare.tax, currencyToUse, baseCurrency);
    console.log('[PriceTrace] taxValue:', {
      from: computedFare.tax, fromCurrency: currencyToUse,
      to: val, toCurrency: baseCurrency,
    });
    return val;
  }, [computedFare, baseCurrency, getConvertedAmount]);


  const refundShieldFee = useMemo(() => {
    if (!refundShieldOpted || isBid) return 0;
    const subtotal =
      baseFareValue + taxValue + seatTotal + ancillaryTotal + addonsTotal;
    return subtotal * 0.1;
  }, [
    refundShieldOpted,
    isBid,
    baseFareValue,
    taxValue,
    seatTotal,
    ancillaryTotal,
    addonsTotal,
  ]);

  const subtotalBeforeAffirm = useMemo(
    () =>
      baseFareValue +
      taxValue +
      seatTotal +
      ancillaryTotal +
      addonsTotal +
      refundShieldFee,
    [
      baseFareValue,
      taxValue,
      seatTotal,
      ancillaryTotal,
      addonsTotal,
      refundShieldFee,
    ],
  );

  const affirmFee = useMemo(
    () => computeAffirmFee(subtotalBeforeAffirm, paymentMethod, isBid),
    [subtotalBeforeAffirm, paymentMethod, isBid],
  );

  const grandTotal = useMemo(() => {
    return subtotalBeforeAffirm + affirmFee;
  }, [subtotalBeforeAffirm, affirmFee]);

  const usdLedger = useMemo(
    () =>
      computeUsdLedgerTotals({
        computedFare,
        seatTotal: Object.values(selectedSeats).reduce(
          (s, v) => s + v.price,
          0,
        ),
        ancillaryTotal: ancillaries.reduce(
          (s, a) => s + a.quantity * a.unitPrice,
          0,
        ),
        addonsTotal: selectedAddons.reduce((s, a) => s + a.price, 0),
        displayCurrency: "USD",
        refundShieldOpted,
        isBid,
        paymentMethod,
        convert: getConvertedAmount,
      }),
    [
      computedFare,
      selectedSeats,
      ancillaries,
      selectedAddons,
      refundShieldOpted,
      isBid,
      paymentMethod,
      getConvertedAmount,
    ],
  );

  // Log selected flight details and pricing side-by-side in USD and User Currency
  useEffect(() => {
    if (flightDetails) {
      const rate = getConvertedAmount(1, "USD", baseCurrency);
      const flightFare =
        displayFlight?.flightFare || flightDetails?.flightFare || {};
      const adultFare = flightFare.adultFare ?? flightDetails.baseFare ?? 0;
      const childFare = flightFare.childFare ?? adultFare * 0.75;
      const infantFare = flightFare.infantFare ?? adultFare * 0.1;

      const adultTax = flightFare.adultTax ?? flightDetails.tax ?? 0;
      const childTax = flightFare.childTax ?? adultTax * 0.75;
      const infantTax = flightFare.infantTax ?? adultTax * 0.1;

      console.log(
        `%c[Pricing Debug] Selected Flight Details & Pricing (Side-by-Side):`,
        "color:#0ea5e9;font-weight:bold",
        {
          meta: {
            flightId: flightDetails.id || flightDetails.flightId,
            passengerCounts,
            exchangeRate: `1 USD = ${rate.toFixed(4)} ${baseCurrency}`,
          },
          unitFaresUSD: {
            adult: `${adultFare} USD`,
            child: `${childFare} USD`,
            infant: `${infantFare} USD`,
            adultTax: `${adultTax} USD`,
            childTax: `${childTax} USD`,
            infantTax: `${infantTax} USD`,
          },
          unitFaresUserCurrency: {
            adult: `${(adultFare * rate).toFixed(2)} ${baseCurrency}`,
            child: `${(childFare * rate).toFixed(2)} ${baseCurrency}`,
            infant: `${(infantFare * rate).toFixed(2)} ${baseCurrency}`,
            adultTax: `${(adultTax * rate).toFixed(2)} ${baseCurrency}`,
            childTax: `${(childTax * rate).toFixed(2)} ${baseCurrency}`,
            infantTax: `${(infantTax * rate).toFixed(2)} ${baseCurrency}`,
          },
          totalsUSD: {
            baseFare: `${computedFare.baseFare.toFixed(2)} USD`,
            tax: `${computedFare.tax.toFixed(2)} USD`,
            seatTotal: `${usdLedger.seatTotal.toFixed(2)} USD`,
            ancillaryTotal: `${usdLedger.ancillaryTotal.toFixed(2)} USD`,
            addonsTotal: `${usdLedger.addonsTotal.toFixed(2)} USD`,
            refundShieldFee: `${usdLedger.refundShieldFee.toFixed(2)} USD`,
            affirmFee: `${usdLedger.affirmFee.toFixed(2)} USD`,
            grandTotal: `${usdLedger.total.toFixed(2)} USD`,
          },
          totalsUserCurrency: {
            baseFare: `${baseFareValue.toFixed(2)} ${baseCurrency}`,
            tax: `${taxValue.toFixed(2)} ${baseCurrency}`,
            seatTotal: `${seatTotal.toFixed(2)} ${baseCurrency}`,
            ancillaryTotal: `${ancillaryTotal.toFixed(2)} ${baseCurrency}`,
            addonsTotal: `${addonsTotal.toFixed(2)} ${baseCurrency}`,
            refundShieldFee: `${refundShieldFee.toFixed(2)} ${baseCurrency}`,
            affirmFee: `${affirmFee.toFixed(2)} ${baseCurrency}`,
            grandTotal: `${grandTotal.toFixed(2)} ${baseCurrency}`,
          },
        },
      );
    }
  }, [
    flightDetails,
    displayFlight,
    baseCurrency,
    passengerCounts,
    computedFare,
    usdLedger,
    baseFareValue,
    taxValue,
    seatTotal,
    ancillaryTotal,
    addonsTotal,
    refundShieldFee,
    affirmFee,
    grandTotal,
    getConvertedAmount,
  ]);

  const bookingPriceBreakdown = useMemo(
    () => ({
      currency: usdLedger.currency,
      baseFare: usdLedger.baseFare,
      taxesAndFees: usdLedger.tax,
      seatTotal: usdLedger.seatTotal,
      ancillaryTotal: usdLedger.ancillaryTotal,
      addonsTotal: usdLedger.addonsTotal,
      refundShieldOpted,
      ...(refundShieldOpted
        ? { refundShieldRate: 0.1, refundShieldFee: usdLedger.refundShieldFee }
        : {}),
      affirmFee: usdLedger.affirmFee,
      affirmRate: paymentMethod === "affirm" ? 0.08 : 0,
      paymentMethod,
      total: usdLedger.total,
      displayCurrency: baseCurrency,
      displayTotal: grandTotal,
    }),
    [usdLedger, refundShieldOpted, paymentMethod, baseCurrency, grandTotal],
  );

  const { openAffirmCheckout } = useAffirm({
    active: true,
  });

  function launchAffirmCheckout(leadInquiryId?: string) {
    setIsAffirmLoading(true);
    const totalUsdCents = convertToUsdCents(grandTotal, baseCurrency);

    const onAffirmApproved = (checkoutToken: string, vcnData?: any) => {
      setAffirmToken(checkoutToken);
      if (vcnData) {
        setAffirmVcnData(vcnData);
      }
      toast({
        title: "Affirm Approved",
        description: "Payment plan confirmed! Processing booking...",
      });
      handleAffirmSubmit(checkoutToken, vcnData, leadInquiryId);
    };

    const onDecline = () => {
      setAffirmToken(null);
      setError("Affirm payment was declined or cancelled.");
      setIsAffirmLoading(false);
      setSubmitLoading(false);
      toast({
        title: t("Affirm Cancelled"),
        description: t("Affirm payment was declined or cancelled."),
      });
    };

    openAffirmCheckout({
      totalAmountUsdCents: totalUsdCents,
      onOpen: () => {
        setIsAffirmLoading(false);
      },
      items: [
        {
          display_name: `Flight ${searchParams.get("org")} → ${searchParams.get("des")}`,
          unit_price: totalUsdCents,
          qty: 1,
        },
      ],
      billing: {
        name: {
          first: travelers[0]?.firstName || "Guest",
          last: travelers[0]?.lastName || "Traveler",
        },
        email: contactEmail.trim() || session?.email || "",
        phone_number: contactPhone.trim() || undefined,
      },
      onSuccess: onAffirmApproved,
      onDecline,
    });
  }

  const progressValue = ((step + 1) / steps.length) * 100;

  const tripSummaryElement = (
    <TripSummary
      flightDetails={flightDetails}
      displayFlight={displayFlight}
      searchParams={searchParams}
      cabinClass={cabinClass}
      totalPax={totalPax}
      travelers={travelers}
      baseFareValue={baseFareValue}
      taxValue={taxValue}
      seatTotal={seatTotal}
      ancillaryTotal={ancillaryTotal}
      selectedAddons={selectedAddons}
      isBid={isBid}
      standbyDeal={standbyDeal}
      grandTotal={grandTotal}
      formatPrice={formatPrice}
      getConvertedAmount={getConvertedAmount}
      baseCurrency={baseCurrency}
      refundShieldOpted={refundShieldOpted}
      onRefundShieldToggle={handleRefundShieldToggle}
      refundShieldFee={refundShieldFee}
      affirmFee={affirmFee}
      paymentMethod={paymentMethod}
      onPaymentMethodChange={handlePaymentMethodChange}
      isPricingLoading={isPricingLoading}
    />
  );

  const selectedFlightIdsStr = selectedFlightIds.join(",");

  // Strip legacy fare params from old bookmarks / shared links
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const legacyKeys = ["fareTotal", "baseFare", "tax", "cur"];
    let changed = false;
    for (const key of legacyKeys) {
      if (params.has(key)) {
        params.delete(key);
        changed = true;
      }
    }
    if (changed) {
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  }, []);

  // Fetch flight details
  useEffect(() => {
    const flightId = urlFlightId || selectedFlightIdsStr;
    if (!flightId) {
      if (!isLoading) router.replace("/flights");
      return;
    }
    setLoading(true);

    if (flightId.includes(",")) {
      const ids = flightId.split(",").filter(Boolean);
      Promise.all(ids.map((id) => apiFetch(`/flights/${id}`)))
        .then((flights: any[]) => {
          const combined = {
            flightId,
            baseFare: flights.reduce(
              (acc, f) => acc + (f.baseFare || f.totalFare || 0),
              0,
            ),
            tax: flights.reduce((acc, f) => acc + (f.tax || 0), 0),
            totalFare: flights.reduce((acc, f) => acc + (f.totalFare || 0), 0),
            currency: flights[0]?.currency || "USD",
            departureAirport:
              searchParams.get("org") || flights[0]?.departureAirport,
            arrivalAirport:
              searchParams.get("des") ||
              flights[flights.length - 1]?.arrivalAirport ||
              "Multi-City",
            departureAt: flights[0]?.departureAt,
            arrivalAt: flights[flights.length - 1]?.arrivalAt,
            airlineName:
              flights[0]?.airline?.name ||
              flights[0]?.airlineName ||
              "Multi-City Package",
            airlineCode: flights[0]?.airline?.code || flights[0]?.airlineCode,
          };
          setFlightDetails(combined);
          logCabinAvailability("GET /flights (multi-city)", combined);
          setLoading(false);
        })
        .catch(() => {
          setFlightDetails(null);
          setLoading(false);
        });
    } else {
      apiFetch(`/flights/${flightId}`)
        .then(async (data: any) => {
          setFlightDetails({
            ...data,
            departureAirport:
              data?.departureAirport === "Pending"
                ? urlOrg
                : data?.departureAirport,
            arrivalAirport:
              data?.arrivalAirport === "Pending"
                ? urlDes
                : data?.arrivalAirport,
          });
          logCabinAvailability("GET /flights/:id", data);
          setLoading(false);
        })
        .catch(() => {
          setFlightDetails(null);
          setLoading(false);
        });
    }
  }, [router, selectedFlightIdsStr, urlFlightId, isLoading, urlOrg, urlDes]);

  useEffect(() => {
    if (!flightDetails) return;
    if (cabinInitializedRef.current) return;
    const available = resolveAvailableCabinSelectorIds(flightDetails);
    const next = pickInitialCabinForFlight(initialClass, available);
    if (next) {
      setCabinClass(next);
      cabinInitializedRef.current = true;
    }
  }, [flightDetails?.availableCabinClasses, flightDetails?.cabinClass]);

  // Fetch Bid details if applicable
  useEffect(() => {
    if (isBid && bidId) {
      setIsPricingLoading(true);
      apiFetch<any>(`/cheap-bid/token?token=${bidId}`)
        .then((deal) => {
          if (deal) setStandbyDeal(deal);
        })
        .catch((err) => {
          console.error("Error fetching bid:", err);
          toast({
            title: "Bid details unavailable",
            description:
              "We couldn't retrieve your bid price. Proceeding with standard pricing.",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsPricingLoading(false);
        });
    }
  }, [isBid, bidId]);

  // Effect to refresh pricing when cabin class, passenger count, or base currency changes
  useEffect(() => {
    const flightId = urlFlightId || selectedFlightIds[0];
    if (flightId) {
      refreshPricing();
    }
  }, [cabinClass, baseCurrency, adt, chd, inf]);

  const handleCabinSelect = (id: string) => {
    const available = resolveAvailableCabinSelectorIds(
      flightDetails,
      initialClass,
    );
    if (!available.includes(id)) {
      toast({
        title: "Cabin not available",
        description: `This flight is only offered in ${available.map(formatCabinClassLabel).join(", ")}.`,
        variant: "destructive",
      });
      return;
    }
    setCabinClass(id);
  };

  const refreshPricing = async () => {
    const flightId = urlFlightId || selectedFlightIds[0];
    if (!flightId) return;

    if (isBid) {
      // Bids are manual overrides; skip external provider live pricing API.
      return;
    }

    const available = resolveAvailableCabinSelectorIds(
      flightDetails,
      initialClass,
    );
    if (!available.includes(cabinClass)) return;

    setIsPricingLoading(true);
    try {
      const res = (await apiFetch("/flights/price", {
        method: "POST",
        body: JSON.stringify({
          flightId,
          cabinClass,
          passengers: travelerSlots.map((s) => ({
            type: PASSENGER_AGE_RULES[s.type].ptc,
          })),
          currency: SELECT_API_CURRENCY,
        }),
      })) as any;

      if (res) {
        if (res.cabinUnavailable) {
          const nextAvailable = resolveAvailableCabinSelectorIds(
            {
              availableCabinClasses: res.availableCabinClasses,
              cabinClass: flightDetails?.cabinClass,
            },
            initialClass,
          );
          toast({
            title: "Cabin not available",
            description:
              res.errorMessage ||
              `No fare for ${formatCabinClassLabel(cabinClass)}. Choose ${nextAvailable.map(formatCabinClassLabel).join(" or ")}.`,
            variant: "destructive",
          });
          setFlightDetails((prev: any) =>
            prev
              ? {
                  ...prev,
                  ...(res.availableCabinClasses?.length
                    ? { availableCabinClasses: res.availableCabinClasses }
                    : {}),
                }
              : prev,
          );
          setCabinClass(pickInitialCabinForFlight(initialClass, nextAvailable));
          return;
        }

        if (res.priceUnavailable) {
          toast({
            title: "Live pricing unavailable",
            description:
              res.errorMessage ||
              "Redirecting you back to search results to select another flight.",
            variant: "destructive",
          });
          const queryParams = new URLSearchParams(window.location.search);
          queryParams.delete("id");
          setTimeout(() => {
            router.replace(`/flights/result?${queryParams.toString()}`);
          }, 2000);
          return;
        }

        setFlightDetails((prev: any) => {
          if (!prev) return null;
          console.log('[PriceTrace] /flights/price API response received:', {
            'API totalFare (live)': res.totalFare,
            'API baseFare (live)': res.baseFare,
            'API tax (live)': res.tax,
            'API currency': res.currency,
            'API perPassengerFare': res.perPassengerFare,
            'displayFlight.totalCost (ORIGINAL - used for display)': displayFlight?.totalCost,
            'displayFlight.flightFare (ORIGINAL - used for display)': displayFlight?.flightFare,
            '⚠ Difference': res.totalFare && displayFlight?.totalCost
              ? `live $${res.totalFare?.toFixed(2)} vs original $${displayFlight.totalCost?.toFixed(2)} (${((res.totalFare / displayFlight.totalCost - 1) * 100).toFixed(1)}% higher)`
              : 'n/a',
          });
          const merged = {
            ...prev,
            totalFare: res.totalFare ?? prev.totalFare,
            tax: res.tax ?? prev.tax,
            baseFare: res.baseFare ?? prev.baseFare,
            currency: res.currency ?? prev.currency,
            flightFare: res.flightFare ?? prev.flightFare,
            cabinClass,
            pricedFor: { adults: adt, children: chd, infants: inf },
            ...(res.availableCabinClasses?.length
              ? { availableCabinClasses: res.availableCabinClasses }
              : {}),
          };
          logCabinAvailability("POST /flights/price", merged, {
            requestedCabin: cabinClass,
            priceApiList: res.availableCabinClasses,
          });
          return merged;
        });
      }
    } catch (err) {
      console.error("[Pricing] refreshPricing failed:", err);
    } finally {
      setIsPricingLoading(false);
    }
  };

  const checkProfile = async () => {
    if (!session) return;
    try {
      const profile: any = await apiFetch("/user/profile");
      const complete = !!(profile?.firstName && profile?.lastName);
      setIsProfileComplete(complete);
    } catch (err) {
      console.error("Error checking profile:", err);
    } finally {
      setIsProfileChecking(false);
    }
  };

  useEffect(() => {
    if (session) checkProfile();
    else if (!isLoading) setIsProfileChecking(false);
  }, [session, isLoading]);

  useEffect(() => {
    if (session?.email && !contactEmail) {
      setContactEmail(session.email);
    }
    if (session?.phone && !contactPhone) {
      setContactPhone(session.phone);
    }
  }, [session?.email, session?.phone, contactEmail, contactPhone]);

  useEffect(() => {
    if (!MOCK_TRAVELERS_ENABLED) return;
    setContactEmail((e) => e || MOCK_CONTACT.email);
    setContactPhone((p) => p || MOCK_CONTACT.phone);
  }, []);

  // ─── Validate Step 0 ───────────────────────────────────────
  function validateTravelers(): boolean {
    const result = getTravelerValidationError(travelers, {
      slots: travelerSlots,
      departDate,
      slotLabel: (s) => getSlotLabel(s, t),
    });
    if (!result.valid) {
      setShowValidationErrors(true);
      toast({
        title: result.title ?? t("Incomplete Details"),
        description: t("Please fill in all required fields and correct highlighted errors."),
        variant: "destructive",
      });
      return false;
    }
    return true;
  }

  function validateContact(): boolean {
    const result = getContactValidationError(contactEmail, contactPhone);
    if (!result.valid) {
      setShowValidationErrors(true);
      toast({
        title: result.title ?? t("Contact details required"),
        description: t("Please fill in all required fields and correct highlighted errors."),
        variant: "destructive",
      });
      return false;
    }
    return true;
  }

  function validateBeforeSubmit(): boolean {
    return validateTravelers() && validateContact();
  }

  function normalizeTravelersForSubmit(
    list: InquiryTraveler[],
  ): InquiryTraveler[] {
    return list.map((t) => ({
      ...t,
      firstName: t.firstName.trim(),
      lastName: t.lastName.trim(),
      middleName: t.middleName?.trim() || undefined,
      nationality: t.nationality?.trim() || undefined,
      dob: t.dob?.trim() || undefined,
    }));
  }

  function buildCrmSnapshotFields(
    paymentMeta?: Record<string, unknown>,
  ): Record<string, unknown> {
    const flightId = urlFlightId || selectedFlightIds[0] || "";
    return {
      crmStatus: "0",
      workStatus: "pending",
      source: "web",
      sourceId: flightId,
      ...(typeof paymentMeta?.crmStatus === "string"
        ? { crmStatus: paymentMeta.crmStatus }
        : {}),
      ...(typeof paymentMeta?.workStatus === "string"
        ? { workStatus: paymentMeta.workStatus }
        : {}),
      ...(typeof paymentMeta?.source === "string"
        ? { source: paymentMeta.source }
        : {}),
      ...(typeof paymentMeta?.sourceId === "string"
        ? { sourceId: paymentMeta.sourceId }
        : {}),
    };
  }

  function buildFlightSnapshot(paymentMeta?: Record<string, unknown>) {
    if (!flightDetails) return undefined;

    // Create a cleaned price breakdown that only includes USD
    const { displayCurrency, displayTotal, ...cleanPriceBreakdown } =
      bookingPriceBreakdown;

    return {
      ...flightDetails,
      flightFare: isBid
        ? (() => {
            const appliedMeta = flightDetails?.cheapBidApplied ?? displayFlight?.cheapBidApplied;
            const discountType = standbyDeal?.discountType ?? appliedMeta?.discountType ?? "replace";
            const isRelative = discountType === "percentage" || discountType === "fixed";

            return {
              adultFare: isRelative && appliedMeta
                ? appliedMeta.bidAdtPrice
                : (standbyDeal?.bidAdtPrice ?? appliedMeta?.bidAdtPrice ?? 0),
              childFare: isRelative && appliedMeta
                ? appliedMeta.bidChdPrice
                : (standbyDeal?.bidChdPrice ?? standbyDeal?.bidAdtPrice ?? appliedMeta?.bidChdPrice ?? 0),
              infantFare: isRelative && appliedMeta
                ? appliedMeta.bidInfPrice
                : (standbyDeal?.bidInfPrice ?? appliedMeta?.bidInfPrice ?? 0),
              adultTax: 0,
              childTax: 0,
              infantTax: 0,
            };
          })()
        : flightDetails.flightFare,
      outbound: flightDetails.outbound ?? flightDetails.outboundSegments ?? displayFlight?.outbound ?? [],
      inbound: flightDetails.inbound ?? flightDetails.inboundSegments ?? displayFlight?.inbound ?? [],
      defaultCurrency: flightDetails.currency || SELECT_API_CURRENCY,
      defaultTotalFare: flightDetails.totalFare,
      defaultBaseFare: flightDetails.baseFare,
      defaultTax: flightDetails.tax,
      currency: usdLedger.currency,
      totalFare: usdLedger.total,
      totalCost: usdLedger.total,
      baseFare: usdLedger.baseFare,
      tax: usdLedger.tax,
      userCurrency: baseCurrency,
      userTotalFare: grandTotal,
      userBaseFare: baseFareValue,
      userTax: taxValue,
      addons: selectedAddons,
      addonsTotal: usdLedger.addonsTotal,
      seatTotal: usdLedger.seatTotal,
      ancillaryTotal: usdLedger.ancillaryTotal,
      refundShieldOpted: isBid ? false : refundShieldOpted,
      ...(isBid || !refundShieldOpted
        ? {}
        : {
            refundShieldRate: 0.1,
            refundShieldFee: usdLedger.refundShieldFee,
          }),
      affirmFee: usdLedger.affirmFee,
      affirmRate: paymentMethod === "affirm" ? 0.08 : 0,
      paymentMethod: isBid ? "bid_deposit" : paymentMethod,
      priceBreakdown: {
        ...bookingPriceBreakdown,
        displayBaseFare: baseFareValue,
        displayTaxesAndFees: taxValue,
        displaySeatTotal: seatTotal,
        displayAncillaryTotal: ancillaryTotal,
        displayAddonsTotal: addonsTotal,
        displayRefundShieldFee: refundShieldFee,
      },
      ...buildCrmSnapshotFields(paymentMeta),
      ...(paymentMeta ?? {}),
    };
  }

  function buildInquiryPayload(paymentMeta?: Record<string, unknown>) {
    const flightId = urlFlightId || selectedFlightIds[0];
    return {
      flightId: flightId!,
      origin: searchParams.get("org") ?? undefined,
      destination: searchParams.get("des") ?? undefined,
      departDate: searchParams.get("dDate") ?? undefined,
      returnDate: searchParams.get("rDate") ?? undefined,
      tripType: searchParams.get("trip") ?? undefined,
      cabinClass,
      adults: adt,
      children: chd,
      infants: inf,
      flightSnapshot: buildFlightSnapshot(paymentMeta),
      travelers: normalizeTravelersForSubmit(travelers),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      source: searchParams.get("utm_source") || "web",
    };
  }

  async function confirmBookingAfterPayment(
    paymentMeta: Record<string, unknown>,
    existingInquiryId?: string
  ) {
    const payload = buildInquiryPayload(paymentMeta);
    const resolvedId = existingInquiryId || inquiryResult?.customerId?.toString() || inquiryResult?.id;
    if (resolvedId) {
      (payload as any).id = resolvedId;
    }

    const result = await submitInquiry({
      ...payload,
      status: "pending",
    });
    setInquiryResult(result as any);
    setStep(2);

    // --- Local DB persistence is now handled universally in the backend during booking creation ---
    // ---------------------------------------------

    return result;
  }

  function openPaymentSimulator(onConfirm: () => void, onCancel?: () => void) {
    setSimulatorModal({ open: true, onConfirm, onCancel: onCancel ?? null });
  }

  async function collectAdvanceRazorpayPayment(options: {
    amount: number;
    paymentType: "refund_shield" | "affirm" | "advance";
    description: string;
    metadata?: Record<string, unknown>;
  }) {
    setRazorpayStage("creating-order");
    const orderData = await createAdvancePaymentOrder({
      amount: getConvertedAmount(
        options.amount,
        baseCurrency,
        SELECT_API_CURRENCY,
      ),
      currency: SELECT_API_CURRENCY,
      paymentType: options.paymentType,
      metadata: options.metadata,
    });

    if (!orderData?.razorpayOrderId) {
      setRazorpayStage("idle");
      stopLoading();
      throw new Error("Failed to initialize Razorpay payment order.");
    }

    await new Promise<void>((resolve, reject) => {
      const cancelHandler = () => {
        setRazorpayStage("idle");
        stopLoading();
        reject(new Error("Payment cancelled by user"));
      };
      setOnRazorpayCancel(() => cancelHandler);

      openRazorpayCheckout({
        orderData,
        description: options.description,
        prefill: {
          name:
            `${travelers[0]?.firstName || ""} ${travelers[0]?.lastName || ""}`.trim() ||
            undefined,
          email: contactEmail.trim() || session?.email || undefined,
          contact: contactPhone.trim() || undefined,
        },
        onStageChange: (s) => setRazorpayStage(s),
        onOpen: () => {
          stopLoading();
          setRazorpayStage("idle"); // modal is now visible — hide our overlay
        },
        onSuccess: async (response) => {
          setRazorpayStage("verifying");
          startLoading(t("Verifying Payment..."));
          try {
            await verifyAdvancePayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            // Record payment to tbl_affirmpayment — non-fatal, fire-and-forget
            void recordRazorpayPayment({
              bookingRef: orderData.razorpayOrderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              amount: options.amount,
              currency: "USD",
              email: contactEmail.trim() || session?.email || undefined,
              phone: contactPhone.trim() || undefined,
            });
            setRazorpayStage("idle");
            resolve();
          } catch (err) {
            setRazorpayStage("idle");
            reject(err);
          }
        },
        onError: (message) => {
          setRazorpayStage("idle");
          stopLoading();
          reject(new Error(message));
        },
        onDismiss: () => {
          cancelHandler();
        },
        openSimulator: (onConfirm) => {
          setSubmitLoading(false);
          stopLoading();
          openPaymentSimulator(onConfirm, () => cancelHandler());
        },
      });
    }).finally(() => {
      setOnRazorpayCancel(null);
    });

    return orderData;
  }

  // ─── Submit Inquiry ────────────────────────────────────────
  async function handleSubmit() {
    if (!validateBeforeSubmit()) return;
    setSubmitLoading(true);
    setError("");
    try {
      if (isBid && bidId) {
        let currentInquiryId = inquiryResult?.customerId?.toString() || inquiryResult?.id;
        try {
          const leadResult = await submitInquiry({
            ...buildInquiryPayload({
              paymentFlow: "bid_deposit",
              paymentStatus: "pending",
              ...(currentInquiryId ? { id: currentInquiryId } : {}),
            }),
            status: "pending",
          });
          setInquiryResult(leadResult as any);
          currentInquiryId = (leadResult as any).customerId?.toString() || (leadResult as any).id;
        } catch (e) {
          console.error("Failed to save initial lead", e);
        }

        setRazorpayStage("creating-order");
        const orderData = await createBidDepositOrder({
          dealId: bidId,
          userId: session?.id,
          departureDate: (searchParams.get("dDate") || "").replace(" ", "+"),
          origin: searchParams.get("org") || "",
          destination: searchParams.get("des") || "",
          currency: SELECT_API_CURRENCY,
          depositAmount: getConvertedAmount(
            grandTotal,
            baseCurrency,
            SELECT_API_CURRENCY,
          ),
          passengers: travelers.map((t) => ({
            firstName: t.firstName,
            lastName: t.lastName,
            email: contactEmail.trim() || session?.email || "",
            phone: contactPhone.trim(),
          })),
        });

        if (!orderData?.razorpayOrderId) {
          stopLoading();
          setRazorpayStage("idle");
          throw new Error("Failed to initialize payment order.");
        }

        await new Promise<void>((resolve, reject) => {
          const cancelHandler = () => {
            setRazorpayStage("idle");
            stopLoading();
            reject(new Error("Payment cancelled by user"));
          };
          setOnRazorpayCancel(() => cancelHandler);

          openRazorpayCheckout({
            orderData: {
              key: orderData.key,
              amount: orderData.amount,
              currency: orderData.currency,
              razorpayOrderId: orderData.razorpayOrderId,
            },
            description: "Bid Deal Deposit",
            prefill: {
              name:
                `${travelers[0]?.firstName || ""} ${travelers[0]?.lastName || ""}`.trim() ||
                undefined,
              email: contactEmail.trim() || session?.email || undefined,
              contact: contactPhone.trim() || undefined,
            },
            onStageChange: (s) => setRazorpayStage(s),
            onOpen: () => {
              stopLoading();
              setRazorpayStage("idle"); // modal is now visible — hide our overlay
            },
            onSuccess: async (response) => {
              setRazorpayStage("verifying");
              startLoading(t("Verifying Payment..."));
              try {
                await verifyBidDeposit({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature:
                    response.razorpay_signature || "mock_signature",
                });
                // Record payment to tbl_affirmpayment — non-fatal, fire-and-forget
                void recordRazorpayPayment({
                  bookingRef: orderData.razorpayOrderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  amount: orderData.amount / 100,
                  currency: orderData.currency || "USD",
                  email: contactEmail.trim() || session?.email || undefined,
                  phone: contactPhone.trim() || undefined,
                });
                setRazorpayStage("idle");
                resolve();
              } catch (err) {
                setRazorpayStage("idle");
                reject(err);
              }
            },
            onError: (message) => {
              setRazorpayStage("idle");
              stopLoading();
              reject(new Error(message));
            },
            onDismiss: () => {
              cancelHandler();
            },
            openSimulator: (onConfirm) => {
              setSubmitLoading(false);
              stopLoading();
              openPaymentSimulator(onConfirm, () => cancelHandler());
            },
          });
        }).finally(() => {
          setOnRazorpayCancel(null);
        });

        startLoading(t("Confirming your booking..."));
        await confirmBookingAfterPayment({
          advancePaymentVerified: true,
          paymentFlow: "bid_deposit",
          razorpayOrderId: orderData.razorpayOrderId,
          depositId: orderData.depositId,
          bidId,
        }, currentInquiryId);
        return;
      }

      let currentInquiryId =
        inquiryResult?.customerId?.toString() || inquiryResult?.id;
      try {
        const leadResult = await submitInquiry({
          ...buildInquiryPayload({
            paymentFlow: "standard",
            paymentStatus: "pending",
            ...(currentInquiryId ? { id: currentInquiryId } : {}),
          }),
          status: "pending",
        });
        setInquiryResult(leadResult as any);
        currentInquiryId =
          (leadResult as any).customerId?.toString() || (leadResult as any).id;
      } catch (e) {
        console.error("Failed to save initial lead", e);
      }

      const orderData = await collectAdvanceRazorpayPayment({
        amount: grandTotal,
        paymentType: "advance",
        description: `Flight Booking ${searchParams.get("org") || ""} → ${searchParams.get("des") || ""}`,
        metadata: { paymentFlow: "standard" },
      });

      startLoading(t("Confirming your booking..."));
      await confirmBookingAfterPayment(
        {
          advancePaymentVerified: true,
          paymentFlow: "standard",
          razorpayOrderId: orderData.razorpayOrderId,
        },
        currentInquiryId,
      );
    } catch (e: any) {
      if (e.message === "Payment cancelled by user") {
        // Just let the finally block reset loading state
      } else if (e.message?.includes("401") || e.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else {
        let userFriendlyMsg =
          e.message || "An unexpected error occurred. Please try again.";
        if (e.message) {
          try {
            const parsed = JSON.parse(e.message);
            if (parsed && typeof parsed === "object") {
              userFriendlyMsg =
                parsed.message || parsed.error || userFriendlyMsg;
            }
          } catch {
            // ignore
          }
        }
        if (
          userFriendlyMsg.includes("Razorpay") ||
          userFriendlyMsg.includes("[object Object]") ||
          userFriendlyMsg.includes("406")
        ) {
          userFriendlyMsg =
            "Please try again later or contact customer support.";
        }
        setError(userFriendlyMsg);
        toast({
          title: t("Payment Failed"),
          description: t(userFriendlyMsg),
          variant: "destructive",
        });
      }
    } finally {
      setSubmitLoading(false);
      stopLoading();
      setRazorpayStage("idle");
    }
  }

  async function handleRefundShieldCheckout() {
    if (!validateBeforeSubmit()) return;
    setSubmitLoading(true);
    setError("");
    try {
      const orderData = await collectAdvanceRazorpayPayment({
        amount: grandTotal,
        paymentType: "advance", // Using 'advance' to avoid potential DB enum constraint errors
        description: "Flight Booking with Refund Shield",
        metadata: { paymentFlow: "refund_shield", refundShieldOpted: true },
      });

      startLoading(t("Confirming your booking..."));
      const result = await confirmBookingAfterPayment({
        advancePaymentVerified: true,
        paymentFlow: "refund_shield",
        refundShieldOpted: true,
        razorpayOrderId: orderData.razorpayOrderId,
      });

      const bookingId = (result as any)?.id || urlFlightId || "unknown";

      console.log(
        `[RefundShield Checkout] Payment verified. Triggering RS API for booking ${bookingId}`,
      );
      try {
        // Compute per-passenger USD prices for tbl_refund_shield logging
        const _flightFare = fareSource.flightFare;
        const _adultFareUnit = Number(_flightFare?.adultFare || 0);
        const _childFareUnit = Number(
          _flightFare?.childFare ||
            (_adultFareUnit > 0 ? _adultFareUnit * 0.75 : 0),
        );
        const _infantFareUnit = Number(
          _flightFare?.infantFare ||
            (_adultFareUnit > 0 ? _adultFareUnit * 0.1 : 0),
        );
        const _adultTaxUnit = Number(_flightFare?.adultTax || 0);
        const _childTaxUnit = Number(
          _flightFare?.childTax ||
            (_adultTaxUnit > 0 ? _adultTaxUnit * 0.75 : 0),
        );
        const _infantTaxUnit = Number(
          _flightFare?.infantTax ||
            (_adultTaxUnit > 0 ? _adultTaxUnit * 0.1 : 0),
        );
        // Total price per passenger type (fare + tax, per person)
        const _adultPriceEach = _adultFareUnit + _adultTaxUnit;
        const _childPriceEach = _childFareUnit + _childTaxUnit;
        const _infantPriceEach = _infantFareUnit + _infantTaxUnit;

        const _hasPaxFares = _adultPriceEach > 0;
        let _adultPriceTotal: number | undefined;
        let _childPriceTotal: number | undefined;
        let _infantPriceTotal: number | undefined;

        if (_hasPaxFares) {
          _adultPriceTotal = Math.round(_adultPriceEach * adt * 100) / 100;
          _childPriceTotal =
            chd > 0 ? Math.round(_childPriceEach * chd * 100) / 100 : undefined;
          _infantPriceTotal =
            inf > 0
              ? Math.round(_infantPriceEach * inf * 100) / 100
              : undefined;
        } else {
          // Fallback: use usdLedger base+tax split by pax weight
          const _flightCostUsd =
            (usdLedger?.baseFare || 0) + (usdLedger?.tax || 0);
          const _adultWeight = adt * 1.0;
          const _childWeight = chd * 0.75;
          const _infantWeight = inf * 0.1;
          const _totalWeight = _adultWeight + _childWeight + _infantWeight || 1;
          _adultPriceTotal =
            Math.round(((_flightCostUsd * _adultWeight) / _totalWeight) * 100) /
            100;
          _childPriceTotal =
            chd > 0
              ? Math.round(
                  ((_flightCostUsd * _childWeight) / _totalWeight) * 100,
                ) / 100
              : undefined;
          _infantPriceTotal =
            inf > 0
              ? Math.round(
                  ((_flightCostUsd * _infantWeight) / _totalWeight) * 100,
                ) / 100
              : undefined;
        }

        const rsResponse = await apiFetch("/payments/refund-shield/report", {
          method: "POST",
          body: JSON.stringify({
            bookingId,
            pnrCode:
              (result as any)?.bookingRef ||
              (result as any)?.pnrCode ||
              bookingId,
            basketTotalUsd: usdLedger.subtotal,
            passengerCount: totalPax,
            adultCount: adt,
            childCount: chd,
            infantCount: inf,
            adultPrice: _adultPriceTotal,
            childPrice: _childPriceTotal,
            infantPrice: _infantPriceTotal,
            opted: true,
            paymentVerified: true,
            userEmail: contactEmail.trim() || session?.email || "",
            userFirstName: travelers[0]?.firstName || "",
            userLastName: travelers[0]?.lastName || "",
            origin: searchParams.get("org") || "",
            destination: searchParams.get("des") || "",
            flightDate: searchParams.get("dDate") || "",
          }),
        });
        console.log(
          `[RefundShield Checkout] RS API triggered successfully:`,
          rsResponse,
        );
      } catch (rsErr) {
        console.error(
          `[RefundShield Checkout] Error triggering RS API:`,
          rsErr,
        );
      }
    } catch (e: any) {
      if (e.message !== "Payment cancelled by user") {
        let userFriendlyMsg =
          e.message || "Payment processing failed. Please try again.";
        if (e.message) {
          try {
            const parsed = JSON.parse(e.message);
            if (parsed && typeof parsed === "object") {
              userFriendlyMsg =
                parsed.message || parsed.error || userFriendlyMsg;
            }
          } catch {
            // ignore
          }
        }
        if (
          userFriendlyMsg.includes("Razorpay") ||
          userFriendlyMsg.includes("[object Object]") ||
          userFriendlyMsg.includes("406")
        ) {
          userFriendlyMsg =
            "Please try again later or contact customer support.";
        }
        setError(userFriendlyMsg);
        toast({
          title: t("Payment Failed"),
          description: t(userFriendlyMsg),
          variant: "destructive",
        });
      }
    } finally {
      setSubmitLoading(false);
      stopLoading();
      setRazorpayStage("idle");
    }
  }

  async function handleAffirmSubmit(tokenToUse?: string, vcnToUse?: any, inquiryIdOverride?: string) {
    if (!validateBeforeSubmit()) return;

    const token = tokenToUse || affirmToken;
    const vcnData = vcnToUse || affirmVcnData;

    let currentInquiryId = inquiryIdOverride || inquiryResult?.customerId?.toString() || inquiryResult?.id;

    if (!token) {
      setSubmitLoading(true);

      try {
        const leadResult = await submitInquiry({
          ...buildInquiryPayload({ paymentFlow: "affirm", paymentStatus: "pending", omitFeesForLead: true, ...(currentInquiryId ? { id: currentInquiryId } : {}) }),
          status: "pending",
        });
        setInquiryResult(leadResult as any);
        currentInquiryId = (leadResult as any).customerId?.toString() || (leadResult as any).id;
      } catch (e) {
        console.error("Failed to save initial lead for Affirm", e);
      }

      launchAffirmCheckout(currentInquiryId);
      return;
    }

    setSubmitLoading(true);
    startLoading(t("Confirming your booking..."));
    setError("");
    try {
      const result = await confirmBookingAfterPayment({
        advancePaymentVerified: true,
        paymentFlow: "affirm",
        paymentMethod: "affirm",
        affirmCheckoutToken: token,
      }, currentInquiryId);

      const bookingId = (result as any)?.id || urlFlightId || currentInquiryId || "unknown";
      const totalUsdCents = convertToUsdCents(grandTotal, baseCurrency);
      const totalUsd = totalUsdCents / 100;

      console.log(
        `[Affirm Checkout] Triggering Affirm authorize API for booking ${bookingId}`,
      );

      try {
        const affirmResponse = await apiFetch("/payments/affirm/authorize", {
          method: "POST",
          body: JSON.stringify({
            checkoutToken: token,
            vcnData: vcnData,
            bookingId,
            totalAmountUsdCents: totalUsdCents,
            refundShieldOpted,
            passengerCount: totalPax,
            baseFarePerPaxUsd: totalUsd / Math.max(totalPax, 1),
            basketTotalUsd: usdLedger.subtotal,
            userEmail: contactEmail.trim() || session?.email || "",
            phone: contactPhone.trim() || "",
            userFirstName: travelers[0]?.firstName || "",
            userLastName: travelers[0]?.lastName || "",
            flightDate: searchParams.get("dDate") || "",
            origin: searchParams.get("org") || "",
            destination: searchParams.get("des") || "",
            pnrCode:
              (result as any)?.bookingRef ||
              (result as any)?.confirmation?.bookingRef ||
              (result as any)?.pnrCode ||
              bookingId,
          }),
        });
        console.log(
          `[Affirm Checkout] Affirm authorize API triggered successfully:`,
          affirmResponse,
        );
      } catch (affirmErr) {
        console.error(
          `[Affirm Checkout] Error triggering Affirm authorize API:`,
          affirmErr,
        );
      }
    } catch (e: any) {
      if (e.message !== "Payment cancelled by user") {
        setError(e.message || "Affirm processing failed.");
      }
    } finally {
      setSubmitLoading(false);
      stopLoading();
    }
  }

  function goNext() {
    if (step !== 0) {
      if (step < steps.length - 1) setStep(step + 1);
      return;
    }

    if (isBid) {
      handleSubmit();
      return;
    }

    if (paymentMethod === "affirm") {
      handleAffirmSubmit();
      return;
    }

    if (refundShieldOpted) {
      handleRefundShieldCheckout();
      return;
    }

    handleSubmit();
  }

  const shortRef = inquiryResult?.confirmation?.bookingRef ?? "";

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ─── Payment Simulator Modal ─────────────────────────────── */}
      {simulatorModal.open && (
        <SimulatorAutoSuccessModal
          onConfirm={() => {
            const fn = simulatorModal.onConfirm;
            setSimulatorModal({ open: false, onConfirm: null, onCancel: null });
            fn?.();
          }}
          onCancel={() => {
            const cancelFn = simulatorModal.onCancel;
            setSimulatorModal({ open: false, onConfirm: null, onCancel: null });
            cancelFn?.();
            setError("Payment cancelled.");
          }}
        />
      )}
      {/* ─── Razorpay SDK Loading Overlay ───────────────────── */}
      <RazorpayLoader
        stage={razorpayStage}
        onCancel={onRazorpayCancel ? () => onRazorpayCancel() : undefined}
      />

      {/* ─── Affirm Loading Overlay ─────────────────────────────── */}
      <AnimatePresence>
        {isAffirmLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="flex flex-col items-center gap-4 p-5 relative overflow-hidden min-w-[240px] md:min-w-[280px] max-w-[80vw] bg-background/95 backdrop-blur-xl rounded-[20px] md:rounded-[28px] shadow-2xl shadow-black/20 border border-border/50 text-center"
            >
              {/* Spinning progress loader matching global-loader */}
              <div className="h-9 w-9 rounded-full border-4 border-redmix/30 border-t-redmix dark:border-white/20 dark:border-t-white animate-spin" />

              <div className="flex flex-col items-center gap-1 relative z-10 w-full px-2">
                <h3 className="text-xs md:text-sm font-semibold tracking-tight text-redmix/90 dark:text-white">
                  {t("Connecting to Affirm")}
                </h3>
                <p className="text-[10px] md:text-xs text-muted-foreground">
                  {t("Opening secure payment plan window...")}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      <main className="flex-grow container mx-auto max-w-7xl px-4 pt-20 pb-8">
        {/* ─── Header ─────────────────────────────────────── */}
        <div className="mb-4 flex flex-col items-center text-center">
          {/* Profile incomplete banner */}
          {/* {!isProfileComplete && !isProfileChecking && step < 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-5 w-full max-w-2xl rounded-2xl border border-redmix/20 bg-redmix/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 text-center sm:text-left">
                <div className="h-10 w-10 rounded-full bg-redmix/10 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-redmix" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {t("Complete your profile")}
                  </p>
                  <p className="text-xs text-foreground/80 ">
                    {t(
                      "Add your name to your profile for a smoother experience.",
                    )}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full sm:w-auto rounded-xl text-xs font-bold"
                onClick={() => window.open("/profile", "_blank")}
              >
                {t("Edit Profile")}
              </Button>
            </motion.div>
          )} */}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("mb-3", step === 2 && "text-center mb-8 mt-4")}
          >
            <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl lg:text-3xl">
              {step === 2 ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 sm:h-12 sm:w-12">
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 sm:h-7 sm:w-7" />
                  </div>
                  <span className="text-[22px] font-semibold tracking-tight sm:text-2xl lg:text-3xl">
                    {t("Booking")}{" "}
                    <span className="text-emerald-600">
                      {t("Request Received!")}
                    </span>
                  </span>
                </span>
              ) : (
                <>
                  {t("Confirm")}{" "}
                  <span className="text-redmix">{t("Request")}</span>
                </>
              )}
            </h1>
            {step < 2 && (
              <p className="mt-2 text-foreground/80 text-sm font-semibold">
                {t(
                  "Please provide traveler information to complete your booking.",
                )}
              </p>
            )}
          </motion.div>

          {/* Progress bar hidden for single step */}
        </div>

        {/* ─── Main Grid ──────────────────────────────────── */}
        <div
          className={cn(
            "grid gap-10 lg:grid-cols-[1fr_380px]",
            step === 2 && "max-w-7xl mx-auto lg:grid-cols-[1fr]",
          )}
        >
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Error banner */}
                {error && (
                  <div className="mb-6 rounded-xl border border-destructive/20 bg-redmix/10 p-4 text-sm text-redmix flex items-center gap-3">
                    <Info className="h-5 w-5 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {/* ── Step 0: Traveler Forms ── */}
                {step === 0 && (
                  <div className="space-y-4">
                    {/* Premium Cabin Class Selection */}
                    <div className="relative">
                      <CabinClassSelector
                        flightDetails={flightDetails}
                        initialClass={initialClass}
                        cabinClass={cabinClass}
                        onSelect={handleCabinSelect}
                      />
                    </div>

                    <p className="text-sm text-foreground font-medium pt-2">
                      {t("Please fill in the details for")}{" "}
                      <span className="font-bold text-foreground">
                        {totalPax}
                      </span>{" "}
                      {totalPax === 1 ? t("traveler") : t("travelers")}
                    </p>
                    <BookingTravelersForm
                      travelers={travelers}
                      onChange={setTravelers}
                      travelerSlots={travelerSlots}
                      departDate={departDate}
                      onDobTypeMismatch={handleDobTypeMismatch}
                      showErrors={showValidationErrors}
                    />

                    <BookingContactForm
                      email={contactEmail}
                      phone={contactPhone}
                      onEmailChange={setContactEmail}
                      onPhoneChange={setContactPhone}
                      disabled={submitLoading}
                      showErrors={showValidationErrors}
                    />
                  </div>
                )}

                {/* ── Step 1: Review & Submit ── */}
                {step === 1 && (
                  <Card className="rounded-3xl border-border/60 bg-card shadow-2xl shadow-black/5 overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                    {/* <div className="h-2 w-full bg-gradient-to-r from-redmix to-orange-500" /> */}
                    {/* Decorative Top Bar */}

                    <CardContent className="p-5 space-y-3">
                      {/* Header */}
                      <div className="flex items-center gap-4 border-b border-border/50 pb-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-redmix/10 text-redmix">
                          <ClipboardList className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold  tracking-tight text-foreground">
                            {t("Review Your Details")}
                          </h2>
                          <p className="text-sm text-foreground/80 mt-1 leading-relaxed font-medium">
                            {t(
                              "Please verify your information before submitting to EzeeFlights.",
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Traveler Summary */}
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold  tracking-wider text-foreground/80 flex items-center gap-2 mb-3">
                          <UserIcon className="h-4 w-4" />{" "}
                          {t("Passenger Information")}
                        </h3>
                        <motion.div
                          variants={{
                            hidden: { opacity: 0 },
                            show: {
                              opacity: 1,
                              transition: { staggerChildren: 0.1 },
                            },
                          }}
                          initial="hidden"
                          animate="show"
                          className="grid gap-3 sm:grid-cols-2"
                        >
                          {travelerSlots.map((slot) => {
                            const traveler = travelers[slot.globalIndex];
                            if (!traveler) return null;
                            return (
                              <motion.div
                                key={`${slot.type}-${slot.indexInType}`}
                                variants={{
                                  hidden: { opacity: 0, scale: 0.95 },
                                  show: { opacity: 1, scale: 1 },
                                }}
                                className="group relative flex flex-col justify-center gap-1 rounded-2xl border border-border/60 bg-muted/20 p-5 transition-all hover:border-redmix/30 hover:bg-redmix/5 hover:shadow-md"
                              >
                                <div className="absolute top-4 right-4 text-xs font-bold text-foreground/80 /30 transition-colors group-hover:text-redmix/20">
                                  {getSlotLabel(slot, t)}
                                </div>
                                <p className="pr-6 font-bold text-foreground text-base capitalize truncate">
                                  {[
                                    traveler.firstName,
                                    traveler.middleName,
                                    traveler.lastName,
                                  ]
                                    .filter(Boolean)
                                    .join(" ")}
                                </p>
                                <div className="mt-2 space-y-1.5">
                                  {traveler.dob && (
                                    <p className="text-xs text-foreground/80  flex items-center gap-1.5">
                                      <span className="font-semibold text-foreground/70">
                                        {t("Date of Birth")}:
                                      </span>
                                      {traveler.dob}
                                    </p>
                                  )}
                                  {(traveler.nationality ||
                                    traveler.gender) && (
                                    <p className="text-xs text-foreground/80 ">
                                      {[traveler.nationality, traveler.gender]
                                        .filter(Boolean)
                                        .join(" • ")}
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      </div>

                      {/* Flight Summary */}
                      {flightDetails && (
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold  tracking-wider text-foreground/80  flex items-center gap-2 mb-3">
                            <Plane className="h-4 w-4" /> {t("Selected Flight")}
                          </h3>
                          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-background p-5 sm:p-6 shadow-sm">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-center bg-muted/40 rounded-xl px-4 py-3 border border-border/50">
                                <p className="font-bold text-base sm:text-lg text-foreground flex items-center gap-3 text-center">
                                  {flightDetails.departureAirport?.includes(
                                    "→",
                                  ) ||
                                  searchParams.get("org")?.includes("→") ? (
                                    flightDetails.departureAirport ||
                                    searchParams.get("org")
                                  ) : (
                                    <>
                                      <span>
                                        {flightDetails.departureAirport ||
                                          searchParams.get("org")}
                                      </span>
                                      <Plane className="h-5 w-5 text-redmix shrink-0" />
                                      <span>
                                        {flightDetails.arrivalAirport ||
                                          searchParams.get("des")}
                                      </span>
                                    </>
                                  )}
                                </p>
                              </div>

                              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-medium text-foreground/80 ">
                                <div className="flex items-center gap-2">
                                  <CalendarDays className="h-4 w-4 text-redmix/70" />
                                  <span>
                                    {allDates.length > 0
                                      ? allDates
                                          .map((d) =>
                                            new Date(d).toLocaleDateString(
                                              "en-US",
                                              {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                              },
                                            ),
                                          )
                                          .join(" • ")
                                      : flightDetails.departureAt
                                        ? new Date(
                                            flightDetails.departureAt,
                                          ).toLocaleDateString("en-US", {
                                            weekday: "short",
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                          })
                                        : searchParams.get("dDate")}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-1.5 rounded-full bg-border" />
                                  <span>
                                    {searchParams.get("class") || "Economy"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Confirmation Message */}
                      <div
                        className={cn(
                          "flex items-start gap-4 rounded-2xl border p-5 text-sm",
                          isBid
                            ? "border-redmix/20 bg-redmix/[0.02]"
                            : "border-foreground/20",
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-full p-2 shrink-0",
                            isBid
                              ? "bg-redmix/10 text-redmix"
                              : "bg-foreground/20 text-foreground dark:text-foreground",
                          )}
                        >
                          {isBid ? (
                            <Clock className="h-6 w-6" />
                          ) : (
                            <ShieldCheck className="h-6 w-6" />
                          )}
                        </div>
                        <div className="space-y-1 mt-0.5">
                          <p className="font-bold text-foreground text-base">
                            {isBid
                              ? t("Secure with Deposit")
                              : t("Instant Confirmation")}
                          </p>
                          <p className="text-foreground/80 leading-relaxed">
                            {isBid
                              ? t(
                                  "To lock in this standby price, a fully refundable deposit is required. If your bid is not successful within 24 hours, the full amount will be credited back to your account.",
                                )
                              : t(
                                  "Your booking is being confirmed instantly. No payment is required at this stage. Our EzeeFlights specialists will provide your e-ticket shortly.",
                                )}
                          </p>
                        </div>
                      </div>
                      <div className=" flex justify-end ms-auto w-full">
                        {/* Submit Button */}
                        <Button
                          onClick={goNext}
                          disabled={submitLoading}
                          className="group relative w-full lg:w-64 h-12 rounded-2xl bg-redmix text-white font-bold shadow-xl shadow-redmix/20 hover:shadow-redmix/30 transition-all duration-300 overflow-hidden hover:scale-[1.01] active:scale-[0.98]"
                        >
                          {/* <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" /> */}
                          <span className="relative flex items-center justify-end gap-2">
                            {submitLoading ? (
                              <>
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 1,
                                    ease: "linear",
                                  }}
                                  className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                                {t("Processing...")}
                              </>
                            ) : (
                              <>
                                {isBid
                                  ? t("Pay Deposit & Bid")
                                  : t("Submit Booking")}{" "}
                                <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                              </>
                            )}
                          </span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {step === 2 && (
                  <BookingConfirmationPanel
                    bookingRef={shortRef}
                    displayFlight={displayFlight}
                    flightDetails={flightDetails}
                    searchParams={searchParams}
                    travelers={travelers}
                    cabinClass={cabinClass}
                    totalPax={totalPax}
                    baseFareValue={baseFareValue}
                    taxValue={taxValue}
                    seatTotal={seatTotal}
                    ancillaryTotal={ancillaryTotal}
                    addonsTotal={addonsTotal}
                    grandTotal={grandTotal}
                    baseCurrency={baseCurrency}
                    formatPrice={formatPrice}
                    getConvertedAmount={getConvertedAmount}
                    formatAddonPrice={(addon) =>
                      formatPrice(
                        getConvertedAmount(addon.price, "USD", baseCurrency),
                      )
                    }
                    refundShieldOpted={refundShieldOpted}
                    refundShieldFee={refundShieldFee}
                    affirmFee={affirmFee}
                    selectedAddons={selectedAddons}
                    allDates={allDates}
                    departDateLabel={
                      allDates[0]
                        ? new Date(allDates[0]).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : undefined
                    }
                    isBid={isBid}
                    standbyDeal={standbyDeal}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Trip Summary for Mobile (Shown above buttons) */}
            {step < 2 && (
              <div className="mt-8 lg:hidden">{tripSummaryElement}</div>
            )}

            {/* Navigation buttons */}
            {step < 2 && (
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 mt-5">
                {/* <Button
                  variant="ghost"
                  disabled={step === 0}
                  onClick={() => setStep((s) => s - 1)}
                  className="w-full sm:w-auto text-foreground/80  hover:text-foreground text-xs font-bold "
                >
                  ← Previous
                </Button> */}
                {step === 0 && (
                  <Button
                    onClick={goNext}
                    disabled={submitLoading}
                    className="w-full mb-16 md:mb-0 sm:w-auto h-12 px-10 rounded-xl bg-redmix font-bold text-sm shadow-xl shadow-redmix/20 transition-all hover:scale-[1.01] active:scale-[0.98]"
                  >
                    {submitLoading
                      ? t("Processing...")
                      : isBid || refundShieldOpted
                        ? t("Pay & Confirm")
                        : t("Confirm Request")}{" "}
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* ─── Trip Summary Sidebar (Shown on Desktop) ─────────────────────── */}
          {step < 2 && (
            <aside className="hidden lg:block space-y-6">
              <div className="sticky top-24">{tripSummaryElement}</div>
            </aside>
          )}
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

// Suspense-wrapped
export default function BookingPage(props: any) {
  return (
    <Suspense fallback={null}>
      <BookingPageContent {...props} />
    </Suspense>
  );
}
