"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, ShieldCheck } from "lucide-react";
import { getHotelStaySelection } from "@/lib/utils/hotel-stay";
import { HotelGuestForm } from "@/components/hotels/HotelGuestForm";
import { useHotelBookingFlowStore } from "@/lib/store/hotel-booking-flow-store";
import { useCurrencyStore } from "@/lib/store/currency-store";
import { createHotelBooking } from "@/lib/api/hotels";
import type { Hotel } from "@/lib/types/hotels";
import { useTranslation } from "react-i18next";
import { isHotelGuestComplete } from "@/lib/validation/hotel-guest";
import { getContactValidationError } from "@/lib/validation/flight-traveler";
import { useToast } from "@/lib/hooks/use-toast";

interface HotelBookingSectionProps {
  hotel: Hotel;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
}

export function HotelBookingSection({
  hotel,
  checkInDate,
  checkOutDate,
  nights,
}: HotelBookingSectionProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { toast } = useToast();
  const baseCurrency = useCurrencyStore((s) => s.baseCurrency);
  const reset = useHotelBookingFlowStore((s) => s.reset);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const stay = useMemo(() => getHotelStaySelection(hotel), [hotel]);
  const roomIds = [stay.roomId];

  const baseTotal = useMemo(
    () => stay.pricePerNight * nights,
    [stay.pricePerNight, nights],
  );

  const handleCompleteBooking = async (
    guestList: Array<{
      firstName: string;
      middleName?: string;
      lastName: string;
      age: number;
      type: "ADULT" | "CHILD";
      roomId: string;
    }>,
  ) => {
    if (!checkInDate || !checkOutDate) {
      alert(t("Please select check-in and check-out dates."));
      return;
    }

    if (guestList.some((g) => !isHotelGuestComplete(g))) {
      alert(t("Please complete First Name, Last Name, and Age for every guest."));
      return;
    }

    const contactResult = getContactValidationError(contactEmail, contactPhone);
    if (!contactResult.valid) {
      toast({
        title: contactResult.title ?? t("Contact details required"),
        description: contactResult.description,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const rooms = [{ roomId: stay.roomId, quantity: stay.quantity }];

    const payload = {
      hotelId: hotel.id,
      checkInDate,
      checkOutDate,
      rooms,
      guests: guestList.map((g) => ({
        firstName: g.firstName.trim(),
        middleName: g.middleName?.trim() || undefined,
        lastName: g.lastName.trim(),
        age: Number(g.age),
        type: g.type,
        roomId: g.roomId || stay.roomId,
      })),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
      city: hotel.city,
      displayCurrency: baseCurrency,
    };

    try {
      const booking = await createHotelBooking(payload);
      toast({
        title: t("Booking confirmed"),
        description: t("Your reservation at {{hotel}} has been created successfully.", {
          hotel: hotel.name,
        }),
        variant: "success",
      });
      reset();
      router.push(`/hotels/confirmation?bookingId=${booking.id}` as any);
    } catch {
      toast({
        title: t("Booking failed"),
        description: t(
          "Something went wrong with your reservation. Please try again.",
        ),
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="guest-booking"
      className="scroll-mt-28 space-y-6 pt-4 border-t border-border/60"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-redmix/10 text-redmix">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
            {t("Complete Your Reservation")}
          </h2>
          <p className="text-sm text-foreground/80 font-medium mt-1">
            {t("Enter guest details to confirm your stay at")} {hotel.name}
          </p>
        </div>
      </div>

      {/* Trust / confirmation message (matches flight booking) */}
      <div className="flex items-start gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 text-sm">
        <div className="rounded-full p-2 shrink-0 bg-emerald-500/10 text-emerald-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1 mt-0.5">
          <p className="font-bold text-foreground text-base">
            {t("Instant Confirmation")}
          </p>
          <p className="text-foreground/80 leading-relaxed">
            {t(
              "Your reservation is confirmed instantly. No payment is required at this stage — our specialists will finalise your stay and send your confirmation shortly.",
            )}
          </p>
        </div>
      </div>

      <div className="gap-3 items-start">
        <div className="rounded-3xl border border-border/60 bg-card p-5 md:p-6 shadow-2xl shadow-black/5 ring-1 ring-black/5 dark:ring-white/5">
          <HotelGuestForm
            roomIds={roomIds}
            contactEmail={contactEmail}
            contactPhone={contactPhone}
            onContactEmailChange={setContactEmail}
            onContactPhoneChange={setContactPhone}
            onSubmit={handleCompleteBooking}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* <aside className="lg:sticky lg:top-28 space-y-4">
          <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-md overflow-hidden">
            {hotel.images?.[0]?.url && (
              <div className="h-36 relative overflow-hidden bg-muted/20">
                <img
                  src={hotel.images[0].url}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-redmix">
                    {hotel.type}
                  </p>
                  <p className="text-base font-black leading-tight">{hotel.name}</p>
                </div>
              </div>
            )}

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-xl border border-border/50 text-sm">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-redmix" /> Check-in
                  </p>
                  <p className="font-bold mt-0.5">
                    {new Date(checkInDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-redmix" /> Check-out
                  </p>
                  <p className="font-bold mt-0.5">
                    {new Date(checkOutDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="col-span-2 pt-2 border-t border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3 h-3 text-redmix" /> Stay
                  </p>
                  <p className="font-bold mt-0.5">
                    2 Adults · {nights} Night{nights > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {selectedRooms.length > 0 && (
                <div className="space-y-2 text-sm">
                  {selectedRooms.map((room) => (
                    <div
                      key={room.roomId}
                      className="flex justify-between gap-2 text-muted-foreground"
                    >
                      <span className="font-medium truncate">
                        {room.roomType} × {room.quantity}
                      </span>
                      <CurrencyDisplay
                        amount={room.pricePerNight * room.quantity * nights}
                        currency={hotel.currency || "USD"}
                        showComparison={false}
                        amountClassName="font-bold text-foreground shrink-0"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t border-border/50 flex flex-col items-end gap-1">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest self-start mb-1">
                  Total
                </p>
                <CurrencyDisplay
                  amount={baseTotal}
                  currency={hotel.currency || "USD"}
                  amountClassName="text-2xl font-black text-redmix tracking-tight"
                  showComparison={false}
                />
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl p-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-wider">
                  Best Price Guarantee
                </p>
              </div>
            </div>
          </div>

          {isSubmitting && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-redmix" />
              Securing your reservation…
            </div>
          )}
        </aside> */}
      </div>
    </section>
  );
}
