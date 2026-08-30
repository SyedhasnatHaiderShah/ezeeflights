"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { GradientCard } from "@/components/ui/gradient-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeaturedDestinations } from "@/lib/api/destinations";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { NATIONALITIES } from "@/lib/nationalities.generated";

export function TopDestinations() {
  const { t } = useTranslation();
  const { data, isLoading } = useFeaturedDestinations(10);
  const destinations = React.useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );
  const regions = React.useMemo(
    () => ["ALL", ...new Set(destinations.map((d) => d.region || "OTHER"))],
    [destinations],
  );

  const [active, setActive] = React.useState("ALL");
  const filtered = React.useMemo(
    () =>
      active === "ALL"
        ? destinations
        : destinations.filter((d) => (d.region || "OTHER") === active),
    [active, destinations],
  );

  // Embla Carousel setup for Mobile
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      containScroll: "trimSnaps",
    },
    [Autoplay({ delay: 2000, stopOnInteraction: true })],
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
      emblaApi.scrollTo(0);
    }
  }, [filtered, emblaApi]);

  const getTranslatedDestinationName = (name?: string) => {
    if (!name) return "";
    return t(name.trim());
  };

  const getTranslatedRegion = (region?: string) => {
    if (!region) return t("Global");
    return t(region.trim());
  };

  const getCountryFlag = (code?: string) => {
    if (!code) return "📍";
    const upper = code.toUpperCase();
    const match = NATIONALITIES.find(
      (n) => n.alpha3 === upper || n.alpha2 === upper,
    );
    if (match) return match.flag;

    if (upper.length === 2) {
      try {
        return String.fromCodePoint(
          ...[...upper].map((c) => 127397 + c.charCodeAt(0)),
        );
      } catch {
        return "📍";
      }
    }
    return "📍";
  };

  const renderCardContent = (
    dest: (typeof destinations)[0],
    idx: number,
    isMobile = false,
  ) => (
    <GradientCard
      href={`/cities/${dest.slug}`}
      imageSrc={
        dest.heroImage ||
        dest.imageUrl ||
        "/images/hero/destination_fallback.webp"
      }
      imageAlt={dest.name}
      className={cn(
        "group relative overflow-hidden rounded-2xl w-full",
        isMobile
          ? "h-[290px]"
          : idx === 0
            ? "h-[240px] md:h-[500px]"
            : "h-[240px] md:h-[240px]",
      )}
    >
      <div className="absolute top-3 left-3 z-20">
        {idx === 0 && (
          <Badge className="bg-redmix/90 backdrop-blur-sm text-white border-none px-2.5 py-1 text-xs font-black tracking-widest uppercase shadow-md">
            {t("Trending")}
          </Badge>
        )}
      </div>

      <div className="flex h-full flex-col justify-end p-4">
        <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-2">
          <div className="flex items-center gap-1.5">
            <p className="text-lg font-semibold text-white tracking-tight md:text-xl">
              <span>{getCountryFlag(dest.code)}</span>{" "}
              {getTranslatedDestinationName(dest.name)}
            </p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            {dest.fromPrice && (
              <CurrencyDisplay
                amount={dest.fromPrice}
                currency={dest.currency || "USD"}
                showComparison={false}
                amountClassName="text-sm font-semibold text-white"
                symbolClassName="text-sm font-semibold text-white"
              />
            )}
            <div className="h-3 w-[1px] bg-white/20" />
            <span className="text-xs font-semibold text-white/70 tracking-[0.15em]">
              {getTranslatedRegion(dest.region)}
            </span>
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-4 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-white/60 tracking-widest">
              {t("Best Deals Available")}
            </p>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-redmix shadow-lg transition-transform hover:scale-105 active:scale-95">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </div>
    </GradientCard>
  );

  return (
    <section className="py-8 bg-background">
      <div className="mx-auto max-w-[1440px] px-4">
        <SectionHeader
          eyebrow={
            <Badge
              variant="default"
              className="bg-redmix/5 text-redmix border-none px-2 py-0.5 text-xs font-semibold tracking-[0.2em]"
            >
              {t("Curated Escapes")}
            </Badge>
          }
          title={t("Top Destinations")}
          ctaLabel={t("Explore All")}
          ctaHref="/destinations"
        />
        <div className="mb-4 mt-2">
          <Tabs value={active} onValueChange={setActive}>
            <TabsList className="h-9 inline-flex items-center justify-start gap-1 p-1 rounded-lg no-scrollbar overflow-x-auto max-w-full">
              {regions.map((filter) => (
                <TabsTrigger
                  key={filter}
                  value={filter}
                  className="rounded-md px-3 py-1 text-xs font-bold tracking-wider transition-all data-[state=active]:bg-redmix font-semibold data-[state=active]:text-white data-[state=active]:shadow-sm text-foreground/80 hover:text-foreground outline-none select-none"
                >
                  {t(filter)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div>
            {/* Mobile Loading Skeleton Carousel */}
            <div className="md:hidden flex overflow-hidden -ml-3 pb-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_84%] sm:flex-[0_0_55%] min-w-0 pl-3 shrink-0"
                >
                  <Skeleton className="h-[290px] w-full rounded-2xl" />
                </div>
              ))}
            </div>
            {/* Desktop Loading Skeleton Grid */}
            <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 7 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className={cn(
                    "rounded-2xl",
                    idx === 0
                      ? "h-[500px] md:col-span-2 md:row-span-2"
                      : "h-[240px]",
                  )}
                />
              ))}
            </div>
          </div>
        ) : filtered.length > 0 ? (
          <div>
            {/* Mobile Animated Carousel */}
            <div className="md:hidden relative">
              <div className="overflow-hidden touch-pan-y" ref={emblaRef}>
                <div className="flex -ml-3">
                  {filtered.map((dest, idx) => (
                    <div
                      key={dest.slug}
                      className="flex-[0_0_84%] sm:flex-[0_0_55%] min-w-0 pl-3 shrink-0"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {renderCardContent(dest, idx, true)}
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Pagination Dots & Nav Controls */}
              {filtered.length > 1 && (
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
            <motion.div
              layout
              className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filtered.map((dest, idx) => (
                  <motion.div
                    key={dest.slug}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "w-auto shrink",
                      idx === 0 ? "md:col-span-2 md:row-span-2" : "",
                    )}
                  >
                    {renderCardContent(dest, idx, false)}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/40 p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <MapPin className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {t("No results in this region")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
