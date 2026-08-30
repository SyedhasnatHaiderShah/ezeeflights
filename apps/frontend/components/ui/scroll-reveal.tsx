"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  /** @deprecated rootMargin no longer used for mounting — kept for API compat */
  rootMargin?: string;
}

export function ScrollReveal({
  children,
  className = "",
  minHeight = "400px",
  rootMargin = "800px",
}: ScrollRevealProps) {
  // Start with hasMounted = true so Server-Side Rendering (SSR) compiles the layout
  // for SEO crawlers. On client mount, if it's below the fold, we unmount it.
  const [hasMounted, setHasMounted] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    // If already in or near the viewport: keep visible, mark as animated
    if (rect.top < window.innerHeight + 100) {
      setIsVisible(true);
      setHasAnimated(true);
      setHasMounted(true);
      return;
    }

    // Element is below the fold — hide it and unmount it to save client CPU/memory
    setIsVisible(false);
    setHasMounted(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setHasAnimated(true);
          setHasMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px 150px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={!hasMounted ? { minHeight } : undefined}
      className={cn(
        // Only apply transition when we have something to animate
        !hasAnimated && "transition-all duration-700 ease-out",
        // Default: fully visible. Only invisible while waiting for scroll-in
        !isVisible ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0",
        className,
      )}
    >
      {hasMounted ? children : null}
    </div>
  );
}
