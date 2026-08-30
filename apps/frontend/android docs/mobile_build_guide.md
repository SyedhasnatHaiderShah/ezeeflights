# 📱 EzeeFlights — Complete Web-to-Mobile Conversion & Build Manual
This document provides the complete, end-to-end technical guide for converting the **EzeeFlights** Next.js web application into fully fledged, production-ready **Android** and **iOS** applications using **Capacitor**. 

It details the hybrid architecture, step-by-step setup guides, deep-linking OAuth (Google Auth) integration, push notifications, native UI/UX adaptation, and troubleshooting steps.

---

## 🧭 Table of Contents
1. [Chronological A-to-Z Execution Checklist](#-chronological-a-to-z-execution-checklist)
2. [Core Architecture: How the Web App is Converted](#1-core-architecture-how-the-web-app-is-converted)
3. [Prerequisites & Environment Setup](#2-prerequisites--environment-setup)
4. [The Zero-Touch Next.js Mobile Build Pipeline](#3-the-zero-touch-nextjs-mobile-build-pipeline)
5. [Android Native Shell Implementation (APK/AAB)](#4-android-native-shell-implementation-apkaab)
6. [iOS Native Shell Implementation (IPA)](#5-ios-native-shell-implementation-ipa)
7. [Google & Social Authentication Integration (OAuth)](#6-google--social-authentication-integration-oauth)
8. [Firebase Push Notifications Setup](#7-firebase-push-notifications-setup)
9. [Mobile-Adaptive UI & UX Styling](#8-mobile-adaptive-ui--ux-styling)
10. [Debugging & Troubleshooting Guide](#9-debugging--troubleshooting-guide)
11. [Environment Variables (.env) Configuration](#10-environment-variables-env-configuration)

---

## 🏁 Chronological A-to-Z Execution Checklist

Follow this exact order of operations to convert and build the mobile app:

### Phase 1: Environment & Prerequisites Setup
*   [ ] **Step 1: Install Core Runtimes**
    *   Install Node.js (v18+) and Git.
    *   Install JDK 17 (essential for Android Gradle builds).
*   [ ] **Step 2: Install Android Development Tools**
    *   Download and install [Android Studio](https://developer.android.com/studio).
    *   Set system Environment Variables (`ANDROID_HOME` pointing to your SDK path, and add `platform-tools` and `emulator` to system `PATH`).
*   [ ] **Step 3: Install iOS Development Tools (Mac only)**
    *   Download Xcode from the Mac App Store.
    *   Run `sudo gem install cocoapods` in the Mac terminal.

### Phase 2: Configuration & Asset Preparation
*   [ ] **Step 4: Configure App Environment Variables**
    *   Open `apps/frontend/` and configure your `.env` or `.env.local` file.
    *   Set `NEXT_PUBLIC_API_BASE_URL` to your machine's local IP address (e.g., `http://192.168.100.67:4000/v1`) or the staging/production API.
*   [ ] **Step 5: Prepare Brand Assets**
    *   Place a 1024x1024px `icon.png` and a 2732x2732px `splash.png` inside `apps/frontend/android docs/resources/`.
*   [ ] **Step 6: Configure Firebase for Push Notifications**
    *   Create a project in the Firebase Console.
    *   Add an Android app (`com.ezeeflights.app`), download `google-services.json`, and place it in `apps/frontend/android/app/`.
    *   Add an iOS app (`com.ezeeflights.app`), download `GoogleService-Info.plist`, and place it in the future iOS folder.

### Phase 3: Project Compilation & Native Sync
*   [ ] **Step 7: Install Node Dependencies**
    *   Navigate to `apps/frontend/` in your terminal and run `npm install`.
*   [ ] **Step 8: Generate Android Resources**
    *   Run `npm run cap:assets` to automatically crop and populate all density variants for icons and splash screens.
*   [ ] **Step 9: Initialize Native Folders (One-time Setup)**
    *   Run `npx cap add android` to prepare the Android native code wrapper.
    *   *(Mac Only)* Run `npx cap add ios` to generate the Xcode Workspace workspace.
*   [ ] **Step 10: Compile Next.js & Sync Assets**
    *   Run `npm run cap:sync`. This executes a static compile, applies Next.js patches, and copies HTML/JS assets to the native folders.

### Phase 4: Building & Testing on Devices
*   [ ] **Step 11: Build and Launch the Android App**
    *   Run `npm run cap:android` (or open the `android/` folder in Android Studio).
    *   Verify the project synced successfully with Gradle.
    *   Build a Debug APK (**Build → Build Bundle(s) / APK(s) → Build APK(s)**) and install it on an emulator or a USB-connected phone.
*   [ ] **Step 12: Build and Launch the iOS App (Mac only)**
    *   Run `npm run cap:ios` (or open the project in Xcode).
    *   Configure signing credentials (Apple Developer Account) and enable push capabilities.
    *   Build the archive and test on a device.
*   [ ] **Step 13: Test OAuth (Google Sign-In) & Core Features**
    *   Initiate Google Sign-In inside the app. Ensure the browser overlay launches, logs you in, redirects back using `com.ezeeflights.app://`, and matches the session details.
    *   Debug logs using Chrome DevTools (`chrome://inspect`) or Safari Web Inspector.

---

---

## 1. Core Architecture: How the Web App is Converted

Capacitor bridges the gap between web and native by running your Next.js application inside a highly optimized native **WebView** container (Chromium on Android, WebKit/WKWebView on iOS) and exposing native device APIs (Camera, Biometrics, Push Notifications) via a JavaScript-to-Native bridge.

```
+-------------------------------------------------------------+
|                     EzeeFlights Mobile App                   |
|                                                             |
|   +-----------------------------------------------------+   |
|   |                  Next.js App Layer                  |   |
|   |   (React 19, Tailwind CSS v4, Lucide Icons, etc.)   |   |
|   +-----------------------------------------------------+   |
|                              |                              |
|                  Capacitor JavaScript Bridge                |
|                              |                              |
|   +-----------------------------------------------------+   |
|   |                 Native OS WebView                   |   |
|   |         (Android System WebView / WKWebView)        |   |
|   +-----------------------------------------------------+   |
|            |                                   |            |
|   +--------v--------+                 +--------v--------+   |
|   |   Android App   |                 |     iOS App     |   |
|   |  (Java/Gradle)  |                 |  (Swift/Cocoa)  |   |
|   +-----------------+                 +-----------------+   |
+-------------------------------------------------------------+
```

### The Challenge: Server-Side Rendering (SSR) vs. Native Shells
Standard Next.js apps run on a Node.js server to perform Server-Side Rendering (SSR) and execute Server Actions. Because mobile apps run locally on a device without a local Node.js server, we compile Next.js into a **Static Export** (`output: 'export'`). 

This creates a self-contained bundle of static HTML, CSS, and JS assets in the `out/` directory, which Capacitor copies directly into the native app's asset folders (`assets/public` on Android, `public` on iOS).

### The Solution: Selective Compilation (`pageExtensions`)
Compiling a full-scale web project with hundreds of pages into a static export is difficult because many web pages use server-side routes, cookies, headers, or API proxies. 

EzeeFlights uses a **conditional page-loading mechanism** in [next.config.js](file:///d:/aws/ezeeflights-aws/apps/frontend/next.config.js):
- **Web Builds**: Next.js compiles all normal `*.tsx` files.
- **Mobile Builds** (`CAPACITOR_BUILD=true`): Next.js **only** compiles files ending with `.mobile.tsx` or `.mobile.ts`.

This allows us to isolate our lightweight, native-optimized mobile layout and pages (like `app/layout.mobile.tsx`, `app/page.mobile.tsx`) from the rest of the web app, maintaining a single codebase.

---

## 2. Prerequisites & Environment Setup

Before starting, prepare your development machine.

### Windows & Android Development Setup
1. **Node.js**: Install Node.js LTS (version 18 or 20+).
2. **Java Development Kit (JDK)**: Install **JDK 17** (required by modern Gradle and Android Gradle Plugin).
3. **Android Studio**: Download and install [Android Studio](https://developer.android.com/studio).
   - Open Android Studio, go to **SDK Manager**, and install:
     - Android SDK Platform (API Level 34 or newer)
     - Android SDK Build-Tools
     - Android SDK Command-line Tools
     - Android Emulator (for testing on virtual devices)
4. **Environment Variables**: Add Android SDK variables to your user profile (e.g. `~/.bashrc`, `~/.zshrc`, or Windows Environment Variables):
   - `ANDROID_HOME` = `C:\Users\<Your-Username>\AppData\Local\Android\Sdk`
   - Add `platform-tools` and `emulator` to your system `PATH`:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\emulator`

### macOS & iOS Development Setup (Mac Required)
1. **macOS**: iOS compiling, signing, and exporting require a machine running macOS.
2. **Xcode**: Install Xcode (v15+) from the Mac App Store.
3. **CocoaPods**: Install CocoaPods (used to manage native iOS plugins):
   ```bash
   sudo gem install cocoapods
   ```
4. **Xcode Command Line Tools**: Select active tools in Xcode settings:
   ```bash
   xcode-select --install
   ```

---

## 3. The Zero-Touch Next.js Mobile Build Pipeline

We utilize custom scripts to compile Next.js and safely manage dependencies.

### Key Configuration Files

#### 1. [capacitor.config.ts](file:///d:/aws/ezeeflights-aws/apps/frontend/capacitor.config.ts)
Specifies project settings for the Capacitor CLI:
```typescript
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ezeeflights.app",
  appName: "EzeeFlights",
  webDir: "out", // Points to the static Next.js export folder
  server: {
    androidScheme: "http", // Allows HTTP communication for local backend debugging
    cleartext: true,       // Permits cleartext HTTP traffic in development
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2500,
      launchAutoHide: true,
      backgroundColor: "#0d2353", // EzeeFlights Dark Blue
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0d2353",
    },
    Keyboard: {
      resize: "body",
      style: "DARK",
      resizeOnFullScreen: true,
    }
  }
};
export default config;
```

#### 2. [next.config.js](file:///d:/aws/ezeeflights-aws/apps/frontend/next.config.js)
Handles conditional compilation and skips Dynamic API endpoints during mobile build runs:
```javascript
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig = {
  ...(isCapacitorBuild && {
    output: 'export',
    trailingSlash: true,
    distDir: 'out',
    typescript: { ignoreBuildErrors: true },
  }),

  // Compile only mobile pages when building for mobile platforms
  pageExtensions: isCapacitorBuild
    ? ['mobile.tsx', 'mobile.ts', 'mobile.jsx', 'mobile.js']
    : ['tsx', 'ts', 'jsx', 'js'],

  images: { unoptimized: true } // Static exports cannot use Next.js dynamic image optimization
};
```

### The Build Execution Process
The mobile build pipeline runs as follows:

```bash
cd apps/frontend

# 1. Runs next.config.js with CAPACITOR_BUILD=true
# 2. Generates static assets into apps/frontend/out/
# 3. Copies compiled assets into native Android/iOS project directories
npm run cap:sync
```

#### ⚠️ Essential Recovery Script: `fix-api-routes.js`
Next.js static compilation throws errors if it detects dynamic API paths (`app/api/*`). The build pipeline uses a script [fix-api-routes.js](file:///d:/aws/ezeeflights-aws/apps/frontend/scripts/fix-api-routes.js) to temporarily configure all routes to static before compilation. 

If your build crashes, these routes can remain stuck in static mode, breaking standard web app logins. To recover, run:
```bash
node scripts/fix-api-routes.js --revert
```

---

## 4. Android Native Shell Implementation (APK/AAB)

Android files are located in `apps/frontend/android`.

### Native Configuration Settings

#### 1. [strings.xml](file:///d:/aws/ezeeflights-aws/apps/frontend/android/app/src/main/res/values/strings.xml)
Configures app name, package name, and deep-link schemes:
```xml
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">EzeeFlights</string>
    <string name="package_name">com.ezeeflights.app</string>
    <string name="custom_url_scheme">com.ezeeflights.app</string>
</resources>
```

#### 2. [AndroidManifest.xml](file:///d:/aws/ezeeflights-aws/apps/frontend/android/app/src/main/AndroidManifest.xml)
Defines app permissions and registers the intent filters required to handle Deep Linking:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Required Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true"> <!-- Allowed for local API connections -->

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|layoutDirection|fontScale|screenLayout|density"
            android:name=".MainActivity"
            android:label="@string/app_name"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- Custom URL Scheme for Google Auth / Deep Linking -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="com.ezeeflights.app" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

#### 3. [MainActivity.java](file:///d:/aws/ezeeflights-aws/apps/frontend/android/app/src/main/java/com/ezeeflights/app/MainActivity.java)
Initializes Capacitor and explicitly hooks native plugins into the application lifecycle:
```java
package com.ezeeflights.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Capacitor plugins auto-register on modern versions.
    }
}
```

### Building the Android App
Use these steps to build your Android package.

#### 1. Assets Generation
Add your raw high-resolution branding images to `android docs/resources/`:
- `icon.png` (1024x1024px)
- `splash.png` (2732x2732px, centered logo with dark blue background)

Run the asset tool to crop and generate resource folders automatically:
```bash
npm run cap:assets
```

#### 2. Building a Debug APK (For Local Testing)
Generate a test package to run on your emulator or physical Android phone:
- **Using Android Studio**: Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**.
- **Using Command Line**:
  ```bash
  cd android
  ./gradlew assembleDebug
  ```
- **Output Path**: `android/app/build/outputs/apk/debug/app-debug.apk`

#### 3. Building a Signed Release APK (For Play Store / Distribution)
1. **Generate a Keystore File** (Required to cryptographically sign the package):
   ```bash
   keytool -genkey -v -keystore ezeeflights-release.keystore -alias ezeeflights -keyalg RSA -keysize 2048 -validity 10000
   ```
2. **Compile Release Assets**:
   - In Android Studio, go to **Build** → **Generate Signed Bundle / APK**.
   - Choose **APK** (or **Android App Bundle (AAB)** for Play Store uploads).
   - Target your keystore file and specify passwords.
   - Set Build Type to `release` and click **Finish**.
- **Output Paths**:
  - Signed APK: `android/app/build/outputs/apk/release/app-release.apk`
  - Signed AAB: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 5. iOS Native Shell Implementation (IPA)

iOS configuration folders live under `apps/frontend/ios`.

### Native Configuration Settings

#### 1. Add Platform (Run once on Mac)
```bash
npx cap add ios
```

#### 2. Configure `Info.plist` permissions
Open Xcode, load the `ios/App` project workspace, and verify these configurations are in `App/App/Info.plist`:
```xml
<!-- Custom Descriptions for Apple Privacy Audits -->
<key>NSCameraUsageDescription</key>
<string>EzeeFlights needs camera access to capture passenger profile photos and scan passports.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>EzeeFlights needs photo library access to upload booking documentation.</string>
<key>NSFaceIDUsageDescription</key>
<string>EzeeFlights uses Face ID to securely log in to your account.</string>

<!-- App Scheme for Auth Redirection callbacks -->
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.ezeeflights.app</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.ezeeflights.app</string>
        </array>
    </dict>
</array>
```

### Xcode Configuration & Signing
To run on physical Apple hardware, configure the Xcode Workspace:
1. Open the project in Xcode:
   ```bash
   npx cap open ios
   ```
2. In the left panel, click on the **App** target.
3. Select **Signing & Capabilities** tab.
4. Enable **Automatically manage signing**.
5. Log in with your **Apple Developer ID** and select your Team.
6. Under capabilities, click `+ Capability` and add:
   - **Associated Domains** (e.g. `applinks:ezeeflights.com`)
   - **Push Notifications**

### Building and Exporting the iOS IPA
1. Select target as **Any iOS Device (arm64)** from the device selector.
2. In the Xcode top menu, click **Product** → **Archive**.
3. Once compilation finishes, the Organizer window will open. Click **Distribute App**.
4. Choose **App Store Connect** (for App Store / TestFlight) or **Ad Hoc** (for local device testing).
5. Walk through signing options and export the finished `.ipa` package.

---

## 6. Google & Social Authentication Integration (OAuth)

### The OAuth Redirect Challenge
In standard web apps, OAuth redirects from Google back to `https://domain.com/callback`. However, on native platforms:
- Web cookies might not persist inside the WebView container.
- Navigating away from the app to a web page can break the JavaScript state.
- Google blocks native WebView agents from rendering login pages directly for security reasons.

### The Mobile OAuth Solution
We use the **Capacitor Browser plugin** to launch Google Auth in a native Safari/Chrome overlay, then redirect back to the app using our registered Custom URL scheme (`com.ezeeflights.app://`).

```
[Native App] --(Browser Plugin)--> [System Browser (Google Login)]
                                                  |
[Native App] <--(Deep Link Scheme)-- [Backend Redirect Callback]
```

### Step-by-Step Auth Integration Flow

#### 1. Requesting Authentication in React
Trigger OAuth via the Capacitor Browser plugin, providing the mobile custom redirect URI:
```typescript
import { Browser } from "@capacitor/browser";
import { isNative } from "@/lib/capacitor/platform";

export async function handleGoogleLogin() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.ezeeflights.com";
  
  // Custom redirect targets the deep-link handler in our app
  const redirectUri = isNative() 
    ? "com.ezeeflights.app://auth/callback" 
    : `${window.location.origin}/auth/callback`;

  const authUrl = `${apiBase}/api/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

  if (isNative()) {
    // Open in native system browser overlay
    await Browser.open({ url: authUrl });
  } else {
    // Web redirect
    window.location.href = authUrl;
  }
}
```

#### 2. The Deep-Link Listener in [auth-handler.ts](file:///d:/aws/ezeeflights-aws/apps/frontend/lib/capacitor/auth-handler.ts)
This module runs at the root of the app, intercepting deep links and completing the session exchange:
```typescript
import { isNative } from "./platform";

export async function setupCapacitorAuthListener(
  onSuccess?: () => void,
  onError?: (error: string) => void,
): Promise<void> {
  if (!isNative()) return;

  const { App } = await import("@capacitor/app");
  const { Browser } = await import("@capacitor/browser");

  App.addListener("appUrlOpen", async ({ url }) => {
    // Check if the URL matches our custom deep link scheme
    if (url.startsWith("com.ezeeflights.app://auth/callback")) {
      // Close the native system browser overlay
      await Browser.close();

      try {
        const urlObj = new URL(url.replace("com.ezeeflights.app://", "https://app.ezeeflights.com/"));
        const code = urlObj.searchParams.get("code");

        if (!code) {
          onError?.("Auth code not found in deep link parameters");
          return;
        }

        // POST code to the backend to exchange for session cookies/tokens
        const response = await fetch("https://api.ezeeflights.com/api/auth/oauth/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });

        if (response.ok) {
          onSuccess?.();
        } else {
          onError?.("Failed to establish auth session with backend");
        }
      } catch (err) {
        onError?.(err instanceof Error ? err.message : "Exchange failed");
      }
    }
  });
}
```

#### 3. Backend Cors & Redirect Whitelisting
To allow native app communication, update your backend's API middleware/CORS configuration to trust these native app schemes:
```json
{
  "allowed_origins": [
    "https://www.ezeeflights.com",
    "http://localhost",
    "capacitor://localhost"
  ],
  "allowed_redirect_uris": [
    "https://www.ezeeflights.com/auth/callback",
    "com.ezeeflights.app://auth/callback"
  ]
}
```

---

## 7. Firebase Push Notifications Setup

Capacitor accesses **Firebase Cloud Messaging (FCM)** for Android and **Apple Push Notification Service (APNs)** for iOS.

### Android Setup
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Create a project named **EzeeFlights** and add an Android app using package ID `com.ezeeflights.app`.
3. Download `google-services.json` and save it to:
   `apps/frontend/android/app/google-services.json`.
4. Open `apps/frontend/android/build.gradle` and add:
   ```gradle
   dependencies {
       classpath 'com.google.gms:google-services:4.4.0'
   }
   ```
5. Open `apps/frontend/android/app/build.gradle` and apply the plugin at the bottom:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

### iOS Setup
1. Add an iOS app to your Firebase project using the bundle ID `com.ezeeflights.app`.
2. Download `GoogleService-Info.plist` and drag it into your Xcode project under `App/App`.
3. Set up APNs authentication keys inside the Apple Developer Portal and upload them to Firebase under **Project Settings** → **Cloud Messaging** → **APNs Certificates**.

### React Native Push Notification Logic
Use this hook inside your main layout page to request permissions and listen for notifications:
```typescript
import { useEffect } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { isNative } from "@/lib/capacitor/platform";

export function usePushNotifications() {
  useEffect(() => {
    if (!isNative()) return;

    // 1. Request OS Permission
    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === "granted") {
        // Register with Apple/Google push services
        PushNotifications.register();
      }
    });

    // 2. Obtain Token for backend uploads
    PushNotifications.addListener("registration", (token) => {
      console.log("FCM/APNS Native Token:", token.value);
      // Send token.value to backend to associate with logged-in user
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.error("Push Registration Error:", err);
    });

    // 3. Listen for Incoming Notifications
    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("Foreground notification received:", notification);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      console.log("Notification clicked in tray:", action.notification);
      // Redirect user inside the app based on notification data payload
    });

    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);
}
```

---

## 8. Mobile-Adaptive UI & UX Styling

Web designs must be adapted for mobile screen edges and interactions.

### 1. Handling Device Insets & Safe Areas (Notched Screens)
iOS and Android devices use screen cutouts and bottom gesture bars. If page layouts do not account for safe area insets, headers and footers can overlap status and navigation bars.

#### Safe Area CSS Setup
Add this to your global style definitions ([globals.css](file:///d:/aws/ezeeflights-aws/apps/frontend/styles/globals.css)):
```css
:root {
  /* Set safe area fallback values */
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
}

.pb-safe {
  padding-bottom: calc(1rem + var(--safe-area-inset-bottom));
}

.pt-safe {
  padding-top: calc(1rem + var(--safe-area-inset-top));
}
```

#### Safe Area Status Bar Spacer
Add a dynamic spacer component to push headers below the native system status bar:
```tsx
import { isNative } from "@/lib/capacitor/platform";

export function MobileStatusBarSpacer() {
  if (!isNative()) return null;
  return <div className="h-[var(--safe-area-inset-top)] w-full bg-ezee-dark-blue" />;
}
```
Render `<MobileStatusBarSpacer />` as the first element in [layout.mobile.tsx](file:///d:/aws/ezeeflights-aws/apps/frontend/app/layout.mobile.tsx).

---

### 2. Native Physical Back-Button Listener (Android)
To prevent the app from immediately exiting when Android users hit the physical back button, implement a back handler in React:
```typescript
import { useEffect } from "react";
import { App } from "@capacitor/app";
import { useRouter, usePathname } from "next/navigation";

export function useAndroidBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initBackHandler = async () => {
      await App.addListener("backButton", ({ canGoBack }) => {
        if (pathname === "/" || pathname === "/home") {
          // Minimize the app if on the home screen
          App.minimizeApp();
        } else if (canGoBack) {
          router.back();
        } else {
          router.push("/");
        }
      });
    };

    initBackHandler();
    return () => {
      App.removeAllListeners();
    };
  }, [pathname, router]);
}
```

---

## 9. Debugging & Troubleshooting Guide

### 1. White Screen on Startup
- **Root Cause**: The static export references absolute file links (e.g. `<script src="/_next/static/js/main.js">`), which fail when loaded via local file schemes (`file://` or `capacitor://localhost`).
- **Fix**: Check `next.config.js`. Ensure `trailingSlash: true` is configured and that `assetPrefix` is not overriding paths. Run `npm run cap:sync` again.

---

### 2. Next.js Compile Error: "Dynamic Server Usage"
- **Root Cause**: Next.js tried to pre-render dynamic routes containing headers, search parameters, or cookies during static compilation.
- **Fix**: Ensure your api routes and pages are wrapped in Suspense or marked as `force-static`. Check that [fix-api-routes.js](file:///d:/aws/ezeeflights-aws/apps/frontend/scripts/fix-api-routes.js) has run successfully.

---

### 3. API Requests Fail on Device (CORS or Network Error)
- **Root Cause**: The mobile app runs under `http://localhost` (iOS) or `http://localhost` / custom scheme (Android), which triggers CORS blocks on the backend API.
- **Fix**: 
  - Ensure the backend allows `capacitor://localhost` and `http://localhost` origins.
  - Verify `androidScheme: "http"` is in `capacitor.config.ts` for local API debugging.
  - For production, use secure `https` endpoints for all native API queries.

---

### 4. Logging & Inspecting the Webview
Use native browser tools to debug the running mobile app.

#### Android Debugging
1. Connect your phone via USB and enable **USB Debugging** in Developer Options.
2. Run `npm run cap:android` to start the app.
3. Open **Google Chrome** and navigate to `chrome://inspect`.
4. Locate your device and click **Inspect** to open Developer Tools, view console logs, and debug network requests.

#### iOS Debugging
1. Enable **Developer Mode** on your physical iPhone (Settings → Privacy & Security).
2. Open the app in Xcode, build, and run it on your device or simulator.
3. Open **Safari** on your Mac, go to **Develop** in the menu bar, select your device, and choose the EzeeFlights application process to inspect.

---

## 10. Environment Variables (.env) Configuration

### How Env Variables Work on Native Mobile
Because your Capacitor mobile app runs as a statically compiled bundle directly from the device's storage (without a Node.js server), **environment variables cannot be read dynamically at runtime**. 

Instead, all variables must be **baked into the JavaScript bundle at build time** when running `npm run build:mobile`.

### Rule 1: Use `NEXT_PUBLIC_` Prefix
Only environment variables prefixed with `NEXT_PUBLIC_` will be included in the client-side JavaScript code. Any variable without this prefix (such as `OPENAI_API_KEY` or `INTERNAL_API_BASE_URL`) will evaluate to `undefined` inside the mobile app.

### Rule 2: Point to the Correct API IP Address (Local Dev)
When testing on a physical phone or simulator:
- **Do NOT use `localhost` or `127.0.0.1`** in `NEXT_PUBLIC_API_BASE_URL`. Inside the mobile device or emulator, `localhost` refers to the mobile device itself, not your computer running the backend.
- You must use your computer's **Local Wi-Fi Network IP Address** (e.g. `http://192.168.1.15:4000/v1`) or a public staging API URL.

### Setting Up the Env File

Create or update the `.env.local` or `.env` file in `apps/frontend/` before building the app:

```env
# ─── Production / Staging API (Required for Mobile)
# Point this to your live API or your development machine's local IP address
NEXT_PUBLIC_API_BASE_URL=https://api.ezeeflights.com/v1
# For local testing (Example):
# NEXT_PUBLIC_API_BASE_URL=http://192.168.1.20:4000/v1

# ─── Client-Side Maps & Geolocation
NEXT_PUBLIC_MAP_PROVIDER=mapbox
NEXT_PUBLIC_IPWHO_KEY=your_ipwho_key_here

# ─── BNPL (Buy Now Pay Later) Keys
NEXT_PUBLIC_AFFIRM_PUBLIC_KEY=your_affirm_key_here
NEXT_PUBLIC_AFFIRM_SCRIPT_URL=https://cdn1-sandbox.affirm.com/js/v2/affirm.js
```

### Steps to Apply Env Changes to the App:
Whenever you change a variable in your `.env` or `.env.local` file, you must rebuild the static export and sync it with Capacitor for the changes to take effect:

1. Update `.env` or `.env.local` with the new values.
2. Run `npm run cap:sync` to rebuild Next.js and update assets.
3. Re-run or re-build the app via Android Studio / Xcode.

