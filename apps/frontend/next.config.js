// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const path = require('path');

// ─── Capacitor / Mobile Build Mode ────────────────────────────────────────────
// When building for Android/iOS via `npm run build:mobile`, set CAPACITOR_BUILD=true.
// This switches Next.js to static export mode (output: 'export') which outputs to ./out/
// Capacitor then copies ./out/ into the native shell via `npx cap sync`.
//
// IMPORTANT: Capacitor builds use *.mobile.tsx page/layout files only (see pageExtensions).
// Root shell: app/layout.mobile.tsx | Home: app/page.mobile.tsx → LandingPageClient.tsx
//
// Normal web builds (npm run build) are unaffected and continue to use SSR.
const isProd = process.env.APP_ENV ? process.env.APP_ENV === 'production' : process.env.NODE_ENV === 'production';
const isCapacitorBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig = {
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || (
      isProd
        ? (process.env.NEXT_PUBLIC_SITE_URL_PROD || 'https://www.fareshoppe.com')
        : (process.env.NEXT_PUBLIC_SITE_URL_DEV || 'http://localhost:3000')
    ),
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || (
      isProd
        ? (process.env.NEXT_PUBLIC_API_BASE_URL_PROD || 'https://fareshoppe.com/api')
        : (process.env.NEXT_PUBLIC_API_BASE_URL_DEV || 'http://localhost:4000/api')
    ),
    NEXT_PUBLIC_AFFIRM_PUBLIC_KEY: process.env.NEXT_PUBLIC_AFFIRM_PUBLIC_KEY || 'WCE4XYM8ENAIT5LN',
    NEXT_PUBLIC_AFFIRM_SCRIPT_URL: process.env.NEXT_PUBLIC_AFFIRM_SCRIPT_URL || 'https://cdn1-sandbox.affirm.com/js/v2/affirm.js',
    NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_US: process.env.NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_US || 'T0D5213ZUAIYJMFQ',
    NEXT_PUBLIC_AFFIRM_SCRIPT_URL_US: process.env.NEXT_PUBLIC_AFFIRM_SCRIPT_URL_US || 'https://cdn1.affirm.com/js/v2/affirm.js',
    NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_CA: process.env.NEXT_PUBLIC_AFFIRM_PUBLIC_KEY_CA || 'RY4S0G3DTXUEUOXO',
    NEXT_PUBLIC_AFFIRM_SCRIPT_URL_CA: process.env.NEXT_PUBLIC_AFFIRM_SCRIPT_URL_CA || 'https://cdn1.affirm.ca/js/v2/affirm.js',
  },

  // Enable static export only for mobile/Capacitor builds.
  // API routes (BFF proxy) are marked as force-static individually so Next.js
  // doesn't error — the mobile app calls the backend directly anyway.
  ...(isCapacitorBuild && {
    output: 'export',
    trailingSlash: true,
    distDir: 'out',
    typescript: {
      ignoreBuildErrors: true,
    },
  }),

  // If building for mobile, ONLY look for .mobile.tsx files.
  // This lets us skip 300+ web pages without renaming folders!
  pageExtensions: isCapacitorBuild
    ? ['mobile.tsx', 'mobile.ts', 'mobile.jsx', 'mobile.js']
    : ['tsx', 'ts', 'jsx', 'js'],

  typescript: {
    ignoreBuildErrors: true,
  },
  typedRoutes: false, // disabled to prevent build errors with dynamic paths
  allowedDevOrigins: [
    "localhost:3000",
    "10.0.2.2:3000",
    "192.168.100.4:3000",
    "192.168.100.67:3000"
  ],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.unsplash.com",
      },
    ],
  },
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
  async headers() {
    return [];
  },
};


// Wrap with Sentry only for web/server builds (not static Capacitor export)
if (isCapacitorBuild) {
  module.exports = nextConfig;
} else {
  module.exports = withSentryConfig(nextConfig, {
    // Suppress non-error Sentry CLI output unless running in CI.
    silent: !process.env.CI,
    // Upload a larger set of source maps for prettier stack traces (increases build time).
    widenClientFileUpload: true,
    webpack: {
      // Remove debug logging from the browser bundle to reduce bundle size.
      treeshake: { removeDebugLogging: true },
    },
  });
}

