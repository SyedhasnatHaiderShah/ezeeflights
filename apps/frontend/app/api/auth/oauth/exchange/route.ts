import { NextRequest, NextResponse } from 'next/server';
import {
  applyAuthCookies,
  cookieBase,
  PENDING_2FA_COOKIE,
} from '@/lib/bff/auth-cookies';
import { internalV1Url } from '@/lib/bff/config';
import { validateCsrf } from '@/lib/bff/csrf';

export async function POST(req: NextRequest) {
  const csrf = validateCsrf(req);
  if (csrf) {
    return csrf;
  }

  const body = await req.text();
  const upstream = await fetch(internalV1Url('auth/oauth/exchange'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  if (data.requiresTwoFactor && typeof data.pendingToken === 'string') {
    const res = NextResponse.json({ requiresTwoFactor: true });
    res.cookies.set(PENDING_2FA_COOKIE, data.pendingToken, {
      ...cookieBase(),
      maxAge: 300,
    });
    return res;
  }

  const res = NextResponse.json({ ok: true });
  applyAuthCookies(res, {
    accessToken: data.accessToken as string | undefined,
    refreshToken: data.refreshToken as string | undefined,
    expiresIn: data.expiresIn as string | undefined,
  });
  return res;
}
