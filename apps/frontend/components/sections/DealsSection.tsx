"use client";

import * as React from "react";
import { AppImage } from "@/components/ui/app-image";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/ui/price-tag";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedDeals } from "@/lib/api/deals";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function DealsSection() {
  const { t } = useTranslation();
  const { data, isLoading } = useFeaturedDeals(10);
  const deals = React.useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Embla Carousel setup for Mobile
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      containScroll: "trimSnaps",
    },
    [Autoplay({ delay: 3000, stopOnInteraction: true })],
  );

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", () => {
      setScrollSnaps(emblaApi.scrollSnapList());
      onSelect();
    });
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  React.useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [deals, emblaApi]);

  const renderDealCard = (deal: any) => (
    <article className="group relative h-[290px] w-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
      <div className="absolute inset-0 z-0">
        <AppImage
          src={deal.imageUrl || "/images/hero/destination_fallback.webp"}
          alt={deal.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-all duration-500 group-hover:via-black/60" />
      </div>

      <div className="absolute left-3 top-3 z-10 flex max-w-[calc(100%-7.5rem)] flex-col items-start gap-1.5">
        {deal.isFlashSale ? (
          <Badge className="border-none bg-black/50 px-1.5 py-0.5 text-[9px] font-medium text-white backdrop-blur-md hover:bg-black/60">
            {t("FLASH SALE")}
          </Badge>
        ) : null}
        {deal.expiresAt ? (
          <CountdownTimer
            compact
            className="gap-0.5 rounded-full border-none bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-md hover:bg-black/60"
            expiresAt={new Date(deal.expiresAt)}
          />
        ) : null}
      </div>

      {deal.savingPercent && deal.savingPercent > 0 ? (
        <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-2">
          <Badge
            variant="gold"
            size="sm"
            className="whitespace-nowrap px-1.5 py-0.5 text-[10px]"
          >
            {t("Save")} {deal.savingPercent}%
          </Badge>
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 flex translate-y-[44px] flex-col justify-end p-3.5 text-white transition-all duration-300 group-hover:translate-y-0">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-semibold uppercase tracking-wider text-white/70 sm:text-[10px]">
              {deal.originCity ? `${t(deal.originCity.trim())} → ` : ""}
              {t(deal.destinationCity.trim())}
            </span>
            {deal.airline ? (
              <>
                <span className="h-1 w-1 rounded-full bg-white/40" />
                <span className="text-[9px] font-bold text-redmix-light sm:text-[10px]">
                  {deal.airline}
                </span>
              </>
            ) : null}
          </div>

          <h3 className="line-clamp-1 text-xs font-bold leading-tight transition-colors group-hover:text-redmix-light sm:text-sm">
            {deal.title}
          </h3>

          <div className="flex items-end justify-between pt-1">
            <PriceTag
              amount={deal.price}
              originalAmount={deal.originalPrice}
              currency="USD"
              size="xs"
              variant="inverse"
            />
            {deal.savingPercent && deal.savingPercent > 0 ? (
              <span className="text-[9px] font-medium text-white/60 sm:text-[10px]">
                {t("Save")} {deal.savingPercent}%
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-3 border-t border-white/10 pt-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <button className="w-full rounded-lg bg-redmix py-1.5 text-xs font-bold text-white shadow-lg shadow-redmix/20 transition-all hover:bg-redmix-light active:scale-95 sm:py-2">
            {t("Book Now →")}
          </button>
        </div>
      </div>
    </article>
  );

  return (
    <section className="py-10">
      <div className="mx-auto max-w-[1200px] px-5">
        <SectionHeader
          eyebrow={t("LIMITED TIME")}
          title={t("Flight Deals")}
          subtitle={t("Prices updated daily grab them before they're gone")}
          ctaLabel={t("All deals")}
          ctaHref="/deals"
        />

        {isLoading ? (
          <div>
            {/* Mobile Loading Skeleton */}
            <div className="md:hidden flex overflow-hidden -ml-3 pb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-[0_0_84%] sm:flex-[0_0_55%] min-w-0 pl-3 shrink-0"
                >
                  <Skeleton className="h-[290px] w-full rounded-2xl" />
                </div>
              ))}
            </div>
            {/* Desktop Loading Skeleton */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[290px] w-full rounded-2xl" />
              ))}
            </div>
          </div>
        ) : deals.length > 0 ? (
          <div>
            {/* Mobile Animated Carousel */}
            <div className="md:hidden relative">
              <div className="overflow-hidden touch-pan-y" ref={emblaRef}>
                <div className="flex -ml-3">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex-[0_0_84%] sm:flex-[0_0_55%] min-w-0 pl-3 shrink-0"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {renderDealCard(deal)}
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Pagination Dots & Nav Controls */}
              {deals.length > 1 && (
                <div className="mt-4 flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    {scrollSnaps.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => emblaApi?.scrollTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          i === selectedIndex
                            ? "w-7 bg-redmix"
                            : "w-2 bg-foreground/20 hover:bg-foreground/40",
                        )}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => emblaApi?.scrollPrev()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition active:scale-95 hover:bg-muted"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => emblaApi?.scrollNext()}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm transition active:scale-95 hover:bg-muted"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Grid Layout */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {deals.map((deal) => (
                <div key={deal.id}>{renderDealCard(deal)}</div>
              ))}
            </div>
          </div>
        ) : null}

        {!isLoading && deals.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t(
              "No featured deals yet. Run backend mock seed to populate package deals.",
            )}
          </p>
        ) : null}
      </div>
    </section>
  );
}
