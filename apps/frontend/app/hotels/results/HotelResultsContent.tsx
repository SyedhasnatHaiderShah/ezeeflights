"use client";

import React, { useState, useMemo, useTransition } from "react";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import * as motion from "framer-motion/client";
import { Drawer } from "vaul";
import {
  SlidersHorizontal,
  Sparkles,
  Hotel as HotelIcon,
  Loader2,
} from "lucide-react";
import { HotelCard } from "@/components/hotels/HotelCard";
import { HotelCardSkeleton } from "@/components/hotels/HotelCardSkeleton";
import {
  HotelFilterSidebar,
  HotelSortOption,
} from "@/components/hotels/HotelFilterSidebar";
import {
  HotelAiSuggestionsPanel,
  preFetchHotelInsights,
} from "./HotelAiSuggestionsPanel";
import { cn } from "@/lib/utils";
import { useLoadingStore } from "@/lib/store/use-loading-store";
import { useTranslation } from "react-i18next";

import { Hotel } from "@/lib/api/hotels";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  initialData: Hotel[];
  city: string;
  checkInDate: string;
  checkOutDate: string;
  query: string;
  totalCount: number;
  currentPage: number;
  limit: number;
}

import { differenceInDays } from "date-fns";

import {
  useCurrencyStore,
  CurrencyCode,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";
import { useBookedHotelKeys } from "@/lib/hooks/use-booked-hotel-keys";
import { useHotelBookingFlowStore } from "@/lib/store/hotel-booking-flow-store";

export function HotelResultsContent({
  initialData,
  city,
  checkInDate,
  checkOutDate,
  query,
  totalCount,
  currentPage,
  limit,
}: Props) {
  const { t } = useTranslation();
  const setIsSelectingGlobal = useHotelBookingFlowStore(
    (s) => s.setIsSelecting,
  );
  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
    setIsSelectingGlobal(false);
  }, [setIsSelectingGlobal]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleReload = async () => {
    startTransition(() => {
      router.refresh();
    });
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (!isPending) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(check);
        resolve();
      }, 5000);
    });
  };

  const { getConvertedAmount } = useCurrencyStore();
  const { isHotelBooked } = useBookedHotelKeys(checkInDate, checkOutDate);

  const convert = React.useCallback(
    (amount: number, from: string, to: string) => {
      const fromCode = from.toUpperCase();
      const toCode = to.toUpperCase();
      if (fromCode === toCode) return amount;
      if (!mounted) {
        const fromRate = SUPPORTED_CURRENCIES[fromCode]?.rate || 1;
        const toRate = SUPPORTED_CURRENCIES[toCode]?.rate || 1;
        return (amount / fromRate) * toRate;
      }
      return getConvertedAmount(
        amount,
        fromCode as CurrencyCode,
        toCode as CurrencyCode,
      );
    },
    [mounted, getConvertedAmount],
  );

  const stayDays = useMemo(() => {
    return differenceInDays(new Date(checkOutDate), new Date(checkInDate)) || 1;
  }, [checkInDate, checkOutDate]);

  const { minPossiblePrice, maxPossiblePrice, priceStep } = useMemo(() => {
    const step = Math.max(10 * stayDays, 1);

    if (!initialData.length) {
      const fallbackMax = Math.ceil((1000 * stayDays) / step) * step;
      return {
        minPossiblePrice: 50 * stayDays,
        maxPossiblePrice: fallbackMax,
        priceStep: step,
      };
    }

    let min = Infinity;
    let max = -Infinity;

    initialData.forEach((h) => {
      const totalInUsd = convert(
        h.minPricePerNight * stayDays,
        h.currency || "USD",
        "USD",
      );
      if (totalInUsd < min) min = totalInUsd;
      if (totalInUsd > max) max = totalInUsd;
    });

    if (min === Infinity) min = 50 * stayDays;
    if (max === -Infinity) max = 1000 * stayDays;
    if (min === max) {
      min = Math.max(0, min - 50);
      max = max + 50;
    }

    const alignedMax = Math.ceil(max / step) * step;

    return {
      minPossiblePrice: Math.floor(min),
      maxPossiblePrice: alignedMax,
      priceStep: step,
    };
  }, [initialData, stayDays, convert]);

  const [maxPrice, setMaxPrice] = useState(maxPossiblePrice);

  // Reset price ceiling when a new result set loads (not on currency mount tweaks)
  const initialDataKey = useMemo(
    () => initialData.map((h) => h.id).join(","),
    [initialData],
  );

  React.useEffect(() => {
    setMaxPrice(maxPossiblePrice);
  }, [initialDataKey, maxPossiblePrice]);

  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<HotelSortOption>("Recommended");
  const [isSorting, setIsSorting] = useState(false);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const hasRatings = React.useMemo(
    () => initialData.some((h) => (h.starRating || 0) > 0),
    [initialData],
  );

  const handleSortChange = React.useCallback((option: HotelSortOption) => {
    setSortBy((current) => {
      if (current === option) return current;
      setIsSorting(true);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      setTimeout(() => {
        setIsSorting(false);
      }, 600);
      return option;
    });
  }, []);

  const [openFilters, setOpenFilters] = useState(false);
  const [openAiTips, setOpenAiTips] = useState(false);
  const stopLoading = useLoadingStore((state) => state.stopLoading);

  React.useEffect(() => {
    stopLoading();
  }, [stopLoading, initialData, city, checkInDate, checkOutDate, searchParams]);

  React.useEffect(() => {
    if (city) preFetchHotelInsights(city);
  }, [city]);

  const totalPages = Math.ceil(totalCount / limit);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}` as any);
  };

  const handleResetFilters = React.useCallback(() => {
    setMaxPrice(maxPossiblePrice);
    setSelectedStars([]);
    setSortBy("Recommended");
  }, [maxPossiblePrice]);

  const filteredData = useMemo(() => {
    let data = [...initialData].filter((h) => {
      const totalInUsd = convert(
        h.minPricePerNight * stayDays,
        h.currency || "USD",
        "USD",
      );
      return totalInUsd <= maxPrice;
    });

    if (selectedStars.length > 0) {
      data = data.filter((h) => selectedStars.includes(h.starRating));
    }

    if (sortBy === "Price") {
      data.sort((a, b) => {
        const priceA = convert(a.minPricePerNight, a.currency || "USD", "USD");
        const priceB = convert(b.minPricePerNight, b.currency || "USD", "USD");
        return priceA - priceB;
      });
    } else if (sortBy === "Rating") {
      data.sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
    }

    return data;
  }, [initialData, maxPrice, sortBy, selectedStars, stayDays, convert]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[220px_minmax(0,1fr)_380px] lg:grid-rows-1 gap-3 md:gap-5 min-h-0 max-md:h-auto md:h-full md:max-h-full relative">
      {/* Column 1: Filters (Desktop) */}
      <div className="hidden lg:block min-h-0 md:h-full md:max-h-full overflow-y-auto overscroll-contain no-scrollbar border-r border-border/50 pr-4">
        <HotelFilterSidebar
          maxPrice={maxPrice}
          onPriceChange={setMaxPrice}
          selectedStars={selectedStars}
          onStarsChange={setSelectedStars}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          resultsCount={filteredData.length}
          stayDays={stayDays}
          minPossiblePrice={minPossiblePrice}
          maxPossiblePrice={maxPossiblePrice}
          priceStep={priceStep}
          hasRatings={hasRatings}
        />
      </div>
      <main className="relative flex min-h-0 min-w-0 max-md:h-auto flex-col max-md:overflow-visible md:h-full md:max-h-full md:overflow-hidden md:py-0">
        {/* Sticky mobile controls — directly below Edit Search bar */}
        {!isPending && (
          <div
            className={cn(
              "sticky md:static z-30 lg:hidden shrink-0",
              "top-[90px] md:top-0",
              "-mx-4 px-4 py-2 md:-mx-0 md:px-0 md:mb-3",
              "bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 md:bg-transparent md:backdrop-blur-none",
              "border-b border-border/40 md:border-none",
            )}
          >
            <div className="flex rounded-[10px] bg-muted/60 p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] md:shadow-sm md:border md:border-border">
              <button
                onClick={() => setOpenFilters(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[8px] text-[13px] font-semibold text-foreground active:bg-background active:shadow-sm transition-all duration-150"
              >
                <SlidersHorizontal
                  className="h-3.5 w-3.5 text-foreground/80"
                  strokeWidth={2.25}
                />
                {t("Filters")}
              </button>
              <div
                className="w-px bg-border/50 my-1.5 shrink-0 md:hidden"
                aria-hidden
              />
              <button
                onClick={() => setOpenAiTips(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[8px] text-[13px] font-semibold text-foreground active:bg-background active:shadow-sm transition-all duration-150 md:hidden"
              >
                <Sparkles
                  className="h-3.5 w-3.5 text-foreground"
                  strokeWidth={2.25}
                />
                {t("AI Insight")}
              </button>
            </div>
          </div>
        )}

        {/* Sort By Panel */}
        <div className="hidden md:flex bg-white dark:bg-card border border-border/50 rounded-2xl p-3.5 mb-3.5 flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider text-foreground/80">
              {t("Sort By")}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 bg-muted/60 p-0.5 rounded-[10px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
            {(["Recommended", "Price", "Rating", "Distance"] as const)
              .filter((option) => option !== "Rating" || hasRatings)
              .map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSortChange(option)}
                  className={cn(
                    "rounded-[8px] px-3.5 py-1.5 text-[11px] font-bold transition-all duration-150 cursor-pointer",
                    sortBy === option
                      ? "bg-white dark:bg-card text-redmix shadow-sm"
                      : "text-foreground/80 hover:text-foreground active:bg-white/70",
                  )}
                >
                  {t(option)}
                </button>
              ))}
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="max-md:overflow-visible md:h-0 md:min-h-0 md:flex-1 md:overflow-y-auto overscroll-contain pb-20"
        >
          {/* <PullToRefresh onRefresh={handleReload}> */}
          <div className="space-y-4">
            {isSorting ? (
              Array.from({ length: 3 }).map((_, i) => (
                <HotelCardSkeleton key={i} />
              ))
            ) : filteredData.length > 0 ? (
              filteredData.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <HotelCard
                    hotel={hotel}
                    checkInDate={checkInDate}
                    checkOutDate={checkOutDate}
                    isBooked={isHotelBooked(hotel.id)}
                  />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 px-4 text-center rounded-[2.5rem] bg-white dark:bg-card flex flex-col items-center justify-center gap-4 max-w-md mx-auto my-8">
                <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-muted flex items-center justify-center text-slate-400 border border-border/40 shadow-sm">
                  <HotelIcon className="h-7 w-7 text-slate-400/80 stroke-[1.5]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest">
                    {initialData.length === 0
                      ? t("No properties available")
                      : t("No hotels in budget")}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {initialData.length === 0
                      ? t(
                          "We couldn't find any accommodation in this area for your selected dates. Try modifying dates or location.",
                        )
                      : t(
                          "No matches fit your budget. Try adjusting the price slider or resetting filters.",
                        )}
                  </p>
                </div>
                {initialData.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 text-sm font-semibold cursor-pointer text-redmix hover:underline"
                  >
                    {t("Reset Price Filter")}
                  </button>
                ) : (
                  <Button
                    disabled={isPending}
                    onClick={handleReload}
                    className="mt-2 text-xs font-bold bg-redmix text-white rounded-xl shadow-md shadow-redmix/10 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {t("Reloading...")}
                      </>
                    ) : (
                      t("Reload Search")
                    )}
                  </Button>
                )}
              </div>
            )}

            {filteredData.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <div className="w-20 sm:w-24">
                  {currentPage > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="rounded-xl font-bold h-9 sm:h-10 px-3 sm:px-4"
                    >
                      ← {t("Back")}
                    </Button>
                  )}
                </div>

                <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                  {t("Page {{current}} of {{total}}", {
                    current: currentPage,
                    total: totalPages,
                  })}
                </span>

                <div className="w-20 sm:w-24 flex justify-end">
                  {currentPage < totalPages && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="rounded-xl font-bold h-9 sm:h-10 px-3 sm:px-4"
                    >
                      {t("Next")} →
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* </PullToRefresh> */}
        </div>
      </main>

      {/* Column 3: AI Suggestions (Desktop & Tablet) */}
      <div className="hidden md:block min-h-0 md:h-full md:max-h-full py-4 border-l border-border/40 overflow-y-auto overscroll-contain no-scrollbar pl-4">
        <HotelAiSuggestionsPanel hotels={filteredData} city={city} />
      </div>

      {/* Mobile Drawer: Filters */}
      <Drawer.Root open={openFilters} onOpenChange={setOpenFilters}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[20px] border-t border-border/40 bg-background/95 backdrop-blur-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] outline-none">
            <Drawer.Title className="sr-only">{t("Filters")}</Drawer.Title>
            <Drawer.Description className="sr-only">
              {t("Adjust your hotel search results using various filters.")}
            </Drawer.Description>
            <div className="mx-auto mt-2.5 mb-3 h-[5px] w-9 shrink-0 rounded-full bg-foreground/20" />
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-8">
              <HotelFilterSidebar
                maxPrice={maxPrice}
                onPriceChange={setMaxPrice}
                selectedStars={selectedStars}
                onStarsChange={setSelectedStars}
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultsCount={filteredData.length}
                stayDays={stayDays}
                minPossiblePrice={minPossiblePrice}
                maxPossiblePrice={maxPossiblePrice}
                priceStep={priceStep}
                onClose={() => setOpenFilters(false)}
                hasRatings={hasRatings}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Mobile Drawer: AI Tips */}
      <Drawer.Root open={openAiTips} onOpenChange={setOpenAiTips}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[2px]" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[80] flex max-h-[92dvh] flex-col overflow-hidden rounded-t-[20px] border-t border-border/40 bg-background/95 backdrop-blur-2xl shadow-[0_-8px_40px_rgba(0,0,0,0.12)] outline-none">
            <Drawer.Title className="sr-only">
              {t("Hotel Insights")}
            </Drawer.Title>
            <Drawer.Description className="sr-only">
              {t("AI-powered insights and tips for your stay.")}
            </Drawer.Description>
            <div className="mx-auto mt-2.5 mb-3 h-[5px] w-9 shrink-0 rounded-full bg-foreground/20" />
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
              <HotelAiSuggestionsPanel
                onClose={() => setOpenAiTips(false)}
                hotels={filteredData}
                city={city}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </div>
  );
}
