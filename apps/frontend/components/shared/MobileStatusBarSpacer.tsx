"use client";

/**
 * EzeeFlights — Mobile Status Bar Spacer
 *
 * On native iOS/Android, the status bar overlays the app content.
 * This component adds a spacer at the top of the layout equal to the
 * safe area inset-top, pushing content below the status bar.
 *
 * Uses CSS `env(safe-area-inset-top)` which is set automatically by
 * Capacitor/WebKit on iOS and by the Android system on Android 10+.
 *
 * On desktop web browsers this renders as a zero-height element.
 *
 * Usage: Place at the very top of the layout, before the Header.
 *
 *   <MobileStatusBarSpacer />
 *   <Header />
 */
export function MobileStatusBarSpacer() {
  return (
    <div
      aria-hidden
      className="w-full shrink-0"
      style={{
        // On native: equals the device status bar height (20–50px depending on device)
        // On web: env() is not supported, so defaults to 0px
        height: "env(safe-area-inset-top, 0px)",
        // Match the EzeeFlights header dark blue so the status bar area is seamless
        // In light mode this is transparent (header handles its own background)
        backgroundColor: "transparent",
      }}
    />
  );
}
