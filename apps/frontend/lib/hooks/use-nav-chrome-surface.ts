"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { usePageScroll } from "./use-page-scroll";

/** Shared hero / scrolled surface chrome for mobile overlays and modals. */
export function useNavChromeSurface() {
  const pathname = usePathname();
  const isScrolled = usePageScroll(20);
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHomePage = pathname === "/";
  const isHeroMode = isHomePage && !isScrolled;
  const isDarkMode = mounted && resolvedTheme === "dark";
  const useDarkChrome = isDarkMode || isHeroMode;

  return {
    mounted,
    pathname,
    isScrolled,
    theme,
    resolvedTheme,
    isHomePage,
    isHeroMode,
    isDarkMode,
    useDarkChrome,
  };
}
