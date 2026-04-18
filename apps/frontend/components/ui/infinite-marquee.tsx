import * as React from "react";
import { cn } from "@/lib/utils";

interface InfiniteMarqueeProps {
  items: React.ReactNode[];
  speed?: number;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
}

export function InfiniteMarquee({
  items,
  speed = 40,
  pauseOnHover = false,
  reverse = false,
  className,
}: InfiniteMarqueeProps) {
  return (
    <div className={cn("overflow-hidden", className)}>
      <div
        className={cn(
          "flex min-w-max gap-4 animate-marquee",
          pauseOnHover && "hover:[animation-play-state:paused]",
          reverse && "[animation-direction:reverse]",
        )}
        style={{ animationDuration: `${speed}s` }}
      >
        {[...items, ...items].map((item, index) => (
          <div key={`marquee-item-${index}`} className="shrink-0">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
