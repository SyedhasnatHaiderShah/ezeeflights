/**
 * EzeeFlights — Capacitor Status Bar Management
 *
 * Controls the native device status bar color and style to match
 * the EzeeFlights brand (dark blue header / light/dark mode support).
 *
 * Brand colors (from globals.css):
 *   Dark Blue:  #0d2353  — used for header / dark mode
 *   White:      #ffffff  — used for light mode backgrounds
 */
import { isNative } from "./platform";
import {
  applyNativeChrome,
  type NativeChromeAppearance,
} from "./native-chrome";

/**
 * Configure the native status bar to match the EzeeFlights theme.
 * Prefer `applyNativeChrome()` for hero-mode aware behavior.
 */
export async function configureStatusBar(
  theme: "light" | "dark",
): Promise<void> {
  if (!isNative()) return;

  const appearance: NativeChromeAppearance = theme === "dark" ? "dark" : "light";
  await applyNativeChrome(appearance);
}

/**
 * Set the status bar to EzeeFlights brand dark blue (used during splash/loading).
 * Always uses dark icons/text (white icons on dark background).
 */
export async function setStatusBarBrandColor(): Promise<void> {
  if (!isNative()) return;
  await applyNativeChrome("hero");
}

/**
 * Show the status bar (in case it was hidden).
 */
export async function showStatusBar(): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar } = await import("@capacitor/status-bar");
    await StatusBar.show();
  } catch {
    // Silently ignore
  }
}

/**
 * Hide the status bar (useful for full-screen map/video views).
 */
export async function hideStatusBar(): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar } = await import("@capacitor/status-bar");
    await StatusBar.hide();
  } catch {
    // Silently ignore
  }
}
