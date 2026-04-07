"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { AppImage } from "@/components/ui/app-image";

interface Deal {
  id: string;
  city: string;
  image: string;
  price: string;
}

const DEALS: Deal[] = [
  {
    id: "1",
    city: "Kuala Lumpur",
    image:
      "https://images.unsplash.com/photo-1534430480872-3498386e7a56?q=80&w=800&auto=format&fit=crop",
    price: "$89",
  },
  {
    id: "2",
    city: "Langkawi",
    image:
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?q=80&w=800&auto=format&fit=crop",
    price: "$102",
  },
  {
    id: "3",
    city: "Malacca",
    image:
      "https://images.unsplash.com/photo-1596422846543-b5c64883493b?q=80&w=800&auto=format&fit=crop",
    price: "$75",
  },
  {
    id: "4",
    city: "Penang",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop",
    price: "$93",
  },
];

export function DealsSection() {
  const [emblaRef] = useEmblaCarousel({ 
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 640px)': { slidesToScroll: 2 },
      '(min-width: 1024px)': { active: false } 
    }
  }, [Autoplay({ delay: 3500, stopOnInteraction: true })])

  const renderDealCard = (deal: Deal) => (
    <Link
      key={deal.id}
      href={`/deals/${deal.id}` as any}
      className="group relative block aspect-[3.5/4.5] rounded-2xl overflow-hidden bg-muted shadow-sm hover:shadow-2xl transition-all duration-500 w-full border border-border/40"
    >
      <AppImage
        src={deal.image}
        alt={deal.city}
        fill
        isCompact={true}
        className="group-hover:scale-110 transition-transform duration-700 object-cover"
      />

      {/* Overlay Metadata - Neat & Clean Glassmorphism */}
      <div className="absolute inset-x-3 bottom-3 p-3 bg-white/40 dark:bg-black/40 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl flex items-center justify-between shadow-xl group-hover:bg-white/60 dark:group-hover:bg-black/60 transition-all duration-300">
        <div className="min-w-0 pr-2">
          <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mb-0.5 opacity-80">
            Starting from
          </p>
          <h4 className="text-[13px] font-bold text-foreground truncate leading-tight">
            {deal.city}
          </h4>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <div className="text-[15px] font-black text-brand-red font-display drop-shadow-sm">
            {deal.price}
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <section className="py-14 bg-background transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        <div className="flex items-center justify-between mb-8 border-b border-border/60 pb-5">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-foreground uppercase">
            Travel deals under $111
          </h2>
          <Link
            href={"/deals" as any}
            className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-brand-red transition-all group"
          >
            Explore more
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Carousel for Mobile / Grid for Desktop */}
        <div className="relative">
          {/* Embla Viewport */}
          <div className="lg:hidden overflow-hidden touch-pan-y" ref={emblaRef}>
            <div className="flex ml-[-16px]">
              {DEALS.map((deal) => (
                <div key={deal.id} className="flex-[0_0_75%] sm:flex-[0_0_45%] min-w-0 pl-4">
                  {renderDealCard(deal)}
                </div>
              ))}
            </div>
          </div>

          {/* Static Grid for Large Screens */}
          <div className="hidden lg:grid grid-cols-4 gap-5 xl:gap-6">
            {DEALS.map(deal => renderDealCard(deal))}
          </div>
        </div>
      </div>
    </section>
  );
}
