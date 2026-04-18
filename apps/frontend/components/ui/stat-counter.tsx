"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  duration?: number;
  className?: string;
}

export function StatCounter({
  value,
  suffix = "",
  prefix = "",
  label,
  duration = 2000,
  className,
}: StatCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node || hasAnimated) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || hasAnimated) {
          return;
        }

        setHasAnimated(true);
        const start = performance.now();

        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          setDisplayValue(Math.round(progress * value));

          if (progress < 1) {
            window.requestAnimationFrame(animate);
          }
        };

        window.requestAnimationFrame(animate);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [duration, hasAnimated, value]);

  return (
    <div ref={containerRef} className={cn("space-y-1", className)}>
      <p className="text-4xl font-bold text-foreground animate-counter-up">
        {prefix}
        {displayValue.toLocaleString()}
        {suffix}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
