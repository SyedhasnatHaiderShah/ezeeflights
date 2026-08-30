import { NextRequest, NextResponse } from "next/server";
import { internalV1Url } from "@/lib/bff/config";
import { validateCsrf } from "@/lib/bff/csrf";
import { applyAuthCookies, cookieBase, PENDING_2FA_COOKIE } from "@/lib/bff/auth-cookies";

const corsHeaders = (req: NextRequest) => ({
  "Access-Control-Allow-Origin": req.headers.get("origin") || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-csrf-token",
  "Access-Control-Allow-Credentials": "true",
});

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function POST(req: NextRequest) {
  const csrf = validateCsrf(req);
  if (csrf) return csrf;

  const body = await req.text();
  const upstream = await fetch(internalV1Url("auth/google/native"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status, headers: corsHeaders(req) });
  }

  if (data.requiresTwoFactor && typeof data.pendingToken === "string") {
    const res = NextResponse.json({ requiresTwoFactor: true }, { headers: corsHeaders(req) });
    res.cookies.set(PENDING_2FA_COOKIE, data.pendingToken, {
      ...cookieBase(req),
      maxAge: 300,
    });
    return res;
  }

  const res = NextResponse.json({ ok: true }, { headers: corsHeaders(req) });
  applyAuthCookies(res, {
    accessToken: data.accessToken as string | undefined,
    refreshToken: data.refreshToken as string | undefined,
    expiresIn: data.expiresIn as string | undefined,
  }, req);
  return res;
}
