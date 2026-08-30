import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  applyAuthCookies,
  clearAuthCookies,
  cookieBase,
  parseExpiresInSeconds,
} from "@/lib/bff/auth-cookies";
import { internalApiOrigin, internalV1Url } from "@/lib/bff/config";
import { validateCsrf } from "@/lib/bff/csrf";
import { CORRELATION_HEADER } from "@/lib/correlation/correlation-id";

// Next.js 16: params is now a Promise — must be awaited.
type RouteContext = { params: Promise<{ path?: string[] }> };

function buildUpstreamUrl(
  pathSegments: string[] | undefined,
  search: string,
): string {
  const base = internalApiOrigin();
  const suffix = pathSegments?.length ? pathSegments.join("/") : "";
  return `${base}/api/${suffix}${search}`;
}

/**
 * Attempts a silent token refresh using the refresh cookie.
 * Returns the new access token if successful, null otherwise.
 */
async function silentRefresh(req: NextRequest): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string;
} | null> {
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  if (!refresh) {
    return null;
  }

  try {
    const refreshResponse = await fetch(internalV1Url("auth/refresh-token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refresh }),
    });

    if (!refreshResponse.ok) {
      return null;
    }

    const data = await refreshResponse.json();
    if (!data.accessToken) {
      return null;
    }

    return data;
  } catch {
    console.error("[PROXY] silentRefresh: exception while refreshing");
    return null;
  }
}

async function proxy(
  req: NextRequest,
  method: string,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  const startMs = Date.now();
  const { path: pathSegments } = await ctx.params;
  const pathStr = pathSegments ? `/${pathSegments.join("/")}` : "/";
  const url = buildUpstreamUrl(pathSegments, req.nextUrl.search);
  
  // Log request start
  console.log(`[PROXY START] ${method} ${pathStr}${req.nextUrl.search || ""}`);

  const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  if (mutating) {
    const err = validateCsrf(req);
    if (err) {
      console.warn(`[PROXY CSRF BLOCKED] ${method} ${pathStr} in ${Date.now() - startMs}ms`);
      return err;
    }
  }

  // Read the body once (streams can only be consumed once)
  let body: ArrayBuffer | undefined;
  if (mutating || method === "POST" || method === "PUT" || method === "PATCH") {
    body = await req.arrayBuffer();
  }

  const correlationId = req.headers.get(CORRELATION_HEADER);

  const buildHeaders = (
    accessToken: string | undefined,
  ): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    const ct = req.headers.get("content-type");
    if (ct) {
      headers["Content-Type"] = ct;
    }
    if (correlationId) {
      headers[CORRELATION_HEADER] = correlationId;
    }
    const acceptLanguage = req.headers.get("accept-language");
    if (acceptLanguage) {
      headers["Accept-Language"] = acceptLanguage;
    }
    const clientCountry = req.headers.get("x-client-country");
    if (clientCountry) {
      headers["X-Client-Country"] = clientCountry;
    }
    const xff = req.headers.get("x-forwarded-for");
    const xRealIp = req.headers.get("x-real-ip");
    if (xff) {
      headers["X-Forwarded-For"] = xff;
    } else if (xRealIp) {
      headers["X-Forwarded-For"] = xRealIp;
    }
    // Forward API key header (case-insensitive — clients may send X-Api-Key, x-api-key, X-API-KEY)
    const xApiKey =
      req.headers.get("x-api-key") ??
      req.headers.get("X-Api-Key") ??
      req.headers.get("X-API-KEY");
    if (xApiKey) {
      headers["X-Api-Key"] = xApiKey;
    }
    return headers;
  };

  let access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  try {
    // ── First attempt ────────────────────────────────────────────────────────
    let upstream = await fetch(url, {
      method,
      headers: buildHeaders(access),
      body: body && body.byteLength > 0 ? Buffer.from(body) : undefined,
      redirect: "manual",
    });

    // ── Silent refresh on 401 ────────────────────────────────────────────────
    let refreshedTokens: {
      accessToken: string;
      refreshToken?: string;
      expiresIn?: string;
    } | null = null;

    if (upstream.status === 401) {
      refreshedTokens = await silentRefresh(req);

      if (refreshedTokens) {
        access = refreshedTokens.accessToken;

        // Retry with the fresh token
        upstream = await fetch(url, {
          method,
          headers: buildHeaders(access),
          body: body && body.byteLength > 0 ? Buffer.from(body) : undefined,
          redirect: "manual",
        });
      } else {
        const hasRefresh = req.cookies.has(REFRESH_COOKIE);
        const responseHeaders: Record<string, string> = {};
        if (hasRefresh || req.cookies.has(ACCESS_COOKIE)) {
          responseHeaders["x-auth-required"] = "true";
        }
        const expired = NextResponse.json(
          {
            message: "Session expired. Please sign in again.",
            code: "SESSION_EXPIRED",
          },
          { status: 401, headers: responseHeaders },
        );
        clearAuthCookies(expired, req);
        console.warn(`[PROXY SESSION EXPIRED] ${method} ${pathStr} -> 401 in ${Date.now() - startMs}ms`);
        return expired;
      }
    }

    // ── Build response ───────────────────────────────────────────────────────
    const outHeaders = new Headers();
    const oct = upstream.headers.get("content-type");
    if (oct) {
      outHeaders.set("Content-Type", oct);
    }
    const echoed = upstream.headers.get(CORRELATION_HEADER);
    if (echoed) {
      outHeaders.set(CORRELATION_HEADER, echoed);
    } else if (correlationId) {
      outHeaders.set(CORRELATION_HEADER, correlationId);
    }

    // Forward Location header for redirects
    if (upstream.status >= 300 && upstream.status < 400) {
      const loc = upstream.headers.get("location");
      if (loc) {
        outHeaders.set("Location", loc);
      }
    }

    // Add CORS headers to the response
    const origin = req.headers.get("origin") ?? "*";
    outHeaders.set("Access-Control-Allow-Origin", origin);
    outHeaders.set("Access-Control-Allow-Credentials", "true");

    const res = new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: outHeaders,
    });

    // If we refreshed, set the new cookies so the browser stays logged in
    if (refreshedTokens) {
      applyAuthCookies(res, refreshedTokens, req);
    }

    console.log(`[PROXY SUCCESS] ${method} ${pathStr} -> ${upstream.status} in ${Date.now() - startMs}ms`);
    return res;
  } catch (err: any) {
    const duration = Date.now() - startMs;
    console.error(`[PROXY ERROR] ${method} ${pathStr} -> failed in ${duration}ms:`, err.stack || err.message || err);
    throw err; // Next.js will catch this and send a 500, logging the stack trace
  }
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxy(req, "GET", ctx);
}

export async function HEAD(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxy(req, "HEAD", ctx);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxy(req, "POST", ctx);
}

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxy(req, "PUT", ctx);
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxy(req, "PATCH", ctx);
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxy(req, "DELETE", ctx);
}

export function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "*";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers":
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
    },
  });
}
