"use client";

import { useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Filter, Star, CheckCircle2 } from "lucide-react";
import { useFeaturedReviews, useReviewStats, useReviews } from "@/lib/api/reviews";
import { Skeleton } from "@/components/ui/skeleton";
import { RatingStars } from "@/components/ui/rating-stars";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { cn } from "@/lib/utils";

export default function ReviewsPage() {
  const limit = 9;
  const featuredLimit = 8;
  const [star, setStar] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });

  const { data: stats } = useReviewStats();
  const featured = useFeaturedReviews(featuredLimit);
  const q = useReviews({ rating: star || undefined, verified: verifiedOnly || undefined, page, limit });
  const reviews = q.data?.data ?? [];
  const featuredReviews = featured.data ?? [];
  const total = q.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const visiblePageNumbers = useMemo(() => {
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const adjustedStart = Math.max(1, end - 4);
    return Array.from({ length: end - adjustedStart + 1 }, (_, idx) => adjustedStart + idx);
  }, [page, totalPages]);

  const onFilterToggle = (nextStar: number, nextVerified?: boolean) => {
    setStar(nextStar);
    if (typeof nextVerified === "boolean") {
      setVerifiedOnly(nextVerified);
    }
    setPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="mx-auto w-full max-w-screen-2xl px-6 md:px-12 space-y-12">
          {/* Header Section */}
          <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-8 md:p-12 shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <CheckCircle2 className="h-48 w-48" />
            </div>
            
            <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-foreground md:text-5xl">Traveler <span className="text-brand-red">Reviews</span></h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-md">
                  Real feedback from our global community. Discover why thousands trust EzeeFlights for their journeys.
                </p>
              </div>
              
              <div className="rounded-2xl bg-muted/50 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-5xl font-black text-brand-red">{stats?.average?.toFixed(1) ?? "0.0"}</p>
                    <div className="flex justify-center mt-1">
                      <RatingStars rating={Math.round(stats?.average ?? 0)} />
                    </div>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div>
                    <p className="text-xl font-bold">{stats?.total ?? 0}</p>
                    <p className="text-sm text-muted-foreground font-medium">Verified Reviews</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <span className="w-8 text-xs font-bold text-muted-foreground">{s} <Star className="inline h-3 w-3 -mt-0.5" /></span>
                      <div className="h-2 flex-1 rounded-full bg-background overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-red transition-all duration-500"
                          style={{ width: `${Math.min(100, ((stats?.distribution?.[s] ?? 0) / Math.max(1, stats?.total ?? 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-[10px] font-medium text-muted-foreground">
                        {Math.round(((stats?.distribution?.[s] ?? 0) / Math.max(1, stats?.total ?? 1)) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Featured Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Featured Experiences</h2>
                <p className="text-sm text-muted-foreground">Hand-picked stories from our most recent travelers.</p>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollPrev()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition hover:bg-muted"
                  aria-label="Previous featured review"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollNext()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition hover:bg-muted"
                  aria-label="Next featured review"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {featured.isLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}
              </div>
            ) : null}

            {featured.isError ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
                <p className="text-sm font-medium text-destructive">Unable to load featured stories at the moment.</p>
              </div>
            ) : null}

            {!featured.isLoading && !featured.isError ? (
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6 py-2">
                  {featuredReviews.map((review) => (
                    <article key={review.id} className="flex-[0_0_100%] rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md md:flex-[0_0_50%] lg:flex-[0_0_33%]">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 overflow-hidden rounded-full ring-2 ring-brand-red/10">
                          {review.authorAvatar ? (
                            <img src={review.authorAvatar} alt={review.authorName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-brand-red text-sm font-bold text-white">
                              {review.authorName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{review.authorName}</p>
                          <p className="text-xs text-muted-foreground font-medium">{review.authorLocation}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-2">
                        <RatingStars rating={review.rating} />
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                          {review.isVerified ? "Verified Trip" : "Guest Review"}
                        </span>
                      </div>
                      <p className="mt-4 line-clamp-4 text-sm italic leading-relaxed text-muted-foreground">"{review.text}"</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          {/* Filters & Grid */}
          <section className="space-y-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between border-t border-border pt-12">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">All Reviews</h2>
                <p className="text-sm text-muted-foreground font-medium">Filtering {total} traveler stories</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full border border-border">
                  <span className="px-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Rating</span>
                  <div className="flex gap-1">
                    {[5, 4, 3, 2, 1].map((s) => (
                      <button
                        key={s}
                        className={cn(
                          "flex h-8 w-10 items-center justify-center rounded-full text-xs font-bold transition-all",
                          star === s ? "bg-brand-red text-white shadow-md" : "hover:bg-background text-muted-foreground"
                        )}
                        onClick={() => onFilterToggle(star === s ? 0 : s)}
                      >
                        {s}★
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-full border border-border bg-card px-4 py-2 transition hover:bg-muted">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer sr-only"
                      checked={verifiedOnly}
                      onChange={(e) => onFilterToggle(star, e.target.checked)}
                    />
                    <div className="h-5 w-9 rounded-full bg-muted transition-colors peer-checked:bg-brand-red"></div>
                    <div className="absolute left-1 h-3 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-4"></div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground/80">Verified Only</span>
                </label>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {q.isLoading ? (
                Array.from({ length: limit }).map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)
              ) : (
                reviews.map((review, idx) => (
                  <article key={review.id} className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 overflow-hidden rounded-full ring-2 ring-brand-red/5">
                        {review.authorAvatar ? (
                          <img src={review.authorAvatar} alt={review.authorName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-brand-red/10 text-xs font-bold text-brand-red">
                            {review.authorName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{review.authorName}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          {review.authorLocation} · {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <RatingStars rating={review.rating} />
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{review.isVerified ? "✓ Verified" : ""}</span>
                    </div>
                    <p className="mt-4 line-clamp-5 text-sm leading-relaxed text-muted-foreground font-medium italic">"{review.text}"</p>
                  </article>
                ))
              )}
            </div>

            {/* Pagination */}
            {!q.isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card transition hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <div className="flex items-center gap-1">
                  {visiblePageNumbers.map((pageNo) => (
                    <button
                      key={pageNo}
                      className={cn(
                        "h-10 w-10 rounded-xl text-sm font-bold transition-all",
                        pageNo === page 
                          ? "bg-brand-red text-white shadow-md scale-110" 
                          : "bg-card border border-border hover:bg-muted text-muted-foreground"
                      )}
                      onClick={() => setPage(pageNo)}
                    >
                      {pageNo}
                    </button>
                  ))}
                </div>

                <button
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card transition hover:bg-muted disabled:opacity-30 disabled:pointer-events-none"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
