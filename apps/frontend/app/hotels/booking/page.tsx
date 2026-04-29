"use client";

import {
  Clock,
  ShieldCheck,
  Sparkles,
  CreditCard,
  Hotel as HotelIcon,
  Check,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Users,
  Loader2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useHotelBookingFlowStore } from "@/lib/store/hotel-booking-flow-store";
import { cn } from "@/lib/utils";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { GuestForm } from "@/components/hotels/GuestForm";
import {
  getHotelDetails,
  createHotelBooking,
  initiateHotelPayment,
  confirmHotelPayment,
  Hotel,
} from "@/lib/api/hotels";

const steps = ["Personalize", "Guest Details", "Payment"];

export default function HotelBookingPage() {
  const router = useRouter();
  const store = useHotelBookingFlowStore();
  const [step, setStep] = useState(0);
  const [guests, setGuests] = useState<
    Array<{
      fullName: string;
      age: number;
      type: "ADULT" | "CHILD";
      roomId: string;
    }>
  >([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loadingHotel, setLoadingHotel] = useState(true);

  // Enhancement options
  const [payAtHotel, setPayAtHotel] = useState(false);
  const [earlyCheckIn, setEarlyCheckIn] = useState(false);
  const [lateCheckOut, setLateCheckOut] = useState(false);
  const [upgradeSelected, setUpgradeSelected] = useState(false);

  useEffect(() => {
    if (!store.hotelId) {
      router.push("/hotels");
      return;
    }

    const fetchHotel = async () => {
      try {
        const data = await getHotelDetails(store.hotelId!);
        setHotel(data);
      } catch (err) {
        console.error("Failed to fetch hotel details:", err);
      } finally {
        setLoadingHotel(false);
      }
    };

    fetchHotel();
  }, [store.hotelId, router]);

  const roomIds = store.selectedRooms.map((room) => room.roomId);

  const nights = Math.max(
    1,
    Math.ceil(
      (new Date(store.checkOutDate).getTime() -
        new Date(store.checkInDate).getTime()) /
        (24 * 60 * 60 * 1000),
    ) || 1,
  );

  const baseTotal = useMemo(
    () =>
      store.selectedRooms.reduce(
        (acc, room) => acc + room.pricePerNight * room.quantity * nights,
        0,
      ) || (hotel?.minPricePerNight ? hotel.minPricePerNight * nights : 0),
    [nights, store.selectedRooms, hotel],
  );
  const upgradeCost = upgradeSelected ? 250 * nights : 0;
  const total = baseTotal + upgradeCost;

  const handleCompleteBooking = async () => {
    setIsSubmitting(true);
    try {
      // 1. Create the booking
      const booking = await createHotelBooking({
        hotelId: store.hotelId!,
        checkInDate: store.checkInDate,
        checkOutDate: store.checkOutDate,
        rooms: store.selectedRooms.map((r) => ({
          roomId: r.roomId,
          quantity: r.quantity,
        })),
        guests: guests,
      });

      if (!payAtHotel) {
        // 2. If paying now, initiate payment
        const { paymentIntentId } = await initiateHotelPayment(booking.id);

        // 3. Confirm payment (Simulated for now, usually happens after Stripe.js confirmation)
        await confirmHotelPayment(booking.id, paymentIntentId);
      }

      // 4. Reset store and navigate to confirmation
      store.reset();
      router.push(`/hotels/confirmation?bookingId=${booking.id}`);
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Something went wrong with your reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingHotel || !hotel) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-red" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Preparing your reservation...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-brand-red/10 selection:text-brand-red">
      <Header />

      <main className="flex-1 pt-20">
        <div className="mx-auto max-w-screen-2xl px-4 py-12 md:px-6">
          {/* Progress Header */}
          <div className="mb-16 max-w-3xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Complete Your Reservation
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Just a few steps away from your perfect stay at {hotel.name}
              </p>
            </div>

            <div className="relative flex items-center justify-between px-2">
              <div className="absolute left-0 right-0 top-[1.25rem] h-0.5 bg-muted/50 -z-10" />
              <div
                className="absolute left-0 top-[1.25rem] h-0.5 bg-brand-red transition-all duration-700 -z-10"
                style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
              />
              {steps.map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-500 border-2",
                      i < step
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : i === step
                          ? "bg-brand-red border-brand-red text-white shadow-xl shadow-brand-red/30 scale-110"
                          : "bg-background border-border text-muted-foreground",
                    )}
                  >
                    {i < step ? <Check className="w-5 h-5" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider transition-colors duration-500",
                      i <= step ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-12">
              {/* Step 0: Enhancements */}
              {step === 0 && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-brand-red" />
                      Enhance Your Experience
                    </h2>

                    <div
                      onClick={() => setUpgradeSelected(!upgradeSelected)}
                      className={cn(
                        "group p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden",
                        upgradeSelected
                          ? "border-brand-red bg-brand-red/[0.03] shadow-xl shadow-brand-red/5"
                          : "border-border/50 bg-card/40 hover:border-brand-red/30",
                      )}
                    >
                      <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="w-full md:w-32 h-32 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                          <img
                            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                        <div className="flex-1 space-y-2 text-center md:text-left">
                          <h3 className="font-bold text-lg">
                            Luxury Ocean Suite Upgrade
                          </h3>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-md">
                            Enjoy an extra 25sqm of space, a private balcony
                            with panoramic sea views, and a complimentary
                            premium minibar.
                          </p>
                        </div>
                        <div className="text-center md:text-right shrink-0">
                          <p className="text-sm font-bold text-brand-red">
                            + {hotel.currency} 250{" "}
                            <span className="text-[10px] font-medium text-muted-foreground">
                              / night
                            </span>
                          </p>
                          <div
                            className={cn(
                              "mt-3 w-6 h-6 rounded-lg border-2 flex items-center justify-center mx-auto md:ml-auto transition-all",
                              upgradeSelected
                                ? "bg-brand-red border-brand-red text-white"
                                : "border-border group-hover:border-brand-red/50",
                            )}
                          >
                            {upgradeSelected && <Check className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <Clock className="w-6 h-6 text-brand-red" />
                      Flexible Timing
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        {
                          id: "early",
                          label: "Early Check-in (10 AM)",
                          state: earlyCheckIn,
                          setter: setEarlyCheckIn,
                        },
                        {
                          id: "late",
                          label: "Late Check-out (4 PM)",
                          state: lateCheckOut,
                          setter: setLateCheckOut,
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => item.setter(!item.state)}
                          className={cn(
                            "p-5 rounded-2xl border flex items-center justify-between transition-all font-bold text-xs bg-card/40 backdrop-blur-sm",
                            item.state
                              ? "border-brand-red bg-brand-red/[0.05] text-brand-red shadow-lg"
                              : "border-border/50 text-muted-foreground hover:bg-muted/30 hover:border-brand-red/20",
                          )}
                        >
                          {item.label}
                          <div
                            className={cn(
                              "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all",
                              item.state
                                ? "bg-brand-red border-brand-red text-white"
                                : "border-border/50",
                            )}
                          >
                            {item.state && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-brand-red" />
                      Payment Strategy
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div
                        onClick={() => setPayAtHotel(false)}
                        className={cn(
                          "group p-6 rounded-3xl border-2 cursor-pointer transition-all bg-card/40 relative",
                          !payAtHotel
                            ? "border-brand-red shadow-xl shadow-brand-red/5"
                            : "border-border/50 opacity-60 hover:opacity-100",
                        )}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-bold text-sm">Pay Securely Now</p>
                          <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            Save 12%
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          Pay with your preferred method today and enjoy a
                          significant discount on your stay.
                        </p>
                      </div>
                      <div
                        onClick={() => setPayAtHotel(true)}
                        className={cn(
                          "group p-6 rounded-3xl border-2 cursor-pointer transition-all bg-card/40",
                          payAtHotel
                            ? "border-brand-red shadow-xl shadow-brand-red/5"
                            : "border-border/50 opacity-60 hover:opacity-100",
                        )}
                      >
                        <p className="font-bold text-sm mb-3">
                          Pay at Property
                        </p>
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                          Flexible booking: No immediate charge. Pay at the
                          hotel during your check-in or stay.
                        </p>
                      </div>
                    </div>
                  </section>

                  <button
                    onClick={() => setStep(1)}
                    className="w-full bg-brand-red text-white py-5 rounded-2xl font-bold text-sm hover:shadow-2xl hover:shadow-brand-red/30 transition-all active:scale-[0.98]"
                  >
                    Confirm & Continue to Guests
                  </button>
                </div>
              )}

              {/* Step 1: Guest Details */}
              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setStep(0)}
                      className="p-3 hover:bg-muted/50 rounded-2xl transition-colors border border-border/50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold">Guest Information</h2>
                  </div>
                  <div className="bg-card/40 backdrop-blur-md p-8 rounded-[2rem] border border-border/50 shadow-sm">
                    <GuestForm
                      roomIds={roomIds}
                      onSubmit={async (guestList) => {
                        setGuests(guestList);
                        setStep(2);
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Final Confirmation */}
              {step === 2 && (
                <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700 text-center py-12">
                  <div className="w-24 h-24 bg-brand-red/10 rounded-3xl flex items-center justify-center mx-auto mb-8 transform rotate-6 hover:rotate-0 transition-transform duration-500 shadow-xl shadow-brand-red/10">
                    <ShieldCheck className="w-12 h-12 text-brand-red" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-bold tracking-tight">
                      Final Confirmation
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                      Almost there! Review your stay summary on the right and
                      finalize your reservation for {hotel.name}.
                    </p>
                  </div>

                  <div className="bg-card/40 backdrop-blur-md p-10 rounded-[3rem] border border-border/50 shadow-2xl max-w-md mx-auto mt-12 space-y-8">
                    <div className="space-y-4">
                      <button
                        className="w-full rounded-2xl bg-brand-red py-5 text-white font-bold text-sm hover:shadow-2xl hover:shadow-brand-red/30 disabled:opacity-60 transition-all active:scale-95 flex items-center justify-center gap-3"
                        disabled={isSubmitting}
                        onClick={handleCompleteBooking}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Securing Your Stay...
                          </>
                        ) : payAtHotel ? (
                          "Complete Reservation"
                        ) : (
                          "Authorize & Pay Now"
                        )}
                      </button>
                      <p className="text-[10px] text-muted-foreground font-bold tracking-tight">
                        By proceeding, you agree to our{" "}
                        <span className="text-brand-red hover:underline cursor-pointer">
                          Booking Conditions
                        </span>{" "}
                        and Privacy Policy.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Summary Sidebar */}
            <aside className="sticky top-28 space-y-6">
              <div className="bg-card/40 backdrop-blur-md rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden">
                <div className="h-44 relative overflow-hidden group">
                  <img
                    src={hotel.images[0]?.url}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 text-white space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                      {hotel.type}
                    </p>
                    <p className="text-lg font-bold leading-tight tracking-tight">
                      {hotel.name}
                    </p>
                  </div>
                </div>

                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Check-in
                      </p>
                      <p className="text-xs font-bold">
                        {new Date(
                          store.checkInDate || Date.now(),
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" /> Check-out
                      </p>
                      <p className="text-xs font-bold">
                        {new Date(
                          store.checkOutDate || Date.now(),
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="space-y-1.5 col-span-2 pt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-3 h-3" /> Guests & Duration
                      </p>
                      <p className="text-xs font-bold">
                        2 Adults · {nights} Night{nights > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="h-px bg-border/50" />

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-muted-foreground">
                        Standard Room Rate
                      </span>
                      <span className="font-bold">
                        {hotel.currency} {baseTotal.toLocaleString()}
                      </span>
                    </div>
                    {upgradeSelected && (
                      <div className="flex justify-between items-center text-xs font-medium animate-in slide-in-from-left-2">
                        <span className="text-brand-red flex items-center gap-1.5 font-bold">
                          <Sparkles className="w-3.5 h-3.5" /> Luxury Upgrade
                        </span>
                        <span className="font-bold text-brand-red">
                          + {hotel.currency} {upgradeCost.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs font-medium">
                      <span className="text-muted-foreground">
                        Taxes & Service Fees
                      </span>
                      <span className="font-bold text-emerald-500">
                        Complimentary
                      </span>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border/50">
                    <div className="flex justify-between items-end mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Total Reservation
                      </span>
                      <div className="text-right">
                        <p className="text-3xl font-bold tracking-tight text-brand-red">
                          {hotel.currency} {total.toLocaleString()}
                        </p>
                        <p className="text-[9px] text-muted-foreground font-bold italic mt-1">
                          Price inclusive of all taxes
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-border/50">
                      <div className="p-2 bg-background rounded-xl">
                        <HotelIcon className="w-4 h-4 text-brand-red" />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                        Best Price Guarantee Applied
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
