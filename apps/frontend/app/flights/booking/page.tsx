"use client";

import {
  Check,
  ChevronRight,
  User as UserIcon,
  Info,
  CreditCard,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { PassengerForm } from "@/components/flights/PassengerForm";
import { apiFetch } from "@/lib/api/client";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useProfile } from "@/lib/hooks/use-profile";
import { useToast } from "@/lib/hooks/use-toast";
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
import { queryClient } from "@/lib/query/query-client";

const steps = [
  { label: "Travelers", icon: UserIcon },
  { label: "Payment", icon: CreditCard },
];

const SUPPORTED_PAYMENT_CURRENCIES = ["USD", "AED", "EUR", "GBP"] as const;
const DEFAULT_PAYMENT_PROVIDER =
  (process.env.NEXT_PUBLIC_PAYMENT_PROVIDER as "STRIPE" | "PAYTABS" | "TABBY" | "TAMARA" | "MOCK" | undefined) ??
  (process.env.NODE_ENV === "production" ? "STRIPE" : "MOCK");

function normalizePaymentCurrency(value: unknown): (typeof SUPPORTED_PAYMENT_CURRENCIES)[number] {
  if (typeof value !== "string") return "USD";
  const normalized = value.trim().toUpperCase();
  return (SUPPORTED_PAYMENT_CURRENCIES as readonly string[]).includes(normalized)
    ? (normalized as (typeof SUPPORTED_PAYMENT_CURRENCIES)[number])
    : "USD";
}

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFlightId = searchParams.get("id");
  const adt = parseInt(searchParams.get("adt") || "1", 10) || 1;
  const chd = parseInt(searchParams.get("chd") || "0", 10) || 0;
  const inf = parseInt(searchParams.get("inf") || "0", 10) || 0;

  const initialPassengers = useMemo(() => {
    const arr: any[] = [];
    for (let i = 0; i < adt; i++) arr.push({ fullName: "", passportNumber: "", dob: "", gender: "M", seatNumber: "", type: "ADULT" });
    for (let i = 0; i < chd; i++) arr.push({ fullName: "", passportNumber: "", dob: "", gender: "M", seatNumber: "", type: "CHILD" });
    for (let i = 0; i < inf; i++) arr.push({ fullName: "", passportNumber: "", dob: "", gender: "M", seatNumber: "", type: "INFANT" });
    return arr.length > 0 ? arr : [{ fullName: "", passportNumber: "", dob: "", gender: "M", seatNumber: "", type: "ADULT" }];
  }, [adt, chd, inf]);

  const { toast } = useToast();

  const selectedFlightIds = useBookingFlowStore((state) => state.selectedFlightIds);
  const setPassengersInStore = useBookingFlowStore((state) => state.setPassengers);
  const setBookingId = useBookingFlowStore((state) => state.setBookingId);
  const selectedSeats = useBookingFlowStore((state) => state.selectedSeats);
  const ancillaries = useBookingFlowStore((state) => state.ancillaries);

  const [passengers, setPassengers] = useState<
    {
      fullName: string;
      passportNumber: string;
      dob: string;
      gender: "M" | "F";
      seatNumber: string;
      type: "ADULT" | "CHILD" | "INFANT";
    }[]
  >(initialPassengers);
  const [bookingIdState, setBookingIdState] = useState<string>("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [flightDetails, setFlightDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProfileChecking, setIsProfileChecking] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [paymentData, setPaymentData] = useState<{ clientSecret: string; pnr: string; paymentId: string } | null>(null);
  const [pricingData, setPricingData] = useState<any | null>(null);
  const hasShownProfileToastRef = useRef(false);

  const { data: session, status } = useAuthSession();
  const isAuthenticated = status === "success" && !!session;
  const authChecked = status !== "pending";
  const profileQuery = useProfile(isAuthenticated);
  const activeFlightId = urlFlightId || selectedFlightIds[0] || "";
  const bookingFlightIds = urlFlightId ? [urlFlightId] : selectedFlightIds;

  const seatTotal = useMemo(
    () => Object.values(selectedSeats).reduce((sum, v) => sum + v.price, 0),
    [selectedSeats],
  );
  const ancillaryTotal = useMemo(
    () => ancillaries.reduce((sum, a) => sum + a.quantity * a.unitPrice, 0),
    [ancillaries],
  );
  const progressValue = ((step + 1) / steps.length) * 100;
  const paymentCurrency = useMemo(
    () => normalizePaymentCurrency(flightDetails?.currency),
    [flightDetails?.currency],
  );

  // Redirect if not logged in
  useEffect(() => {
    if (status === "success" && !session) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`);
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session && error.includes("session has expired")) {
      setError("");
    }
  }, [session, error]);

  // Fetch flight details from URL ID or store
  useEffect(() => {
    if (!activeFlightId) {
      if (authChecked && isAuthenticated) {
        router.replace("/flights");
      }
      return;
    }

    setLoading(true);
    apiFetch(`/flights/${activeFlightId}`)
      .then((data) => {
        setFlightDetails(data);
        // After getting flight details, also get the price solution (needed for SOAP booking)
        return apiFetch("/flights/price", {
          method: "POST",
          body: JSON.stringify({
            flightId: activeFlightId,
            passengers: initialPassengers.map(p => ({ type: p.type === 'ADULT' ? 'ADT' : p.type === 'CHILD' ? 'CNN' : 'INF' }))
          })
        });
      })
      .then((priceResponse) => {
        setPricingData(priceResponse);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Flight/Price fetch error:", err);
        setFlightDetails(null);
        setLoading(false);
      });
  }, [activeFlightId, authChecked, isAuthenticated, router, initialPassengers]);
  const nextStep = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      setError("");
      if (step === 0) {
        if (passengers.some((p) => !p.fullName || !p.passportNumber))
          throw new Error("Please fill all traveler details");
        if (bookingFlightIds.length === 0)
          throw new Error("No flight selected. Please select a flight again.");
        setPassengersInStore(passengers);

        const cleanedPassengers = passengers.map(({ seatNumber, ...p }) => ({
          ...p,
          seatNumber: seatNumber || undefined,
        }));

        const booking = await apiFetch<{ 
          bookingId: string; 
          payment: { clientSecret: string; paymentId: string };
          pnr: string;
        }>("/bookings/flights/hold", {
          method: "POST",
          body: JSON.stringify({
            flightIds: bookingFlightIds,
            passengers: cleanedPassengers,
            pricingSolutionXml: pricingData?.pricingSolutionXml || "",
          }),
        });
        
        setBookingId(booking.bookingId);
        setBookingIdState(booking.bookingId);
        setPaymentData({ 
          clientSecret: booking.payment.clientSecret,
          pnr: booking.pnr,
          paymentId: booking.payment.paymentId
        });
      } else if (step === 1) {
        const payment = await apiFetch<{ status: string; paymentId: string }>(
          "/payments/initiate",
          {
            method: "POST",
            body: JSON.stringify({
              bookingId: bookingIdState,
              provider: DEFAULT_PAYMENT_PROVIDER,
              amount: Number(
                flightDetails?.totalFare ?? flightDetails?.baseFare ?? 450,
              ),
              currency: paymentCurrency,
              successUrl: window.location.origin + "/flights/booking/success",
              failureUrl: window.location.origin + "/flights/booking/failure",
            }),
          },
        );

        const redirectUrl = (payment as any).redirectUrl as string | undefined;

        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }

        if (payment.status === "SUCCESS" || (payment as any).clientSecret) {
          setStep(2);
          setLoading(false);
          return;
        }
        throw new Error("Payment authorization failed");
      }
      setStep((prev) => prev + 1);
    } catch (e: any) {
      if (e.message?.includes("401") || e.status === 401) {
        setError(
          "Your session has expired. Please log in again to continue your booking.",
        );
      } else {
        setError(
          e.message || "An unexpected error occurred. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    step,
    passengers,
    bookingFlightIds,
    setPassengersInStore,
    setBookingId,
    bookingIdState,
    flightDetails,
    pricingData,
    setStep,
    setError,
    setLoading,
  ]);


  const checkProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setIsProfileChecking(false);
      return;
    }

    try {
      const profileResponse = await profileQuery.refetch();
      const profile = (profileResponse.data as any)?.profile ?? profileResponse.data ?? {};
      console.log("[checkProfile] Profile data:", profile);
      const complete = !!(
        profile && 
        profile.firstName && 
        profile.lastName && 
        profile.passportNumber
      );
      
      // Auto-continue if it was incomplete and now is complete
      if (complete && !isProfileComplete && !isProfileChecking) {
        toast({
          title: "Profile Complete!",
          description: "Resuming your booking automatically.",
        });
        setIsProfileComplete(true);
        // Set passengers first then continue
        setPassengers(prev => {
          const newArr = [...prev];
          newArr[0] = {
            ...newArr[0],
            fullName: `${profile.firstName} ${profile.lastName}`,
            passportNumber: profile.passportNumber || "",
            dob: profile.dateOfBirth || "",
            gender: profile.gender === "FEMALE" ? "F" : "M",
          };
          return newArr;
        });
        setTimeout(() => nextStep(), 500);
      } else {
        setIsProfileComplete(complete);
      }

      if (!complete && !hasShownProfileToastRef.current) {
        toast({
          title: "Complete your profile",
          description: "Add your phone, nationality, and passport to continue booking quickly.",
          variant: "destructive",
        });
        hasShownProfileToastRef.current = true;
      }

      if (complete && passengers[0].fullName === "") {
        // Keep other passengers intact, just update the first one
        setPassengers(prev => {
          const newArr = [...prev];
          newArr[0] = {
            ...newArr[0],
            fullName: `${profile.firstName} ${profile.lastName}`,
            passportNumber: profile.passportNumber || "",
            dob: profile.dateOfBirth || "",
            gender: profile.gender === "FEMALE" ? "F" : "M",
          };
          return newArr;
        });
      }
    } catch (err: any) {
      // Parse JSON error if possible
      let errorMessage = err?.message || err;
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed.statusCode === 401) {
          // Quietly handle unauthorized - the redirect useEffect will take care of it
          setIsProfileComplete(false);
          return;
        }
        errorMessage = parsed.message || errorMessage;
      } catch (e) {
        // Not JSON, use as is
      }
      
      console.error("[checkProfile] Profile fetch error:", errorMessage);
      setIsProfileComplete(false);
    } finally {
      setIsProfileChecking(false);
    }
  }, [isAuthenticated, isProfileComplete, isProfileChecking, nextStep, passengers, profileQuery, toast]);

  // Auto-fill profile data
  useEffect(() => {
    if (!authChecked) {
      return;
    }

    if (isAuthenticated) {
      checkProfile();
    } else {
      setIsProfileChecking(false);
    }
  }, [authChecked, isAuthenticated, checkProfile]);

  useEffect(() => {
    if (!isAuthenticated || isProfileComplete) {
      return;
    }

    const onFocus = () => {
      checkProfile();
    };

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [isAuthenticated, isProfileComplete, checkProfile]);


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="grow container mx-auto max-w-6xl px-4 pt-20 pb-12">
        <div className="mb-6 flex flex-col items-center text-center">
          {!isProfileComplete && !isProfileChecking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 w-full max-w-xl rounded-xl border border-redmix/10 bg-card p-3 flex items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="h-8 w-8 rounded-full bg-redmix/5 flex items-center justify-center shrink-0">
                  <Info className="h-4 w-4 text-redmix" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Complete your profile</p>
                  <p className="text-[10px] text-muted-foreground">Add your passport to continue booking.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="rounded-lg text-[10px] font-bold h-7"
                  onClick={() =>
                    router.push(
                      `/profile?callbackUrl=${encodeURIComponent(
                        `${window.location.pathname}${window.location.search}`,
                      )}`,
                    )
                  }
                >
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  className="bg-redmix text-white rounded-lg text-[10px] font-bold h-7 px-3"
                  onClick={checkProfile}
                >
                  Refresh
                </Button>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <h1 className="text-2xl font-black tracking-tight md:text-3xl uppercase text-foreground">
              {step === 2 ? "Booking" : "Secure"}{" "}
              <span className="text-redmix">
                {step === 2 ? "Confirmed" : "Checkout"}
              </span>
            </h1>
            {step < 2 && (
              <p className="mt-1 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                Step {step + 1} of {steps.length}: {steps[step].label}
              </p>
            )}
          </motion.div>

          {step < 2 && (
            <div className="w-full max-w-lg relative">
              <div className="absolute top-4 left-0 w-full h-px bg-muted/40 -z-10" />
              <div className="flex justify-between px-2">
                {steps.map((s, i) => (
                  <div
                    key={s.label}
                    className={cn(
                      "flex flex-col items-center gap-2",
                      i <= step
                        ? "text-foreground"
                        : "text-muted-foreground/30",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all bg-background",
                        i < step
                          ? "bg-green-500 border-green-500 text-white"
                          : i === step
                            ? "border-redmix text-redmix shadow-lg shadow-redmix/10"
                            : "border-muted text-muted-foreground",
                      )}
                    >
                      {i < step ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <s.icon className="h-4 w-4" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-wider",
                        i === step
                          ? "text-redmix"
                          : "text-muted-foreground",
                      )}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {error && (
                  <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive flex items-center gap-3">
                    <Info className="h-4 w-4" /> {error}
                  </div>
                )}

                {step === 0 && (
                  <PassengerForm
                    passengers={passengers}
                    setPassengers={setPassengers}
                  />
                )}

                {step === 1 && (
                  <Card className="rounded-2xl border-border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <CardContent className="p-6 md:p-10 text-center">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                        <CreditCard className="h-8 w-8" />
                      </div>
                      <h2 className="text-2xl font-black uppercase mb-2 tracking-tight">
                        Complete Payment
                      </h2>
                      {paymentData?.pnr && (
                        <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-redmix/5 px-3 py-1.5 text-[10px] font-bold text-redmix border border-redmix/10">
                          RESERVATION HELD: {paymentData.pnr}
                        </div>
                      )}
                      <p className="text-muted-foreground text-xs mb-8 max-w-sm mx-auto leading-relaxed">
                        Your flight is held. Please complete the payment to issue your tickets and secure your seats.
                      </p>
                      
                      <div className="space-y-4 max-w-sm mx-auto">
                        <Button
                          onClick={nextStep}
                          disabled={loading}
                          size="lg"
                          className="w-full h-12 rounded-xl bg-redmix text-white font-bold text-sm shadow-xl shadow-redmix/20 hover:bg-redmix/90 transition-all active:scale-[0.98]"
                        >
                          {loading ? "Processing..." : "SIMULATE SECURE PAYMENT"}
                        </Button>
                        <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-[0.2em]">
                          Secured by Stripe & Travelport
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card rounded-2xl p-6 md:p-10 border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center"
                  >
                    <div className="mb-5 flex justify-center">
                      <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 dark:bg-green-500/20 dark:text-green-300">
                        <Check className="h-8 w-8" />
                      </div>
                    </div>

                    <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight uppercase">
                      Booking Confirmed!
                    </h2>
                    <p className="text-muted-foreground text-xs mb-8 max-w-md mx-auto leading-relaxed">
                      Thank you for choosing EzeeFlights. Your journey to{" "}
                      <span className="text-foreground font-bold">
                        {flightDetails?.destination}
                      </span>{" "}
                      is officially locked in. Check your email for the itinerary.
                    </p>

                    <div className="grid grid-cols-1 gap-4 mb-8 text-left max-w-xs mx-auto">
                      <div className="bg-muted/40 rounded-xl p-4 border border-border/50">
                        <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-1">
                          Total Paid
                        </Label>
                        <span className="text-xl font-black text-redmix">
                          {flightDetails?.currency || "$"}
                          {(
                            Number(flightDetails?.baseFare || 0) * 1.12 +
                            ancillaryTotal +
                            seatTotal
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="px-6 h-11 rounded-xl font-bold uppercase text-[10px] tracking-widest border-2"
                      >
                        Manage Booking
                      </Button>
                      <Button
                        onClick={() => router.push("/")}
                        className="px-6 h-11 bg-redmix text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-redmix/20"
                      >
                        Return Home
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-8">
              <Button
                variant="ghost"
                disabled={step === 0 || step === 2}
                onClick={() => setStep((s) => s - 1)}
                className="text-muted-foreground hover:text-foreground text-[10px] font-bold uppercase tracking-wider"
              >
                ← Previous Step
              </Button>
              {step < 1 && (
                <Button
                  onClick={nextStep}
                  disabled={loading}
                  className="h-11 px-8 rounded-xl bg-redmix font-bold text-xs uppercase tracking-widest shadow-lg shadow-redmix/20 transition-all hover:scale-[1.02]"
                >
                  {loading ? "Processing..." : "Continue to Payment"}{" "}
                  <ChevronRight className="ml-2 h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          <aside>
            <Card className="sticky top-24 rounded-2xl border-border bg-card shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <CardContent className="p-5">
                <h3 className="mb-4 text-[11px] font-black text-foreground uppercase tracking-wider">
                  Trip Summary
                </h3>

                <div className="mb-5 flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="h-9 w-9 rounded-lg bg-background p-1.5 flex items-center justify-center border border-border/50">
                    <img
                      src={`https://www.kayak.com/rimg/provider-logos/airlines/v/${flightDetails?.airlineCode || "XX"}.png`}
                      className="h-full w-full object-contain"
                      alt="airline"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs truncate">
                      {flightDetails?.departureAirport || "---"} →{" "}
                      {flightDetails?.arrivalAirport || "---"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold">
                      {paymentData?.pnr ? `PNR: ${paymentData.pnr}` : (flightDetails?.departureAt
                        ? new Date(
                            flightDetails.departureAt,
                          ).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : "Loading...")}
                    </p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="fare" className="border-none">
                    <AccordionTrigger className="text-[10px] text-foreground font-black uppercase tracking-wider hover:no-underline py-2">
                      Price Breakdown
                    </AccordionTrigger>
                    <AccordionContent className="text-[10px] space-y-2.5 pt-2 font-medium">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Base Fare ({passengers.length}x)</span>
                        <span className="text-foreground font-bold">
                          {flightDetails?.currency || "$"}
                          {Number(flightDetails?.baseFare || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Taxes & Fees</span>
                        <span className="text-foreground font-bold">
                          {flightDetails?.currency || "$"}
                          {Number(
                            flightDetails?.tax ||
                              Number(flightDetails?.baseFare || 0) * 0.12,
                          ).toLocaleString()}
                        </span>
                      </div>
                      {seatTotal > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Seating</span>
                          <span className="text-foreground font-bold">
                            {flightDetails?.currency || "$"}
                            {seatTotal.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {ancillaryTotal > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Extras</span>
                          <span className="text-foreground font-bold">
                            {flightDetails?.currency || "$"}
                            {ancillaryTotal.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-5 pt-4 border-t border-dashed border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-foreground font-black uppercase tracking-wider">
                      Total
                    </Label>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-redmix">
                        {(
                          Number(
                            flightDetails?.totalFare ||
                              Number(flightDetails?.baseFare || 0) * 1.12,
                          ) +
                          ancillaryTotal +
                          seatTotal
                        ).toLocaleString()}
                      </span>
                      <span className="text-foreground/60 font-bold text-[9px] uppercase">
                        {flightDetails?.currency || "USD"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function BookingPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <BookingPageContent />
    </QueryClientProvider>
  );
}
