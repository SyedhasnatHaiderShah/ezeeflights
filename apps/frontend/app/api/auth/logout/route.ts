import { NextRequest, NextResponse } from 'next/server';
import { clearAuthCookies, REFRESH_COOKIE } from '@/lib/bff/auth-cookies';
import { internalV1Url } from '@/lib/bff/config';
import { validateCsrf } from '@/lib/bff/csrf';

export async function POST(req: NextRequest) {
  const csrf = validateCsrf(req);
  if (csrf) {
    return csrf;
  }

  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;
  const upstream = await fetch(internalV1Url('auth/logout'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(refresh ? { refreshToken: refresh } : {}),
  });

  await upstream.json().catch(() => ({}));

  const res = NextResponse.json({ ok: true });
  clearAuthCookies(res);
  return res;
}
