import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE } from '@/lib/bff/auth-cookies';
import { internalV1Url } from '@/lib/bff/config';

export async function GET(req: NextRequest) {
  const access = req.cookies.get(ACCESS_COOKIE)?.value;
  if (!access) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const upstream = await fetch(internalV1Url('auth/me'), {
    headers: { Authorization: `Bearer ${access}` },
  });

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
