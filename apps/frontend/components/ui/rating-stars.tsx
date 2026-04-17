import { Star } from "lucide-react";

export function RatingStars({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-brand-yellow">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5" fill={i < rating ? "currentColor" : "none"} />
      ))}
    </div>
  );
}
