// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  allowedDevOrigins: ["192.168.100.67"],
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
};

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
