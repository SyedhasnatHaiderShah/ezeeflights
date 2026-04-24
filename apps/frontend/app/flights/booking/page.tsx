"use client";

import {
  Check,
  ChevronRight,
  User as UserIcon,
  Info,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PassengerForm } from "@/components/flights/PassengerForm";
import { apiFetch } from "@/lib/api/client";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
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
      seatNumber: string;
      type: "ADULT" | "CHILD" | "INFANT";
    }[]
  >([{ fullName: "", passportNumber: "", seatNumber: "", type: "ADULT" }]);
  const [bookingIdState, setBookingIdState] = useState<string>("");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [flightDetails, setFlightDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: session } = useAuthSession();

  useEffect(() => {
    if (session && error.includes("session has expired")) {
      setError("");
    }
  }, [session, error]);

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
    if (selectedFlightIds.length === 0) {
      router.replace("/flights");
      return;
    }
    apiFetch(`/flights/${selectedFlightIds[0]}`)
      .then(setFlightDetails)
      .catch(() => setFlightDetails(null));
  }, [router, selectedFlightIds]);

  const nextStep = async () => {
    if (loading) return;
    setLoading(true);
    try {
      setError("");
      if (step === 0) {
        if (passengers.some((p) => !p.fullName || !p.passportNumber))
          throw new Error("Please fill all traveler details");
        setPassengersInStore(passengers);

        const cleanedPassengers = passengers.map(({ seatNumber, ...p }) => ({
          ...p,
          seatNumber: seatNumber || undefined,
        }));

        const booking = await apiFetch<{ id: string }>("/bookings", {
          method: "POST",
          body: JSON.stringify({
            flightIds: selectedFlightIds,
            passengers: cleanedPassengers,
            paymentStatus: "PENDING",
          }),
        });
        setBookingId(booking.id);
        setBookingIdState(booking.id);
      } else if (step === 1) {
        const payment = await apiFetch<{ status: string; paymentId: string }>(
          "/payments/initiate",
          {
            method: "POST",
            body: JSON.stringify({
              bookingId: bookingIdState,
              provider: "MOCK",
              amount: flightDetails?.baseFare || 450,
              currency: "USD",
              successUrl: window.location.origin + "/flights/booking/success",
              failureUrl: window.location.origin + "/flights/booking/failure",
            }),
          },
        );

        if (payment.status === "SUCCESS" || (payment as any).redirectUrl) {
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
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto max-w-7xl px-4 pt-24 pb-12">
        <div className="mb-8 flex flex-col items-center text-center">
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
                          $
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
                          {flightDetails?.currency || "$"}
                          {Number(flightDetails?.baseFare || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes & Fees</span>
                        <span className="text-foreground font-bold">
                          {flightDetails?.currency || "$"}
                          {Number(
                            flightDetails?.tax ||
                              Number(flightDetails?.baseFare || 0) * 0.12,
                          ).toFixed(2)}
                        </span>
                      </div>
                      {seatTotal > 0 && (
                        <div className="flex justify-between">
                          <span>Seating</span>
                          <span className="text-foreground font-bold">
                            {flightDetails?.currency || "$"}
                            {seatTotal.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {ancillaryTotal > 0 && (
                        <div className="flex justify-between">
                          <span>Extras</span>
                          <span className="text-foreground font-bold">
                            {flightDetails?.currency || "$"}
                            {ancillaryTotal.toFixed(2)}
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
                        {(
                          Number(
                            flightDetails?.totalFare ||
                              Number(flightDetails?.baseFare || 0) * 1.12,
                          ) +
                          ancillaryTotal +
                          seatTotal
                        ).toFixed(2)}
                      </span>
                      <span className="text-foreground/90 font-bold text-sm">
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
