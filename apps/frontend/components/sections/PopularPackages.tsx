"use client";

import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/ui/rating-stars";
import { SectionHeader } from "@/components/ui/section-header";
import { AppImage } from "@/components/ui/app-image";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  useCurrencyStore,
  type CurrencyCode,
} from "@/lib/store/currency-store";

export function PopularPackages() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: ["packages", "featured", 10],
    queryFn: () =>
      apiFetch<{ data: any[]; total: number }>(
        `/home/popular-packages?limit=10`,
      ),
  });
  const packages = useMemo(() => data?.data ?? [], [data]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const baseCurrency = useCurrencyStore((s) => s.baseCurrency);
  const comparisonCurrencies = useCurrencyStore((s) => s.comparisonCurrencies);
  const getConvertedAmount = useCurrencyStore((s) => s.getConvertedAmount);
  const getCurrency = useCurrencyStore((s) => s.getCurrency);

  // Embla Carousel setup for Mobile
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      containScroll: "trimSnaps",
    },
    [Autoplay({ delay: 3000, stopOnInteraction: true })],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
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

  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [packages, emblaApi]);

  const renderPackageCard = (item: any) => {
    const base = mounted ? baseCurrency : item.currency || "USD";
    const comps = mounted ? comparisonCurrencies : [];
    const convertedPrice = mounted
      ? getConvertedAmount(
          item.basePrice,
          (item.currency || "USD").toUpperCase() as CurrencyCode,
          base as CurrencyCode,
        )
      : item.basePrice;
    const targetCurrencyMeta = getCurrency(base) || {
      code: base,
      symbol: "$",
      label: "Currency",
      rate: 1,
    };

    return (
      <article className="group relative h-[290px] w-full overflow-hidden rounded-2xl border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-xl">
        {/* Full Background Image */}
        <div className="absolute inset-0 z-0">
          <AppImage
            src={item.thumbnailUrl || "/logos-banner-new.jpg"}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Shadow overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-all duration-500 group-hover:via-black/60" />
        </div>

        {/* Badges overlay on top-left of image */}
        <div className="absolute left-3 top-3 z-10 flex gap-1">
          <Badge className="bg-black/50 hover:bg-black/60 text-white backdrop-blur-md border-none text-[9px] py-0.5 px-1.5 font-medium">
            {item.durationDays} {t("Days")}
          </Badge>
        </div>

        {/* Content Container */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-3.5 text-white transition-all duration-300 translate-y-[44px] group-hover:translate-y-0">
          {/* Always Visible Info */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-white/70 uppercase">
                {t(item.country)}
              </span>
              <span className="h-1 w-1 rounded-full bg-white/40" />
              <span className="text-[9px] sm:text-[10px] font-bold text-redmix-light">
                {t(item.destination)}
              </span>
            </div>

            <h3 className="line-clamp-1 text-xs sm:text-sm font-bold leading-tight group-hover:text-redmix-light transition-colors">
              {item.title}
            </h3>

            <div className="flex items-end justify-between pt-1">
              <div className="flex flex-col">
                <span className="text-[8px] sm:text-[9px] text-white/50 leading-none">
                  {t("From")}
                </span>
                <span className="text-sm sm:text-base font-extrabold text-white mt-0.5 flex items-baseline gap-0.5">
                  <span className="text-xs font-bold text-white/90">
                    {targetCurrencyMeta.symbol}
                  </span>
                  <span>{Math.round(convertedPrice).toLocaleString()}</span>
                  <span className="ml-1 text-[10px] font-semibold text-white/70">
                    {base}
                  </span>
                </span>

                {comps.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {comps.map((code) => {
                      if (code === base) return null;
                      const convertedComp = getConvertedAmount(
                        item.basePrice,
                        (item.currency || "USD").toUpperCase() as CurrencyCode,
                        code as CurrencyCode,
                      );
                      const meta = getCurrency(code);
                      if (!meta) return null;
                      return (
                        <span
                          key={code}
                          className="inline-flex items-center rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter text-white border border-white/15"
                        >
                          {meta.symbol}
                          {Math.round(convertedComp).toLocaleString()} {code}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] text-white/60 font-medium">
                {item.durationDays} {t("Days")}
              </span>
            </div>
          </div>

          {/* Hidden Info (Slides up on Hover) */}
          <div className="opacity-0 transition-opacity duration-200 group-hover:opacity-100 mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
            <RatingStars rating={5} />
            <button className="rounded-lg bg-redmix hover:bg-redmix-light px-2.5 py-1 text-[9px] sm:px-3 sm:py-1.5 sm:text-[10px] font-bold text-white transition-all active:scale-95 shadow-lg shadow-redmix/20">
              {t("Book Package")}
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <section className="py-10">
      <div className="mx-auto max-w-[1200px] px-5">
        <SectionHeader
          eyebrow={t("CURATED FOR YOU")}
          title={t("Popular Packages")}
          ctaLabel={t("View all packages")}
          ctaHref="/packages"
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
        ) : packages.length > 0 ? (
          <div>
            {/* Mobile Animated Carousel */}
            <div className="md:hidden relative">
              <div className="overflow-hidden touch-pan-y" ref={emblaRef}>
                <div className="flex -ml-3">
                  {packages.map((item) => (
                    <div
                      key={item.id}
                      className="flex-[0_0_84%] sm:flex-[0_0_55%] min-w-0 pl-3 shrink-0"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {renderPackageCard(item)}
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Pagination Dots & Nav Controls */}
              {packages.length > 1 && (
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
              {packages.map((item) => (
                <div key={item.id}>{renderPackageCard(item)}</div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
