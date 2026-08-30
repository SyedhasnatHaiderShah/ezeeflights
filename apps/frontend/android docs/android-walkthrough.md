# EzeeFlights — Android & iOS Mobile App Walkthrough

## What Was Done

The existing Capacitor `android/` shell (previously named "Rentolic") has been completely updated to EzeeFlights branding, a new `ios/` setup path has been documented, and the Next.js frontend is now wired for mobile builds.

---

## Phase 1 — Android Native Shell Rebranded

All Android native files updated from `com.rentolic.app` → `com.ezeeflights.app`:

| File | Change |
|------|--------|
| `strings.xml` | App name: "EzeeFlights", package: com.ezeeflights.app |
| `colors.xml` | NEW — Full EzeeFlights brand palette (dark blue #0d2353, red #c52a28, yellow #ffbf27) |
| `styles.xml` | Updated theme: dark blue status bar, edge-to-edge, DayNight base |
| `ic_launcher_background.xml` | Dark blue #0d2353 adaptive icon background |
| `app/build.gradle` | namespace + applicationId = com.ezeeflights.app |
| `AndroidManifest.xml` | Added: Camera, Push, Biometric, Storage permissions + deep-link intent filters |
| `com/ezeeflights/app/MainActivity.java` | NEW — EzeeFlights package, Capacitor BridgeActivity |
| `xml/network_security_config.xml` | NEW — Blocks cleartext in prod, allows HTTP to localhost for dev |

## Phase 2 — Capacitor Config Updated

| File | Change |
|------|--------|
| `assets/capacitor.config.json` | appId: com.ezeeflights.app, SplashScreen dark blue, StatusBar dark blue, Keyboard body-resize |
| `assets/capacitor.plugins.json` | Added Filesystem + Share plugins (was missing) |

## Phase 3 — Frontend Capacitor Integration (New Files)

```
apps/frontend/
├── capacitor.config.ts              ← Root Capacitor config for npx cap sync
├── next.config.js                   ← MODIFIED: conditional static export (CAPACITOR_BUILD=true)
├── package.json                     ← MODIFIED: mobile build scripts + Capacitor deps
└── lib/capacitor/
    ├── index.ts                     ← Barrel export
    ├── platform.ts                  ← isNative(), isAndroid(), isIOS(), getPlatform()
    ├── status-bar.ts               ← configureStatusBar(), setStatusBarBrandColor()
    ├── auth-handler.ts             ← setupCapacitorAuthListener(), setupBackButtonHandler()
    ├── push-notifications.ts       ← registerPushNotifications(), addPushListeners()
    └── biometric.ts                ← authenticateWithBiometric(), saveCredentials()
```

## Phase 4 — Mobile-Native UI
 
 - **`MobileHome.tsx`** (NEW) — A dedicated, app-optimized landing page for Android/iOS users. It features quick search actions, bottom-biased interactivity, and a cleaner header.
 - **`MobileStatusBarSpacer.tsx`** (NEW) — renders `env(safe-area-inset-top)` spacer to push content below the native status bar on iOS/Android
 - **`globals.css`** — Extended with: `pt-safe`, `pl-safe`, `pr-safe`, `mb-safe`, `inset-safe`, `touch-scale`, `touch-target`, `no-select`, `no-overscroll`, `scroll-native`

---

## Phase 5 — Mobile Build Scripts

```bash
npm run build:mobile   # CAPACITOR_BUILD=true next build → outputs to ./out/
npm run cap:sync       # build:mobile + npx cap sync (copies to android/ and ios/)
npm run cap:android    # build + sync + npx cap open android
npm run cap:ios        # build + sync + npx cap open ios
npm run cap:assets     # generate icons & splash screens with EzeeFlights dark blue brand
```

## Phase 6 — iOS Platform Added
 
 The iOS platform has been successfully added to the repository:
 ```bash
 apps/frontend/ios/    # Full Xcode project shell
 ```
 You can open it in Xcode (on a Mac) with:
 ```bash
 npm run cap:ios
 ```

The `android docs/mobile_build_guide.md` now covers both Android and iOS from scratch, including:
- FCM (Firebase Cloud Messaging) push setup
- Supabase OAuth deep-link configuration
- Xcode signing steps
- App Store / TestFlight distribution

---

## Next Steps for You

> [!IMPORTANT]
> **To build the Android APK** — open Android Studio with:
> ```bash
> cd apps/frontend
> npm run cap:android
> ```
> Then: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

> [!IMPORTANT]
> **For push notifications** — download `google-services.json` from Firebase Console (create project "EzeeFlights", package `com.ezeeflights.app`) and place it at `android/app/google-services.json`

> [!TIP]
> **Supabase OAuth on mobile** — add `com.ezeeflights.app://auth/callback` to your Supabase Dashboard → Authentication → URL Configuration → Redirect URLs

> [!NOTE]
> **iOS** — requires a Mac with Xcode. The `ios/` folder will be created automatically when you run `npx cap add ios` on a Mac.
