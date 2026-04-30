import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateCorrelationId, CORRELATION_COOKIE, CORRELATION_HEADER } from "./lib/correlation/correlation-id";

const ACCESS_COOKIE = "ezee_access";

/** Runs on every edge request — no DB or external API calls allowed here. */
export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // ── Correlation ID ──────────────────────────────────────────────────────
  const existing = request.cookies.get(CORRELATION_COOKIE)?.value;
  const correlationId = existing ?? generateCorrelationId();
  const isNewSession = !existing;

  // Inject the correlation ID into forwarded request headers so Server
  // Components can read it via next/headers without an extra cookie parse.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(CORRELATION_HEADER, correlationId);

  // ── Auth guard ──────────────────────────────────────────────────────────
  const needsAuth =
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/users") ||
    pathname.startsWith("/api/v1/user/searches");

  if (needsAuth) {
    const access = request.cookies.get(ACCESS_COOKIE);
    if (!access?.value) {
      // If it's an API request, return 401
      if (pathname.startsWith("/api/")) {
        return NextResponse.json(
          { statusCode: 401, message: "Unauthorized", error: "UNAUTHORIZED" },
          { status: 401 }
        );
      }
      
      // For page requests (like /dashboard), we let the request through
      // but the client component will handle showing the AuthModal.
      // This prevents the hard redirect to /login and provides a better UX.
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
  }

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  // Set cookie on first visit — httpOnly:false so the client-side
  // CorrelationProvider can also read it without a round-trip.
  if (isNewSession) {
    res.cookies.set(CORRELATION_COOKIE, correlationId, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Skip Next.js internals and static assets so the proxy
     * never runs on files that don't need a correlation ID.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|otf)).*)",
  ],
};
