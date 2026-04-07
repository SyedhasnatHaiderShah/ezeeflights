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

export function Reviews() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "start",
    breakpoints: {
      '(min-width: 1024px)': { active: false } 
    }
  }, [Autoplay({ delay: 5000, stopOnInteraction: true })]);

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

  const renderReview = (rev: any, i: number) => (
    <div
      key={i}
      className="group flex flex-col p-4 rounded-xl bg-card border border-border/60 hover:border-brand-red/20 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden h-full w-full"
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
        <p className="text-foreground/90 text-xs font-medium leading-relaxed font-sans line-clamp-6 px-1 pt-1 opacity-90">
          {rev.text}
        </p>
      </div>
    </div>
  );

  return (
    <section className="py-14 bg-background relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="flex items-baseline justify-between mb-8 px-1">
          <div className="space-y-0.5">
            <span className="text-brand-red font-bold uppercase tracking-[0.2em] text-xs block">
              Customer Trust
            </span>
            <h2 className="text-2xl font-black lg:text-3xl tracking-tight text-foreground leading-tight">
              What Our Passengers Say
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
              1K+ Reviews
            </span>
          </div>
        </div>

        {/* Carousel for Mobile / Grid for Desktop */}
        <div className="relative">
          <div className="lg:hidden overflow-hidden" ref={emblaRef}>
            <div className="flex ml-[-16px]">
              {REVIEWS.slice(0, 6).map((rev, i) => (
                <div key={i} className="flex-[0_0_88%] sm:flex-[0_0_48%] min-w-0 pl-4">
                  {renderReview(rev, i)}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-3 gap-5 xl:gap-6">
            {REVIEWS.slice(0, 6).map(renderReview)}
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 pt-8">
           {/* Slider Dots for Mobile/Tablet */}
           <div className="lg:hidden flex items-center gap-1.5">
              {REVIEWS.slice(0, 6).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    currentIndex === i ? "w-6 bg-brand-red" : "w-1.5 bg-border"
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
      </div>
    </section>
  );
}
