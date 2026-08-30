"use client";

import React, { useMemo, useState } from "react";
import {
  Sparkles,
  Users,
  Car,
  CheckCircle2,
  Info,
  MapPin,
  Zap,
  Fuel,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Tag,
  Clock,
  Layers,
  AlertTriangle,
} from "lucide-react";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { useLoadingStore } from "@/lib/store/use-loading-store";
import { useToast } from "@/lib/hooks/use-toast";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

type TravelportCar = {
  id: string;
  name: string;
  makeModel?: string;
  acrissCode?: string;
  category: string;
  passengerCount?: number;
  doorCount?: number | string;
  partnerNetwork: { name: string };
  pricePerDay: number;
  totalPrice?: number;
  baseRate?: number;
  taxes?: number;
  extraMileageCharge?: number;
  dropOffCharge?: number;
  distanceUnits?: string;
  currency: string;
  features: string[];
  unlimitedMileage: boolean;
  freeCancellation: boolean;
  location: string;
  pickupLocationDetails?: string;
  counterLocationCode?: string | null;
  locationDescription?: string | null;
  description?: string;
  warnings?: string[];
  vendorLocationKey?: string | null;
  rateToken?: string | null;
  inventoryToken?: string | null;
  rateCode?: string;
  rateAvailability?: string;
  rateInclusions?: string[];
  fuelType?: string | null;
  mediaItems?: Array<{ url: string; sizeCode?: string; type?: string }>;
  images?: string[];
  allRates?: Array<{
    rateToken?: string | null;
    inventoryToken?: string | null;
    rateCode?: string | null;
    rateCategory?: string | null;
    ratePeriod?: string | null;
    unlimitedMileage?: boolean;
    estimatedTotalAmount?: number;
    baseRate?: number;
    currency?: string;
  }>;
  charges?: Array<{
    category?: string;
    name?: string;
    amount?: number;
    includedInRate?: string;
  }>;
  [key: string]: any;
};

interface Props {
  car: TravelportCar;
  pickupDate?: string;
  dropoffDate?: string;
}

const VENDOR_NAMES: Record<string, string> = {
  ZE: "Hertz",
  ZI: "Avis",
  SX: "Sixt",
  ET: "Enterprise",
  ZL: "National",
  AL: "Alamo",
  FX: "Fox Rent A Car",
  ZA: "Payless",
  ZD: "Budget",
  ZT: "Thrifty",
  EP: "Europcar",
  VR: "Dollar / Thrifty",
};

export function decodeAcrissCode(code: string): string {
  if (!code || code.length !== 4) return "Standard Rental Vehicle";

  const categories: Record<string, string> = {
    M: "Mini", N: "Mini Elite", E: "Economy", H: "Economy Elite",
    C: "Compact", D: "Compact Elite", I: "Intermediate", J: "Intermediate Elite",
    S: "Standard", R: "Standard Elite", F: "Fullsize", G: "Fullsize Elite",
    P: "Premium", U: "Premium Elite", L: "Luxury", W: "Luxury Elite",
    O: "Oversize", X: "Specialty"
  };

  const types: Record<string, string> = {
    B: "2-3 Door Passenger Car", C: "2 or 4 Door Passenger Car",
    D: "4-5 Door Passenger Car", W: "Wagon/Estate", V: "Passenger Van",
    L: "Limousine", S: "Sport Car", T: "Convertible", F: "SUV",
    J: "Open All-Terrain", X: "Specialty Vehicle", K: "Commercial/Van"
  };

  const transmissions: Record<string, string> = {
    M: "Manual Transmission", N: "Manual 4WD/AWD",
    A: "Automatic Transmission", R: "Automatic 4WD/AWD"
  };

  const fuels: Record<string, string> = {
    R: "Air Conditioned (Unspecified Fuel)",
    N: "No Air Conditioning (Unspecified Fuel)",
    D: "Air Conditioned (Diesel)",
    Z: "No Air Conditioning (Diesel)",
    E: "Air Conditioned (Electric)",
    C: "Air Conditioned (Electric/Hybrid)",
    H: "Air Conditioned (Hybrid)",
    Q: "No Air Conditioning (Hybrid)"
  };

  const char1 = categories[code[0]] || "";
  const char2 = types[code[1]] || "";
  const char3 = transmissions[code[2]] || "";
  const char4 = fuels[code[3]] || "";

  const parts = [char1, char2, char3, char4].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Standard Rental Vehicle";
}

