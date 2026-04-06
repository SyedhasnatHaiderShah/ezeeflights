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
    <section className="py-16 bg-background relative overflow-hidden transition-colors duration-300">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/4 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-10 relative z-10 w-full">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="space-y-4">
            <span className="text-primary font-semibold text-sm block">
              Real Customer Experiences
            </span>
            <h2 className="font-display text-2xl md:text-3xl lg:text-3xl font-bold tracking-tight text-foreground">
              What Our Passengers Are Saying
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8">
            <div className="flex items-center gap-2 bg-muted px-5 py-2.5 rounded-full border border-border shadow-sm">
              <span className="font-bold text-lg text-foreground">4.7</span>
              <div className="flex bg-redmix/10 px-2 py-1 rounded-full border border-redmix/20">
                <Star className="w-4 h-4 text-redmix fill-current" />
                <Star className="w-4 h-4 text-redmix fill-current" />
                <Star className="w-4 h-4 text-redmix fill-current" />
                <Star className="w-4 h-4 text-redmix fill-current" />
                <Star className="w-4 h-4 text-redmix fill-current opacity-50" />
              </div>
              <span className="text-xs font-medium text-muted-foreground ml-1">
                Based on 1,000+ verified reviews
              </span>
            </div>
            <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full font-semibold text-xs border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
              85% 5-Star Ratings
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {visibleReviews.map((rev, i) => (
            <div
              key={currentIndex + i}
              className="flex flex-col relative p-5 rounded-md bg-card backdrop-blur-sm border border-border shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:bg-primary/15 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col h-full space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 text-redmix">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground/90 tracking-wider">
                    {new Date(rev.date).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex-grow">
                  <Quote className="w-6 h-6 text-primary/50 mb-3" />
                  <p className="text-foreground/90 text-sm font-medium leading-relaxed italic line-clamp-6">
                    "{rev.text}"
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-border/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md shrink-0">
                    {rev.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                      {rev.name}
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </h4>
                    <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> Verified Buyer,{" "}
                      {rev.location}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-border/30">
          <div className="flex items-center gap-4">
            <button
              onClick={prevReviews}
              className="p-3.5 rounded-full border border-border bg-card hover:bg-muted transition-all text-foreground shadow-sm hover:shadow-md active:scale-95"
              aria-label="Previous Reviews"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-xs font-semibold text-muted-foreground bg-card px-4 py-2 rounded-full border border-border/50">
              Showing {currentIndex + 1}-
              {Math.min(currentIndex + itemsPerPage, REVIEWS.length)} of{" "}
              {REVIEWS.length}
            </div>
            <button
              onClick={nextReviews}
              className="p-3.5 rounded-full border border-border bg-card hover:bg-muted transition-all text-foreground shadow-sm hover:shadow-md active:scale-95"
              aria-label="Next Reviews"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <Link
            href={"/reviews" as any}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-bold tracking-wide hover:bg-primary/90 transition-all hover:gap-3 group shadow-lg shadow-primary/25"
          >
            Read All Reviews
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
