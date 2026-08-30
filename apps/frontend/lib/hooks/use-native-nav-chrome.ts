"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { isNative } from "@/lib/capacitor";
import {
  applyNativeChrome,
  resolveNativeChromeAppearance,
} from "@/lib/capacitor/native-chrome";
import { usePageScroll } from "@/lib/hooks/use-page-scroll";

/** Sync Android/iOS status + navigation bars with hero mode and theme. */
export function useNativeNavChrome(): void {
  const pathname = usePathname();
  const isScrolled = usePageScroll(20);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isNative() || !mounted) return;

    const appearance = resolveNativeChromeAppearance({
      pathname,
      isScrolled,
      theme: resolvedTheme,
    });

    void applyNativeChrome(appearance);
  }, [pathname, isScrolled, resolvedTheme, mounted]);
}
