"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { RatingStars } from "@/components/ui/rating-stars";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  useAllReviews,
  type Review,
  type ReviewsResponse,
} from "@/lib/api/reviews";
import { cn } from "@/lib/utils";

// ─── helpers ────────────────────────────────────────────────────────────────

/** Normalises the two possible shapes returned by GET /v1/reviews/all:
 *  • plain array  → returned when `page` query param is omitted
 *  • paginated obj { data, total, page, limit } → returned when `page` is set
 */
function extractReviews(raw: Review[] | ReviewsResponse | undefined): Review[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return (raw as ReviewsResponse).data ?? [];
}

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

// ─── component ──────────────────────────────────────────────────────────────

export function Reviews() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Fetch up to 10 reviews for the homepage carousel.
   * GET /v1/reviews/all?page=1&limit=10  → returns { data, total, page, limit }
   */
  const {
    data: rawData,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useAllReviews({ page: 1, limit: 10 });

  const reviews = React.useMemo(() => extractReviews(rawData), [rawData]);

  // ── auto-scroll ────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!emblaApi || paused) return;
    const id = setInterval(() => emblaApi.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [emblaApi, paused]);

  // ── active dot tracking ────────────────────────────────────────────────────
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
      className="relative overflow-hidden bg-[#030712] py-20 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background Decor */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-redmix/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-screen-2xl px-6 md:px-12">
        <SectionHeader
          eyebrow="TESTIMONIALS"
          title="What Travelers Say"
          titleClassName="text-white"
          ctaLabel="View all reviews"
          ctaHref="/reviews"
          align="left"
        />

        <div className="mt-12">
          {/* ── Loading skeletons ── */}
          {isLoading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-2xl bg-white/5" />
              ))}
            </div>
          )}

          {/* ── Error state ── */}
          {isError && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <RefreshCw
                  className={cn("h-6 w-6", isRefetching && "animate-spin")}
                />
              </div>
              <p className="mb-6 text-sm text-white/70 font-medium">
                Unable to load reviews right now. Please check back later.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isRefetching}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isRefetching ? "Retrying..." : "Try Again"}
              </Button>
            </div>
          )}

          {/* ── Carousel ── */}
          {!isLoading && !isError && reviews.length > 0 && (
            <div className="relative">
              {/* Desktop nav arrows */}
              <button
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute -left-6 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg backdrop-blur-md transition hover:bg-redmix hover:text-white md:flex"
                aria-label="Previous review"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                className="absolute -right-6 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-lg backdrop-blur-md transition hover:bg-redmix hover:text-white md:flex"
                aria-label="Next review"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6 py-4">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="relative flex-[0_0_100%] rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm transition-all duration-300 hover:bg-white/10 md:flex-[0_0_45%] lg:flex-[0_0_31%]"
                    >
                      {/* Decorative quote mark */}
                      <span className="absolute right-6 top-4 text-5xl font-serif text-redmix/10 leading-none select-none">
                        "
                      </span>

                      <div className="relative z-10 flex h-full flex-col justify-between gap-5">
                        {/* Rating + verified badge */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <RatingStars rating={review.rating} />
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {review.isVerified
                                ? "Verified"
                                : "Guest"}
                            </span>
                          </div>

                          {/* Review text */}
                          <p className="line-clamp-4 text-sm italic leading-relaxed text-white/80">
                            "
                            {review.text.length > 200
                              ? `${review.text.slice(0, 200)}...`
                              : review.text}
                            "
                          </p>
                        </div>

                        {/* Author info */}
                        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                          <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-white/5 flex-shrink-0">
                            {review.authorAvatar ? (
                              <img
                                src={review.authorAvatar}
                                alt={review.authorName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-redmix text-sm font-bold text-white">
                                {review.authorName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {review.authorName}
                            </p>
                            <p className="text-[11px] font-medium text-white/50">
                              {review.authorLocation}
                              {review.createdAt && (
                                <span className="ml-1 opacity-60">
                                  · {formatDate(review.createdAt)}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {!isLoading && !isError && reviews.length === 0 && (
            <div className="rounded-2xl border border-border bg-muted/30 p-10 text-center">
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            </div>
          )}

          {/* ── Dots & mobile nav ── */}
          {!isLoading && !isError && reviews.length > 0 && (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md md:hidden"
                aria-label="Previous review"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => emblaApi?.scrollTo(i)}
                    aria-label={`Go to review ${i + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      i === active
                        ? "w-8 bg-redmix shadow-[0_0_10px_rgba(197,42,40,0.5)]"
                        : "w-1.5 bg-white/20 hover:bg-white/40",
                    )}
                  />
                ))}
              </div>

              <button
                onClick={() => emblaApi?.scrollNext()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md md:hidden"
                aria-label="Next review"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ── View all reviews button ── */}
          {!isLoading && !isError && reviews.length > 0 && (
            <div className="mt-12 flex justify-center">
              <Button
                asChild
                variant="outline"
                className="group h-12 rounded-full border-white/10 bg-white/5 px-8 text-white backdrop-blur-md transition-all hover:bg-redmix hover:border-redmix"
              >
                <a href="/reviews">
                  View All Reviews
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
