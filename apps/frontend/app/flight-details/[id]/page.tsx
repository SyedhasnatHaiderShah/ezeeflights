"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { AirlineLogo } from "@/components/flights/AirlineLogo";
import { LoaderUI } from "@/components/shared/global-loader";
import { useAffirm } from "@/lib/hooks/useAffirm";
import { apiFetch } from "@/lib/api/client";
import { useToast } from "@/lib/hooks/use-toast";
import {
  Plane,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlightSegment {
  StopAndTime: string;
  AirlineCode: string;
  AirlineNameAndNumber: string;
  DepartureCity: string;
  ArrivalCity: string;
  DepartureDateAndTime: string;
  ArrivalDateAndTime: string;
  DepartArriveTotalTime: string;
  StopoverTime: string;
}

interface Passenger {
  FirstName: string;
  MiddleName?: string;
  LastName: string;
  Nationality: string;
  DobMonth: string;
  DobDay: string;
  DobYear: string;
  Gender: string;
}

interface PassengerData {
  Adults: Passenger[];
  Children?: Passenger[];
  Infants?: Passenger[];
}

interface BookingFormResponse {
  id: number;
  uniqueId: string;
  phoneNo: string;
  email: string;
  marketingClass: string;
  passengerData: PassengerData | null;
  inboundFlights: FlightSegment[] | null;
  outboundFlights: FlightSegment[] | null;
  linkExpiryDate: string | null;
  createdAt: string;
  depart: string;
  arrive: string;
  departDate: string;
  returnDate: string;
  adultsPrice: number;
  childPrice: number;
  infantPrice: number;
  isExpired: boolean;
  hasPaid: boolean;
}

const GROUP_SURFACE =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50 shadow-sm";

/** Helper to parse e.g. "New York John F Kennedy Airport, (JFK)" */
function parseCityAndAirport(locationStr: string) {
  if (!locationStr) return { code: "", city: "", airport: "" };

  const codeMatch = locationStr.match(/\(([^)]+)\)/);
  const code = codeMatch ? codeMatch[1].toUpperCase() : "";

  let cleanName = locationStr.replace(/,?\s*\([^)]+\)/, "").trim();
  let city = cleanName;
  let airport = "";

  if (cleanName.includes(",")) {
    const parts = cleanName.split(",");
    if (
      parts[0].toLowerCase().includes("airport") ||
      parts[0].toLowerCase().includes("intl")
    ) {
      airport = parts[0].trim();
      city = parts[1].trim();
    } else {
      city = parts[0].trim();
      airport = parts[1].trim();
    }
  } else {
    const airportIndex = cleanName.toLowerCase().indexOf("airport");
    const intlIndex = cleanName.toLowerCase().indexOf("intl");
    const splitIndex = airportIndex !== -1 ? airportIndex : intlIndex;

    if (splitIndex > 0) {
      const beforeSplit = cleanName.substring(0, splitIndex).trim();
      const lastSpace = beforeSplit.lastIndexOf(" ");
      if (lastSpace > 0) {
        city = beforeSplit.substring(0, lastSpace).trim();
        airport = cleanName.substring(lastSpace).trim();
      }
    }
  }

  return { code, city, airport };
}

