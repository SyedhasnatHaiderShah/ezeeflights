# EzeeFlights Android & iOS App — Complete Implementation Plan

## Background

The frontend (`apps/frontend`) is a **Next.js 16** app with a rich design system (Tailwind CSS v4, Noto Sans font, HSL CSS variables for light/dark mode, Radix UI primitives). The EzeeFlights brand colors are:

- **Primary red**: `#c52a28` (`redmix`)
- **Dark blue**: `#0d2353` / `#304cb2`
- **Yellow accent**: `#ffbf27`

The goal is to provide a premium, native-feeling mobile experience for **EzeeFlights** using the same Next.js frontend codebase via Capacitor's WebView bridge. We have implemented a dedicated `MobileHome` screen that is automatically served when running inside the native shell.

> **Architecture**: Capacitor wraps the **built Next.js web app** (static export) inside a native WebView. The `android/` folder contains the native shell; the web content is copied into `android/app/src/main/assets/public/` on every `npx cap sync`.

---

## User Review Required

> [!IMPORTANT]
> **Key Decision**: The Next.js app currently uses **server-side features** (`headers()`, API routes, Sentry middleware). For Capacitor to work, Next.js must be built as a **static export** (`output: 'export'` in `next.config.js`). This means:
>
> - All `app/api/` routes will NOT be available in the mobile build — the app must call your **backend API directly**.
> - `headers()`, `cookies()` server actions, and Sentry server instrumentation will not work in the static export.
> - We will create a **separate Capacitor-specific build** so the web app is unaffected.

> [!WARNING]
> **iOS Build Requirement**: Building the iOS `.ipa` requires a **Mac with Xcode**. The `ios/` folder can be set up on Windows but cannot be compiled/run without a Mac. The plan includes setting up the ios/ folder structure so it's ready when you have Mac access.

> [!IMPORTANT]
> **App Identity**: The app is fully branded as `com.ezeeflights.app` / "EzeeFlights". All legacy "Rentolic" references have been removed.

---

## Open Questions

> [!IMPORTANT]
>
> 1. **API Base URL**: What is the production backend API URL the mobile app should call directly? (e.g., `https://api.ezeeflights.com`) — needed for the Capacitor config.
> 2. **Supabase Auth on Mobile**: The web app uses Supabase for auth. Supabase deep-link OAuth callbacks (Google, Apple sign-in) need custom URL scheme registration in the app. Should we support social login in the mobile app?
> 3. **Static Export Compatibility**: Are there any pages that rely heavily on server components / API routes you want to keep working in mobile? We'll need to audit and convert these.

---

## Proposed Changes

### Phase 1 — App Identity & Branding (Android Native Shell)

---

#### [MODIFY] [strings.xml](file:///d:/syed%20hasnat/ezeeflights-aws/apps/frontend/android/app/src/main/res/values/strings.xml)

Rename app identity from Rentolic → EzeeFlights and update package name.

```xml
<!-- BEFORE -->
<string name="app_name">Rentolic</string>
<string name="package_name">com.rentolic.app</string>
<string name="custom_url_scheme">com.rentolic.app</string>

<!-- AFTER -->
<string name="app_name">EzeeFlights</string>
<string name="package_name">com.ezeeflights.app</string>
<string name="custom_url_scheme">com.ezeeflights.app</string>
```

#### [MODIFY] [styles.xml](file:///d:/syed%20hasnat/ezeeflights-aws/apps/frontend/android/app/src/main/res/values/styles.xml)

Update splash screen background and status bar to use EzeeFlights dark blue (`#0d2353`). Add Material3 theme and edge-to-edge support.

#### [MODIFY] [app/build.gradle](file:///d:/syed%20hasnat/ezeeflights-aws/apps/frontend/android/app/build.gradle)

- Change `namespace` and `applicationId` from `com.rentolic.app` → `com.ezeeflights.app`
- Add `versionName "1.0"` and set `versionCode` correctly
- Add `google-services` plugin block for Push Notifications (FCM)

#### [MODIFY] [AndroidManifest.xml](file:///d:/syed%20hasnat/ezeeflights-aws/apps/frontend/android/app/src/main/AndroidManifest.xml)

- Add permissions: `CAMERA`, `VIBRATE`, `RECEIVE_BOOT_COMPLETED`, `POST_NOTIFICATIONS`
- Register deep-link intent filter for Supabase auth callback (`ezeeflights://`)
- Configure `android:windowSoftInputMode` for proper keyboard handling
- Enable `android:usesCleartextTraffic="true"` for dev server access

