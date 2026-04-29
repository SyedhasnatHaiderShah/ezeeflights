"use client";

import {
  Check,
  ChevronRight,
  User as UserIcon,
  Info,
  CreditCard,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PassengerForm } from "@/components/flights/PassengerForm";
import { apiFetch } from "@/lib/api/client";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
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

const steps = [
  { label: "Travelers", icon: UserIcon },
  { label: "Payment", icon: CreditCard },
];

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlFlightId = searchParams.get("id");

  const selectedFlightIds = useBookingFlowStore(
    (state) => state.selectedFlightIds,
  );
  const setPassengersInStore = useBookingFlowStore(
    (state) => state.setPassengers,
  );
  const setBookingId = useBookingFlowStore((state) => state.setBookingId);
  const selectedSeats = useBookingFlowStore((state) => state.selectedSeats);
  const ancillaries = useBookingFlowStore((state) => state.ancillaries);

  const [passengers, setPassengers] = useState<
    {
      fullName: string;
      passportNumber: string;
      phoneNumber?: string;
      gender: "M" | "F";
      type: "ADULT" | "CHILD" | "INFANT";
    }[]
  >([
    {
      fullName: "",
      passportNumber: "",
      phoneNumber: "",
      gender: "M",
      type: "ADULT",
    },
  ]);
  const [pricingSolutionXml, setPricingSolutionXml] = useState<string | null>(
    null,
  );
  const [bookingIdState, setBookingIdState] = useState<string>("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [flightDetails, setFlightDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProfileChecking, setIsProfileChecking] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(true);

  const { data: session, isLoading } = useAuthSession();
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const currentCurrency = SUPPORTED_CURRENCIES[baseCurrency];

  const formatPrice = (
    amount: number,
    from: string = flightDetails?.currency || "USD",
  ) => {
    const converted = getConvertedAmount(amount, from as any, baseCurrency);
    return `${currentCurrency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const seatTotal = useMemo(
    () => Object.values(selectedSeats).reduce((sum, v) => sum + v.price, 0),
    [selectedSeats],
  );
  const ancillaryTotal = useMemo(
    () => ancillaries.reduce((sum, a) => sum + a.quantity * a.unitPrice, 0),
    [ancillaries],
  );
  const progressValue = ((step + 1) / steps.length) * 100;

  useEffect(() => {
    if (session && error.includes("session has expired")) {
      setError("");
    }
  }, [session, error]);

  // Fetch flight details from URL ID or store
  useEffect(() => {
    const flightId = urlFlightId || selectedFlightIds[0];
    if (!flightId) {
      if (!isLoading) {
        router.replace("/flights");
      }
      return;
    }
    setLoading(true);
    apiFetch(`/flights/${flightId}`)
      .then((data) => {
        setFlightDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Flight fetch error:", err);
        setFlightDetails(null);
        setLoading(false);
      });
  }, [router, selectedFlightIds, urlFlightId, isLoading]);

  const checkProfile = async () => {
    if (!session) return;
    try {
      const profile: any = await apiFetch("/profile/me");
      const complete = !!(
        profile &&
        profile.firstName &&
        profile.lastName &&
        profile.passportNumber &&
        profile.gender
      );
      setIsProfileComplete(complete);

      if (profile && profile.firstName && profile.lastName) {
        setPassengers([
          {
            fullName: `${profile.firstName} ${profile.lastName}`,
            passportNumber: profile.passportNumber || "",
            phoneNumber: profile.phone || "",
            gender: (profile.gender as any) || "M",
            type: "ADULT",
          },
        ]);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setIsProfileChecking(false);
    }
  };

  // Auto-fill profile data
  useEffect(() => {
    if (session) {
      checkProfile();
    } else if (!isLoading) {
      setIsProfileChecking(false);
    }
  }, [session, isLoading]);

  const nextStep = async () => {
    if (loading) return;
    setLoading(true);
    try {
      setError("");
      if (step === 0) {
        if (passengers.some((p) => !p.fullName || !p.passportNumber))
          throw new Error("Please fill all required traveler details");
        setPassengersInStore(passengers);

        try {
          const priceRes = await apiFetch<any>("/flights/price", {
            method: "POST",
            body: JSON.stringify({
              flightId: urlFlightId || selectedFlightIds[0],
              passengers: [
                {
                  type: "ADULT",
                  count: passengers.filter((p) => p.type === "ADULT").length,
                },
                {
                  type: "CHILD",
                  count: passengers.filter((p) => p.type === "CHILD").length,
                },
                {
                  type: "INFANT",
                  count: passengers.filter((p) => p.type === "INFANT").length,
                },
              ].filter((p) => p.count > 0),
            }),
          });

          if (priceRes?.pricingSolutionXml) {
            setPricingSolutionXml(priceRes.pricingSolutionXml);
            if (
              priceRes.pricingData?.["SOAP:Envelope"]?.["SOAP:Body"]?.[
                "air:AirPriceRsp"
              ]?.["air:AirPriceResult"]?.["air:AirPricingSolution"]
            ) {
              const solution =
                priceRes.pricingData["SOAP:Envelope"]["SOAP:Body"][
                  "air:AirPriceRsp"
                ]["air:AirPriceResult"]["air:AirPricingSolution"];
              const numericTotal = parseFloat(
                solution.TotalPrice?.replace(/[^\d.]/g, "") || "0",
              );
              setFlightDetails((prev: any) => ({
                ...prev,
                totalFare: numericTotal || prev?.totalFare,
              }));
            }
          }
        } catch (err: any) {
          console.warn(
            "Failed to fetch live price, continuing with cached price.",
            err,
          );
        }
      } else if (step === 1) {
        const booking = await apiFetch<{
          bookingId: string;
          status: string;
          payment: any;
        }>("/bookings/flights/hold", {
          method: "POST",
          body: JSON.stringify({
            flightIds: [urlFlightId || selectedFlightIds[0]],
            passengers: passengers,
            pricingSolutionXml: pricingSolutionXml || undefined,
            paymentStatus: "PENDING",
            currency: flightDetails?.currency || "USD",
          }),
        });

        if (booking.bookingId) {
          setBookingId(booking.bookingId);
          setBookingIdState(booking.bookingId);
          setStep(2);
          setLoading(false);
          return;
        }
        throw new Error("Booking hold failed");
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
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto max-w-7xl px-4 pt-24 pb-12">
        <div className="mb-8 flex flex-col items-center text-center">
          {!isProfileComplete && !isProfileChecking && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 w-full max-w-2xl rounded-2xl border border-redmix/20 bg-redmix/5 p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 text-left">
                <div className="h-10 w-10 rounded-full bg-redmix/10 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-redmix" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Complete your profile
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Add your passport and name to speed up booking.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl text-xs font-bold"
                  onClick={() => window.open("/dashboard/profile", "_blank")}
                >
                  Edit Profile
                </Button>
                <Button
                  size="sm"
                  className="bg-redmix text-white rounded-xl text-xs font-bold"
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
            className="mb-6"
          >
            <h1 className="text-3xl font-black tracking-tight md:text-4xl lg:text-5xl uppercase text-foreground">
              {step === 2 ? "Booking" : "Secure"}{" "}
              <span className="text-redmix">
                {step === 2 ? "Confirmed" : "Checkout"}
              </span>
            </h1>
            {step < 2 && (
              <p className="mt-2 text-muted-foreground text-sm font-bold">
                Step {step + 1} of {steps.length}: {steps[step].label}
              </p>
            )}
          </motion.div>

          {step < 2 && (
            <div className="w-full max-w-2xl">
              <Progress
                value={Math.min(progressValue, 100)}
                className="h-1.5 bg-muted"
              />
              <div className="mt-5 flex justify-between px-4">
                {steps.map((s, i) => (
                  <div
                    key={s.label}
                    className={cn(
                      "flex flex-col items-center gap-1.5",
                      i <= step
                        ? "text-foreground"
                        : "text-muted-foreground/30",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl border transition-all",
                        i < step
                          ? "bg-green-500/10 border-green-500 text-green-500"
                          : i === step
                            ? "bg-redmix border-redmix text-white shadow-lg shadow-redmix/30 scale-110"
                            : "bg-muted/50 border-border text-muted-foreground",
                      )}
                    >
                      {i < step ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <s.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs font-bold uppercase tracking-tight hidden sm:block",
                        i === step
                          ? "text-foreground"
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

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {error && (
                  <div className="mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-3">
                    <Info className="h-5 w-5" /> {error}
                  </div>
                )}

                {step === 0 && (
                  <PassengerForm
                    passengers={passengers}
                    setPassengers={setPassengers}
                  />
                )}

                {step === 1 && (
                  <Card className="rounded-2xl border-border bg-card shadow-xl overflow-hidden">
                    <CardContent className="p-8 md:p-12 text-center">
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                        <Check className="h-10 w-10" />
                      </div>
                      <h2 className="text-3xl font-black uppercase mb-3 tracking-tight">
                        Ready to Confirm?
                      </h2>
                      <p className="text-muted-foreground text-sm mb-8">
                        Review your flight details and complete your secure
                        payment to finalize the booking.
                      </p>
                      <Button
                        onClick={nextStep}
                        disabled={loading}
                        size="lg"
                        className="w-full h-14 rounded-xl bg-redmix text-white font-bold shadow-lg shadow-redmix/20 hover:brightness-110 transition-all"
                      >
                        {loading ? "Processing..." : "CONFIRM & PAY NOW"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-2xl text-center"
                  >
                    <div className="mb-6 flex justify-center">
                      <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shadow-lg shadow-green-500/5">
                        <Check className="h-10 w-10 text-green-500" />
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-foreground mb-4 tracking-tight uppercase">
                      Booking Confirmed!
                    </h2>
                    <p className="text-muted-foreground text-sm mb-8 max-w-lg mx-auto">
                      Thank you for choosing EzeeFlights. Your journey to{" "}
                      <span className="text-foreground font-bold">
                        {flightDetails?.destination}
                      </span>{" "}
                      is officially locked in.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 text-left max-w-lg mx-auto">
                      <div className="bg-muted/50 rounded-xl p-6 border border-border">
                        <Label className="text-xs text-muted-foreground font-bold uppercase tracking-tight block mb-2">
                          Total Paid
                        </Label>
                        <span className="text-2xl font-black text-redmix">
                          {formatPrice(
                            Number(flightDetails?.baseFare || 0) * 1.12 +
                              ancillaryTotal +
                              seatTotal,
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => router.push("/dashboard")}
                        className="px-8 py-6 rounded-xl font-bold uppercase text-xs tracking-widest"
                      >
                        Manage Booking
                      </Button>
                      <Button
                        onClick={() => router.push("/")}
                        className="px-8 py-6 bg-redmix text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-redmix/20"
                      >
                        Return Home
                      </Button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-6">
              <Button
                variant="ghost"
                disabled={step === 0 || step === 2}
                onClick={() => setStep((s) => s - 1)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold uppercase"
              >
                ← Previous Step
              </Button>
              {step < 1 && (
                <Button
                  onClick={nextStep}
                  disabled={loading}
                  className="h-12 px-8 rounded-xl bg-redmix font-bold text-sm shadow-lg shadow-redmix/20 transition-all hover:scale-[1.02]"
                >
                  {loading ? "Processing..." : "Continue to Payment"}{" "}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <Card className="sticky top-24 rounded-2xl border-border bg-card shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <h3 className="mb-4 text-sm font-bold text-foreground">
                  Trip Summary
                </h3>

                <div className="mb-6">
                  <CurrencySwitcher />
                </div>

                <div className="mb-6 flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className="h-10 w-10 rounded-lg bg-white p-1.5 flex items-center justify-center border border-border">
                    <img
                      //   src={`https://www.kayak.com/rimg/provider-logos/airlines/v/${flightDetails?.airlineCode || "XX"}.png`}
                      className="h-full w-full object-contain"
                      alt="airline"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-sm">
                      {flightDetails?.departureAirport || "---"} →{" "}
                      {flightDetails?.arrivalAirport || "---"}
                    </p>
                    <p className="text-xs text-muted-foreground font-semibold">
                      {flightDetails?.departureAt
                        ? new Date(
                            flightDetails.departureAt,
                          ).toLocaleDateString()
                        : "Loading..."}
                    </p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="fare" className="border-none">
                    <AccordionTrigger className="text-sm text-foreground/90 hover:no-underline py-2 font-bold">
                      Price Breakdown
                    </AccordionTrigger>
                    <AccordionContent className="text-sm space-y-2 pt-1 text-foreground/90">
                      <div className="flex justify-between">
                        <span>Base Fare ({passengers.length}x)</span>
                        <span className="text-foreground font-bold">
                          {formatPrice(Number(flightDetails?.baseFare || 0))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes & Fees</span>
                        <span className="text-foreground font-bold">
                          {formatPrice(
                            Number(
                              flightDetails?.tax ||
                                Number(flightDetails?.baseFare || 0) * 0.12,
                            ),
                          )}
                        </span>
                      </div>
                      {seatTotal > 0 && (
                        <div className="flex justify-between">
                          <span>Seating</span>
                          <span className="text-foreground font-bold">
                            {formatPrice(seatTotal)}
                          </span>
                        </div>
                      )}
                      {ancillaryTotal > 0 && (
                        <div className="flex justify-between">
                          <span>Extras</span>
                          <span className="text-foreground font-bold">
                            {formatPrice(ancillaryTotal)}
                          </span>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="mt-6 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label className="text-base text-foreground font-bold">
                      Total Price
                    </Label>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-redmix">
                        {formatPrice(
                          Number(
                            flightDetails?.totalFare ||
                              Number(flightDetails?.baseFare || 0) * 1.12,
                          ) +
                            ancillaryTotal +
                            seatTotal,
                        )}
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
