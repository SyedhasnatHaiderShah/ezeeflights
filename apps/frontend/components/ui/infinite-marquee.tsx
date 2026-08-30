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
  // Repeat items to fill viewport and ensure seamless continuous looping
  const repeatedItems = React.useMemo(() => {
    if (!items || items.length === 0) return [];
    const repeatCount = Math.max(4, Math.ceil(30 / items.length));
    const result: React.ReactNode[] = [];
    for (let i = 0; i < repeatCount; i++) {
      result.push(...items);
    }
    return result;
  }, [items]);

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
        {repeatedItems.map((item, index) => (
          <div key={`marquee-item-${index}`} className="shrink-0">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