#### [MODIFY] [MainActivity.java](file:///d:/syed%20hasnat/ezeeflights-aws/apps/frontend/android/app/src/main/java/com/rentolic/app/MainActivity.java)

- Move to new package `com.ezeeflights.app`
- Register all Capacitor plugins explicitly (Camera, PushNotifications, Device, NativeBiometric, Filesystem, Share)

**File rename required**: Move from `com/rentolic/app/` → `com/ezeeflights/app/`

#### [NEW] `android/app/src/main/res/values/colors.xml`

Define EzeeFlights brand colors for native splash and status bar:

```xml
<color name="colorPrimary">#0d2353</color>   <!-- EzeeFlights dark blue -->
<color name="colorPrimaryDark">#0d2353</color>
<color name="colorAccent">#c52a28</color>      <!-- EzeeFlights red -->
<color name="splash_background">#0d2353</color>
```

#### [NEW] `android/app/src/main/res/drawable/splash.xml`

Branded splash screen drawable with EzeeFlights dark blue background + centered logo vector.

---

### Phase 2 — Capacitor Configuration

---

#### [MODIFY] `android/app/src/main/assets/capacitor.config.json`

```json
{
  "appId": "com.ezeeflights.app",
  "appName": "EzeeFlights",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2500,
      "backgroundColor": "#0d2353",
      "androidSplashResourceName": "splash",
      "showSpinner": false
    },
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    },
    "StatusBar": {
      "style": "DARK",
      "backgroundColor": "#0d2353"
    },
    "Keyboard": {
      "resize": "body",
      "style": "DARK"
    }
  }
}
```

#### [MODIFY] `android/app/src/main/assets/capacitor.plugins.json`

Add all plugins used by the EzeeFlights app:

- `@capacitor/camera`
- `@capacitor/device`
- `@capacitor/push-notifications`
- `@capacitor/filesystem`
- `@capacitor/share`
- `capacitor-native-biometric`

---

### Phase 3 — Next.js Static Export for Capacitor

---

#### [NEW] `apps/frontend/capacitor.config.ts`

Root-level Capacitor config for `npx cap sync`:

```typescript
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ezeeflights.app",
  appName: "EzeeFlights",
  webDir: "out", // Next.js static export output
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: { launchShowDuration: 2500, backgroundColor: "#0d2353" },
    StatusBar: { style: "DARK", backgroundColor: "#0d2353" },
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
  },
};
export default config;
```

#### [MODIFY] `apps/frontend/next.config.js`

Add a **conditional static export mode** triggered by env variable `CAPACITOR_BUILD=true`:

```js
const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

const nextConfig = {
  ...(isCapacitorBuild && { output: "export" }),
  // ... rest of config
};
```

#### [NEW] Environment Variable Two-Layered Solution

To handle API URLs correctly during mobile app building without hardcoding, the project uses a two-layered environment variable strategy.

**1. Define environment-specific variables in `.env`:**
```env
# --- Development Case ---
NEXT_PUBLIC_API_BASE_URL_DEV=http://localhost:4000/v1

# --- Production Case ---
NEXT_PUBLIC_API_BASE_URL_PROD=https://ezeeflights.online/api/v1
```

**2. Dynamically resolve in `next.config.js` based on `APP_ENV`:**
```javascript
const isProd = process.env.APP_ENV === 'production' || process.env.NODE_ENV === 'production';

const nextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || (
      isProd
        ? (process.env.NEXT_PUBLIC_API_BASE_URL_PROD || 'https://ezeeflights.online/api/v1')
        : (process.env.NEXT_PUBLIC_API_BASE_URL_DEV || 'http://localhost:4000/v1')
    )
  }
  // ...
}
```

This allows building the production APK directly by passing `APP_ENV=production` without needing to modify the local `.env` file before every build.

#### [NEW] `apps/frontend/package.json` — add scripts

```json
"build:mobile": "CAPACITOR_BUILD=true next build",
"cap:sync": "npm run build:mobile && npx cap sync",
"cap:android": "npm run cap:sync && npx cap open android",
"cap:ios": "npm run cap:sync && npx cap open ios"
```

#### [NEW] `apps/frontend/lib/capacitor/platform.ts`

Utility to detect if running inside Capacitor:

```typescript
import { Capacitor } from "@capacitor/core";

export const isNative = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform(); // 'android' | 'ios' | 'web'
export const isAndroid = () => Capacitor.getPlatform() === "android";
export const isIOS = () => Capacitor.getPlatform() === "ios";
```

#### [NEW] `apps/frontend/lib/capacitor/auth-handler.ts`

Handle Supabase auth deep-link callbacks in Capacitor (OAuth redirect handling):

