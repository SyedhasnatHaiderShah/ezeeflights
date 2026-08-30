import { registerPlugin } from "@capacitor/core";
import { NAV_HERO_SOLID } from "@/lib/constants/nav-chrome";
import { isAndroid, isIOS, isNative } from "./platform";

export type NativeChromeAppearance = "hero" | "light" | "dark";

const CHROME_APPEARANCE = {
  hero: { color: NAV_HERO_SOLID, lightIcons: true },
  dark: { color: NAV_HERO_SOLID, lightIcons: true },
  light: { color: "#ffffff", lightIcons: false },
} as const;

interface SystemChromePlugin {
  applyAppearance(options: {
    backgroundColor: string;
    lightIcons: boolean;
  }): Promise<void>;
  enterFullscreen(): Promise<void>;
  exitFullscreen(): Promise<void>;
  isFullscreen(): Promise<{ value: boolean }>;
}

const SystemChrome = registerPlugin<SystemChromePlugin>("SystemChrome");

export function resolveNativeChromeAppearance(options: {
  pathname: string;
  isScrolled: boolean;
  theme?: string;
}): NativeChromeAppearance {
  const isHomePage = options.pathname === "/";
  const isHeroMode = isHomePage && !options.isScrolled;
  const isDark = options.theme === "dark";

  if (isDark || isHeroMode) {
    return isDark ? "dark" : "hero";
  }

  return "light";
}

export function resolveChromeFromSurface(options: {
  useDarkChrome: boolean;
  isDarkMode: boolean;
}): NativeChromeAppearance {
  if (!options.useDarkChrome) return "light";
  return options.isDarkMode ? "dark" : "hero";
}

export async function applyNativeChrome(
  appearance: NativeChromeAppearance,
): Promise<void> {
  if (!isNative()) return;

  const config = CHROME_APPEARANCE[appearance];

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.show();
    await StatusBar.setStyle({
      style: config.lightIcons ? Style.Light : Style.Dark,
    });
    await StatusBar.setBackgroundColor({ color: config.color });
  } catch (error) {
    console.warn("[EzeeFlights] StatusBar update failed:", error);
  }

  if (isAndroid()) {
    try {
      await SystemChrome.applyAppearance({
        backgroundColor: config.color,
        lightIcons: config.lightIcons,
      });
    } catch (error) {
      console.warn("[EzeeFlights] SystemChrome update failed:", error);
    }
  }
}

export async function enterNativeFullscreen(): Promise<void> {
  if (!isNative()) return;

  if (isAndroid()) {
    try {
      await SystemChrome.enterFullscreen();
      return;
    } catch (error) {
      console.warn("[EzeeFlights] Android fullscreen failed:", error);
    }
  }

  try {
    const { StatusBar } = await import("@capacitor/status-bar");
    await StatusBar.hide();
  } catch {
    // Ignore on platforms without StatusBar.
  }
}

export async function exitNativeFullscreen(): Promise<void> {
  if (!isNative()) return;

  if (isAndroid()) {
    try {
      await SystemChrome.exitFullscreen();
    } catch (error) {
      console.warn("[EzeeFlights] Android exit fullscreen failed:", error);
    }
  }

  if (isIOS()) {
    try {
      const { StatusBar } = await import("@capacitor/status-bar");
      await StatusBar.show();
    } catch {
      // Ignore.
    }
  }
}

export async function isNativeFullscreen(): Promise<boolean> {
  if (!isNative()) return !!document.fullscreenElement;

  if (isAndroid()) {
    try {
      const result = await SystemChrome.isFullscreen();
      return Boolean(result.value);
    } catch {
      return false;
    }
  }

  try {
    const { StatusBar } = await import("@capacitor/status-bar");
    // No direct query API — treat hidden status bar as fullscreen on iOS.
    void StatusBar;
    return false;
  } catch {
    return false;
  }
}

export async function toggleNativeFullscreen(options: {
  pathname: string;
  isScrolled: boolean;
  theme?: string;
}): Promise<boolean> {
  if (!isNative()) {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      return true;
    }

    if (document.exitFullscreen) {
      await document.exitFullscreen();
    }
    return false;
  }

  const active = await isNativeFullscreen();

  if (active) {
    await exitNativeFullscreen();
    await applyNativeChrome(resolveNativeChromeAppearance(options));
    return false;
  }

  await enterNativeFullscreen();
  return true;
}
