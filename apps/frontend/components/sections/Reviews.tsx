"use client";

import React, { useState } from "react";
import {
  Quote,
  Star,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { REVIEWS } from "@/data/reviews";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export function Reviews({ showFullList = false }: { showFullList?: boolean }) {
  const INITIAL_LIMIT = 10;
  const LOAD_MORE_STEP = 10;
  const [visibleCount, setVisibleCount] = useState(
    showFullList ? INITIAL_LIMIT : 6,
  );
  const [selectedReview, setSelectedReview] = useState<any>(null);

  const emblaRefHook = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      breakpoints: {
        "(min-width: 1024px)": { active: false },
      },
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })],
  );

  const [emblaRef, emblaApi] = emblaRefHook;
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const displayedReviews = showFullList
    ? REVIEWS.slice(0, visibleCount)
    : REVIEWS.slice(0, 6);
  const hasMore = showFullList && visibleCount < REVIEWS.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_STEP, REVIEWS.length));
  };

  const renderReview = (rev: any, i: number) => (
    <div
      key={i}
      onClick={() => setSelectedReview(rev)}
      className="group flex flex-col p-4 rounded-xl bg-card border border-border/60 hover:border-brand-red/20 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden h-full w-full cursor-pointer"
    >
      {/* Profile - Positioned on Top */}
      <div className="flex items-center gap-3 mb-3.5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-red to-brand-red-light flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
          {rev.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h4 className="font-bold text-foreground flex items-center gap-1 text-xs truncate">
              {rev.name}
              <CheckCircle2 className="w-3 h-3 text-emerald-500 fill-emerald-500/10" />
            </h4>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-[0.1em]">
              {new Date(rev.date).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex text-brand-red scale-[0.65] origin-left -ml-1">
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase opacity-70 border-l border-border/50 pl-1.5 leading-none">
              {rev.location}
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex-grow">
        <Quote className="w-4 h-4 text-brand-red/20 absolute -top-1 -left-1 transform -translate-x-1 -translate-y-1" />
        <p className="text-foreground/90 text-xs font-medium leading-relaxed font-sans line-clamp-4 px-1 pt-1 opacity-90">
          {rev.text}
        </p>
        {rev.text.length > 100 && (
          <span className="text-[10px] text-brand-red font-bold uppercase tracking-tighter mt-1 block group-hover:underline">
            Read More...
          </span>
        )}
      </div>
    </div>
  );

  return (
    <section
      className={cn(
        "py-14 bg-background relative overflow-hidden transition-colors duration-300",
        showFullList && "py-0",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="flex items-baseline justify-between mb-8 px-1">
          <div className="space-y-0.5">
            <span className="text-brand-red font-bold uppercase tracking-[0.2em] text-xs block">
              Customer Trust
            </span>
            <h2 className="text-2xl font-black lg:text-3xl tracking-tight text-foreground leading-tight">
              {showFullList
                ? "All Passenger Stories"
                : "What Our Passengers Say"}
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
            <span className="font-bold text-sm text-foreground">4.7</span>
            <div className="flex text-brand-red scale-75 origin-left">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1 border-l border-border/50 pl-2">
              {REVIEWS.length}+ Reviews
            </span>
          </div>
        </div>

        {/* Carousel for Mobile / Grid for Desktop */}
        <div className="relative">
          {!showFullList && (
            <div className="lg:hidden overflow-hidden" ref={emblaRef}>
              <div className="flex ml-[-16px]">
                {displayedReviews.map((rev, i) => (
                  <div
                    key={i}
                    className="flex-[0_0_88%] sm:flex-[0_0_48%] min-w-0 pl-4"
                  >
                    {renderReview(rev, i)}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-6",
              !showFullList && "hidden lg:grid",
            )}
          >
            {displayedReviews.map(renderReview)}
          </div>
        </div>

        {showFullList ? (
          hasMore && (
            <div className="flex justify-center pt-12">
              <button
                onClick={handleLoadMore}
                className="flex items-center gap-2 px-8 py-3 bg-brand-red text-white font-bold rounded-full hover:bg-brand-red/90 transition-all active:scale-95 shadow-lg shadow-brand-red/20 group"
              >
                <span>Show More Stories</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )
        ) : (
          <div className="flex items-center justify-between gap-6 pt-8">
            {/* Slider Dots for Mobile/Tablet */}
            <div className="lg:hidden flex items-center gap-1.5">
              {REVIEWS.slice(0, 6).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    currentIndex === i ? "w-6 bg-brand-red" : "w-1.5 bg-border",
                  )}
                />
              ))}
            </div>

            <Link
              href={"/reviews" as any}
              className="flex items-center gap-1.5 text-brand-red font-bold hover:text-brand-red/80 transition-all active:scale-95 group ms-auto lg:ms-0"
            >
              <span className="text-xs uppercase tracking-widest border-b border-brand-red/20 pb-0.5">
                Read All Stories
              </span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Dialog
        open={!!selectedReview}
        onOpenChange={() => setSelectedReview(null)}
      >
        <DialogContent className="w-[95vw] sm:max-w-2xl bg-white dark:bg-card border-none shadow-2xl p-0 overflow-hidden rounded-3xl">
          <DialogTitle className="sr-only">
            Passenger Review Details
          </DialogTitle>
          {selectedReview && (
            <div className="p-5 sm:p-8 space-y-4 sm:space-y-6 relative max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-brand-red to-brand-red-light flex items-center justify-center text-white font-black text-sm md:text-lg shadow-lg ring-4 ring-brand-red/5 shrink-0">
                    {selectedReview.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="space-y-0.5 sm:space-y-1 min-w-0">
                    <h3 className="text-sm md:text-2xl font-semibold text-foreground flex items-center gap-1.5 truncate">
                      {selectedReview.name}
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-emerald-500 fill-emerald-500/10 shrink-0" />
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-muted-foreground font-bold uppercase tracking-wider text-[10px] md:text-xs">
                      <span>{selectedReview.location}</span>
                      <span className="opacity-30">•</span>
                      <span>
                        {new Date(selectedReview.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex text-brand-red gap-0.5 sm:gap-1 bg-brand-red/5 w-fit px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-brand-red/10">
                {[...Array(selectedReview.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current"
                  />
                ))}
              </div>

              <div className="relative pt-2 md:pt-4">
                <p className="text-foreground/90 text-sm md:text-base font-medium md:leading-relaxed font-sans italic relative z-10 pl-3 md:pl-4 border-l-1 border-brand-red/20">
                  {selectedReview.text}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
