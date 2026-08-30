import { NextRequest, NextResponse } from "next/server";
import {
  applyAuthCookies,
  cookieBase,
  PENDING_2FA_COOKIE,
} from "@/lib/bff/auth-cookies";
import { internalV1Url } from "@/lib/bff/config";

export async function GET(req: NextRequest) {
  const reqId = `oauth-callback-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  console.log(`[${reqId}] [BFF oauth/callback] Incoming callback`, {
    url: req.url,
    hasCode: Boolean(code),
    codeLength: code?.length ?? 0,
    error,
    hasRedirectBackCookie: Boolean(req.cookies.get("oauth_redirect_back")?.value),
  });

  const fallbackRedirect = "/";
  let redirectUrl = fallbackRedirect;

  // Read saved redirect path from cookie
  const savedPathCookie = req.cookies.get("oauth_redirect_back");
  if (savedPathCookie?.value) {
    redirectUrl = decodeURIComponent(savedPathCookie.value);
  }

  const base = new URL(redirectUrl, req.nextUrl.origin);

  if (error || !code) {
    console.warn(`[${reqId}] [BFF oauth/callback] Missing code or provider error`, {
      error,
      hasCode: Boolean(code),
    });
    base.searchParams.set("auth_error", error || "missing_code");
    const response = NextResponse.redirect(base.toString());
    response.cookies.delete("oauth_redirect_back");
    return response;
  }

  try {
    const upstream = await fetch(internalV1Url("auth/oauth/exchange"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    const data = (await upstream.json().catch(() => ({}))) as Record<
      string,
      unknown
    >;
    console.log(`[${reqId}] [BFF oauth/callback] Upstream exchange response`, {
      status: upstream.status,
      ok: upstream.ok,
      keys: Object.keys(data),
      hasAccessToken: typeof data.accessToken === "string",
      hasRefreshToken: typeof data.refreshToken === "string",
      hasExpiresIn: typeof data.expiresIn === "string",
      requiresTwoFactor: Boolean(data.requiresTwoFactor),
    });

    if (!upstream.ok) {
      console.warn(`[${reqId}] [BFF oauth/callback] Exchange failed`, data);
      base.searchParams.set("auth_error", "exchange_failed");
      const response = NextResponse.redirect(base.toString());
      response.cookies.delete("oauth_redirect_back");
      return response;
    }

    if (data.requiresTwoFactor && typeof data.pendingToken === "string") {
      const response = NextResponse.redirect(
        new URL("/2fa", req.nextUrl.origin).toString(),
      );
      response.cookies.set(PENDING_2FA_COOKIE, data.pendingToken, {
        ...cookieBase(req),
        maxAge: 300,
      });
      console.log(`[${reqId}] [BFF oauth/callback] 2FA pending cookie set`);
      response.cookies.delete("oauth_redirect_back");
      return response;
    }

    // Auth succeeded! Redirect back to the destination
    const response = NextResponse.redirect(base.toString());
    applyAuthCookies(response, {
      accessToken: data.accessToken as string | undefined,
      refreshToken: data.refreshToken as string | undefined,
      expiresIn: data.expiresIn as string | undefined,
    }, req);
    console.log(`[${reqId}] [BFF oauth/callback] Auth cookies applied and redirecting`, {
      redirectTo: base.toString(),
      accessTokenLength:
        typeof data.accessToken === "string" ? data.accessToken.length : 0,
      refreshTokenLength:
        typeof data.refreshToken === "string" ? data.refreshToken.length : 0,
    });
    response.cookies.delete("oauth_redirect_back");
    return response;
  } catch (err) {
    console.error(`[${reqId}] [BFF oauth/callback] Unexpected error`, err);
    base.searchParams.set("auth_error", "server_error");
    const response = NextResponse.redirect(base.toString());
    response.cookies.delete("oauth_redirect_back");
    return response;
  }
}