export default function FlightDetailsPage() {
  const { id } = useParams() as { id: string };
  const { t } = useTranslation();
  const { toast } = useToast();

  const [loading, setLoading] = React.useState(true);
  const [bookingForm, setBookingForm] =
    React.useState<BookingFormResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isAffirmLoading, setIsAffirmLoading] = React.useState(false);
  const [hasPaid, setHasPaid] = React.useState(false);
  const [isExpired, setIsExpired] = React.useState(false);

  // 1. Multi-domain Validation & Redirection
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname.toLowerCase();
      const isAllowedDomain =
        hostname === "ezeeflights.com" ||
        hostname === "www.ezeeflights.com" ||
        hostname === "fareshoppe.com" ||
        hostname === "www.fareshoppe.com" ||
        hostname === "localhost" ||
        hostname.includes("127.0.0.1");

      if (!isAllowedDomain) {
        toast({
          title: t("Redirecting..."),
          description: t("Redirecting to the main portal for secure checkout."),
        });
        window.location.replace(
          `https://www.ezeeflights.com/flight-details/${id}`,
        );
      }
    }
  }, [id, toast, t]);

  // 2. Fetch Booking Form Data
  React.useEffect(() => {
    async function fetchFormDetails() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch<BookingFormResponse>(
          `/payments/affirm/booking-form/${id}`,
        );
        setBookingForm(data);
        setHasPaid(data.hasPaid);
        setIsExpired(false);
      } catch (err: any) {
        console.error("Error fetching form details:", err);
        setError(
          err.message ||
            t("Could not load flight booking details. Please contact support."),
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchFormDetails();
    }
  }, [id, t]);

  // 3. Affirm Checkout Hook Integration
  const { openAffirmCheckout } = useAffirm({ active: true });

  // Safe client-side parsing of Passenger JSON in case it is double stringified or returned raw
  let parsedPassengerData = bookingForm?.passengerData;
  if (typeof parsedPassengerData === "string") {
    try {
      parsedPassengerData = JSON.parse(parsedPassengerData);
    } catch (e) {
      console.error("Failed to parse passengerData string:", e);
    }
  }

  const adults = parsedPassengerData?.Adults || [];
  const children = parsedPassengerData?.Children || [];
  const infants = parsedPassengerData?.Infants || [];

  let adultCount = adults.length;
  let childCount = children.length;
  let infantCount = infants.length;

  // Fallback: If no passenger data lists could be resolved but the adultsPrice exists
  if (adultCount === 0 && childCount === 0 && infantCount === 0) {
    if (Number(bookingForm?.adultsPrice || 0) > 0) {
      adultCount = 1;
    }
  }

  // Safe client-side parsing of Flight Lists in case they are double stringified or returned raw
  let outboundFlightsList = bookingForm?.outboundFlights || [];
  if (typeof outboundFlightsList === "string") {
    try {
      outboundFlightsList = JSON.parse(outboundFlightsList);
    } catch (e) {
      console.error("Failed to parse outboundFlights string:", e);
    }
  }

  let inboundFlightsList = bookingForm?.inboundFlights || [];
  if (typeof inboundFlightsList === "string") {
    try {
      inboundFlightsList = JSON.parse(inboundFlightsList);
    } catch (e) {
      console.error("Failed to parse inboundFlights string:", e);
    }
  }

  const adultPrice = Number(bookingForm?.adultsPrice || 0);
  const childPrice = Number(bookingForm?.childPrice || 0);
  const infantPrice = Number(bookingForm?.infantPrice || 0);

  // Derive per-person unit rates from the multiplied totals and passenger counts
  const adultRate = adultCount > 0 ? adultPrice / adultCount : adultPrice;
  const childRate = childCount > 0 ? childPrice / childCount : childPrice;
  const infantRate = infantCount > 0 ? infantPrice / infantCount : infantPrice;

  const subtotal = adultPrice + childPrice + infantPrice;
  const affirmFee = Math.round(subtotal * 0.08 * 100) / 100;
  const grandTotal = subtotal + affirmFee;

  const handlePayNow = () => {
    if (!bookingForm || isExpired || hasPaid || isAffirmLoading) return;

    setIsAffirmLoading(true);
    const totalUsdCents = Math.round(grandTotal * 100);

    const onAffirmApproved = async (checkoutToken: string, vcnData?: any) => {
      setIsAffirmLoading(true);
      toast({
        title: t("Affirm Approved"),
        description: t(
          "Payment plan confirmed! Processing order authorization...",
        ),
      });

      try {
        const passengerCount = Math.max(
          adultCount + childCount + infantCount,
          1,
        );
        const baseFarePerPaxUsd = grandTotal / passengerCount;

        let sanitizedEmail = bookingForm.email || "";
        if (process.env.NODE_ENV !== "production") {
          const emailParts = sanitizedEmail.split("@");
          const hasValidTld =
            emailParts.length === 2 &&
            emailParts[1].includes(".") &&
            emailParts[1].split(".")[1].length >= 2;
          if (!hasValidTld) {
            sanitizedEmail = "test@ezeeflights.com";
          }
        }

        const response: any = await apiFetch("/payments/affirm/authorize", {
          method: "POST",
          body: JSON.stringify({
            checkoutToken,
            vcnData,
            bookingId: bookingForm.uniqueId,
            totalAmountUsdCents: totalUsdCents,
            refundShieldOpted: false,
            passengerCount,
            baseFarePerPaxUsd,
            basketTotalUsd: grandTotal,
            userEmail: sanitizedEmail,
            phone: bookingForm.phoneNo,
            userFirstName: adults[0]?.FirstName || "Guest",
            userLastName: adults[0]?.LastName || "Traveler",
            flightDate: bookingForm.departDate || "",
            origin: bookingForm.depart || "",
            destination: bookingForm.arrive || "",
            pnrCode: bookingForm.uniqueId,
          }),
        });

        if (response && response.success) {
          setHasPaid(true);
          toast({
            title: t("Payment Successful"),
            description: t(
              "Your ticket payment has been authorized and captured!",
            ),
          });
        } else {
          throw new Error(t("Authorization process returned failure"));
        }
      } catch (err: any) {
        console.error("[Affirm Authorization] Error:", err);
        toast({
          title: t("Payment Verification Failed"),
          description:
            err.message ||
            t("Failed to verify transaction. Please contact support."),
          variant: "destructive",
        });
      } finally {
        setIsAffirmLoading(false);
      }
    };

    const onDecline = () => {
      setIsAffirmLoading(false);
      toast({
        title: t("Checkout Cancelled"),
        description: t(
          "The Affirm payment checkout was declined or cancelled.",
        ),
        variant: "destructive",
      });
    };

    openAffirmCheckout({
      totalAmountUsdCents: totalUsdCents,
      onOpen: () => {
        setIsAffirmLoading(false);
      },
      items: [
        {
          display_name: `${t("Flight Ticket")}: ${bookingForm.depart} → ${bookingForm.arrive} (${bookingForm.marketingClass || "Economy"})`,
          unit_price: totalUsdCents,
          qty: 1,
        },
      ],
      billing: {
        name: {
          first: adults[0]?.FirstName || "Guest",
          last: adults[0]?.LastName || "Traveler",
        },
        email: bookingForm.email || "",
        phone_number: bookingForm.phoneNo || undefined,
      },
      onSuccess: onAffirmApproved,
      onDecline,
    });
  };

  const renderFlightTimeline = (
    flights: FlightSegment[],
    typeLabel: string,
  ) => {
    return (
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-redmix bg-redmix/5 px-2 py-0.5 rounded-md inline-block">
          {t(typeLabel)}
        </p>

        <div className="space-y-3">
          {flights.map((flight, idx) => {
            const depDetails = parseCityAndAirport(flight.DepartureCity);
            const arrDetails = parseCityAndAirport(flight.ArrivalCity);

            const depTimeParts = flight.DepartureDateAndTime.split(", ");
            const depDate = depTimeParts[0];
            const depTime = depTimeParts[1] || "";

            const arrTimeParts = flight.ArrivalDateAndTime.split(", ");
            const arrDate = arrTimeParts[0];
            const arrTime = arrTimeParts[1] || "";

            return (
              <div
                key={`${typeLabel}-${idx}`}
                className="flex flex-col bg-slate-50/40 dark:bg-[#1A2333]/20 p-3.5 rounded-[12px] border border-border/40 gap-3"
              >
                {/* Segment Top Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white p-1 shadow-sm border border-border/50 dark:bg-card">
                      <AirlineLogo
                        code={flight.AirlineCode}
                        name={flight.AirlineNameAndNumber?.split(" ")[0]}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-foreground/95 leading-tight">
                        {flight.AirlineNameAndNumber}
                      </h4>
                      <p className="text-[11px] font-medium text-foreground/80 tracking-wide mt-0.5">
                        {t("Flight segment")}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-[#1A2333] border border-border/40 text-foreground/90 uppercase">
                    {bookingForm?.marketingClass || "Economy"}
                  </span>
                </div>

                {/* Segment Main Route Layout */}
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center">
                  {/* Departure Block */}
                  <div className="md:col-span-3 text-left space-y-1">
                    <p className="font-semibold text-lg text-foreground leading-none">
                      {depTime}
                    </p>
                    <p className="text-sm font-medium text-foreground/80 flex items-center gap-1 flex-wrap">
                      <span className="bg-slate-100 dark:bg-[#1A2333] px-1.5 py-0.5 rounded text-xs font-semibold border border-border/50">
                        {depDetails.code || bookingForm?.depart}
                      </span>
                      <span className="text-foreground/70 font-medium">
                        {depDetails.city}
                      </span>
                    </p>
                    {depDetails.airport && (
                      <p className="text-[11px] font-medium text-foreground/80 leading-normal max-w-xs break-words">
                        {depDetails.airport}
                      </p>
                    )}
                    <p className="text-[11px] font-medium text-foreground/80">
                      {depDate}
                    </p>
                  </div>

                  {/* Journey Line Block */}
                  <div className="md:col-span-1 flex flex-col items-center justify-center py-1 px-1 relative">
                    <span className="font-medium text-foreground/90 text-xs whitespace-nowrap mb-0.5">
                      {flight.DepartArriveTotalTime}
                    </span>
                    <div className="w-16 md:w-full h-px bg-border/80 relative my-0.5">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-redmix shrink-0" />
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider whitespace-nowrap mt-0.5">
                      {flight.StopAndTime || t("Nonstop")}
                    </span>
                  </div>

                  {/* Arrival Block */}
                  <div className="md:col-span-3 text-left md:text-right space-y-1">
                    <p className="font-semibold text-lg text-foreground leading-none">
                      {arrTime}
                    </p>
                    <p className="text-sm font-medium text-foreground/80 flex items-center md:justify-end gap-1 flex-wrap">
                      <span className="bg-slate-100 dark:bg-[#1A2333] px-1.5 py-0.5 rounded text-xs font-semibold border border-border/50">
                        {arrDetails.code || bookingForm?.arrive}
                      </span>
                      <span className="text-foreground/70 font-medium">
                        {arrDetails.city}
                      </span>
                    </p>
                    {arrDetails.airport && (
                      <p className="text-[11px] font-medium text-foreground/80 leading-normal max-w-xs md:ml-auto break-words">
                        {arrDetails.airport}
                      </p>
                    )}
                    <p className="text-[11px] font-medium text-foreground/80">
                      {arrDate}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-grow container mx-auto max-w-7xl px-4 sm:px-3 md:px-4 pt-20 pb-12 md:pb-6">
        <div className="w-full">
          {/* 4. Loading State */}
          {loading && <LoaderUI message={t("Loading flight details...")} />}

          {/* 5. Error State */}
          {!loading && error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-lg rounded-[12px] border border-border/50 bg-white p-6 text-center shadow-sm dark:bg-card"
            >
              {error.toLowerCase().includes("not found") ||
              error.includes("404") ? (
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-redmix/5 text-redmix mb-3">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-bold text-foreground">
                    {t("Payment Link Not Found")}
                  </h2>
                  <p className="mt-2 text-xs text-foreground/75 leading-relaxed">
                    {t(
                      "This payment link is invalid, has expired, or may have been deleted by the administrator. Please check the URL or contact Ezee Flights customer support.",
                    )}
                  </p>
                  <div className="mt-5 flex flex-col sm:flex-row gap-2.5 w-full justify-center">
                    <Link
                      href="/"
                      className="inline-flex min-h-[38px] items-center justify-center rounded-[10px] bg-redmix text-white font-bold text-xs px-5 py-2 transition active:scale-[0.98] hover:opacity-90 shadow-sm"
                    >
                      {t("Back to Home")}
                    </Link>
                    <Link
                      href="/support"
                      className="inline-flex min-h-[38px] items-center justify-center rounded-[10px] border border-border bg-slate-50 dark:bg-[#1A2333] text-foreground font-bold text-xs px-5 py-2 transition active:scale-[0.98] hover:bg-slate-100 dark:hover:bg-[#253247] shadow-sm"
                    >
                      {t("Contact Support")}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-redmix/5 text-redmix mb-3">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-bold text-foreground">
                    {t("Something went wrong")}
                  </h2>
                  <p className="mt-2 text-xs text-foreground/75">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-5 inline-flex min-h-[38px] items-center justify-center rounded-[10px] bg-redmix text-white font-bold text-xs px-5 py-2 transition active:scale-[0.98] hover:opacity-90 shadow-sm"
                  >
                    {t("Retry")}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* 6. Main Content Loaded */}
          {!loading && !error && bookingForm && (
            <div className="space-y-4">
              {/* Header Status Bar */}
              <div className={GROUP_SURFACE}>
                <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h1 className="text-lg font-semibold tracking-tight text-foreground/90">
                      {t("Flight Ticket Payment Request")}
                    </h1>
                    <p className="mt-0.5 text-xs font-medium text-foreground/80">
                      ID:{" "}
                      <span className="font-mono">{bookingForm.uniqueId}</span>
                    </p>
                  </div>
                  {/* <div>
                    {hasPaid ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-500/25">
                        <CheckCircle2 className="h-3 w-3" />
                        {t("Paid Successfully")}
                      </span>
                    ) : isExpired ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-redmix/10 px-2 py-0.5 text-xs font-bold text-redmix border border-redmix/20">
                        <AlertTriangle className="h-3 w-3" />
                        {t("Expired")}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-600 border border-amber-500/20">
                        <Clock className="h-3 w-3" />
                        {t("Pending")}
                      </span>
                    )}
                  </div> */}
                </div>

                {!hasPaid && bookingForm.linkExpiryDate && (
                  <div className="bg-slate-50/50 dark:bg-[#1A2333]/30 px-4 py-2 border-t border-border/50 flex flex-wrap gap-2 items-center justify-between text-[11px] text-foreground/80 font-medium">
                    <span>
                      {t("Link Created")}:{" "}
                      <span className="text-foreground">
                        {new Date(bookingForm.createdAt).toLocaleString()}
                      </span>
                    </span>
                    <span
                      className={isExpired ? "text-redmix" : "text-amber-600"}
                    >
                      {t("Link Expires")}:{" "}
                      {new Date(bookingForm.linkExpiryDate).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Grid content split: 2/3 for flight details, 1/3 for pay details */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Left side details */}
                <div className="space-y-4 lg:col-span-2">
                  {/* Flight Itineraries */}
                  <div className={cn(GROUP_SURFACE, "p-4 space-y-4")}>
                    <h2 className="text-sm font-semibold text-foreground/90 border-b border-border/50 pb-2 flex items-center gap-2">
                      <Plane className="h-4 w-4 text-redmix rotate-45" />
                      {t("Flight Itinerary")}
                    </h2>

                    {/* Outbound Flights */}
                    {outboundFlightsList &&
                      outboundFlightsList.length > 0 &&
                      renderFlightTimeline(outboundFlightsList, "Outbound")}

                    {/* Inbound Flights */}
                    {inboundFlightsList && inboundFlightsList.length > 0 && (
                      <div className="pt-1">
                        {renderFlightTimeline(inboundFlightsList, "Return")}
                      </div>
                    )}
                  </div>

                  {/* Passengers Information */}
                  {bookingForm.passengerData && (
                    <div className={GROUP_SURFACE}>
                      <div className="bg-slate-50/60 dark:bg-[#1A2333]/20 px-4 py-2 border-b border-border/50">
                        <h3 className="font-semibold text-sm text-foreground/90 flex items-center gap-2">
                          <User className="h-4 w-4 text-redmix" />
                          {t("Passengers Details")}
                        </h3>
                      </div>

                      <div className="divide-y divide-border/40">
                        {/* Adults */}
                        {adults.map((passenger, idx) => (
                          <div
                            key={`ad-${idx}`}
                            className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-[#1A2333]/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1A2333] border border-border/50 text-foreground/90">
                                <User className="h-4.5 w-4.5" />
                              </div>
                              <div className="space-y-1">
                                <p className="font-semibold text-sm text-foreground/90 leading-tight">
                                  {passenger.FirstName}{" "}
                                  {passenger.MiddleName
                                    ? passenger.MiddleName + " "
                                    : ""}
                                  {passenger.LastName}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                                  <span className="text-[9px] font-semibold tracking-wider text-redmix uppercase px-1.5 py-0.5 rounded border border-redmix/25 bg-redmix/5">
                                    {t("Adult")}
                                  </span>
                                  <span className="text-[11px] font-medium text-foreground/90">
                                    {t("DOB")}: {passenger.DobMonth}/
                                    {passenger.DobDay}/{passenger.DobYear}
                                  </span>
                                  <span className="h-2 w-px bg-border/80" />
                                  <span className="text-[11px] font-medium text-foreground/90">
                                    {t("Gender")}:{" "}
                                    <span className="capitalize">
                                      {passenger.Gender}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            {/* <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#1A2333]/40 border border-border/40 rounded-full px-2 py-0.5 font-medium text-[10px] text-foreground/90 uppercase">
                              <MapPin className="h-3 w-3 text-foreground/90" />
                              {passenger.Nationality || "US"}
                            </div> */}
                          </div>
                        ))}

                        {/* Children */}
                        {children.map((passenger, idx) => (
                          <div
                            key={`ch-${idx}`}
                            className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-[#1A2333]/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1A2333] border border-border/50 text-foreground/90">
                                <User className="h-4.5 w-4.5" />
                              </div>
                              <div className="space-y-1">
                                <p className="font-semibold text-sm text-foreground/90 leading-tight">
                                  {passenger.FirstName}{" "}
                                  {passenger.MiddleName
                                    ? passenger.MiddleName + " "
                                    : ""}
                                  {passenger.LastName}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                                  <span className="text-[9px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase px-1.5 py-0.5 rounded border border-emerald-500/25 bg-emerald-500/5">
                                    {t("Child")}
                                  </span>
                                  <span className="text-[11px] font-medium text-foreground/90">
                                    {t("DOB")}: {passenger.DobMonth}/
                                    {passenger.DobDay}/{passenger.DobYear}
                                  </span>
                                  <span className="h-2 w-px bg-border/80" />
                                  <span className="text-[11px] font-medium text-foreground/90">
                                    {t("Gender")}:{" "}
                                    <span className="capitalize">
                                      {passenger.Gender}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            {/* <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#1A2333]/40 border border-border/40 rounded-full px-2 py-0.5 font-medium text-[10px] text-foreground/90 uppercase">
                              <MapPin className="h-3 w-3 text-foreground/90" />
                              {passenger.Nationality || "US"}
                            </div> */}
                          </div>
                        ))}

                        {/* Infants */}
                        {infants.map((passenger, idx) => (
                          <div
                            key={`inf-${idx}`}
                            className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-[#1A2333]/10 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1A2333] border border-border/50 text-foreground/90">
                                <User className="h-4.5 w-4.5" />
                              </div>
                              <div className="space-y-1">
                                <p className="font-semibold text-sm text-foreground/90 leading-tight">
                                  {passenger.FirstName}{" "}
                                  {passenger.MiddleName
                                    ? passenger.MiddleName + " "
                                    : ""}
                                  {passenger.LastName}
                                </p>
                                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
                                  <span className="text-[9px] font-semibold tracking-wider text-sky-600 dark:text-sky-400 uppercase px-1.5 py-0.5 rounded border border-sky-500/25 bg-sky-500/5">
                                    {t("Infant")}
                                  </span>
                                  <span className="text-[11px] font-medium text-foreground/90">
                                    {t("DOB")}: {passenger.DobMonth}/
                                    {passenger.DobDay}/{passenger.DobYear}
                                  </span>
                                  <span className="h-2 w-px bg-border/80" />
                                  <span className="text-[11px] font-medium text-foreground/90">
                                    {t("Gender")}:{" "}
                                    <span className="capitalize">
                                      {passenger.Gender}
                                    </span>
                                  </span>
                                </div>
                              </div>
                            </div>
                            {/* <div className="flex items-center gap-1 bg-slate-50 dark:bg-[#1A2333]/40 border border-border/40 rounded-full px-2 py-0.5 font-medium text-[10px] text-foreground/90 uppercase">
                              <MapPin className="h-3 w-3 text-foreground/90" />
                              {passenger.Nationality || "US"}
                            </div> */}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={cn(GROUP_SURFACE, "p-4")}>
                    <h3 className="font-semibold text-sm text-foreground/90 mb-3 border-b border-border/50 pb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-redmix" />
                      {t("Contact Details")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-2.5 bg-slate-50/40 dark:bg-[#1A2333]/20 p-2.5 rounded-[10px] border border-border/40">
                        <div className="bg-redmix/5 p-1.5 rounded-lg text-redmix">
                          <Mail className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-foreground/90 uppercase tracking-wider font-semibold">
                            {t("Email Address")}
                          </p>
                          <p className="font-medium text-sm text-foreground/90 truncate mt-0.5">
                            {bookingForm.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 bg-slate-50/40 dark:bg-[#1A2333]/20 p-2.5 rounded-[10px] border border-border/40">
                        <div className="bg-redmix/5 p-1.5 rounded-lg text-redmix">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-foreground/90 uppercase tracking-wider font-semibold">
                            {t("Phone Number")}
                          </p>
                          <p className="font-medium text-sm text-foreground/90 truncate mt-0.5">
                            {bookingForm.phoneNo || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side summary & Affirm booking widget */}
                <div className="space-y-4">
                  <div className={cn(GROUP_SURFACE, "p-4")}>
                    <h2 className="text-sm font-semibold text-foreground/90 border-b border-border/50 pb-2 flex items-center gap-2">
                      <DollarSign className="h-4.5 w-4.5 text-redmix" />
                      {t("Payment Summary")}
                    </h2>

                    <div className="mt-3 space-y-2.5">
                      {adultPrice > 0 && (
                        <div className="flex items-center justify-between text-xs font-medium text-foreground/90">
                          <span>
                            {t("Adults Price")} ({adultCount} × $
                            {adultRate.toLocaleString()})
                          </span>
                          <span className="font-semibold text-foreground">
                            ${adultPrice.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {childPrice > 0 && (
                        <div className="flex items-center justify-between text-xs font-medium text-foreground/90">
                          <span>
                            {t("Children Price")} ({childCount} × $
                            {childRate.toLocaleString()})
                          </span>
                          <span className="font-semibold text-foreground">
                            ${childPrice.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {infantPrice > 0 && (
                        <div className="flex items-center justify-between text-xs font-medium text-foreground/90">
                          <span>
                            {t("Infants Price")} ({infantCount} × $
                            {infantRate.toLocaleString()})
                          </span>
                          <span className="font-semibold text-foreground">
                            ${infantPrice.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-border/50 pt-3 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground/90">
                          {t("Total Price")} (USD)
                        </span>
                        <span className="text-lg font-bold text-redmix">
                          ${subtotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Affirm Checkout Section */}
                  <div
                    className={cn(
                      GROUP_SURFACE,
                      "p-4 flex flex-col justify-between h-auto",
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-3.5 mb-3 pb-1.5 border-b border-border/50">
                        {/* Affirm Premium Logo */}
                        <div className="flex items-center justify-center bg-[#004BFF] text-white font-black italic rounded px-2 py-0.5 text-sm tracking-tighter">
                          affirm
                        </div>
                        <span className="text-xs font-bold text-foreground/80 uppercase tracking-wider">
                          {t("Installment Plans")}
                        </span>
                      </div>

                      {/* <p className="text-xs text-foreground/75 font-semibold leading-relaxed mb-4">
                        {t(
                          "Pay over time with Affirm. Select budget-friendly payment plans that fit your needs. Easy registration and instant decisions.",
                        )}
                        <span className="block mt-2 text-xs font-bold text-redmix">
                          {t("An 8% Affirm fee is added to the total amount.")}
                        </span>
                      </p> */}
                    </div>

                    <div className="space-y-3">
                      {hasPaid ? (
                        <div className="rounded-[10px] bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-center">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                          <p className="mt-1 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                            {t("Payment Completed")}
                          </p>
                          <p className="mt-0.5 text-xs text-emerald-700/80 dark:text-emerald-400/70 font-bold">
                            {t(
                              "Your payment has been successfully captured. Thank you!",
                            )}
                          </p>
                        </div>
                      ) : isExpired ? (
                        <div className="rounded-[10px] bg-redmix/10 border border-redmix/20 p-3.5 text-center">
                          <AlertTriangle className="h-5 w-5 text-redmix mx-auto" />
                          <p className="mt-1 text-xs font-bold text-redmix">
                            {t("Link Expired")}
                          </p>
                          <p className="mt-0.5 text-xs text-red-700/80 dark:text-red-400/70 font-bold">
                            {t(
                              "This payment request link is expired. Please ask the support desk to regenerate a link.",
                            )}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={handlePayNow}
                          disabled={isAffirmLoading}
                          className={cn(
                            "w-full py-3 px-5 rounded-[10px] font-bold text-white shadow-sm text-sm uppercase tracking-wide transition-all active:scale-[0.98]",
                            "bg-redmix hover:opacity-90",
                            "flex items-center justify-center gap-2 min-h-[44px]",
                            isAffirmLoading && "opacity-75 cursor-not-allowed",
                          )}
                        >
                          {isAffirmLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              {t("Initializing Affirm...")}
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4" />
                              {t("Pay Now with Affirm")}
                            </>
                          )}
                        </button>
                      )}

                      {/* <div className="text-xs text-foreground/80 text-center font-medium leading-relaxed">
                        {t(
                          "Subject to credit check and approval. Affirm loans are made by lending partners.",
                        )}
                      </div> */}
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
