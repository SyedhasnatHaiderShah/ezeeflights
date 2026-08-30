"use client";

import { useEffect, useState } from "react";

/** Scroll top — Capacitor Android scrolls `body`, where window.scrollY can stay 0. */
export function getPageScrollTop(): number {
  if (typeof window === "undefined") return 0;
  const { body, documentElement } = document;
  return Math.max(
    window.scrollY || 0,
    documentElement.scrollTop || 0,
    body.scrollTop || 0,
  );
}

export function usePageScroll(threshold = 20): boolean {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(getPageScrollTop() > threshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    document.body.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.body.removeEventListener("scroll", onScroll);
    };
  }, [threshold]);

  return isScrolled;
}
