"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useHotelBookingFlowStore } from "@/lib/store/hotel-booking-flow-store";
import { getHotelDetails } from "@/lib/api/hotels";
import { DatePicker } from "@/components/ui/date-picker";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/sections/Header";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  CheckCircle2,
  User,
  Building,
  MapPin,
  Calendar,
  Bed,
  ShieldCheck,
  Copy,
  Check,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";
import { apiFetch } from "@/lib/api/client";
import { BookingContactForm } from "@/components/flights/BookingContactForm";
import { BufferedInput } from "@/components/flights/BufferedInput";
import { NationalitySelect } from "@/components/shared/NationalitySelect";
import { cn } from "@/lib/utils";
import { format, isBefore, startOfDay } from "date-fns";
import { useCurrencyStore } from "@/lib/store/currency-store";
import { MOCK_TRAVELERS_ENABLED } from "@/lib/dev/mock-travelers";

const GROUP_SURFACE =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50 shadow-sm";
const FIELD_LABEL = "text-[12px] font-semibold text-foreground/80";
const INPUT_CLASS =
  "h-10 rounded-[10px] border-border/50 bg-white text-[13px] font-medium text-foreground dark:bg-card dark:border-white/20 dark:hover:border-white/40 dark:focus-visible:ring-white";

function HotelBookingContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedHotel = useHotelBookingFlowStore((s) => s.selectedHotel);
  const setSelectedHotel = useHotelBookingFlowStore((s) => s.setSelectedHotel);
  const { toast } = useToast();
  const { baseCurrency: currency, getConvertedAmount } = useCurrencyStore();

  const [firstName, setFirstName] = useState(
    MOCK_TRAVELERS_ENABLED ? "Alex" : "",
  );
  const [lastName, setLastName] = useState(
    MOCK_TRAVELERS_ENABLED ? "Khan" : "",
  );
  const [contactEmail, setContactEmail] = useState(
    MOCK_TRAVELERS_ENABLED ? "alex.khan@example.com" : "",
  );
  const [contactPhone, setContactPhone] = useState(
    MOCK_TRAVELERS_ENABLED ? "+1234567890" : "",
  );
  const [countryOfResidence, setCountryOfResidence] = useState(
    MOCK_TRAVELERS_ENABLED ? "United States" : "India",
  );

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
      if (!firstName.trim() || !lastName.trim()) {
        toast({
          title: t("Error"),
          description: t("Please fill in first name and last name."),
          variant: "destructive",
        });
        return;
      }
      setSubStep(1);
    } else if (subStep === 1) {
      if (!contactEmail.trim() || !contactPhone.trim()) {
        toast({
          title: t("Error"),
          description: t("Please fill in email and phone number."),
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (bookingResult?.bookingRef) {
      navigator.clipboard.writeText(bookingResult.bookingRef);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hotelId = searchParams?.get("hotelId");
  const checkInDateStr = searchParams?.get("checkInDate") || "";
  const checkOutDateStr = searchParams?.get("checkOutDate") || "";
  const isSuggested = searchParams?.get("isSuggested") === "true";

  const [checkInDate, setCheckInDate] = useState(checkInDateStr);
  const [checkOutDate, setCheckOutDate] = useState(checkOutDateStr);

  const checkInDateObj = checkInDate ? new Date(checkInDate) : undefined;
  const checkOutDateObj = checkOutDate ? new Date(checkOutDate) : undefined;

  const handleCheckInChange = (date: Date | undefined) => {
    if (date) {
      setCheckInDate(format(date, "yyyy-MM-dd"));
      if (
        checkOutDateObj &&
        (isBefore(checkOutDateObj, date) ||
          checkOutDateObj.toDateString() === date.toDateString())
      ) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        setCheckOutDate(format(nextDay, "yyyy-MM-dd"));
      }
    }
  };
  const handleCheckOutChange = (date: Date | undefined) => {
    if (date) {
      setCheckOutDate(format(date, "yyyy-MM-dd"));
    }
  };

  useEffect(() => {
    async function loadHotelDetails() {
      if (!hotelId) {
        router.push("/");
        return;
      }

      if (selectedHotel) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const hotelData = await getHotelDetails(
          hotelId,
          checkInDateStr,
          checkOutDateStr,
        );
        const nights =
          checkInDateStr && checkOutDateStr
            ? Math.max(
                1,
                Math.round(
                  (new Date(checkOutDateStr).getTime() -
                    new Date(checkInDateStr).getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              )
            : 1;

        const selectPayload = {
          hotelId,
          roomId: hotelData?.rooms?.[0]?.id || "default-room",
          checkInDate: checkInDateStr,
          checkOutDate: checkOutDateStr,
          totalPrice: (hotelData?.minPricePerNight || 0) * nights,
          currency: hotelData?.currency || "USD",
        };

        const selectResponse = await apiFetch<{
          verifiedPrice: number;
          currency?: string;
        }>("/hotels/select", {
          method: "POST",
          body: JSON.stringify(selectPayload),
        });

        const updatedHotel = {
          ...hotelData,
          minPricePerNight: Number(
            (selectResponse.verifiedPrice / nights).toFixed(2),
          ),
          currency: selectResponse.currency || hotelData.currency || "USD",
        };

        setSelectedHotel(updatedHotel);
      } catch (err) {
        console.error("Failed to fetch hotel details:", err);
        toast({
          title: t("Selection Error"),
          description: t(
            "Failed to retrieve hotel details. Please try searching again.",
          ),
          variant: "destructive",
        });
        router.push("/");
      } finally {
        setLoading(false);
      }
    }

    loadHotelDetails();
  }, [hotelId, router, setSelectedHotel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !contactEmail || !contactPhone) {
      toast({
        title: t("Error"),
        description: t("Please fill all required fields."),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        hotelId,
        roomId: selectedHotel?.rooms?.[0]?.id || "default-room",
        checkInDate,
        checkOutDate,
        contactEmail,
        contactPhone,
        travelers: [
          {
            firstName,
            lastName,
            nationality: countryOfResidence,
          },
        ],
        hotelSnapshot: selectedHotel,
      };

      const data = await apiFetch<any>("/hotels/book", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setBookingResult(data);
      setIsSuccess(true);
    } catch (err: any) {
      let errMsg = err.message || String(err);
      try {
        const parsed = JSON.parse(errMsg);
        if (parsed && parsed.message) {
          errMsg = parsed.message;
        }
      } catch {}
      toast({
        title: t("Booking Failed"),
        description: errMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || loading || !selectedHotel) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 mt-10">
          <Loader2 className="w-12 h-12 text-redmix animate-spin" />
          <p className="text-xs font-semibold text-redmix mt-4 capitalize tracking-widest animate-pulse">
            {t("Please wait...")}
          </p>
        </main>
      </div>
    );
  }

  if (isSuccess) {
    const room = selectedHotel.rooms?.[0];
    const price = room?.pricePerNight || selectedHotel.minPricePerNight || 0;
    const originalCurrency = selectedHotel.currency || "USD";
    const displayPrice = getConvertedAmount(price, originalCurrency, currency);
    const nights =
      checkInDate && checkOutDate
        ? Math.max(
            1,
            Math.round(
              (new Date(checkOutDate).getTime() -
                new Date(checkInDate).getTime()) /
                (1000 * 60 * 60 * 24),
            ),
          )
        : 1;
    const totalDisplayPrice = displayPrice * nights;
    const formattedTotalPrice = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
    }).format(totalDisplayPrice);

    return (
      <div className="min-h-screen flex flex-col dark:bg-background bg-slate-50/50">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-20 mt-10">
          <div className="text-center mb-5">
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
                    "We will contact you shortly to confirm payment and secure your reservation.",
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
              {/* Left Column: Hotel Details */}
              <div className="space-y-4">
                <p className="text-sm font-bold tracking-wider text-foreground/90">
                  {t("Hotel Details")}
                </p>
                <div className="rounded-[12px] border border-border/50 bg-white dark:bg-card p-4 space-y-4 shadow-sm">
                  <div>
                    <h3 className="text-[17px] font-bold text-foreground leading-tight">
                      {selectedHotel.name}
                    </h3>
                    <p className="mt-1 text-xs text-foreground/70">
                      {selectedHotel.address || selectedHotel.city}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-foreground/50">
                        {t("Check-In")}
                      </span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {checkInDate
                          ? format(new Date(checkInDate), "EEE, MMM d, yyyy")
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-foreground/50">
                        {t("Check-Out")}
                      </span>
                      <p className="text-sm font-semibold text-foreground mt-0.5">
                        {checkOutDate
                          ? format(new Date(checkOutDate), "EEE, MMM d, yyyy")
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 flex justify-between items-center text-xs font-semibold text-foreground">
                    <span>{t("Stay Duration")}</span>
                    <span>
                      {nights} {nights > 1 ? t("Nights") : t("Night")}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold text-foreground">
                    <span>{t("Room Type")}</span>
                    <span className="line-clamp-1 max-w-[200px] text-right">
                      {room?.name || t("Standard Room")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Guests & Payment */}
              <div className="space-y-4">
                <p className="text-sm font-bold tracking-wider text-foreground/90">
                  {t("Guests & Payment")}
                </p>
                <div className="rounded-[12px] border border-border/50 bg-white dark:bg-card divide-y divide-border/50 shadow-sm">
                  {/* Lead Guest */}
                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-foreground/50">
                      {t("Lead Guest")}
                    </span>
                    <p className="text-[15px] font-bold text-foreground">
                      {firstName} {lastName}
                    </p>
                    <p className="text-xs text-foreground/75">
                      {contactEmail} · {contactPhone}
                    </p>
                    <p className="text-xs text-foreground/70">
                      {t("Nationality")}: {countryOfResidence}
                    </p>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="p-4 space-y-2.5">
                    <div className="flex justify-between items-center text-xs font-medium text-foreground/80">
                      <span>
                        {t("Room Rate")} ({nights}{" "}
                        {nights > 1 ? t("Nights") : t("Night")})
                      </span>
                      <span>{formattedTotalPrice}</span>
                    </div>

                    <div className="flex justify-between items-start border-t border-border/50 pt-4">
                      <span className="text-sm font-bold text-foreground mt-1">
                        {t("Total Amount")}
                      </span>
                      <div className="text-right flex flex-col items-end">
                        <span className="inline-block md:text-[22px] text-base  font-bold text-redmix px-2 py-1 bg-redmix/5 dark:bg-foreground rounded-md leading-tight">
                          {formattedTotalPrice}
                        </span>
                        {currency !== "USD" && (
                          <p className="text-[10px] text-foreground/60 font-semibold mt-1">
                            approx. $
                            {getConvertedAmount(
                              price * nights,
                              originalCurrency,
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
                onClick={() => router.push("/hotels")}
                className="h-11 rounded-[12px] border-border/50 bg-white px-8 text-[14px] font-semibold hover:bg-foreground/5 dark:bg-card"
              >
                {t("Browse More Hotels")}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate prices
  const room = selectedHotel.rooms?.[0];
  const price = room?.pricePerNight || selectedHotel.minPricePerNight || 0;
  const originalCurrency = selectedHotel.currency || "USD";
  const displayPrice = getConvertedAmount(price, originalCurrency, currency);

  const nights =
    checkInDate && checkOutDate
      ? Math.max(
          1,
          Math.round(
            (new Date(checkOutDate).getTime() -
              new Date(checkInDate).getTime()) /
              (1000 * 60 * 60 * 24),
          ),
        )
      : 1;
  const totalDisplayPrice = displayPrice * nights;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-background">
      <Header />
      <main className="flex-1 pb-20">
        <div className="max-w-7xl mx-auto px-3 md:px-6 pt-3 md:pt-8 mt-12 pb-5 flex flex-col lg:flex-row gap-3 md:gap-5 items-start">
          {/* Left Column: Form */}
          <div className="flex-1 w-full min-w-0 order-2 lg:order-1">
            <h1 className="md:text-3xl text-sm font-bold text-foreground mb-5 tracking-tight">
              {t("Secure your booking")}
            </h1>

            {isMobile && (
              <div className="mb-6 flex items-center justify-between w-full max-w-sm mx-auto px-4">
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
                      {subStep === 0 && t("1/3 • Guest Details")}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Suggested Date Modifier */}
              {isSuggested && (
                <div className={cn(GROUP_SURFACE, "space-y-3 p-3 md:p-4 mb-4")}>
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-redmix/5 dark:bg-foreground text-redmix">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold tracking-tight text-foreground">
                        {t("Adjust Stay Dates")}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-foreground/75">
                        {t(
                          "Modify your check-in and check-out dates for this stay.",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 pt-1">
                    <div className="space-y-1.5 flex flex-col">
                      <Label className={FIELD_LABEL}>
                        {t("Check-In Date")}
                      </Label>
                      <div className="border border-border/50 rounded-[10px] bg-white dark:bg-card overflow-hidden h-10 flex items-center">
                        <DatePicker
                          date={checkInDateObj}
                          setDate={handleCheckInChange}
                          label=""
                          disablePastDates
                          className="w-full text-[13px] font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                      <Label className={FIELD_LABEL}>
                        {t("Check-Out Date")}
                      </Label>
                      <div className="border border-border/50 rounded-[10px] bg-white dark:bg-card overflow-hidden h-10 flex items-center">
                        <DatePicker
                          date={checkOutDateObj}
                          setDate={handleCheckOutChange}
                          label=""
                          disablePastDates
                          calendarDisabled={(date: Date) =>
                            checkInDateObj
                              ? isBefore(
                                  startOfDay(date),
                                  startOfDay(checkInDateObj),
                                ) ||
                                startOfDay(date).getTime() ===
                                  startOfDay(checkInDateObj).getTime()
                              : false
                          }
                          className="w-full text-[13px] font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Lead Guest Form */}
              {(!isMobile || subStep === 0) && (
                <div className={cn(GROUP_SURFACE, "space-y-3 p-3 md:p-4")}>
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/50 bg-redmix/5 dark:bg-foreground text-redmix">
                      <User className="h-[18px] w-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-foreground/80">
                        {t("Guest 1")}
                      </p>
                      <h3 className="text-[17px] font-semibold tracking-tight text-foreground">
                        {t("Lead Guest")}
                      </h3>
                      <p className="mt-0.5 text-xs font-semibold leading-snug text-foreground">
                        {t("This person must be present at check-in.")}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className={FIELD_LABEL}>
                        {t("First Name")} <span className="text-redmix">*</span>
                      </Label>
                      <BufferedInput
                        value={firstName}
                        onChange={setFirstName}
                        placeholder={t("First name")}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className={FIELD_LABEL}>
                        {t("Last Name")} <span className="text-redmix">*</span>
                      </Label>
                      <BufferedInput
                        value={lastName}
                        onChange={setLastName}
                        placeholder={t("Last name")}
                        className={INPUT_CLASS}
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2 w-full md:w-1/2">
                      <Label className={FIELD_LABEL}>{t("Nationality")}</Label>
                      <NationalitySelect
                        value={countryOfResidence}
                        onChange={setCountryOfResidence}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Form */}
              {(!isMobile || subStep === 1) && (
                <BookingContactForm
                  email={contactEmail}
                  phone={contactPhone}
                  onEmailChange={setContactEmail}
                  onPhoneChange={setContactPhone}
                  disabled={isSubmitting}
                />
              )}

              {/* Submit / Next Button */}
              <div className="pt-4 flex justify-end">
                {isMobile && subStep < 2 ? (
                  <Button
                    type="button"
                    onClick={handleMobileNext}
                    className="bg-redmix text-white font-bold h-12 px-8 rounded-xl w-full sm:w-auto shadow-lg shadow-redmix/20 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    {t("Next")} <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-redmix text-white font-bold h-12 px-8 rounded-xl w-full sm:w-auto shadow-lg shadow-redmix/20 hover:brightness-110 active:scale-[0.98] transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                        {t("Processing...")}
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-5 w-5" />{" "}
                        {t("Confirm Request")}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Summary */}
          {(!isMobile || subStep === 2) && (
            <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 lg:sticky lg:top-24 lg:z-10 order-1 lg:order-2">
              {/* Hotel Summary Component */}
              <div className="overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50 shadow-sm relative">
                <div className="p-3 md:p-4">
                  <p className="px-0.5 text-[12px] font-semibold text-foreground/80">
                    {t("Booking")}
                  </p>
                  <h3 className="mb-3 px-0.5 text-base font-semibold tracking-tight text-foreground">
                    {t("Trip Summary")}
                  </h3>

                  <div className="overflow-hidden rounded-md border border-border/50 bg-white dark:bg-card p-3 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">
                          {selectedHotel.name}
                        </p>
                        <p className="text-xs font-semibold tracking-wide text-foreground truncate">
                          {selectedHotel.address || selectedHotel.city}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden my-2 rounded-[10px] border border-border/50 bg-white dark:bg-card divide-y divide-border/50">
                    <div className="px-3 py-2">
                      <h4 className="text-xs font-semibold text-foreground">
                        {t("Stay Details")}
                      </h4>
                    </div>
                    <div className="px-3 pb-2 font-semibold text-xs text-foreground divide-y divide-border/30">
                      <div className="flex min-h-[38px] items-center justify-between gap-1 py-2 text-[13px]">
                        <span className="text-foreground font-semibold">
                          {t("Check-in")}
                        </span>
                        <span className="font-semibold text-foreground">
                          {checkInDate
                            ? format(new Date(checkInDate), "MMM d, yyyy")
                            : "-"}
                        </span>
                      </div>
                      <div className="flex min-h-[38px] items-center justify-between gap-3 py-2 text-[13px]">
                        <span className="text-foreground font-semibold">
                          {t("Check-out")}
                        </span>
                        <span className="font-semibold text-foreground">
                          {checkOutDate
                            ? format(new Date(checkOutDate), "MMM d, yyyy")
                            : "-"}
                        </span>
                      </div>
                      <div className="flex min-h-[38px] items-center justify-between gap-3 py-2 text-xs">
                        <span className="text-foreground font-semibold">
                          {t("Room")}
                        </span>
                        <span className="font-semibold text-foreground line-clamp-1 max-w-[150px] text-right">
                          {room?.name || t("Standard Room")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-md border border-border/50 bg-white dark:bg-card mb-3 divide-y divide-border/50">
                    <div className="px-3 py-2">
                      <h4 className="text-xs font-semibold text-foreground">
                        {t("Fare Summary")}
                      </h4>
                    </div>
                    <div className="px-3 pb-2 font-semibold text-xs text-foreground/90 divide-y divide-border/30">
                      <div className="flex min-h-[38px] items-center justify-between gap-3 py-2 text-xs">
                        <span className="text-foreground font-semibold">
                          {t("Price")} (
                          {new Intl.NumberFormat(undefined, {
                            style: "currency",
                            currency,
                          }).format(displayPrice)}{" "}
                          * {nights} {nights > 1 ? t("Nights") : t("Night")})
                        </span>
                        <span className="font-semibold text-foreground">
                          {new Intl.NumberFormat(undefined, {
                            style: "currency",
                            currency,
                          }).format(displayPrice * nights)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-border/50 pt-3">
                    <div className="flex items-end justify-between gap-3">
                      <Label className="text-[15px] font-semibold text-foreground">
                        {t("Estimated Total")}
                      </Label>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[22px] font-bold tracking-tight bg-redmix/10 dark:bg-foreground text-redmix px-3 py-1 rounded-md">
                          {new Intl.NumberFormat(undefined, {
                            style: "currency",
                            currency,
                          }).format(totalDisplayPrice)}
                        </span>
                        {currency !== "USD" && (
                          <span className="text-[10px] font-bold text-foreground/80 mt-0.5 whitespace-nowrap leading-none">
                            ({t("approx.")} $
                            {getConvertedAmount(
                              price * nights,
                              originalCurrency,
                              "USD",
                            ).toFixed(2)}{" "}
                            USD)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function HotelBookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-redmix" />
        </div>
      }
    >
      <HotelBookingContent />
    </Suspense>
  );
}
