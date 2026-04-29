"use client";

import {
  Star,
  ShieldCheck,
  MessageSquare,
  Flag,
  ThumbsUp,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Review } from "@/lib/types/hotels";
import { useState } from "react";
import { toast } from "@/lib/hooks/use-toast";

interface ReviewCardProps {
  review: Review;
  compact?: boolean;
}

export function ReviewCard({ review, compact = false }: ReviewCardProps) {
  const [isFlagged, setIsFlagged] = useState(false);

  const handleFlag = () => {
    setIsFlagged(true);
    toast({
      description: "This review has been flagged for manual moderation.",
    });
  };

  const categories = [
    { label: "Flight", score: review.flightRating },
    { label: "Hotel", score: review.hotelRating },
    { label: "Car", score: review.carRating },
  ].filter((c) => c.score !== undefined);

  return (
    <div
      className={cn(
        "group relative bg-card/40 backdrop-blur-md rounded-[2rem] border border-border/50 p-8 space-y-6 transition-all duration-500 hover:shadow-2xl hover:border-brand-red/30",
        isFlagged && "opacity-60 grayscale-[0.5]",
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="relative">
            {review.userAvatar ? (
              <img
                src={review.userAvatar}
                className="w-14 h-14 rounded-2xl object-cover border border-border/50 shadow-sm"
                alt={review.userName}
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red font-black text-xl border border-brand-red/20 shadow-sm">
                {review.userName.charAt(0)}
              </div>
            )}
            {review.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-lg border-2 border-background shadow-lg">
                <ShieldCheck className="w-3 h-3" />
              </div>
            )}
          </div>

          <div className="space-y-1">
            <p className="font-black text-sm tracking-tight">
              {review.userName}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted-foreground tracking-widest">
                {new Date(review.date).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="w-1 h-1 bg-border rounded-full" />
              <span className="text-[10px] font-black text-emerald-500 tracking-widest">
                Verified Traveler
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 bg-brand-red/10 text-brand-red px-3 py-1.5 rounded-xl border border-brand-red/10 font-black text-sm shadow-sm">
            {review.rating.toFixed(1)}{" "}
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          {categories.length > 0 && !compact && (
            <div className="flex gap-2">
              {categories.map((cat) => (
                <div
                  key={cat.label}
                  className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/50"
                >
                  {cat.label}:{" "}
                  <span className="text-foreground">{cat.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Content */}
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">
          "{review.comment}"
        </p>

        {review.photos && review.photos.length > 0 && (
          <div className="flex gap-3 pt-2">
            {review.photos.map((photo, i) => (
              <div
                key={i}
                className="relative w-24 h-24 rounded-2xl overflow-hidden border border-border/50 group/photo cursor-zoom-in shadow-sm"
              >
                <img
                  src={photo}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/photo:scale-110"
                  alt="review"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supplier Response */}
      {review.supplierResponse && (
        <div className="relative mt-6 p-6 bg-brand-red/5 rounded-3xl border border-brand-red/10 group-hover:bg-brand-red/[0.08] transition-colors">
          <div className="absolute -top-3 left-6 bg-brand-red text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg shadow-brand-red/20 tracking-[0.2em]">
            Supplier Response
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-xl bg-brand-red/20 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-brand-red" />
            </div>
            <p className="text-xs text-brand-red/80 font-medium leading-relaxed italic">
              "{review.supplierResponse}"
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-border/30 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-4">
          <button className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-brand-red transition-colors">
            <ThumbsUp className="w-3.5 h-3.5" /> Helpful (12)
          </button>
          <button className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-brand-red transition-colors">
            <MessageSquare className="w-3.5 h-3.5" /> Reply
          </button>
        </div>

        <button
          onClick={handleFlag}
          disabled={isFlagged}
          className={cn(
            "flex items-center gap-2 text-[10px] font-bold transition-colors",
            isFlagged
              ? "text-amber-500"
              : "text-muted-foreground hover:text-amber-500",
          )}
        >
          <Flag className={cn("w-3.5 h-3.5", isFlagged && "fill-current")} />
          {isFlagged ? "Reported" : "Report"}
        </button>
      </div>
    </div>
  );
}
