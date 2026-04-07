import { NextRequest, NextResponse } from 'next/server';
import { applyAuthCookies, cookieBase, PENDING_2FA_COOKIE } from '@/lib/bff/auth-cookies';
import { internalV1Url } from '@/lib/bff/config';
import { validateCsrf } from '@/lib/bff/csrf';

export async function POST(req: NextRequest) {
  const csrf = validateCsrf(req);
  if (csrf) {
    return csrf;
  }

  const pending = req.cookies.get(PENDING_2FA_COOKIE)?.value;
  if (!pending) {
    return NextResponse.json({ message: 'Two-factor challenge not found' }, { status: 401 });
  }

  const bodyJson = (await req.json().catch(() => ({}))) as { code?: string };
  const upstream = await fetch(internalV1Url('auth/2fa/verify-login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pendingToken: pending, code: bodyJson.code ?? '' }),
  });

  const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(PENDING_2FA_COOKIE, '', { ...cookieBase(), maxAge: 0 });
  applyAuthCookies(res, {
    accessToken: data.accessToken as string | undefined,
    refreshToken: data.refreshToken as string | undefined,
    expiresIn: data.expiresIn as string | undefined,
  });
  return res;
}
