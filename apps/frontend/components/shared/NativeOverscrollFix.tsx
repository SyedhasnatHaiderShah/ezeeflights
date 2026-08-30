"use client";

import { useEffect } from "react";
import { isNative } from "@/lib/capacitor";

/**
 * Applies CSS overscroll guards on native WebView.
 * Rubber-band is disabled natively in MainActivity via OVER_SCROLL_NEVER.
 * Do NOT use touchmove preventDefault here — it breaks normal vertical scroll on Android.
 */
export function NativeOverscrollFix() {
  useEffect(() => {
    if (!isNative()) return;

    const root = document.documentElement;
    root.dataset.nativeApp = "true";
    root.classList.add("no-overscroll");
    document.body.classList.add("no-overscroll");

    return () => {
      delete root.dataset.nativeApp;
      root.classList.remove("no-overscroll");
      document.body.classList.remove("no-overscroll");
    };
  }, []);

  return null;
}
