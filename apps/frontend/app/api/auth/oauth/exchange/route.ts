
import { NextRequest, NextResponse } from "next/server";

import {
  applyAuthCookies,
  cookieBase,
  PENDING_2FA_COOKIE,
} from "@/lib/bff/auth-cookies";
import { internalV1Url } from "@/lib/bff/config";
import { validateCsrf } from "@/lib/bff/csrf";

export async function POST(req: NextRequest) {
  const reqId = `oauth-exchange-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  console.log(`[${reqId}] [BFF oauth/exchange] Incoming request`, {
    method: req.method,
    url: req.url,
    origin: req.headers.get("origin"),
    referer: req.headers.get("referer"),
    hasCsrfHeader: Boolean(req.headers.get("x-csrf-token")),
    hasAccessCookie: Boolean(req.cookies.get("ezee_access")?.value),
    hasRefreshCookie: Boolean(req.cookies.get("ezee_refresh")?.value),
  });

  const csrf = validateCsrf(req);
  if (csrf) {
    console.warn(`[${reqId}] [BFF oauth/exchange] CSRF validation failed`);
    return csrf;
  }

  const body = await req.text();
  console.log(`[${reqId}] [BFF oauth/exchange] Request body received`, {
    bodyLength: body.length,
    bodyPreview: body.slice(0, 120),
  });

  const upstream = await fetch(internalV1Url("auth/oauth/exchange"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = (await upstream.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  console.log(`[${reqId}] [BFF oauth/exchange] Upstream response`, {
    status: upstream.status,
    ok: upstream.ok,
    keys: Object.keys(data),
    hasAccessToken: typeof data.accessToken === "string",
    hasRefreshToken: typeof data.refreshToken === "string",
    hasExpiresIn: typeof data.expiresIn === "string",
    requiresTwoFactor: Boolean(data.requiresTwoFactor),
  });

  if (!upstream.ok) {
    console.warn(`[${reqId}] [BFF oauth/exchange] Upstream returned error`, data);
    return NextResponse.json(data, { status: upstream.status });
  }

  if (data.requiresTwoFactor && typeof data.pendingToken === "string") {
    const res = NextResponse.json({ requiresTwoFactor: true });
    res.cookies.set(PENDING_2FA_COOKIE, data.pendingToken, {
      ...cookieBase(req),
      maxAge: 300,
    });
    console.log(`[${reqId}] [BFF oauth/exchange] 2FA pending cookie set`);
    return res;
  }

  const res = NextResponse.json({ ok: true });
  applyAuthCookies(res, {
    accessToken: data.accessToken as string | undefined,
    refreshToken: data.refreshToken as string | undefined,
    expiresIn: data.expiresIn as string | undefined,
  }, req);
  console.log(`[${reqId}] [BFF oauth/exchange] Auth cookies applied`, {
    accessTokenLength:
      typeof data.accessToken === "string" ? data.accessToken.length : 0,
    refreshTokenLength:
      typeof data.refreshToken === "string" ? data.refreshToken.length : 0,
    expiresIn:
      typeof data.expiresIn === "string" ? data.expiresIn : undefined,
  });
  return res;
}
