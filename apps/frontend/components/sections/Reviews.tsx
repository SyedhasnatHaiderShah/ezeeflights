"use client";

import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/ui/section-header";
import { RatingStars } from "@/components/ui/rating-stars";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedReviews } from "@/lib/api/reviews";
import { cn } from "@/lib/utils";

export function Reviews() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [active, setActive] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const { data: reviews = [], isLoading, isError } = useFeaturedReviews(10);

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

  return (
    <section
      className="bg-muted/30 py-16 dark:bg-muted/5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-screen-2xl px-6 md:px-12">
        <SectionHeader
          eyebrow="TESTIMONIALS"
          title="What Travelers Say"
          ctaLabel="View all reviews"
          ctaHref="/reviews"
          align="left"
        />

        <div className="mt-10">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-3xl bg-muted" />
              ))}
            </div>
          ) : null}

          {isError ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <p className="text-sm text-destructive font-medium">
                Unable to load reviews right now. Please check back later.
              </p>
            </div>
          ) : null}

          {!isLoading && !isError ? (
            <div className="relative">
              {/* Navigation buttons - Hidden on small screens, shown on md+ */}
              <button
                onClick={() => emblaApi?.scrollPrev()}
                className="absolute -left-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-lg transition hover:bg-brand-red hover:text-white md:flex"
                aria-label="Previous review"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                className="absolute -right-6 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-lg transition hover:bg-brand-red hover:text-white md:flex"
                aria-label="Next review"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6 py-4">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="relative flex-[0_0_100%] rounded-3xl border border-border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md md:flex-[0_0_50%] lg:flex-[0_0_45%]"
                    >
                      <span className="absolute right-8 top-6 text-7xl font-serif text-brand-red/10 leading-none select-none">
                        “
                      </span>

                      <div className="relative z-10 flex h-full flex-col justify-between gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <RatingStars rating={review.rating} />
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                              {review.isVerified
                                ? "Verified Trip"
                                : "Guest Review"}
                            </span>
                          </div>

                          <p className="line-clamp-4 text-base italic leading-relaxed text-foreground/90">
                            "
                            {review.text.length > 220
                              ? `${review.text.slice(0, 220)}...`
                              : review.text}
                            "
                          </p>
                        </div>

                        <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                          <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-brand-red/10">
                            {review.authorAvatar ? (
                              <img
                                src={review.authorAvatar}
                                alt={review.authorName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-brand-red text-lg font-bold text-white">
                                {review.authorName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-foreground">
                              {review.authorName}
                            </p>
                            <p className="text-xs font-medium text-muted-foreground">
                              {review.authorLocation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {/* Dots & Mobile Nav */}
          {!isLoading && !isError && reviews.length > 0 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground md:hidden"
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
                      "h-2 rounded-full transition-all duration-300",
                      i === active
                        ? "w-8 bg-brand-red"
                        : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50",
                    )}
                  />
                ))}
              </div>

              <button
                onClick={() => emblaApi?.scrollNext()}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground md:hidden"
                aria-label="Next review"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
