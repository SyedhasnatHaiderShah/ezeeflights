import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const CSRF_COOKIE = 'ezee_csrf';
export const CSRF_HEADER = 'x-csrf-token';

export function createCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

export function validateCsrf(req: NextRequest): NextResponse | null {
  const header = req.headers.get(CSRF_HEADER);
  const cookie = req.cookies.get(CSRF_COOKIE)?.value;
  if (!header || !cookie || header !== cookie) {
    return NextResponse.json({ message: 'Invalid or missing CSRF token' }, { status: 403 });
  }
  return null;
}