```typescript
// Listens for the custom scheme ezeeflights:// deep link
// and completes the Supabase OAuth session
import { App } from "@capacitor/app";

export function setupCapacitorAuthListener(supabase) {
  App.addListener("appUrlOpen", async ({ url }) => {
    if (url.startsWith("com.ezeeflights.app://")) {
      await supabase.auth.exchangeCodeForSession(url);
    }
  });
}
```

#### [NEW] `apps/frontend/lib/capacitor/push-notifications.ts`

Push notification registration and handling:

```typescript
import { PushNotifications } from '@capacitor/push-notifications';

export async function registerPushNotifications() { ... }
export async function addPushListeners() { ... }
```

#### [NEW] `apps/frontend/lib/capacitor/status-bar.ts`

Status bar and safe area management for mobile:

```typescript
import { StatusBar, Style } from "@capacitor/status-bar";
import { isNative } from "./platform";

export async function configureStatusBar(theme: "light" | "dark") {
  if (!isNative()) return;
  await StatusBar.setStyle({
    style: theme === "dark" ? Style.Dark : Style.Light,
  });
  await StatusBar.setBackgroundColor({
    color: theme === "dark" ? "#0d2353" : "#ffffff",
  });
}
```

---

### Phase 4 — Mobile-Adaptive UI

The web app already has `MobileBottomNav` and responsive layouts. We need to add:

---

#### [MODIFY] `apps/frontend/components/sections/MobileBottomNav.tsx`

- Add safe area inset padding (already has `.pb-safe` class — ensure it uses `env(safe-area-inset-bottom)`)
- Add platform detection to apply native-feel tap feedback
- Ensure all nav items have `hide-tap-highlight` class

#### [NEW] `apps/frontend/components/shared/MobileStatusBarSpacer.tsx`

A component that adds top padding equal to the device status bar height when running in Capacitor:

```tsx
// Renders a div with height matching native status bar on iOS/Android
// Uses CSS env(safe-area-inset-top)
```

#### [MODIFY] `apps/frontend/app/layout.tsx`

- Import and initialize Capacitor platform detection
- Add `MobileStatusBarSpacer` at the top of the layout
- Set up push notification listeners on native
- Call `configureStatusBar` based on current theme
- Call `setupCapacitorAuthListener` for OAuth deep links

#### [MODIFY] `apps/frontend/app/auth/layout.tsx`

- On native platforms, handle the back button via `App.addListener('backButton', ...)`

---

### Phase 5 — Static Export Compatibility Audit

Pages that use server-only APIs must be made client-side compatible:

| Page                               | Issue                          | Fix                                        |
| ---------------------------------- | ------------------------------ | ------------------------------------------ |
| `app/layout.tsx`                   | `headers()` for correlation ID | Guard with `typeof window === 'undefined'` |
| `app/api/*` routes                 | Not available in static export | Mobile app calls backend directly          |
| Sentry server instrumentation      | `instrumentation.ts`           | Conditionally skip in Capacitor build      |
| Auth callback `app/auth/callback/` | Needs server redirect          | Convert to client-side callback handler    |

---

### Phase 6 — iOS Folder Setup

---

#### [NEW] `apps/frontend/ios/` — full Xcode project structure

Generated via `npx cap add ios` (requires running this command after installing `@capacitor/ios`). Key files to configure:

- `ios/App/App/Info.plist` — app permissions, URL schemes, display name
- `ios/App/App/AppDelegate.swift` — Capacitor initialization + deep link handling
- `ios/App/capacitor.config.json` — same as android version

**iOS-specific configurations**:

- `NSCameraUsageDescription` — "EzeeFlights needs camera access to upload profile photos"
- `NSPhotoLibraryUsageDescription` — "EzeeFlights needs photo library access"
- `NSFaceIDUsageDescription` — "EzeeFlights uses Face ID for secure login"
- URL scheme: `com.ezeeflights.app` for OAuth callbacks

---

### Phase 7 — App Icons & Splash Screens

---

#### [NEW] `apps/frontend/android docs/resources/`

Place `icon.png` (1024×1024) and `splash.png` (2732×2732) with EzeeFlights branding. Run `@capacitor/assets` to auto-generate all density variants.

**Script to add to package.json**:

```json
"cap:assets": "npx @capacitor/assets generate --iconBackgroundColor '#0d2353' --splashBackgroundColor '#0d2353'"
```

---

### Phase 8 — Production vs. Development API Routing (Two-Layered Solution)

To handle the difference between local testing on emulators and production installs on physical devices, the app implements a **two-layered API URL resolution solution**.

