import { CapacitorConfig } from "@capacitor/cli";

/**
 * EzeeFlights — Root Capacitor Configuration
 *
 * This file is used by `npx cap sync` to copy the built Next.js
 * static export into the native android/ and ios/ shells.
 *
 * Build flow:
 *   1. npm run build:mobile   → builds Next.js with output: 'export' → ./out/
 *   2. npx cap sync           → copies ./out/ into android/app/src/main/assets/public/
 *   3. npx cap open android   → opens Android Studio
 *
 * Brand Colors (mirrored from styles/globals.css):
 *   Dark Blue:  #0d2353  (--color-ezee-dark-blue)
 *   Red:        #c52a28  (--color-ezee-red / redmix)
 *   Yellow:     #ffbf27  (--color-ezee-yellow)
 *   Light Blue: #304cb2  (--color-ezee-light-blue)
 */
const config: CapacitorConfig = {
  appId: "com.ezeeflights.app",
  appName: "EzeeFlights",
  webDir: "out", // Next.js static export output directory

  server: {
    // Use HTTP scheme on Android to allow connections to local HTTP backends
    androidScheme: "http",
    // Allow cleartext traffic for local development
    cleartext: true,
  },

  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#0d2353", // EzeeFlights dark blue
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      spinnerColor: "#ffbf27", // EzeeFlights yellow
    },

    StatusBar: {
      style: "LIGHT" as const,
      backgroundColor: "#0e0e0e",
      overlaysWebView: false,
    },

    GoogleSignIn: {
      clientId: "593693636053-t2dgq0rjj27unpmjboba26m6g0kefqta.apps.googleusercontent.com",
      scopes: ["profile", "email"],
    },

    Keyboard: {
      resize: "body" as const,
      style: "DARK" as const,
      resizeOnFullScreen: true,
    },

    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },

    LocalNotifications: {
      smallIcon: "ic_stat_ezeeflights",
      iconColor: "#c52a28", // EzeeFlights red
    },
  },
};

export default config;