export function CarCard({ car, pickupDate, dropoffDate }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language || "en-US";
  const { startLoading, stopLoading } = useLoadingStore();
  const { toast } = useToast();
  const router = useRouter();

  const [isThisSelecting, setIsThisSelecting] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedRateIdx, setSelectedRateIdx] = useState(0);
  const [imageError, setImageError] = useState(false);

  const rentalDays = useMemo(() => {
    if (!pickupDate || !dropoffDate) return 1;
    return Math.max(
      1,
      Math.ceil(
        (new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );
  }, [pickupDate, dropoffDate]);

  const { baseCurrency, getConvertedAmount, getCurrency } = useCurrencyStore();
  const currencyMeta = getCurrency(baseCurrency) || SUPPORTED_CURRENCIES["USD"];
  const symbol = currencyMeta.symbol;
  const carSourceCurrency = car.currency || "USD";

  // Check selected rate or default to car top-level price
  const activeRate = car.allRates?.[selectedRateIdx] || null;
  const rawTotalPrice = activeRate
    ? activeRate.estimatedTotalAmount || car.pricePerDay * rentalDays
    : car.totalPrice && car.totalPrice > 0
      ? car.totalPrice
      : car.pricePerDay * rentalDays;

  const displayPricePerDay = activeRate
    ? activeRate.estimatedTotalAmount && rentalDays > 0
      ? Math.round(activeRate.estimatedTotalAmount / rentalDays)
      : car.pricePerDay
    : car.pricePerDay;

  const displayBaseRate = activeRate?.baseRate || car.baseRate || 0;
  const isDiscountedRate =
    displayBaseRate > rawTotalPrice && displayBaseRate > 0;
  const promotionalSavings = isDiscountedRate
    ? displayBaseRate - rawTotalPrice
    : 0;
  const displayTaxes =
    !isDiscountedRate && displayBaseRate > 0 && rawTotalPrice > displayBaseRate
      ? rawTotalPrice - displayBaseRate
      : car.taxes || 0;

  const formatCardPrice = (amount: number) =>
    `${symbol} ${getConvertedAmount(
      amount,
      carSourceCurrency,
      baseCurrency,
    ).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const rawImage = car.images?.[0] || car.mediaItems?.[0]?.url;
  const displayImage = rawImage ? rawImage.replace(/^http:/i, "https:") : "";

  const hasDetails =
    (car.rateInclusions && car.rateInclusions.length > 0) ||
    !!car.description ||
    (car.warnings && car.warnings.length > 0) ||
    (car.charges && car.charges.length > 0) ||
    (car.allRates && car.allRates.length > 1);

  const handleBooking = async () => {
    if (isThisSelecting) return;
    setIsThisSelecting(true);
    startLoading(t("Please wait..."));

    const rateTokenToUse = activeRate?.rateToken || car.rateToken || "";
    const inventoryTokenToUse =
      activeRate?.inventoryToken || car.inventoryToken || "";
    const rateCodeToUse = activeRate?.rateCode || car.rateCode || "";

    // Convert the total price to USD for backend verification
    const totalPriceUSD = getConvertedAmount(
      rawTotalPrice,
      carSourceCurrency,
      "USD",
    );

    const selectPayload = {
      carId: car.id,
      pickupLocationId: car.location || "",
      dropoffLocationId: car.location || "",
      pickupDate: pickupDate || "",
      dropoffDate: dropoffDate || "",
      rateToken: rateTokenToUse,
      inventoryToken: inventoryTokenToUse,
      rateCode: rateCodeToUse,
      totalPrice: Number(totalPriceUSD.toFixed(2)),
      currency: "USD",
    };

    try {
      const selectData = await apiFetch<{
        priceChanged: boolean;
        verifiedPrice?: number;
        currency?: string;
      }>("/cars/select", {
        method: "POST",
        body: JSON.stringify(selectPayload),
      });

      // Price-change guard: warn user if provider price differs significantly
      if (selectData?.priceChanged) {
        stopLoading();
        setIsThisSelecting(false);
        const newPrice = selectData.verifiedPrice
          ? `$${Number(selectData.verifiedPrice).toFixed(2)} USD`
          : "a different amount";
        toast({
          title: t("Price Changed"),
          description: t(
            "The provider updated the price to {{price}}. Please review the new price and select again to proceed.",
            { price: newPrice }
          ),
          variant: "destructive",
          duration: 7000,
        });
        return;
      }

      const params = new URLSearchParams();
      params.set("carId", car.id);
      params.set("vendor", car.partnerNetwork?.name || "");
      if (rateTokenToUse) params.set("rateToken", rateTokenToUse);
      if (inventoryTokenToUse)
        params.set("inventoryToken", inventoryTokenToUse);
      if (rateCodeToUse) params.set("rateCode", rateCodeToUse);
      if (car.location) {
        params.set("pickupLocation", car.location);
        params.set("dropoffLocation", car.location);
      }
      if (pickupDate) params.set("pickupDate", pickupDate);
      if (dropoffDate) params.set("dropoffDate", dropoffDate);
      // Pass verified price so booking page doesn't need to re-search
      if (selectData?.verifiedPrice) {
        params.set("verifiedPrice", String(selectData.verifiedPrice));
        params.set("verifiedCurrency", selectData.currency || "USD");
      }
      router.push(`/cars/booking?${params.toString()}`);
    } catch (err: any) {
      console.error(err);
      let errMsg = t("An unexpected error occurred. Please try again.");
      if (err?.message) {
        try {
          const parsed = JSON.parse(err.message);
          if (parsed && parsed.message) {
            errMsg = parsed.message;
          } else {
            errMsg = err.message;
          }
        } catch {
          errMsg = err.message;
        }
      }
      toast({
        title: t("Selection Failed"),
        description: errMsg,
        variant: "destructive",
      });
      setIsThisSelecting(false);
      stopLoading();
    }
  };

  const selectButtonClass =
    "bg-redmix text-white font-semibold xl:font-bold rounded-[10px] xl:rounded-xl shadow-none xl:shadow-lg xl:shadow-redmix/20 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer";

  const isElectricOrHybrid =
    car.fuelType?.toLowerCase().includes("electric") ||
    car.fuelType?.toLowerCase().includes("hybrid");

  const counterBadgeText =
    car.counterLocationCode === "CNTR" ||
    car.counterLocationCode === "TERM" ||
    car.locationDescription?.toLowerCase().includes("terminal")
      ? t("In Terminal / Shuttle")
      : car.locationDescription || car.counterLocationCode;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all mb-3 relative flex flex-col">
      <div className="flex flex-col sm:flex-row flex-1 w-full">
        {/* Left Side: Car Image Container */}
        {displayImage && !imageError && (
          <div className="relative aspect-[16/10] sm:aspect-auto sm:w-48 sm:h-32 md:w-52 md:h-32 lg:w-48 lg:h-32 xl:w-52 xl:h-32 2xl:w-56 2xl:h-32 shrink-0 bg-white rounded-xl m-2.5 p-2 flex items-center justify-center border border-border/40 overflow-hidden self-center">
            <img
              src={displayImage}
              alt={car.makeModel || car.name}
              className="max-w-[90%] max-h-[90%] object-contain mx-auto my-auto scale-[1.2] transition-transform duration-300 group-hover:scale-[1.25]"
              onError={() => setImageError(true)}
            />
            {car.acrissCode && (
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-redmix text-white shadow-md text-xs font-bold cursor-help select-none z-10 transition-all outline-none">
                      {car.acrissCode}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[280px] p-2.5 text-xs bg-white dark:bg-card border border-border shadow-lg rounded-xl z-[60] text-foreground">
                    <p className="font-bold mb-1">Vehicle Details</p>
                    <p className="text-foreground/80 leading-normal font-medium">
                      {decodeAcrissCode(car.acrissCode)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {car.fuelType && (
              <span
                className={cn(
                  "absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 backdrop-blur-md",
                  isElectricOrHybrid
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800/80 text-slate-100 dark:bg-slate-200 dark:text-slate-900",
                )}
              >
                {isElectricOrHybrid ? (
                  <Zap className="w-2.5 h-2.5" />
                ) : (
                  <Fuel className="w-2.5 h-2.5" />
                )}
                {car.fuelType}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col xl:flex-row flex-1 w-full">
          {/* Middle Content */}
          <div className="flex-1 p-3 flex flex-col justify-center gap-3 relative min-w-0">
            <div>
              {/* Badges Bar */}
              <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                <span className="rounded-full bg-gradient-to-r from-redmix to-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm flex items-center gap-1 tracking-wider">
                  {/* <Sparkles className="w-3 h-3" />{" "} */}
                  {car.category}
                </span>
                {car.acrissCode && (!displayImage || imageError) && (
                  <span className="rounded-full bg-redmix/10 px-2.5 py-0.5 text-xs font-semibold text-redmix border border-redmix/20">
                    {car.acrissCode}
                  </span>
                )}
                {car.fuelType && (!displayImage || imageError) && (
                  <span className="rounded-full bg-slate-100 dark:bg-muted/50 px-2.5 py-0.5 text-xs font-semibold text-foreground border border-border/50">
                    {car.fuelType}
                  </span>
                )}
                {counterBadgeText && (
                  <span className="rounded-full bg-blue-500/10 dark:bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-500/20 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate max-w-[180px] sm:max-w-[260px]">
                      {counterBadgeText}
                    </span>
                  </span>
                )}
                {car.freeCancellation && (
                  <span className="rounded-full bg-emerald-500/10 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20">
                    {t("Free Cancellation")}
                  </span>
                )}
                {car.allRates && car.allRates.length > 1 && (
                  <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-500/20 flex items-center gap-1">
                    <Layers className="w-2.5 h-2.5" />
                    {car.allRates.length} {t("Rates")}
                  </span>
                )}
              </div>

              {/* Title & Vendor Header */}
              <div className="space-y-1.5 min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-semibold leading-wider text-foreground line-clamp-2">
                  {car.makeModel || car.name}
                </h3>
                {car.makeModel && car.name !== car.makeModel && (
                  <p className="text-xs text-muted-foreground font-medium truncate">
                    {car.name}
                  </p>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-redmix/10 dark:bg-muted text-xs font-semibold text-foreground border border-border/50">
                    {VENDOR_NAMES[car.partnerNetwork?.name] ||
                      car.partnerNetwork?.name ||
                      t("Vendor")}
                  </span>
                  {(activeRate?.rateCode || car.rateCode) && (
                    <span className="text-xs text-foreground/80 font-semibold">
                      • {t("Rate")}: {activeRate?.rateCode || car.rateCode}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 pt-0.5">
                  <p className="flex items-center gap-1.5 text-xs text-foreground/90 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 text-brand-red shrink-0" />
                    <span className="text-foreground">{t("Pickup")}:</span>{" "}
                    <span className="font-semibold text-foreground">
                      {car.location}
                    </span>
                  </p>
                  {car.pickupLocationDetails && (
                    <p className="flex items-start gap-1.5 text-xs text-muted-foreground font-medium pl-5">
                      <Info className="w-3 h-3 shrink-0 mt-0.5" />
                      {car.pickupLocationDetails}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Features & Specs Tags */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              {car.passengerCount && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 dark:bg-muted/40 px-2 py-1 text-xs font-semibold text-foreground border border-border/50">
                  <Users className="w-3.5 h-3.5 text-redmix dark:text-foreground" />
                  {car.passengerCount} {t("Seats")}
                </span>
              )}
              {car.doorCount && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100/80 dark:bg-muted/40 px-2 py-1 text-xs font-semibold text-foreground border border-border/50">
                  <Car className="w-3.5 h-3.5 text-redmix dark:text-foreground" />
                  {car.doorCount} {t("Doors")}
                </span>
              )}
              {car.features &&
                Array.isArray(car.features) &&
                car.features
                  .filter(
                    (feat) =>
                      typeof feat === "string" &&
                      feat.trim() !== "" &&
                      feat.trim().toLowerCase() !== "nan",
                  )
                  .slice(0, 4)
                  .map((feat) => {
                    const translated = t(feat);
                    if (translated === "NaN" || !translated) return null;
                    return (
                      <span
                        key={feat}
                        className="inline-flex items-center rounded-lg bg-slate-100/80 dark:bg-muted/40 px-2 py-1 text-xs font-semibold text-foreground border border-border/50"
                      >
                        {translated}
                      </span>
                    );
                  })}
              {car.unlimitedMileage && (
                <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t("Unlimited")} {car.distanceUnits || "MI"}
                </span>
              )}
            </div>

            {/* Pricing Breakdown (Matches HotelCard scribble style) */}
            <div className="flex items-center gap-2 text-xs font-bold text-foreground/80 flex-wrap">
              <span className="text-foreground font-semibold">
                {t("Price per day")}:
              </span>
              <span className="font-bold text-foreground">
                <CurrencyDisplay
                  amount={displayPricePerDay}
                  currency={carSourceCurrency}
                  bypassConversion={false}
                  amountClassName="font-extrabold text-xs"
                  showComparison={false}
                />
              </span>
              <span className="text-foreground font-bold my-0.5 leading-none">
                *
              </span>
              <span className="text-foreground font-semibold">
                {t("Days")}:
              </span>
              <span className="font-bold text-foreground">{rentalDays}</span>
            </div>

            {/* Toggle Details Footer */}
            {hasDetails && (
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-redmix hover:underline cursor-pointer"
                >
                  {isDetailsOpen ? (
                    <>
                      {t("Hide Details & Fees")}{" "}
                      <ChevronUp className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <>
                      {t("View Details")}{" "}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
                {car.charges && car.charges.length > 0 && (
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {car.charges.length} {t("surcharge(s) listed")}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pricing & Selection block */}
          <div className="w-full xl:w-48 shrink-0 border-t border-border/50 xl:dark:bg-muted/20 xl:border-t-0 xl:border-l xl:border-border px-4 py-4 xl:p-5 flex flex-row xl:flex-col justify-between xl:justify-center items-center gap-4 xl:gap-5 self-stretch">
            <div className="flex flex-col items-start xl:items-center text-left xl:text-center gap-1.5 w-full">
              <span className="text-xs font-bold text-foreground whitespace-nowrap">
                {rentalDays} {rentalDays === 1 ? t("Day") : t("Days")}:{" "}
                <span className="text-redmix font-extrabold">
                  <CurrencyDisplay
                    amount={rawTotalPrice}
                    currency={carSourceCurrency}
                    bypassConversion={false}
                    amountClassName="font-extrabold text-sm xl:text-xl"
                    showComparison={false}
                  />
                </span>
              </span>
              {baseCurrency !== "USD" && carSourceCurrency !== baseCurrency && (
                <p className="text-[9px] font-bold text-foreground/85 whitespace-nowrap">
                  ({t("approx.")} $
                  {getConvertedAmount(
                    rawTotalPrice,
                    carSourceCurrency,
                    "USD",
                  ).toFixed(2)}{" "}
                  USD)
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleBooking}
              disabled={isThisSelecting}
              className={cn(
                "w-auto xl:w-full min-w-[100px] h-10 xl:h-11 flex items-center justify-center text-[15px] xl:text-sm",
                selectButtonClass,
              )}
            >
              {isThisSelecting
                ? t("Selecting...")
                : car.rateAvailability === "Call"
                  ? t("Request Booking")
                  : t("Book Now")}
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Details Grid: Rate Breakdown, Surcharges & Multiple Rates */}
      {hasDetails && isDetailsOpen && (
        <div className="border-t bg-slate-50/60 dark:bg-muted/10 p-3 animate-in fade-in-50 duration-200">
          <div className="flex flex-col lg:flex-row gap-4 text-xs">
            {/* 1. Itemized Charges & Price Breakdown */}
            <div className="flex-1 p-3 rounded-xl bg-white dark:bg-card space-y-3">
              <p className="text-xs font-bold text-foreground tracking-wider border-b border-border/50 pb-2 flex items-center gap-1.5">
                {t("Price & Fee Breakdown")}
              </p>
              <div className="space-y-2">
                {displayBaseRate > 0 ? (
                  <div className="flex justify-between items-center text-foreground/80 font-medium">
                    <span>
                      {isDiscountedRate
                        ? t("Standard Base Rate")
                        : t("Base Rental Rate")}
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCardPrice(displayBaseRate)}
                    </span>
                  </div>
                ) : null}
                {isDiscountedRate && promotionalSavings > 0 ? (
                  <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>{t("Promotional Rate Discount")}</span>
                    <span className="font-bold">
                      - {formatCardPrice(promotionalSavings)}
                    </span>
                  </div>
                ) : null}
                {!isDiscountedRate && displayTaxes > 0 ? (
                  <div className="flex justify-between items-center text-foreground/80 font-medium">
                    <span>{t("Taxes & Fees")}</span>
                    <span className="font-semibold text-foreground">
                      {formatCardPrice(displayTaxes)}
                    </span>
                  </div>
                ) : null}

                {/* Itemized Surcharges */}
                {car.charges && car.charges.length > 0 && (
                  <div className="pt-2.5 border-t border-border/40 space-y-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                      {t("Itemized Surcharges (Travelport uAPI)")}
                    </span>
                    {car.charges.map((charge, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-[11px] text-foreground/90"
                      >
                        <span className="truncate pr-2 font-medium">
                          {charge.name || charge.category || t("Fee")}
                          {charge.includedInRate ? (
                            <span className="text-[10px] text-muted-foreground font-normal ml-1">
                              (
                              {charge.includedInRate === "IncludedInBase"
                                ? t("Included in Base")
                                : t("Included in Total")}
                              )
                            </span>
                          ) : null}
                        </span>
                        <span className="font-bold whitespace-nowrap">
                          {charge.amount
                            ? formatCardPrice(charge.amount)
                            : t("Included")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Multiple Rate Choices Table */}
            {car.allRates && car.allRates.length > 1 ? (
              <div className="w-full lg:w-80 shrink-0 p-3.5 rounded-xl bg-white dark:bg-card border border-border/60 shadow-xs space-y-2.5">
                <p className="text-xs font-bold text-foreground tracking-wider uppercase border-b border-border/50 pb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />{" "}
                  {t("Available Rate Plans")} ({car.allRates.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {car.allRates.map((ratePlan, idx) => {
                    const isSelected = selectedRateIdx === idx;
                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedRateIdx(idx)}
                        className={cn(
                          "p-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between",
                          isSelected
                            ? "bg-redmix/10 border-redmix font-bold text-foreground"
                            : "bg-slate-50 dark:bg-muted/20 border-border/50 hover:border-redmix/50 font-medium text-foreground/80",
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full",
                                isSelected
                                  ? "bg-redmix"
                                  : "bg-slate-300 dark:bg-slate-600",
                              )}
                            />
                            {ratePlan.rateCategory || t("Standard")} (
                            {ratePlan.rateCode || t("Rate")})
                          </span>
                          <span className="text-[10px] text-muted-foreground pl-3.5">
                            {ratePlan.ratePeriod || t("Daily")}{" "}
                            {ratePlan.unlimitedMileage
                              ? `• ${t("Unlimited MI")}`
                              : ""}
                          </span>
                        </div>
                        <span className="font-bold text-foreground">
                          {ratePlan.estimatedTotalAmount
                            ? formatCardPrice(ratePlan.estimatedTotalAmount)
                            : t("Select")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </article>
  );
}