#### 1. Build-Time Configuration (The Standard Way)

Use environment-specific build scripts in `package.json` to hardcode the correct API URLs into the compiled static assets.

- **Development (Emulator):** Run `npm run cap:sync` or `npm run cap:android`. This compiles the assets using development variables (`http://10.0.2.2:3000`).
- **Production (Physical Device/Signed APK):** Run `npm run cap:sync:prod` or `npm run cap:android:prod`. This sets `APP_ENV=production` in the environment, instructing Next.js to use `https://ezeeflights.online` as the API base URL.

#### 2. Runtime Safety Net (Auto-Detection Fallback)

If a developer builds a manual APK using the default dev configurations and installs it on a real physical device, the compiled address `10.0.2.2` will fail to connect.
To prevent this, the code in [lib/bff/config.ts](file:///d:/aws/ezeeflights-aws/apps/frontend/lib/bff/config.ts) dynamically checks the device type using `@capacitor/device`:

```typescript
import { Device } from "@capacitor/device";

// On native startup, query if running on emulator vs physical device:
const info = await Device.getInfo();
const isVirtual = info.isVirtual;

// In nextApiOrigin():
if (isAndroid() && !isVirtual) {
  // If running on a physical Android phone, automatically force the production URL!
  return "https://ezeeflights.online";
}
```

In [providers.tsx](file:///d:/aws/ezeeflights-aws/apps/frontend/components/shared/providers.tsx), the app defers mounting client components and running initial fetches (like CSRF tokens) until this device check finishes. This ensures all API calls throughout the app immediately route to the correct origin.

---

## File Change Summary

| File                                                              | Action | Description                |
| ----------------------------------------------------------------- | ------ | -------------------------- |
| `android/app/src/main/res/values/strings.xml`                     | MODIFY | Rename to EzeeFlights      |
| `android/app/src/main/res/values/styles.xml`                      | MODIFY | EzeeFlights brand theme    |
| `android/app/src/main/res/values/colors.xml`                      | NEW    | Brand color palette        |
| `android/app/src/main/res/drawable/splash.xml`                    | NEW    | Branded splash drawable    |
| `android/app/build.gradle`                                        | MODIFY | New app ID, permissions    |
| `android/app/src/main/AndroidManifest.xml`                        | MODIFY | Permissions + deep links   |
| `android/app/src/main/java/com/ezeeflights/app/MainActivity.java` | NEW    | Replace rentolic package   |
| `android/app/src/main/assets/capacitor.config.json`               | MODIFY | EzeeFlights config         |
| `android/app/src/main/assets/capacitor.plugins.json`              | MODIFY | All plugins                |
| `apps/frontend/capacitor.config.ts`                               | NEW    | Root Capacitor config      |
| `apps/frontend/next.config.js`                                    | MODIFY | Conditional static export  |
| `apps/frontend/package.json`                                      | MODIFY | Mobile build scripts       |
| `apps/frontend/lib/capacitor/platform.ts`                         | NEW    | Platform detection util    |
| `apps/frontend/lib/capacitor/auth-handler.ts`                     | NEW    | Deep link auth handler     |
| `apps/frontend/lib/capacitor/push-notifications.ts`               | NEW    | Push notification setup    |
| `apps/frontend/lib/capacitor/status-bar.ts`                       | NEW    | Status bar management      |
| `apps/frontend/components/shared/MobileStatusBarSpacer.tsx`       | NEW    | Safe area spacer           |
| `apps/frontend/app/layout.tsx`                                    | MODIFY | Capacitor init + safe area |
| `apps/frontend/app/auth/layout.tsx`                               | MODIFY | Back button handler        |
| `apps/frontend/ios/`                                              | NEW    | Full iOS Xcode project     |

---

## Verification Plan

### Automated Tests

- Run `npm run build:mobile` to verify static export compiles without errors
- Run `npx cap sync android` to verify assets copy correctly

### Manual Verification

1. **Android**:
   - Open `android/` in Android Studio
   - Gradle sync completes successfully
   - App name shows "EzeeFlights" (not "Rentolic")
   - Splash screen uses dark blue brand color
   - All pages load correctly in the WebView
   - Bottom nav tap targets work correctly
   - Auth login/register flow works
   - Push notification permission prompt appears

2. **iOS** (requires Mac):
   - Run `npx cap open ios`
   - App bundle ID is `com.ezeeflights.app`
   - Signing configured for your Apple team
   - Face ID biometric prompt uses correct description
   - Safe area insets applied correctly on notched devices

---

## Troubleshooting: Web Auth / Google Auth Broken After Mobile Build

When you run `npm run cap:android` or `npm run cap:ios`, the build script `fix-api-routes.js` temporarily converts your API routes (`route.ts`) to `force-static` to allow Capacitor static export.

Normally, the script automatically reverts these routes to `force-dynamic` after the build completes. However, if the build **fails** (e.g., due to name collisions or compilation errors), the process exits early and leaves the API routes frozen in static mode. This will break Google Auth, standard login, and `/api/auth/me` on your web app.

### How to Fix / Restore Web Auth:

If your Next.js auth is broken or returning cached `401` or `{ ok: true }` responses, run this manual restoration command inside `apps/frontend`:

```bash
node scripts/fix-api-routes.js --revert
```

This will strip out the temporary static blocks and immediately restore dynamic web API routes.

---

## Build Commands (Quick Reference)

```bash
# One-time setup
cd apps/frontend
npm install

# Build web + sync to Android
npm run cap:sync

# Open in Android Studio
npm run cap:android

# Generate app icons (requires icon.png + splash.png in android docs/resources/)
npm run cap:assets

# iOS (Mac only)
npm run cap:ios
```

# note

## If your mobile build fails, simply run this command manually in the apps/frontend directory to restore your web app's dynamic API routing:

```bash
node scripts/fix-api-routes.js --revert
```

## (Now that the Windows line-ending regex bug is fixed, this command will instantly restore the files back to dynamic).

---

## Google Play Store: Versioning, Releasing Updates & Fast Testing

### 1. App Versioning (`versionCode` vs `versionName`)
Every time you build and upload a new `.aab` (Android App Bundle) to Google Play Console, Google requires you to increase the internal build number.

Open `apps/frontend/android/app/build.gradle`:
```groovy
defaultConfig {
    applicationId "com.ezeeflights.app"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 1          // MUST INCREMENT for every new upload (1 -> 2 -> 3 -> 4...)
    versionName "1.0.0"    // User-visible version string (e.g. "1.0.1", "1.1.0")
}
```

* **`versionCode`** (Integer): An internal counter used by the Play Store. It must always be strictly greater than the previous upload. If you upload a bundle with the same `versionCode`, Google Play will reject it.
* **`versionName`** (String): The version text displayed to users on the Google Play Store page.

---

### 2. How to Upload App Updates (Multiple Times)
You can update and deploy new releases as often as you want (daily, weekly, or whenever you make bug fixes):

1. **Update the code** in your Next.js project.
2. **Increment `versionCode`** (and optionally `versionName`) in `apps/frontend/android/app/build.gradle`.
3. **Compile the Production Mobile Build**:
   ```bash
   cd apps/frontend
   npm run build:mobile:prod
   npx cap sync android
   ```
4. **Build the Signed `.aab` in Android Studio**:
   * Open Android Studio: `npx cap open android`
   * Go to **Build** → **Generate Signed Bundle / APK...**
   * Select **Android App Bundle (`.aab`)**
   * Choose your Keystore and enter your signing passwords
   * Select **Release** build variant and click **Finish**.
5. **Upload the new `.aab` in Google Play Console**:
   * Navigate to your desired track (**Internal testing**, **Closed testing**, or **Production**).
   * Click **Create new release** at the top right.
   * Upload the new `.aab` file.
   * Add your release notes (e.g., *"Bug fixes, payment improvements, and faster flight search"*).
   * Click **Next** → **Save and Roll out**.
6. **Automatic Updates for Users**:
   * Devices with the app installed will automatically receive the update through the Google Play Store.

---

### 3. Fast Testing Strategies & Timelines

| Testing Track | Review / Availability Time | Requirements | Purpose |
| :--- | :--- | :--- | :--- |
| **Internal Testing** | **10 – 30 Minutes** ⚡ | Up to 100 email testers | Instant distribution to clients/team. Bypasses long reviews and the 14-day clock. |
| **Closed Testing** | **1 – 3 Days review** + **14 Days testing** | 12 testers opted-in for 14 consecutive days | Mandatory requirement for new personal developer accounts to unlock public Production access. |
| **Production** | **1 – 3 Days review** | Unlocked after Closed Testing | Publicly indexed and searchable by all users on Google Play worldwide. |

#### Fast Client Demo Workflow (Before August 31):
1. Upload your `.aab` to **Internal Testing** first.
2. Add your client's email address under the **Testers** tab.
3. Share the Google Play internal test link with the client.
4. They can download and test the app directly from the Google Play Store on their phone in under 30 minutes!
5. In parallel, promote the build to **Closed Testing** to begin the mandatory 14-day countdown for public search indexing.

