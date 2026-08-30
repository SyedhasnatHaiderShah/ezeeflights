"use client";

import { useEffect } from "react";

export function HeroReadyNotifier({ isReady = true }: { isReady?: boolean }) {
  useEffect(() => {
    if (!isReady) return;

    // A small delay ensures the browser paints before we dismiss the loader
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("hero-ready"));
    }, 50);

    return () => clearTimeout(timer);
  }, [isReady]);

  return null;
}
