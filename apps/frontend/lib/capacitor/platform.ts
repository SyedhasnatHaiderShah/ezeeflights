/**
 * EzeeFlights — Capacitor Platform Detection Utilities
 *
 * Use these helpers throughout the app to conditionally apply
 * native behaviour vs. web behaviour.
 *
 * Usage:
 *   import { isNative, isAndroid, isIOS } from '@/lib/capacitor/platform';
 *
 *   if (isNative()) {
 *     // Use native plugin
 *   } else {
 *     // Use web fallback
 *   }
 */

// Type for the Capacitor global injected by the native shell
type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
};

type WindowWithCapacitor = Window &
  typeof globalThis & {
    Capacitor?: CapacitorGlobal;
  };

/**
 * Returns true when running inside a native Capacitor shell (Android or iOS).
 * Returns false in a standard web browser.
 */
export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!(window as WindowWithCapacitor).Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

/**
 * Returns the current platform: 'android' | 'ios' | 'web'
 */
export function getPlatform(): "android" | "ios" | "web" {
  if (typeof window === "undefined") return "web";
  try {
    return (
      ((window as WindowWithCapacitor).Capacitor?.getPlatform?.() as
        | "android"
        | "ios"
        | "web") ?? "web"
    );
  } catch {
    return "web";
  }
}

/** Returns true when running on Android native */
export function isAndroid(): boolean {
  return getPlatform() === "android";
}

/** Returns true when running on iOS native */
export function isIOS(): boolean {
  return getPlatform() === "ios";
}

/**
 * Returns true when running in a browser (not native).
 * Useful for showing web-only features like the full desktop layout.
 */
export function isWeb(): boolean {
  return getPlatform() === "web";
}
