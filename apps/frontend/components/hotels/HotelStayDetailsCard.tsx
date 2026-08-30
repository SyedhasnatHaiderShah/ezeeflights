"use client";

import { Calendar, Users, Clock } from "lucide-react";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { useTranslation } from "react-i18next";
import { resolveHotelPricePerNight } from "@/lib/utils/hotel-stay";

interface StayDetailsCardProps {
  hotel: any;
  checkInDate: string | null;
  checkOutDate: string | null;
  nights: number;
}

export function HotelStayDetailsCard({
  hotel,
  checkInDate,
  checkOutDate,
  nights,
}: StayDetailsCardProps) {
  const { t } = useTranslation();
  const pricePerNight = resolveHotelPricePerNight(hotel);
  const totalPrice = pricePerNight * nights;
  const heroImage = hotel.images?.[0]?.url;

  const description =
    hotel.description ||
    `${hotel.name} offers a refined experience in ${hotel.city}. This ${
      hotel.starRating || hotel.rating || 0
    }-star ${(hotel.type || "property").toLowerCase()} combines modern elegance with exceptional service.`;

  return (
    <div className="bg-card rounded-3xl border border-border/60 shadow-2xl shadow-black/5 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden">
      {heroImage && (
        <div className="relative h-36 overflow-hidden bg-muted/20">
          <img
            src={heroImage}
            alt={hotel.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
              {hotel.type || t("Hotel")}
            </p>
            <p className="text-sm font-bold text-white leading-tight line-clamp-2">
              {hotel.name}
            </p>
          </div>
        </div>
      )}

      <div className="p-6 lg:p-7 space-y-6">
        <section className="space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            {t("Property Overview")}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            {description}
          </p>
        </section>

        <div className="border-t border-border/60 pt-6 space-y-5">
          <h3 className="text-lg font-bold text-foreground">
            {t("Your Stay Details")}
          </h3>

          <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="text-base font-bold text-foreground">{hotel.name}</p>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              {[hotel.city, hotel.country].filter(Boolean).join(", ")}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted/40 dark:bg-muted/10 rounded-xl border border-border/50 shrink-0">
                <Calendar className="w-4 h-4 text-redmix" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("Check-in / Out")}
                </p>
                <p className="text-xs font-bold mt-0.5">
                  {checkInDate
                    ? new Date(checkInDate).toLocaleDateString()
                    : t("Select Dates")}{" "}
                  —{" "}
                  {checkOutDate
                    ? new Date(checkOutDate).toLocaleDateString()
                    : t("Select Dates")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted/40 dark:bg-muted/10 rounded-xl border border-border/50 shrink-0">
                <Users className="w-4 h-4 text-redmix" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("Guests")}
                </p>
                <p className="text-xs font-bold mt-0.5">
                  {t("2 Adults · 1 Room")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted/40 dark:bg-muted/10 rounded-xl border border-border/50 shrink-0">
                <Clock className="w-4 h-4 text-redmix" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("Times")}
                </p>
                <p className="text-xs font-bold mt-0.5">
                  {t("In: 3:00 PM · Out: 12:00 PM")}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 pt-5 space-y-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              {t("Total Price")}
            </p>
            <CurrencyDisplay
              amount={totalPrice}
              currency={hotel.currency || "USD"}
              amountClassName="text-3xl font-black text-redmix tracking-tight leading-none"
              showComparison={false}
            />
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {nights} {nights > 1 ? t("nights") : t("night")} {t("stay")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
