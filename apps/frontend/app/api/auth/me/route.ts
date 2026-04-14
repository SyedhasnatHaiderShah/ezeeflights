import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE, applyAuthCookies } from '@/lib/bff/auth-cookies';
import { internalV1Url } from '@/lib/bff/config';

export async function GET(req: NextRequest) {
  let access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  // 1. Helper to fetch me from upstream
  const fetchMe = async (token: string) => {
    return fetch(internalV1Url('auth/me'), {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  let upstream = access ? await fetchMe(access) : null;

  // 2. If unauthorized or no access token, try refresh
  if ((!upstream || upstream.status === 401) && refresh) {
    try {
      const refreshResponse = await fetch(internalV1Url('auth/refresh-token'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        access = refreshData.accessToken;
        
        // Retry fetch me with new token
        if (access) {
          upstream = await fetchMe(access);
          
          // If successful, we'll need to update the cookies in our final response
          const text = await upstream.text();
          const res = new NextResponse(text, {
            status: upstream.status,
            headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
          });
          
          applyAuthCookies(res, refreshData);
          return res;
        }
      }
    } catch (error) {
      console.error('Auto-refresh failed in /api/auth/me:', error);
    }
  }

  // 3. Fallback handle if refresh not needed or failed
  if (!upstream) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
