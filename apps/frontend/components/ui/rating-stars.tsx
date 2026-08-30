import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

const iconSize = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
} as const;

export function RatingStars({
  rating,
  count,
  size = "md",
  showCount = true,
  className,
}: RatingStarsProps) {
  const clamped = Math.min(5, Math.max(0, rating));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const fill = Math.max(0, Math.min(1, clamped - index));
          return (
            <span
              key={`star-${index}`}
              className="relative inline-flex transition-all duration-500 ease-out"
              style={{
                opacity: fill > 0 ? 1 : 0.7,
                transform: `scale(${fill > 0 ? 1 : 0.95})`,
              }}
            >
              <Star className={cn(iconSize[size], "text-brand-yellow/40")} />
              <span
                className="absolute inset-0 overflow-hidden transition-all duration-700 ease-out"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className={cn(iconSize[size], "fill-brand-yellow text-brand-yellow")} />
              </span>
            </span>
          );
        })}
      </div>
      {showCount && typeof count === "number" && (
        <span className="text-xs text-muted-foreground">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
