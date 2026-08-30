"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import {
  extractReviews,
  mapApiReviewToCard,
  MIN_POSITIVE_REVIEW_RATING,
  useAllReviews,
} from "@/lib/api/reviews";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const HOME_REVIEWS_LIMIT = 10;
const HOME_REVIEWS_FETCH_LIMIT = 50;

const slideClassName =
  "min-w-0 shrink-0 grow-0 basis-full pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4";

const desktopNavButtonClass =
  "absolute top-1/2 z-20 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition-all hover:bg-neutral-50 active:scale-95 md:flex dark:border-white/10 dark:bg-neutral-900 dark:hover:bg-neutral-800";

export function Reviews() {
  const { t } = useTranslation();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    containScroll: "trimSnaps",
  });
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const {
    data: rawData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useAllReviews({
    page: 1,
    limit: HOME_REVIEWS_FETCH_LIMIT,
    minRating: MIN_POSITIVE_REVIEW_RATING,
  });

  const reviews = React.useMemo(
    () => extractReviews(rawData).slice(0, HOME_REVIEWS_LIMIT),
    [rawData],
  );

  React.useEffect(() => {
    if (!emblaApi || paused) return;
    const id = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [emblaApi, paused]);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setActive(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  if (!mounted) return null;

  return (
    <section
      className="relative overflow-x-hidden border-t border-border/40 bg-background py-5 md:py-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative z-10 mx-auto max-w-7xl px-5">
        <div className="rounded-[28px] border border-border/50 px-5 py-4 shadow-sm">
          <SectionHeader
            eyebrow={t("TESTIMONIALS")}
            title={t("What Travelers Say")}
            ctaLabel={t("View all reviews")}
            ctaHref="/reviews"
            align="left"
          />
        </div>

        <div className="mt-6">
          {isLoading ? (
            <div className="overflow-hidden">
              <div className="-ml-4 flex">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className={slideClassName}>
                    <Skeleton className="h-[280px] w-full rounded-[22px]" />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-[28px] border border-border/60 p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                <RefreshCw
                  className={cn("h-6 w-6", isRefetching && "animate-spin")}
                />
              </div>
              <p className="mb-6 text-sm font-medium text-muted-foreground">
                {t(
                  "Unable to load reviews right now. Please check back later.",
                )}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="rounded-full border-border text-foreground hover:bg-muted"
              >
                {isRefetching ? t("Retrying...") : t("Try Again")}
              </Button>
            </div>
          ) : null}

          {!isLoading && !isError && reviews.length > 0 ? (
            <div className="relative px-0 md:px-5">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                className={cn(desktopNavButtonClass, "left-0 -translate-x-1/2")}
                aria-label={t("Previous review")}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                className={cn(desktopNavButtonClass, "right-0 translate-x-1/2")}
                aria-label={t("Next review")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              <div className="overflow-hidden" ref={emblaRef}>
                <div className="-ml-4 flex touch-pan-y">
                  {reviews.map((review) => (
                    <div key={review.id} className={slideClassName}>
                      <ReviewCard
                        review={mapApiReviewToCard(review)}
                        variant="carousel"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {!isLoading && !isError && reviews.length === 0 ? (
            <div className="rounded-[28px] border border-border/60 p-10 text-center shadow-sm">
              <p className="text-sm text-muted-foreground">
                {t("No reviews yet.")}
              </p>
            </div>
          ) : null}

          {!isLoading && !isError && reviews.length > 0 ? (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition active:scale-95 md:hidden dark:border-white/10 dark:bg-neutral-900"
                aria-label={t("Previous review")}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    aria-label={t("Go to review {{index}}", { index: i + 1 })}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === active
                        ? "w-8 bg-redmix"
                        : "w-2 bg-foreground/20 hover:bg-foreground/40",
                    )}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-foreground shadow-[0_2px_10px_rgba(0,0,0,0.08)] transition active:scale-95 md:hidden dark:border-white/10 dark:bg-neutral-900"
                aria-label={t("Next review")}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          {!isLoading && !isError && reviews.length > 0 ? (
            <div className="mt-8 flex justify-center">
              <Button
                asChild
                variant="outline"
                className="group h-12 rounded-full border-border/60 px-8 text-foreground shadow-sm transition-all hover:border-redmix hover:bg-redmix hover:text-white"
              >
                <a href="/reviews">
                  {t("View All Reviews")}
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
