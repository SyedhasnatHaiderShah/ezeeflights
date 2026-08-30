"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";
import { searchCars, createCarBooking, type CarBooking } from "@/lib/api/cars";
import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/use-toast";
import { parseISO, format, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { NationalitySelect } from "@/components/shared/NationalitySelect";
import { BookingContactForm } from "@/components/flights/BookingContactForm";
import {
  Shield,
  MapPin,
  Calendar,
  User,
  CreditCard,
  Loader2,
  Check,
  Copy,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Phone,
  Mail,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GROUP_SURFACE =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50 shadow-sm";

const INSET_GROUP =
  "overflow-hidden rounded-[10px] border border-border/50 bg-white dark:bg-card divide-y divide-border/50";

const FIELD_LABEL = "text-[12px] font-semibold text-foreground/80";

const INPUT_CLASS =
  "h-10 rounded-[10px] border-border/50 bg-white text-[13px] font-medium text-foreground dark:bg-card dark:border-white/20 dark:hover:border-white/40 dark:focus-visible:ring-white";

// --- Subcomponent 2: Driver Info ---
interface DriverInfoFormProps {
  driverName: string;
  setDriverName: (val: string) => void;
  driverLicenseNumber: string;
  setDriverLicenseNumber: (val: string) => void;
  driverNationality: string;
  setDriverNationality: (val: string) => void;
  driverDob: string;
  setDriverDob: (val: string) => void;
  t: (key: string) => string;
}
function DriverInfoForm({
  driverName,
  setDriverName,
  driverLicenseNumber,
  setDriverLicenseNumber,
  driverNationality,
  setDriverNationality,
  driverDob,
  setDriverDob,
  t,
}: DriverInfoFormProps) {
  return (
    <div className={cn(GROUP_SURFACE, "space-y-3 p-3 md:p-4")}>
      <div className="flex items-start gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-redmix/5 dark:bg-foreground text-redmix">
          <User className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
            {t("Driver Information")}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-foreground/75">
            {t("Must match the primary driver's valid driver's license.")}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 pt-1">
        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>
            {t("Driver Full Name")} <span className="text-redmix">*</span>
          </Label>
          <Input
            placeholder={t("Full name as on license")}
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>
            {t("License Number")} <span className="text-redmix">*</span>
          </Label>
          <Input
            placeholder={t("License number")}
            value={driverLicenseNumber}
            onChange={(e) => setDriverLicenseNumber(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>
            {t("Date of Birth")} <span className="text-redmix">*</span>
          </Label>
          <div className="h-10 rounded-[10px] border border-border/50 bg-white dark:bg-card transition-all hover:border-border overflow-hidden">
            <DatePicker
              label=""
              date={
                driverDob && isValid(parseISO(driverDob))
                  ? parseISO(driverDob)
                  : undefined
              }
              setDate={(d) => setDriverDob(d ? format(d, "yyyy-MM-dd") : "")}
              openOnHover={false}
              className="h-full px-3 bg-transparent border-0 text-[13px] font-medium"
              fromYear={1930}
              toYear={new Date().getFullYear() - 18}
              captionLayout="dropdown"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className={FIELD_LABEL}>
            {t("Nationality")} <span className="text-redmix">*</span>
          </Label>
          <div className="[&_button]:h-10 [&_button]:rounded-[10px] [&_button]:border-border/50 [&_button]:bg-white dark:[&_button]:bg-card [&_button]:text-[13px] [&_button]:font-medium">
            <NationalitySelect
              value={driverNationality}
              onChange={(countryName) => setDriverNationality(countryName)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Subcomponent 5: Price Summary Sidebar ---
interface PriceSummarySidebarProps {
  car: any;
  vendor: string;
  pickupLocation: string;
  pickupDateStr: string;
  dropoffDateStr: string;
  rentalDays: number;
  basePricePerDay: number;
  baseTotal: number;
  grandTotal: number;
  bookingLoading: boolean;
  t: (key: string) => string;
}
function PriceSummarySidebar({
  car,
  vendor,
  pickupLocation,
  pickupDateStr,
  dropoffDateStr,
  rentalDays,
  basePricePerDay,
  baseTotal,
  grandTotal,
  bookingLoading,
  t,
}: PriceSummarySidebarProps) {
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const currencyMeta =
    SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES["USD"];
  const symbol = currencyMeta.symbol;

  const carCurrency = car?.currency || "USD";

  const displayBasePricePerDay = getConvertedAmount(
    basePricePerDay,
    carCurrency,
    baseCurrency,
  );
  const displayBaseTotal = getConvertedAmount(
    baseTotal,
    carCurrency,
    baseCurrency,
  );
  const displayGrandTotal = getConvertedAmount(
    grandTotal,
    carCurrency,
    baseCurrency,
  );

  return (
    <div className={cn(GROUP_SURFACE, "relative shadow-sm")}>
      <div className="p-3 md:p-4">
        <p className="px-0.5 text-[12px] font-semibold text-foreground/80">
          {t("Booking")}
        </p>
        <h3 className="mb-3 px-0.5 text-[17px] font-semibold tracking-tight text-foreground">
          {t("Rental Summary")}
        </h3>

        {/* Car Details inside INSET_GROUP */}
        <div className={cn(INSET_GROUP, "mb-3 p-3 space-y-3")}>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold bg-redmix/10 text-redmix dark:text-foreground px-2.5 py-0.5 rounded-full">
              {t(car.category || "Standard")} {t("Car")}
            </span>
            <span className="text-xs font-semibold text-foreground/90 truncate">
              {t("Operated by")} {car.partnerNetwork?.name || vendor}
            </span>
          </div>
          <div className="pt-1">
            <h4 className="text-[16px] font-bold text-foreground leading-snug">
              {car.name}
            </h4>
          </div>
          {car?.images?.[0] && (
            <div className="aspect-[16/9] w-full rounded-[10px] overflow-hidden relative border border-border/40 mt-2 bg-muted/20">
              <img
                src={car.images[0]}
                alt={car.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Location & Dates inside INSET_GROUP */}
        <div className={cn(INSET_GROUP, "mb-3 p-3 space-y-3")}>
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-redmix/5 dark:bg-foreground text-redmix">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="text-[12px] font-semibold text-foreground/80">
                {t("Pickup & Dropoff Location")}
              </h5>
              <p className="text-[13px] font-semibold text-foreground mt-0.5 truncate">
                {car.location || pickupLocation} {t("Airport / Depot")}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 pt-2 border-t border-border/50">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-redmix/5 dark:bg-foreground text-redmix">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <h5 className="text-[12px] font-semibold text-foreground/80">
                {t("Rental Dates")} ({rentalDays}{" "}
                {rentalDays === 1 ? t("Day") : t("Days")})
              </h5>
              <div className="flex flex-col text-[13px] font-semibold text-foreground">
                <span>
                  {pickupDateStr
                    ? new Date(pickupDateStr).toLocaleString()
                    : t("Date TBD")}
                </span>
                <span className="text-xs text-foreground/90 font-normal my-0.5">
                  {t("to")}
                </span>
                <span>
                  {dropoffDateStr
                    ? new Date(dropoffDateStr).toLocaleString()
                    : t("Date TBD")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price Breakdown inside INSET_GROUP */}
        <div className={cn(INSET_GROUP, "mb-3 p-3 space-y-2")}>
          <div className="flex items-center justify-between font-semibold text-xs">
            <span className="text-foreground">
              {t("Car rental")} ({symbol}
              {Math.round(displayBasePricePerDay).toLocaleString()} ×{" "}
              {rentalDays} {rentalDays === 1 ? t("day") : t("days")})
            </span>
            <span className="font-semibold text-foreground">
              {symbol}
              {Math.round(displayBaseTotal).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Estimated Total at bottom matching TripSummary.tsx */}
        <div className="mt-3 border-t border-border/50 pt-3">
          <div className="flex items-end justify-between gap-3">
            <Label className="text-[15px] font-semibold text-foreground">
              {t("Estimated Total")}
            </Label>
            <div className="text-right">
              <span className="text-[22px] font-bold tracking-tight bg-redmix/10 dark:bg-foreground text-redmix px-3 py-1 rounded-md">
                {symbol}
                {Math.round(displayGrandTotal).toLocaleString()}
              </span>
              {baseCurrency !== "USD" && (
                <span className="mt-0.5 block text-xs font-medium text-foreground/90">
                  ({t("approx.")} $
                  {getConvertedAmount(grandTotal, carCurrency, "USD").toFixed(
                    2,
                  )}{" "}
                  USD)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Checkout Page Content ---
function BookingPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const { toast } = useToast();

  // Query Params
  const carId = searchParams.get("carId") || "";
  const vendor = searchParams.get("vendor") || "";
  const rateToken = searchParams.get("rateToken") || "";
  const pickupLocation = searchParams.get("pickupLocation") || "DXB";
  const dropoffLocation = searchParams.get("dropoffLocation") || pickupLocation;
  const pickupDateStr = searchParams.get("pickupDate") || "";
  const dropoffDateStr = searchParams.get("dropoffDate") || "";
  const isSuggested = searchParams.get("isSuggested") === "true";
  // Price already verified by /api/cars/select — use directly when available
  const verifiedPriceParam = searchParams.get("verifiedPrice");
  const verifiedCurrencyParam = searchParams.get("verifiedCurrency") || "USD";
  const verifiedPriceUSD = verifiedPriceParam
    ? Number(verifiedPriceParam)
    : null;

  // State
  const [pickupDate, setPickupDate] = useState(pickupDateStr);
  const [dropoffDate, setDropoffDate] = useState(dropoffDateStr);
  const [car, setCar] = useState<any | null>(null);
  const pickupDateObj = pickupDate ? new Date(pickupDate) : undefined;
  const dropoffDateObj = dropoffDate ? new Date(dropoffDate) : undefined;

  const handlePickupChange = (date: Date | undefined) => {
    if (date) {
      setPickupDate(format(date, "yyyy-MM-dd'T'10:00:00"));
    }
  };
  const handleDropoffChange = (date: Date | undefined) => {
    if (date) {
      setDropoffDate(format(date, "yyyy-MM-dd'T'10:00:00"));
    }
  };
  const [verifiedPrice, setVerifiedPrice] = useState<number | null>(
    verifiedPriceUSD,
  );
  const [verifiedCurrency, setVerifiedCurrency] = useState(
    verifiedCurrencyParam,
  );
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<CarBooking | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (bookingResult?.bookingRef) {
      navigator.clipboard.writeText(bookingResult.bookingRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  // Driver Info State
  const [driverName, setDriverName] = useState("");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  const [driverNationality, setDriverNationality] = useState("AE");
  const [driverDob, setDriverDob] = useState("");

  const [subStep, setSubStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleMobileNext = () => {
    if (subStep === 0) {
      if (!driverName.trim()) {
        toast({
          title: t("Driver Name Required"),
          description: t("Please enter the driver's full name."),
          variant: "destructive",
        });
        return;
      }
      if (!driverLicenseNumber.trim()) {
        toast({
          title: t("License Required"),
          description: t("Please enter driver's license number."),
          variant: "destructive",
        });
        return;
      }
      if (!driverDob) {
        toast({
          title: t("DOB Required"),
          description: t("Please enter the driver's date of birth."),
          variant: "destructive",
        });
        return;
      }
      setSubStep(1);
    } else if (subStep === 1) {
      if (!userEmail.trim() || !userPhone.trim()) {
        toast({
          title: t("Error"),
          description: t("Please enter email and phone number."),
          variant: "destructive",
        });
        return;
      }
      setSubStep(2);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMobileBack = () => {
    if (subStep > 0) {
      setSubStep(subStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Pre-fill user profile with mock data in dev
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setUserEmail("alex.khan@example.com");
      setUserPhone("+1234567890");
      setDriverName("Alex Khan");
      setDriverLicenseNumber("DL-987654321");
      setDriverNationality("US");
      setDriverDob("1990-05-15");
    }
  }, []);

  // Calculate rental duration in days
  const rentalDays = useMemo(() => {
    if (!pickupDate || !dropoffDate) return 1;
    const start = new Date(pickupDate).getTime();
    const end = new Date(dropoffDate).getTime();
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [pickupDate, dropoffDate]);

  // Fetch all cars to locate matching carId details
  useEffect(() => {
    async function loadCarDetails() {
      if (!carId) {
        setError(t("Missing carId query parameter."));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const results = await searchCars({
          pickup_location: pickupLocation,
          dropoff_location: dropoffLocation,
          pickup_date: pickupDateStr,
          dropoff_date: dropoffDateStr,
        });

        let foundCar = results?.find((c: any) => c.id === carId);
        if (!foundCar && carId.startsWith("car-tp-")) {
          const parts = carId.split("-");
          const vendor = parts[3];
          const acriss = parts[4];
          if (vendor && acriss) {
            foundCar = results?.find((c: any) => {
              const cParts = c.id.split("-");
              return cParts[3] === vendor && cParts[4] === acriss;
            });
          }
        }
        if (foundCar) {
          setCar(foundCar);
        } else {
          setError(
            t(
              "Vehicle details not found. It may have been booked or is no longer available.",
            ),
          );
        }
      } catch (err: any) {
        console.error("Failed to load vehicle details:", err);
        setError(
          t("Failed to load vehicle details. Please try searching again."),
        );
      } finally {
        setLoading(false);
      }
    }

    loadCarDetails();
  }, [
    carId,
    vendor,
    pickupLocation,
    dropoffLocation,
    pickupDateStr,
    dropoffDateStr,
  ]);

  // Pricing calculations — prefer verifiedPrice from select API if dates didn't change, otherwise fall back to car data
  const datesChanged =
    pickupDate !== pickupDateStr || dropoffDate !== dropoffDateStr;
  const activeVerifiedPriceUSD = datesChanged ? null : verifiedPrice;
  const basePricePerDay = activeVerifiedPriceUSD
    ? activeVerifiedPriceUSD / Math.max(1, rentalDays)
    : car?.pricePerDay || 0;
  const baseTotal = activeVerifiedPriceUSD ?? basePricePerDay * rentalDays;
  const grandTotal = baseTotal;

  const currencyMeta =
    SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES["USD"];
  const symbol = currencyMeta.symbol;
  const displayGrandTotal = getConvertedAmount(
    grandTotal,
    car?.currency || "USD",
    baseCurrency,
  );

  const handleBookNow = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!userEmail.trim()) {
      toast({
        title: t("Email Required"),
        description: t("Please enter customer contact email."),
        variant: "destructive",
      });
      return;
    }
    if (!userPhone.trim()) {
      toast({
        title: t("Phone Required"),
        description: t("Please enter customer contact phone number."),
        variant: "destructive",
      });
      return;
    }
    if (!driverName.trim()) {
      toast({
        title: t("Driver Name Required"),
        description: t("Please enter the driver's full name."),
        variant: "destructive",
      });
      return;
    }
    if (!driverLicenseNumber.trim()) {
      toast({
        title: t("License Required"),
        description: t("Please enter driver's license number."),
        variant: "destructive",
      });
      return;
    }
    if (!driverDob) {
      toast({
        title: t("DOB Required"),
        description: t("Please enter the driver's date of birth."),
        variant: "destructive",
      });
      return;
    }

    try {
      setBookingLoading(true);

      const bookingDto = {
        carId: car.id,
        carName: car.name,
        vendorCode: car.partnerNetwork?.name || vendor,
        carSnapshot: {
          vendorCode: car.partnerNetwork?.name || vendor,
          vehicleClass: car.category,
          acrissCode: car.acrissCode,
          pricePerDay: car.pricePerDay,
          totalPrice: car.totalPrice ?? car.pricePerDay * rentalDays,
          currency: car.currency || "USD",
        },
        contactEmail: userEmail,
        contactPhone: userPhone,
        pickupLocationId: pickupLocation,
        dropoffLocationId: dropoffLocation,
        pickupDatetime: pickupDate,
        dropoffDatetime: dropoffDate,
        insuranceType: "none",
        extras: [],
        driverName,
        driverLicenseNumber,
        driverNationality,
        driverDob,
        additionalDrivers: [],
      };

      const result = await createCarBooking(bookingDto);
      setBookingResult(result);
      setBookingSuccess(true);
    } catch (err: any) {
      console.error(err);
      toast({
        title: t("Booking Failed"),
        description:
          err.message || t("Failed to confirm reservation. Please try again."),
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (bookingSuccess && car) {
    const formattedTotalPrice = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: baseCurrency,
    }).format(displayGrandTotal);

    return (
      <div className="min-h-screen flex flex-col dark:bg-background bg-slate-50/50">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-20 mt-10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" strokeWidth={2.5} />
            </div>
            <h1 className="text-[28px] font-black tracking-tight text-foreground">
              {t("Booking Request Received!")}
            </h1>
          </div>

          <div
            className={cn(
              GROUP_SURFACE,
              "mx-auto max-w-5xl p-6 md:p-8 space-y-6 bg-white dark:bg-card",
            )}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
              <div className="min-w-0">
                <p className="text-[16px] font-bold text-foreground">
                  {t("Your request has been received")}
                </p>
                <p className="mt-1 text-[13px] text-foreground/80">
                  {t(
                    "We will contact you shortly to confirm payment and secure your car rental.",
                  )}
                </p>
              </div>

              {bookingResult?.bookingRef && (
                <div className="flex shrink-0 items-center justify-between gap-3 rounded-[10px] border border-border/50 bg-white px-3 py-2 dark:bg-card sm:min-w-[220px]">
                  <p className="text-xs font-semibold tracking-wide text-foreground/90">
                    {t("Ref Number")}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <p className="select-all text-sm font-semibold tracking-wide bg-redmix/5 dark:bg-foreground text-redmix px-2 py-1 rounded-md">
                      {bookingResult.bookingRef}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 shrink-0 rounded-[8px] p-0 hover:bg-redmix/10"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-foreground/80" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
              {/* Left Column: Car Details */}
              <div className="space-y-4">
                <p className="text-[13px] font-bold  tracking-wider text-foreground/90">
                  {t("Car Rental Details")}
                </p>
                <div className="rounded-[12px] border border-border/50 bg-white dark:bg-card p-4 space-y-4 shadow-sm">
                  <div>
                    <h3 className="text-[17px] font-bold text-foreground leading-tight">
                      {car.name || car.vehicleClass}
                    </h3>
                    <p className="mt-1 text-xs font-medium text-foreground/90">
                      {car.category || t("Standard")} ·{" "}
                      {car.transmission || t("Automatic")}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                    <div>
                      <span className="text-xs font-bold text-foreground/90">
                        {t("Pick-Up")}
                      </span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {pickupLocation}
                      </p>
                      <p className="text-xs text-foreground/90 font-semibold">
                        {pickupDateStr
                          ? format(
                              new Date(pickupDateStr),
                              "EEE, MMM d, yyyy 'at' hh:mm a",
                            )
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground/90">
                        {t("Drop-Off")}
                      </span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {dropoffLocation}
                      </p>
                      <p className="text-xs text-foreground/90 font-semibold">
                        {dropoffDateStr
                          ? format(
                              new Date(dropoffDateStr),
                              "EEE, MMM d, yyyy 'at' hh:mm a",
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 flex justify-between items-center text-xs font-semibold text-foreground">
                    <span>{t("Rental Duration")}</span>
                    <span>
                      {rentalDays} {rentalDays > 1 ? t("Days") : t("Day")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Driver & Payment */}
              <div className="space-y-4">
                <p className="text-[13px] font-bold tracking-wider text-foreground/90">
                  {t("Driver & Payment")}
                </p>
                <div className="rounded-[12px] border border-border/50 bg-white dark:bg-card divide-y divide-border/50 shadow-sm">
                  {/* Lead Driver */}
                  <div className="p-4 space-y-2">
                    <span className="text-xs font-semibold text-foreground/90">
                      {t("Primary Driver")}
                    </span>
                    <p className="text-[15px] font-bold text-redmix">
                      {driverName}
                    </p>
                    <p className="text-xs text-foreground/90 font-semibold">
                      {userEmail} · {userPhone}
                    </p>
                    <p className="text-xs text-foreground/90 font-semibold">
                      {t("License")}: {driverLicenseNumber} · {t("Nationality")}
                      : {driverNationality}
                    </p>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-semibold text-foreground/90">
                      <span>
                        {t("Car Rental Rate")} ({rentalDays}{" "}
                        {rentalDays > 1 ? t("Days") : t("Day")})
                      </span>
                      <span>{formattedTotalPrice}</span>
                    </div>

                    <div className="flex justify-between items-end border-t border-border/50 pt-4">
                      <span className="text-sm font-bold text-foreground">
                        {t("Total Amount")}
                      </span>
                      <div className="text-right">
                        <span className="text-[22px] font-bold tracking-tight bg-redmix/10 dark:bg-foreground text-redmix px-3 py-1 rounded-md">
                          {formattedTotalPrice}
                        </span>
                        {baseCurrency !== "USD" && (
                          <p className="text-[10px] text-foreground/80 font-semibold mt-1">
                            approx. $
                            {getConvertedAmount(
                              grandTotal,
                              car?.currency || "USD",
                              "USD",
                            ).toFixed(2)}{" "}
                            USD
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-6 border-t border-border/40">
              <Button
                variant="outline"
                onClick={() => router.push("/cars")}
                className="h-11 rounded-[12px] border-border/50 bg-white px-8 text-[14px] font-semibold hover:bg-foreground/5 dark:bg-card"
              >
                {t("Browse More Cars")}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-redmix animate-spin" />
          <p className="text-xs font-semibold text-redmix mt-4 capitalize tracking-widest animate-pulse">
            {t("Please wait...")}
          </p>
        </main>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
          <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-8 max-w-md space-y-4">
            <h1 className="text-xl font-bold text-destructive">
              {t("Booking Error")}
            </h1>
            <p className="text-xs text-muted-foreground">
              {error ||
                t(
                  "Could not retrieve car details. Please try searching again.",
                )}
            </p>
            <button
              onClick={() => router.push("/cars")}
              className="px-6 py-2.5 bg-brand-red text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-red/20 active:scale-95 transition-transform"
            >
              {t("Back to Search")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background flex flex-col justify-between">
      <Header />

      <main className="flex-grow container mx-auto max-w-7xl px-4 pt-20 pb-24 md:pb-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <h1 className="text-lg font-bold tracking-tight text-foreground md:text-xl lg:text-3xl">
            {t("Confirm")}{" "}
            <span className="text-redmix">{t("Car Booking")}</span>
          </h1>
          <p className="mt-2 text-foreground/80 text-sm font-semibold">
            {t(
              "Please provide driver details and contact information for your",
            )}{" "}
            <span className="font-bold text-foreground">{car.name}</span>{" "}
            {t("rental.")}
          </p>

          {isMobile && (
            <div className="mt-4 flex items-center justify-between w-full max-w-sm mx-auto px-4">
              {subStep > 0 ? (
                <button
                  type="button"
                  onClick={handleMobileBack}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-foreground transition-all active:scale-90 shrink-0"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              ) : (
                <div className="w-9 h-9 shrink-0" />
              )}

              <div className="flex flex-col items-center gap-1 flex-grow">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-redmix dark:text-white uppercase tracking-wider">
                    {subStep === 0 && t("1/3 • Driver Details")}
                    {subStep === 1 && t("2/3 • Contact Info")}
                    {subStep === 2 && t("3/3 • Review & Pay")}
                  </span>
                </div>
                <div className="w-36 h-1 rounded-full bg-border overflow-hidden mt-1">
                  <div
                    className="h-full bg-redmix rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${((subStep + 1) / 3) * 100}%` }}
                  />
                </div>
              </div>

              <div className="w-9 h-9 shrink-0" />
            </div>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4 order-2 lg:order-1">
            <form
              id="car-booking-form"
              onSubmit={handleBookNow}
              className="space-y-4"
            >
              {/* Suggested Date Modifier */}
              {isSuggested && (
                <div className={cn(GROUP_SURFACE, "space-y-3 p-3 md:p-4")}>
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/50 bg-redmix/10 text-redmix">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                        {t("Adjust Rental Dates")}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-foreground/75">
                        {t(
                          "Modify your pickup and dropoff dates for this rental.",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 pt-1">
                    <div className="space-y-1.5 flex flex-col">
                      <Label className={FIELD_LABEL}>{t("Pickup Date")}</Label>
                      <div className="border border-border/50 rounded-[10px] bg-white dark:bg-card overflow-hidden h-10 flex items-center">
                        <DatePicker
                          date={pickupDateObj}
                          setDate={handlePickupChange}
                          label=""
                          disablePastDates
                          className="w-full text-[13px] font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                      <Label className={FIELD_LABEL}>{t("Dropoff Date")}</Label>
                      <div className="border border-border/50 rounded-[10px] bg-white dark:bg-card overflow-hidden h-10 flex items-center">
                        <DatePicker
                          date={dropoffDateObj}
                          setDate={handleDropoffChange}
                          label=""
                          disablePastDates
                          className="w-full text-[13px] font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form 1: Driver Details */}
              {(!isMobile || subStep === 0) && (
                <DriverInfoForm
                  driverName={driverName}
                  setDriverName={setDriverName}
                  driverLicenseNumber={driverLicenseNumber}
                  setDriverLicenseNumber={setDriverLicenseNumber}
                  driverNationality={driverNationality}
                  setDriverNationality={setDriverNationality}
                  driverDob={driverDob}
                  setDriverDob={setDriverDob}
                  t={t}
                />
              )}

              {/* Form 2: Customer Contact info */}
              {(!isMobile || subStep === 1) && (
                <BookingContactForm
                  email={userEmail}
                  phone={userPhone}
                  onEmailChange={setUserEmail}
                  onPhoneChange={setUserPhone}
                />
              )}
            </form>
            <div className="w-full md:w-1/2 md:ms-auto px-5 pt-2">
              {isMobile && subStep < 2 ? (
                <button
                  type="button"
                  onClick={handleMobileNext}
                  className="w-full px-5 h-12 flex items-center cursor-pointer justify-center gap-2 text-base font-bold bg-redmix text-white rounded-2xl shadow-lg shadow-redmix/25 hover:brightness-110 active:scale-[0.99] transition-all"
                >
                  {t("Next")} <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  form="car-booking-form"
                  disabled={bookingLoading}
                  className="w-full px-5 h-12 flex items-center cursor-pointer justify-center gap-2 text-base font-bold bg-redmix text-white rounded-2xl shadow-lg shadow-redmix/25 hover:brightness-110 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none transition-all"
                >
                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />{" "}
                      {t("Confirming reservation...")}
                    </>
                  ) : (
                    t("Confirm Request")
                  )}
                </button>
              )}
            </div>
          </div>

          {(!isMobile || subStep === 2) && (
            <div className="space-y-6 order-1 lg:order-2">
              <PriceSummarySidebar
                car={car}
                vendor={vendor}
                pickupLocation={pickupLocation}
                pickupDateStr={pickupDate}
                dropoffDateStr={dropoffDate}
                rentalDays={rentalDays}
                basePricePerDay={basePricePerDay}
                baseTotal={baseTotal}
                grandTotal={grandTotal}
                bookingLoading={bookingLoading}
                t={t}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CarBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex flex-col justify-between">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-brand-red animate-spin" />
          </main>
        </div>
      }
    >
      <BookingPageContent />
    </Suspense>
  );
}
