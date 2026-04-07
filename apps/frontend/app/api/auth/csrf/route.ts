import { NextResponse } from 'next/server';
import { cookieBase } from '@/lib/bff/auth-cookies';
import { createCsrfToken, CSRF_COOKIE } from '@/lib/bff/csrf';

export async function GET() {
  const token = createCsrfToken();
  const res = NextResponse.json({ csrfToken: token });
  res.cookies.set(CSRF_COOKIE, token, {
    ...cookieBase(),
    httpOnly: false,
    maxAge: 86400,
  });
  return res;
}
