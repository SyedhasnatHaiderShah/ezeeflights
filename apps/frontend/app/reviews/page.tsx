"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { AppImage } from "@/components/ui/app-image";
import {
  MessageSquare,
  Sparkles,
  Filter,
  Search,
  Star,
  X,
} from "lucide-react";
import { Review } from "@/lib/types/hotels";
import { useTranslation } from "react-i18next";
import {
  mapApiReviewToCard,
  useAllReviews,
  useReviewStats,
  type Review as ApiReview,
  type ReviewsResponse,
} from "@/lib/api/reviews";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/ui/rating-stars";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=2000&auto=format&fit=crop";

const PAGE_LIMIT = 10;
const RATING_OPTIONS = [5, 4, 3, 2, 1] as const;

function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function extractPage(raw: ApiReview[] | ReviewsResponse | undefined) {
  if (!raw) {
    return { data: [] as ApiReview[], total: 0, page: 1, limit: PAGE_LIMIT };
  }
  if (Array.isArray(raw)) {
    return { data: raw, total: raw.length, page: 1, limit: raw.length };
  }
  return raw;
}

export default function CommunityReviewsPage() {
  const { t } = useTranslation();
  const [page, setPage] = React.useState(1);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [searchInput, setSearchInput] = React.useState("");
  const [ratingFilter, setRatingFilter] = React.useState<number | undefined>();
  const [filterOpen, setFilterOpen] = React.useState(false);

  const debouncedSearch = useDebouncedValue(searchInput.trim(), 400);
  const hasActiveFilters = Boolean(debouncedSearch || ratingFilter);

  const { data: stats, isLoading: statsLoading } = useReviewStats();
  const {
    data: rawData,
    isLoading,
    isFetching,
    isError,
  } = useAllReviews({
    page,
    limit: PAGE_LIMIT,
    search: debouncedSearch || undefined,
    rating: ratingFilter,
  });

  const pageData = React.useMemo(() => extractPage(rawData), [rawData]);
  const total = pageData.total;
  const hasMore = reviews.length < total;

  React.useEffect(() => {
    setPage(1);
    setReviews([]);
  }, [debouncedSearch, ratingFilter]);

  React.useEffect(() => {
    const mapped = pageData.data.map(mapApiReviewToCard);
    setReviews((prev) => {
      if (page === 1) return mapped;
      const existingIds = new Set(prev.map((r) => r.id));
      const next = mapped.filter((r) => !existingIds.has(r.id));
      return next.length ? [...prev, ...next] : prev;
    });
  }, [rawData, page]);

  const clearFilters = () => {
    setSearchInput("");
    setRatingFilter(undefined);
    setFilterOpen(false);
  };

  const averageRating = stats?.average ?? 0;
  const totalReviews = stats?.total ?? 0;

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <AppImage
            src={HERO_IMAGE}
            alt="Travel community"
            fill
            priority
            className="object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background" />

        <div className="relative z-10 mx-auto flex min-h-[50vh] w-full max-w-[1400px] flex-col items-center justify-center px-4 pb-20 text-white">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6 text-center"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-red/20 border border-brand-red/30 px-4 py-1.5 text-[10px] font-black tracking-[0.2em] backdrop-blur-md text-brand-red">
              <Sparkles className="w-3.5 h-3.5" /> {t("Community Voices")}
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              {t("Verified")}{" "}
              <span className="bg-gradient-to-r from-redmix to-orange-400 bg-clip-text text-transparent">
                {t("Experiences")}
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/70 font-medium">
              {t(
                "Real stories from our global community of travelers. Transparent, verified, and always helpful.",
              )}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats & Filters */}
      <section className="relative z-20 -mt-20 mx-auto w-full max-w-6xl px-4">
        <div className="grid md:grid-cols-3 gap-6 bg-card/60 backdrop-blur-2xl p-8 rounded-[3rem] border border-border/50 shadow-2xl">
          {/* Average rating */}
          <div className="flex items-center gap-6 p-4">
            {statsLoading ? (
              <>
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-brand-red/10 rounded-2xl flex items-center justify-center text-brand-red font-black text-3xl shrink-0">
                  {averageRating.toFixed(1)}
                </div>
                <div>
                  <RatingStars
                    rating={averageRating}
                    size="sm"
                    showCount={false}
                    className="mb-1"
                  />
                  <p className="text-sm font-black">{t("Average Rating")}</p>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest">
                    {t("Global Satisfaction")}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Total reviews */}
          <div className="flex items-center gap-6 p-4 border-l border-border/50">
            {statsLoading ? (
              <>
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
                  <MessageSquare className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-black">
                    {totalReviews.toLocaleString()}
                  </p>
                  <p className="text-sm font-black">{t("Total Reviews")}</p>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-widest">
                    {t("Verified Stays")}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Search & filter */}
          <div className="flex items-center gap-4 p-4 border-l border-border/50">
            <div className="flex-1 space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-brand-red transition-colors" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("Search reviews...")}
                  className="w-full bg-muted/50 border border-border/50 rounded-2xl py-3 pl-12 pr-10 text-xs font-bold focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red outline-none transition-all"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => setSearchInput("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-brand-red transition-colors"
                    aria-label={t("Clear search")}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "relative p-3 bg-muted/50 rounded-2xl border transition-all group",
                    ratingFilter
                      ? "border-brand-red/40 bg-brand-red/5"
                      : "border-border/50 hover:border-brand-red/30",
                  )}
                  aria-label={t("Filter reviews")}
                >
                  <Filter
                    className={cn(
                      "w-5 h-5 transition-colors",
                      ratingFilter
                        ? "text-brand-red"
                        : "text-muted-foreground group-hover:text-brand-red",
                    )}
                  />
                  {ratingFilter && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-brand-red border-2 border-background" />
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 space-y-3">
                <p className="text-xs font-black tracking-widest text-muted-foreground uppercase">
                  {t("Filter by rating")}
                </p>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRatingFilter(undefined);
                      setFilterOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold transition-colors",
                      !ratingFilter
                        ? "bg-brand-red/10 text-brand-red"
                        : "hover:bg-muted/60",
                    )}
                  >
                    {t("All ratings")}
                  </button>
                  {RATING_OPTIONS.map((stars) => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => {
                        setRatingFilter(stars);
                        setFilterOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-bold transition-colors",
                        ratingFilter === stars
                          ? "bg-brand-red/10 text-brand-red"
                          : "hover:bg-muted/60",
                      )}
                    >
                      <span className="flex items-center gap-1">
                        {stars}{" "}
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </span>
                      {stats?.distribution?.[stars] != null && (
                        <span className="text-[10px] text-muted-foreground">
                          {stats.distribution[stars]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Rating distribution bar */}
        {!statsLoading && totalReviews > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 px-2">
            {RATING_OPTIONS.map((stars) => {
              const count = stats?.distribution?.[stars] ?? 0;
              const pct =
                totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div
                  key={stars}
                  className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground"
                >
                  <span className="flex items-center gap-0.5 w-8">
                    {stars}
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                  <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-red/70 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}

        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {debouncedSearch && (
              <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs cursor-pointer font-bold">
                {t('Search')}: "{debouncedSearch}"
              </span>
            )}
            {ratingFilter && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xd cursor-pointer font-bold">
                {ratingFilter} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              </span>
            )}
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs cursor-pointer font-bold text-brand-red hover:underline"
            >
              {t("Clear filters")}
            </button>
          </div>
        )}
      </section>

      {/* Review Feed */}
      <section className="mx-auto w-full max-w-[1400px] px-4 py-20">
        {isLoading && page === 1 ? (
          <div className="grid gap-12 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-[2rem]" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-[2rem] border border-border bg-card p-12 text-center">
            <p className="text-sm text-muted-foreground font-medium">
              {t("Unable to load reviews right now. Please check back later.")}
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-[2rem] border border-border bg-muted/30 p-12 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters
                ? t("No reviews match your search or filters.")
                : t("No reviews yet.")}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {t("Clear filters")}
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-2">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % PAGE_LIMIT) * 0.05 }}
              >
                <ReviewCard review={review} />
              </motion.div>
            ))}
          </div>
        )}

        {!isError && reviews.length > 0 && (
          <div className="mt-20 text-center space-y-8">
            <p className="text-sm text-muted-foreground font-bold italic">
              {hasActiveFilters
                ? t("Showing {{shown}} of {{total}} matching reviews", {
                    shown: reviews.length,
                    total: total || reviews.length,
                  })
                : t("Showing {{shown}} of {{total}} verified reviews", {
                    shown: reviews.length,
                    total: total || reviews.length,
                  })}
            </p>
            {hasMore && (
              <Button
                onClick={() => setPage((p) => p + 1)}
                disabled={isFetching}
                className="px-12 py-5 h-auto bg-foreground text-background rounded-[2rem] font-black text-lg shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all active:scale-95"
              >
                {isFetching ? t("Loading...") : t("Load More Experiences")}
              </Button>
            )}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
