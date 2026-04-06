import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ACCESS_COOKIE = 'ezee_access';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const needsAuth = pathname.startsWith('/dashboard') || pathname.startsWith('/users');
  if (!needsAuth) {
    return NextResponse.next();
  }
  const access = request.cookies.get(ACCESS_COOKIE);
  if (!access?.value) {
    const login = new URL('/login', request.url);
    login.searchParams.set('next', pathname);
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/users/:path*'],
};
