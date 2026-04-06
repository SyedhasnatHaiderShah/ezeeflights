import { NextRequest, NextResponse } from 'next/server';
import { applyAuthCookies, REFRESH_COOKIE } from '@/lib/bff/auth-cookies';
import { internalV1Url } from '@/lib/bff/config';
import { validateCsrf } from '@/lib/bff/csrf';

export async function POST(req: NextRequest) {
  const csrf = validateCsrf(req);
  if (csrf) {
    return csrf;
  }

  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  const upstream = await fetch(internalV1Url('auth/refresh-token'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(refresh ? { refreshToken: refresh } : {}),
  });

  const data = (await upstream.json().catch(() => ({}))) as Record<string, unknown>;

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  const res = NextResponse.json({ ok: true });
  applyAuthCookies(res, {
    accessToken: data.accessToken as string | undefined,
    refreshToken: data.refreshToken as string | undefined,
    expiresIn: data.expiresIn as string | undefined,
  });
  return res;
}
