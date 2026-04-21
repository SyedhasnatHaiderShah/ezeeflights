"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/ui/price-tag";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedDeals } from "@/lib/api/deals";

export function DealsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 1 });
  const { data, isLoading } = useFeaturedDeals(8);
  const deals = React.useMemo(() => Array.isArray(data) ? data : [], [data]);

  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader eyebrow="LIMITED TIME" title="Flight Deals" subtitle="Prices updated daily — grab them before they're gone" ctaLabel="All deals" ctaHref="/deals" />
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[360px] w-full rounded-2xl" />
            ))}
          </div>
        ) : deals.length > 0 ? (
          <div className="relative">
            <button onClick={() => emblaApi?.scrollPrev()} className="absolute -left-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card md:flex hover:text-brand-red"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => emblaApi?.scrollNext()} className="absolute -right-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card md:flex hover:text-brand-red"><ChevronRight className="h-4 w-4" /></button>
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {deals.map((deal) => (
                  <article key={deal.id} className="group min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]">
                    <div className="h-full w-full overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 group-hover:scale-[1.02] group-hover:border-brand-red/30 group-hover:shadow-lg">
                      <div className="relative h-[200px]"><AppImage src={deal.imageUrl} alt={deal.title} fill className="object-cover" /><div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/5 to-transparent" />
                      <div className="absolute left-3 top-3 flex max-w-[calc(100%-7.5rem)] flex-col items-start gap-1.5">
                        {deal.isFlashSale ? <Badge variant="brand" size="sm" className="tracking-wide">FLASH SALE</Badge> : null}{deal.expiresAt ? 
                        <CountdownTimer
                          compact
                          className="gap-1"
                          expiresAt={new Date(deal.expiresAt)}
                        /> : null}
                      </div><div className="absolute right-3 top-3">
                        <Badge variant="gold" size="sm" className="whitespace-nowrap">Save {deal.savingPercent}%</Badge>
                      </div></div>
                      <div className="p-4"><h3 className="font-bold text-foreground">{deal.title}</h3><p className="text-sm text-muted-foreground">{deal.originCity ? `${deal.originCity} → ` : ""}{deal.destinationCity}{deal.airline ? ` · ${deal.airline}` : ""}</p><PriceTag amount={deal.price} originalAmount={deal.originalPrice} currency="USD" className="mt-3" /><button className="mt-3 w-full rounded-xl bg-brand-red py-2.5 text-sm font-semibold text-white">Book Now →</button></div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
