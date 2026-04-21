'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, MapPin, ParkingCircle, Waves, Wifi, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useCallback } from 'react';
import { WishlistButton } from '@/components/destinations/WishlistButton';
import { PriceTag } from '@/components/ui/price-tag';
import { RatingStars } from '@/components/ui/rating-stars';

interface Props {
  hotel: {
    id: string;
    name: string;
    city: string;
    country: string;
    rating: number;
    minPricePerNight: number;
    currency: string;
  };
  checkInDate: string;
  checkOutDate: string;
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
];

export function HotelCard({ hotel, checkInDate, checkOutDate }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const images = fallbackImages;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const showFreeCancellation = hotel.rating >= 4;
  const showMembersPrice = hotel.minPricePerNight > 120;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-300 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
          {showFreeCancellation && <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">Free Cancellation</span>}
          {showMembersPrice && <span className="rounded-full bg-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-950">Members Price</span>}
        </div>

        <div className="absolute right-3 top-3 z-10">
          <WishlistButton attractionId={hotel.id} />
        </div>

        <div className="h-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((src, idx) => (
              <div key={`${hotel.id}-${idx}`} className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden">
                <img src={src} alt={`${hotel.name} view ${idx + 1}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          aria-label="Previous image"
          onClick={scrollPrev}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-black/40 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Next image"
          onClick={scrollNext}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/60 bg-black/40 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-tight">{hotel.name}</h3>
          <p className="text-sm text-amber-500">{'★'.repeat(Math.max(1, Math.round(hotel.rating)))}{'☆'.repeat(Math.max(0, 5 - Math.round(hotel.rating)))}</p>
        </div>

        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          Downtown {hotel.city} · 2.1km to center
        </p>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <RatingStars rating={hotel.rating} size="sm" />
            <p className="text-xs text-muted-foreground">{hotel.rating.toFixed(1)} Exceptional · 1,284 reviews</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { label: 'Pool', icon: Waves },
            { label: 'Spa', icon: Sparkles },
            { label: 'Wi‑Fi', icon: Wifi },
            { label: 'Parking', icon: ParkingCircle },
          ].map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2 py-1">
              <item.icon className="h-3.5 w-3.5" /> {item.label}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-border/70 pt-3">
          <div>
            <PriceTag amount={hotel.minPricePerNight} currency={hotel.currency} size="sm" className="gap-0" />
            <p className="text-xs text-muted-foreground">/night</p>
          </div>
          <Link
            href={`/hotels/${hotel.id}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`}
            className="inline-flex items-center rounded-lg border border-brand-red px-3 py-2 text-sm font-semibold text-brand-red transition-colors hover:bg-brand-red hover:text-white"
          >
            View Deal →
          </Link>
        </div>
      </div>
    </article>
  );
}
