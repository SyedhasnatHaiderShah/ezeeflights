import { NextResponse } from 'next/server';

export const ACCESS_COOKIE = 'ezee_access';
export const REFRESH_COOKIE = 'ezee_refresh';
export const PENDING_2FA_COOKIE = 'ezee_2fa_pending';

export function cookieBase() {
  return {
    path: '/' as const,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true as const,
  };
}

export function parseExpiresInSeconds(expiresIn: string | undefined): number {
  if (!expiresIn) {
    return 900;
  }
  const m = expiresIn.match(/^(\d+)([smhd])$/i);
  if (!m) {
    return 900;
  }
  const n = parseInt(m[1], 10);
  const u = m[2].toLowerCase();
  if (u === 's') {
    return n;
  }
  if (u === 'm') {
    return n * 60;
  }
  if (u === 'h') {
    return n * 3600;
  }
  if (u === 'd') {
    return n * 86400;
  }
  return 900;
}

interface TokenPayload {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: string;
  tokenType?: string;
}

export function applyAuthCookies(res: NextResponse, data: TokenPayload): void {
  if (data.accessToken) {
    res.cookies.set(ACCESS_COOKIE, data.accessToken, {
      ...cookieBase(),
      maxAge: parseExpiresInSeconds(data.expiresIn),
    });
  }
  if (data.refreshToken) {
    const days = Number(process.env.JWT_REFRESH_DAYS ?? '14');
    const maxAge = (Number.isFinite(days) && days > 0 ? days : 14) * 86400;
    res.cookies.set(REFRESH_COOKIE, data.refreshToken, {
      ...cookieBase(),
      maxAge,
    });
  }
}

export function clearAuthCookies(res: NextResponse): void {
  const base = cookieBase();
  res.cookies.set(ACCESS_COOKIE, '', { ...base, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, '', { ...base, maxAge: 0 });
  res.cookies.set(PENDING_2FA_COOKIE, '', { ...base, maxAge: 0 });
}
