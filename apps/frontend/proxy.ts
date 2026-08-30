import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  generateCorrelationId,
  CORRELATION_COOKIE,
  CORRELATION_HEADER,
} from "./lib/correlation/correlation-id";
import { ACCESS_COOKIE, clearAuthCookies } from "./lib/bff/auth-cookies";

function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/api/user/searches")
  );
}

function isMissingAccessToken(request: NextRequest): boolean {
  const access = request.cookies.get(ACCESS_COOKIE);
  return !access?.value || access.value === "undefined" || access.value === "";
}

function applyNoStoreHeaders(res: NextResponse): void {
  res.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
}

function requestHeadersWithCorrelation(
  request: NextRequest,
  correlationId: string,
): Headers {
  const headers = new Headers(request.headers);
  headers.set(CORRELATION_HEADER, correlationId);
  return headers;
}

/**
 * Edge proxy — keep this fast: no DB or external API calls.
 * Unprotected /api/* routes are excluded from the matcher and never run this.
 * Dev timings (~200ms) include Turbopack edge cold start; production is typically <10ms.
 */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get("origin");

  // ── Normalize API paths for external metasearch crawlers ──────────────────
  // On Linux (production) Next.js routing is case-sensitive.
  // Also normalise the common typo: /api/flight/... → /api/flights/...
  // Both fixes are applied together in one rewrite to avoid two round-trips.
  if (pathname.startsWith("/api/")) {
    let normalised = pathname.toLowerCase();
    // Fix singular /api/flight/ → plural /api/flights/
    normalised = normalised.replace(/^\/api\/flight\//, "/api/flights/");

    if (normalised !== pathname) {
      const url = request.nextUrl.clone();
      url.pathname = normalised;
      console.log(
        `[Proxy Rewrite] ${pathname} → ${url.pathname}${request.nextUrl.search}`,
      );
      return NextResponse.rewrite(url);
    }
  }

  // Fast exit for BFF/API traffic (matcher should skip these; safety net)
  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/user/searches")
  ) {
    // Handle preflight OPTIONS request
    if (request.method === "OPTIONS") {
      const response = new NextResponse(null, { status: 204 });
      if (origin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
      } else {
        response.headers.set("Access-Control-Allow-Origin", "*");
      }
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,DELETE,OPTIONS,PATCH",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, x-csrf-token, x-requested-with, accept, accept-version, content-length, content-md5, date, x-api-version",
      );
      return response;
    }

    const response = NextResponse.next();
    if (origin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    } else {
      response.headers.set("Access-Control-Allow-Origin", "*");
    }
    response.headers.set("Access-Control-Allow-Credentials", "true");
    return response;
  }

  const needsAuth = isProtectedPath(pathname);

  // Auth guard first — fail fast before correlation / header cloning
  if (needsAuth && isMissingAccessToken(request)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { statusCode: 401, message: "Unauthorized", error: "UNAUTHORIZED" },
        { status: 401 },
      );
    }

    const redirectUrl = new URL("/", request.nextUrl.origin);
    redirectUrl.searchParams.set("auth", "login");
    redirectUrl.searchParams.set("reason", "session_expired");
    const res = NextResponse.redirect(redirectUrl, {
      status: 302,
    });
    clearAuthCookies(res, request.nextUrl.hostname);
    return res;
  }

  const existingCorrelation = request.cookies.get(CORRELATION_COOKIE)?.value;

  // Returning visitor: cookie is enough for Server Components (see api-client resolveCorrelationId)
  if (existingCorrelation) {
    const res = NextResponse.next();
    if (needsAuth) applyNoStoreHeaders(res);
    return res;
  }

  // New session: inject header for first SSR + set cookie for client/API
  const correlationId = generateCorrelationId();
  const res = NextResponse.next({
    request: { headers: requestHeadersWithCorrelation(request, correlationId) },
  });

  if (needsAuth) applyNoStoreHeaders(res);

  res.cookies.set(CORRELATION_COOKIE, correlationId, {
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard",
    "/users/:path*",
    "/api/:path*",
    /*
     * Page navigations only — exclude static assets, fonts.
     * Client api-client attaches x-correlation-id from cookie for API calls.
     */
    "/((?!_next/static|_next/image|_next/webpack-hmr|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf)).*)",
  ],
};
