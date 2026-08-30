/**
 * EzeeFlights — Capacitor Auth Deep-Link Handler
 *
 * When users log in via OAuth (Google) on mobile, the EzeeFlights backend
 * redirects back to the app via the custom URL scheme: com.ezeeflights.app://
 *
 * The URL contains an authorization `code` which we exchange for a session
 * by calling the EzeeFlights backend API at /api/auth/oauth/exchange —
 * the same endpoint the web app uses in its OAuth callback flow.
 *
 * Setup:
 *   Call `setupCapacitorAuthListener()` once on app mount (in layout.tsx).
 *
 * Requires:
 *   - AndroidManifest.xml intent-filter for com.ezeeflights.app scheme ✅
 *   - iOS Info.plist URL scheme registration (done in ios/ setup)
 *   - Backend OAuth redirectTo set to 'com.ezeeflights.app://auth/callback'
 */
import { isNative } from "./platform";

/** The result of an OAuth exchange attempt */
export interface OAuthExchangeResult {
  ok: boolean;
  requiresTwoFactor?: boolean;
  error?: string;
}

/**
 * Initialize the Capacitor deep-link listener for OAuth callbacks.
 * Should be called once when the app mounts.
 *
 * When the user authenticates via Google OAuth, the backend redirects to:
 *   com.ezeeflights.app://auth/callback?code=AUTHORIZATION_CODE
 *
 * This handler intercepts that URL, extracts the code, and calls
 * `/api/auth/oauth/exchange` to complete the login session.
 *
 * @param onSuccess    — called after a successful login
 * @param onTwoFactor  — called if the server requires 2FA verification
 * @param onError      — called on any failure with an error message
 */
export async function setupCapacitorAuthListener(
  onSuccess?: () => void,
  onTwoFactor?: () => void,
  onError?: (error: string) => void,
): Promise<void> {
  if (!isNative()) return;

  try {
    const { App } = await import("@capacitor/app");

    App.addListener("appUrlOpen", async ({ url }) => {
      console.log("[EzeeFlights] Deep link received:", url);

      // Handle OAuth callback from the EzeeFlights backend
      // URL format: com.ezeeflights.app://auth/callback?code=AUTHORIZATION_CODE
      if (
        url.startsWith("com.ezeeflights.app://") ||
        url.includes("ezeeflights.com/auth/callback")
      ) {
        try {
          // Replace custom scheme with https:// so the URL API can parse it
          const parseable = url
            .replace("com.ezeeflights.app://", "https://app.ezeeflights.com/")
            .replace("com.ezeeflights.app:", "https://app.ezeeflights.com");

          const urlObj = new URL(parseable);
          const code = urlObj.searchParams.get("code");

          if (!code) {
            console.warn(
              "[EzeeFlights] OAuth callback missing code parameter:",
              url,
            );
            onError?.("OAuth callback is missing the authorization code");
            return;
          }

          console.log("[EzeeFlights] Exchanging OAuth code with backend...");

          // Call the EzeeFlights backend BFF OAuth exchange endpoint.
          // This sets the auth cookie for the session — identical to the web app flow.
          const { oauthExchangeRequest } = await import("@/lib/api/auth-api");
          const result = await oauthExchangeRequest({ code });

          if ("requiresTwoFactor" in result && result.requiresTwoFactor) {
            console.log("[EzeeFlights] OAuth exchange requires 2FA");
            onTwoFactor?.();
          } else {
            console.log("[EzeeFlights] OAuth exchange successful");
            onSuccess?.();
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "OAuth exchange failed";
          console.error("[EzeeFlights] Auth deep-link error:", error);
          onError?.(message);
        }
      }
    });

    console.log("[EzeeFlights] Auth deep-link listener registered");
  } catch (error) {
    console.warn("[EzeeFlights] App plugin unavailable:", error);
  }
}

/**
 * Handle the Android hardware back button.
 * Prevents the app from exiting when on the home/root screen.
 *
 * @param onBackPress — optional custom handler; return true to prevent default
 */
export async function setupBackButtonHandler(
  onBackPress?: () => boolean | Promise<boolean>,
): Promise<void> {
  if (!isNative()) return;

  try {
    const { App } = await import("@capacitor/app");

    App.addListener("backButton", async ({ canGoBack }) => {
      if (onBackPress) {
        const handled = await onBackPress();
        if (handled) return;
      }

      if (canGoBack) {
        window.history.back();
      } else {
        // On the root screen — minimize the app instead of killing it
        App.minimizeApp();
      }
    });
  } catch (error) {
    console.warn("[EzeeFlights] Back button handler error:", error);
  }
}

/**
 * Remove all Capacitor App event listeners.
 * Call this on component unmount to prevent memory leaks.
 */
export async function removeAppListeners(): Promise<void> {
  if (!isNative()) return;
  try {
    const { App } = await import("@capacitor/app");
    await App.removeAllListeners();
  } catch {
    // Silently ignore
  }
}
