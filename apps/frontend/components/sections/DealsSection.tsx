"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/ui/price-tag";
import { CountdownTimer } from "@/components/ui/countdown-timer";

const FILTERS = ["All", "Under $500", "Business Class", "Weekend", "Non-stop"] as const;

const DEALS = [
  { route: "JFK → DXB", airline: "Emirates", stops: "Non-stop", price: 599, original: 899, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=900&auto=format&fit=crop", tags: ["Non-stop"] },
  { route: "DXB → LHR", airline: "British Airways", stops: "Non-stop", price: 430, original: 650, image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=900&auto=format&fit=crop", tags: ["Under $500", "Non-stop"] },
  { route: "DXB → CDG", airline: "Air France", stops: "1 stop", price: 470, original: 710, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=900&auto=format&fit=crop", tags: ["Under $500"] },
  { route: "DXB → SIN", airline: "Singapore Airlines", stops: "Non-stop", price: 520, original: 770, image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=900&auto=format&fit=crop", tags: ["Business Class"] },
  { route: "DXB → BKK", airline: "Thai Airways", stops: "Non-stop", price: 390, original: 580, image: "https://images.unsplash.com/photo-1508009603885-50cf7c8dd0d5?q=80&w=900&auto=format&fit=crop", tags: ["Weekend", "Under $500"] },
  { route: "DXB → LAX", airline: "Emirates", stops: "1 stop", price: 780, original: 1099, image: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=900&auto=format&fit=crop", tags: ["Business Class"] },
  { route: "DXB → IST", airline: "Turkish", stops: "Non-stop", price: 340, original: 520, image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?q=80&w=900&auto=format&fit=crop", tags: ["Under $500", "Weekend"] },
  { route: "DXB → DEL", airline: "Air India", stops: "Non-stop", price: 299, original: 430, image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=900&auto=format&fit=crop", tags: ["Under $500"] },
] as const;

export function DealsSection() {
  const [active, setActive] = React.useState<(typeof FILTERS)[number]>("All");
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 1 });
  const filtered = active === "All" ? DEALS : DEALS.filter((d) => (d.tags as readonly string[]).includes(active));

  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader eyebrow="LIMITED TIME" title="Flight Deals" subtitle="Prices updated daily — grab them before they're gone" ctaLabel="All deals" ctaHref="/deals" />

        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button key={filter} onClick={() => setActive(filter)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active === filter ? "bg-brand-red text-white" : "bg-muted text-muted-foreground"}`}>
              {filter}
            </button>
          ))}
        </div>

        <div className="relative">
          <button onClick={() => emblaApi?.scrollPrev()} className="absolute -left-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card md:flex hover:text-brand-red"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => emblaApi?.scrollNext()} className="absolute -right-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card md:flex hover:text-brand-red"><ChevronRight className="h-4 w-4" /></button>

          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4">
              {filtered.map((deal, idx) => (
                <article key={`${deal.route}-${idx}`} className="group min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                  <div className="h-full w-[280px] max-w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 group-hover:scale-[1.02] group-hover:border-brand-red/30 group-hover:shadow-lg">
                    <div className="relative h-[200px]">
                      <AppImage src={deal.image} alt={deal.route} fill className="object-cover" />
                      <div className="absolute left-3 top-3 flex items-center gap-2"><Badge variant="brand">FLASH SALE</Badge><CountdownTimer expiresAt={new Date(Date.now() + ((idx % 4) + 2) * 24 * 60 * 60 * 1000)} /></div>
                      <div className="absolute right-3 top-3"><Badge variant="gold">Save 33%</Badge></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-foreground">{deal.route}</h3>
                      <p className="text-sm text-muted-foreground">{deal.airline} · {deal.stops}</p>
                      <PriceTag amount={deal.price} originalAmount={deal.original} currency="USD" className="mt-3" />
                      <button className="mt-3 w-full rounded-xl bg-brand-red py-2.5 text-sm font-semibold text-white">Book Now →</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
