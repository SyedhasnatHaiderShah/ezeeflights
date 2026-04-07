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
import { REVIEWS } from "@/data/reviews";

export function Reviews() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 3;

  const nextReviews = () => {
    setCurrentIndex((prev) =>
      prev + itemsPerPage >= REVIEWS.length ? 0 : prev + itemsPerPage,
    );
  };

  const prevReviews = () => {
    setCurrentIndex((prev) =>
      prev - itemsPerPage < 0
        ? Math.max(0, REVIEWS.length - itemsPerPage)
        : prev - itemsPerPage,
    );
  };

  const visibleReviews = REVIEWS.slice(
    currentIndex,
    currentIndex + itemsPerPage,
  );

  return (
    <section className="py-14 bg-background relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="flex items-baseline justify-between mb-8 px-1">
          <div className="space-y-0.5">
            <span className="text-brand-red font-bold uppercase tracking-[0.2em] text-xs block">
              Customer Trust
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 w-full">
          {visibleReviews.map((rev, i) => (
            <div
              key={currentIndex + i}
              className="group flex flex-col p-4 rounded-xl bg-card border border-border/60 hover:border-brand-red/20 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
            >
              {/* Profile - Positioned on Top */}
              <div className="flex items-center gap-3 mb-3.5">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-red to-brand-red-light flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                  {rev.name
                    .split(" ")
                    .map((n) => n[0])
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
          ))}
        </div>

        <div className="flex items-center justify-between gap-6 pt-6 mt-2">
          <div className="flex items-center gap-3">
            <button
              onClick={prevReviews}
              className="w-9 h-9 rounded-full border border-border/60 bg-card hover:bg-muted transition-all flex items-center justify-center text-foreground hover:border-brand-red/30 active:scale-90"
              aria-label="Previous Reviews"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-medium text-muted-foreground tracking-widest bg-muted/40 px-3 py-1.5 rounded-lg border border-border/40">
              {currentIndex + 1}-
              {Math.min(currentIndex + itemsPerPage, REVIEWS.length)} /{" "}
              {REVIEWS.length}
            </div>
            <button
              onClick={nextReviews}
              className="w-9 h-9 rounded-full border border-border/60 bg-card hover:bg-muted transition-all flex items-center justify-center text-foreground hover:border-brand-red/30 active:scale-90"
              aria-label="Next Reviews"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            href={"/reviews" as any}
            className="flex items-center gap-1.5 text-brand-red font-bold hover:text-brand-blue dark:hover:text-brand-red-light transition-all active:scale-95 group"
          >
            <span className="text-xs uppercase tracking-wider">
              Read All Stories
            </span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
