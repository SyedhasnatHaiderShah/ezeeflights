"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback } from "react";
import { WishlistButton } from "@/components/destinations/WishlistButton";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import { differenceInDays } from "date-fns";
import { Hotel } from "@/lib/types/hotels";
import { cn } from "@/lib/utils";

interface Props {
  hotel: Hotel;
  checkInDate: string;
  checkOutDate: string;
  onCompareToggle?: (hotelId: string, selected: boolean) => void;
  isCompared?: boolean;
}

const fallbackImages = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
];

export function HotelCard({
  hotel,
  checkInDate,
  checkOutDate,
  onCompareToggle,
  isCompared,
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const images =
    hotel.images?.length > 0
      ? hotel.images.map((img) => img.url)
      : fallbackImages;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const stayDays =
    differenceInDays(new Date(checkOutDate), new Date(checkInDate)) || 1;
  const totalPrice = (hotel.minPricePerNight || 0) * stayDays;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all mb-3 relative flex flex-col xl:flex-row">
      <div className="relative aspect-[4/3] xl:aspect-auto xl:w-72 shrink-0 overflow-hidden">
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {hotel.isBestForTrip && (
            <span className="rounded-full bg-gradient-to-r from-redmix to-orange-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg flex items-center gap-1.5 animate-pulse">
              <Sparkles className="w-3 h-3" /> BEST VALUE
            </span>
          )}
          {hotel.rooms?.some((r) => r.freeCancellation) && (
            <span className="rounded-full bg-emerald-500/10 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-emerald-600 shadow-sm border border-emerald-500/20">
              Free Cancellation
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <WishlistButton
          attractionId={hotel.id}
          className="absolute right-3 top-3 z-20 bg-white/80 p-2 backdrop-blur-md shadow-sm transition-all hover:scale-110 active:scale-95 border border-border/50 xl:hidden text-muted-foreground hover:text-redmix"
        />

        {/* Image Carousel */}
        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((src, idx) => (
              <div
                key={`${hotel.id}-${idx}`}
                className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden"
              >
                <img
                  src={src}
                  alt={`${hotel.name} view ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={scrollPrev}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm p-1.5 text-white opacity-0 transition-all hover:bg-black/50 group-hover:opacity-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-black/30 backdrop-blur-sm p-1.5 text-white opacity-0 transition-all hover:bg-black/50 group-hover:opacity-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 p-4 lg:p-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-bold leading-tight text-foreground truncate max-w-[300px]">
                {hotel.name || "Unnamed Property"}
              </h3>
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                <MapPin className="h-3 w-3 text-brand-red" />{" "}
                {hotel.city || "Unknown City"},{" "}
                {hotel.country || "Unknown Country"}
              </p>
            </div>
            <div className="flex flex-col items-end shrink-0">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-xs",
                      i < (hotel.starRating || 0)
                        ? "text-amber-500"
                        : "text-muted/30",
                    )}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-[10px] font-black text-muted-foreground/60 mt-1 uppercase tracking-widest">
                {hotel.type || "Property"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-redmix/10 text-redmix w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold border border-redmix/10">
                {(hotel.userRating || 0).toFixed(1)}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold leading-none text-foreground">
                  {(hotel.userRating || 0) >= 4.5 ? "Exceptional" : "Excellent"}
                </p>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                  {(hotel.reviewCount || 0).toLocaleString()} reviews
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {hotel.amenities?.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center rounded-md bg-slate-50 dark:bg-muted/30 px-2 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-100"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-dashed border-border xl:hidden flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-foreground uppercase tracking-widest">
              Price per night
            </p>
            <CurrencyDisplay
              amount={hotel.minPricePerNight || 0}
              currency={hotel.currency || "USD"}
              className="items-start"
            />
          </div>
          <Link
            href={`/hotels/${hotel.id}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`}
            className="bg-redmix text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-redmix/20 flex items-center justify-center text-xs"
          >
            Select
          </Link>
        </div>
      </div>

      {/* Right: Booking (Desktop) */}
      <div className="hidden xl:flex w-48 dark:bg-muted/10 border-l border-border p-5 flex-col justify-center items-center gap-4 text-center">
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1">
            Total Price
          </p>
          <CurrencyDisplay
            amount={totalPrice}
            currency={hotel.currency || "USD"}
            className="items-center"
          />
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
            {stayDays} {stayDays === 1 ? "night" : "nights"} stay
          </p>
        </div>
        <div className="w-full space-y-2">
          <Link
            href={`/hotels/${hotel.id}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`}
            className="w-full bg-redmix text-white font-bold h-11 rounded-xl shadow-lg shadow-redmix/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center text-sm"
          >
            Select
          </Link>
          <WishlistButton attractionId={hotel.id} className="w-full" />
        </div>
      </div>
    </article>
  );
}
