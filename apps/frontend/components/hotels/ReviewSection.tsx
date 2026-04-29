"use client";

import * as React from "react";
import {
  Star,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Review, AISentimentSummary } from "@/lib/types/hotels";
import { ReviewCard } from "@/components/reviews/ReviewCard";

interface ReviewSectionProps {
  reviews: Review[];
  sentiment: AISentimentSummary;
  userRating: number;
  totalReviews: number;
  className?: string;
}

export function ReviewSection({
  reviews,
  sentiment,
  userRating,
  totalReviews,
  className,
}: ReviewSectionProps) {
  return (
    <div className={cn("space-y-12", className)}>
      {/* Ratings Header */}
      <div className="flex flex-col md:flex-row gap-10 items-start md:items-center bg-card/30 backdrop-blur-md p-8 rounded-[2rem] border border-border/50">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-brand-red text-white rounded-3xl flex items-center justify-center text-3xl font-bold shadow-2xl shadow-brand-red/20">
            {userRating.toFixed(1)}
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight">Exceptional</h3>
            <p className="text-sm text-muted-foreground font-medium">
              Based on {totalReviews.toLocaleString()} verified guest reviews
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
          {[
            { label: "Cleanliness", score: 4.9 },
            { label: "Service", score: 4.8 },
            { label: "Location", score: 4.7 },
            { label: "Value", score: 4.6 },
          ].map((item) => (
            <div key={item.label} className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <span>{item.label}</span>
                <span className="text-foreground">{item.score}</span>
              </div>
              <div className="h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-red rounded-full"
                  style={{ width: `${(item.score / 5) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Sentiment Summary Card */}
      <div className="group relative bg-slate-950 dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl overflow-hidden border border-white/5">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-red/10 blur-[120px] -mr-48 -mt-48 rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] -ml-32 -mb-32 rounded-full opacity-30 group-hover:opacity-50 transition-opacity duration-1000" />

        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-brand-red/20 rounded-2xl border border-brand-red/20">
                <Sparkles className="w-5 h-5 text-brand-red" />
              </div>
              <h4 className="text-xl font-bold tracking-tight">
                AI Smart Summary
              </h4>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
              </span>
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                Live Analysis
              </span>
            </div>
          </div>

          <blockquote className="text-xl md:text-2xl text-white/90 leading-relaxed font-medium italic border-l-4 border-brand-red/30 pl-8">
            "{sentiment.overallSummary}"
          </blockquote>

          <div className="grid md:grid-cols-2 gap-12 pt-4">
            <div className="space-y-5">
              <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                <ThumbsUp className="w-3.5 h-3.5" /> <span>The Highlights</span>
              </div>
              <ul className="grid gap-3">
                {sentiment.pros.map((pro, i) => (
                  <li
                    key={i}
                    className="text-sm font-medium text-white/60 flex items-start gap-3 group/item"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 group-hover/item:bg-emerald-500 transition-colors" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-5">
              <div className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />{" "}
                <span>Areas for Note</span>
              </div>
              <ul className="grid gap-3">
                {sentiment.cons.map((con, i) => (
                  <li
                    key={i}
                    className="text-sm font-medium text-white/60 flex items-start gap-3 group/item"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 mt-1.5 group-hover/item:bg-amber-500 transition-colors" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reviews List */}
      <div className="space-y-8 pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xl font-bold flex items-center gap-3">
            Guest Experiences
            <span className="text-xs font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
              {reviews.length} Verified
            </span>
          </h4>
        </div>

        <div className="grid gap-8">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {totalReviews > reviews.length && (
          <button className="w-full py-5 rounded-3xl border border-dashed border-border/50 text-muted-foreground font-bold text-xs hover:border-brand-red hover:text-brand-red hover:bg-brand-red/5 transition-all active:scale-[0.98]">
            Explore all {totalReviews.toLocaleString()} guest experiences
          </button>
        )}
      </div>
    </div>
  );
}
