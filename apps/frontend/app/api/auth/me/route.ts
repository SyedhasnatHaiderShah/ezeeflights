import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  applyAuthCookies,
  clearAuthCookies,
} from "@/lib/bff/auth-cookies";
import { internalV1Url } from "@/lib/bff/config";

export async function GET(req: NextRequest) {
  const reqId = `auth-me-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  let access = req.cookies.get(ACCESS_COOKIE)?.value;
  const refresh = req.cookies.get(REFRESH_COOKIE)?.value;

  /*
  console.log(`[${reqId}] [BFF auth/me] Incoming request`, {
    hostname: req.nextUrl.hostname,
    hasAccessCookie: Boolean(access),
    accessLength: access ? access.length : 0,
    hasRefreshCookie: Boolean(refresh),
    refreshLength: refresh ? refresh.length : 0,
    allCookies: Array.from(req.cookies.getAll()).map((c) => c.name),
  });
  */

  // 1. Helper to fetch me from upstream
  const fetchMe = async (token: string) => {
    return fetch(internalV1Url("auth/me"), {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  let upstream = access ? await fetchMe(access) : null;
  /*
  console.log(
    `[${reqId}] [BFF auth/me] Upstream auth/me status:`,
    upstream ? upstream.status : "N/A",
  );
  */

  // 2. If unauthorized or no access token, try refresh
  if ((!upstream || upstream.status === 401) && refresh) {
    try {
      const refreshResponse = await fetch(internalV1Url("auth/refresh-token"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            headers: {
              "Content-Type":
                upstream.headers.get("content-type") ?? "application/json",
              "Access-Control-Allow-Origin": req.headers.get("origin") ?? "*",
              "Access-Control-Allow-Credentials": "true",
            },
          });

          applyAuthCookies(res, refreshData, req);

          return res;
        }
      }
    } catch (error) {
      console.error(`[${reqId}] [BFF auth/me] Auto-refresh exception`, error);
    }
  }

  // 3. Fallback handle if refresh not needed or failed
  if (!upstream) {
    const res = NextResponse.json(
      { message: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": req.headers.get("origin") ?? "*",
          "Access-Control-Allow-Credentials": "true",
        },
      },
    );
    clearAuthCookies(res, req);
    return res;
  }

  const text = await upstream.text();

  const res = new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type":
        upstream.headers.get("content-type") ?? "application/json",
      "Access-Control-Allow-Origin": req.headers.get("origin") ?? "*",
      "Access-Control-Allow-Credentials": "true",
    },
  });

  if (upstream.status === 401) {
    res.headers.set("x-auth-required", "true");
    clearAuthCookies(res, req);
  }

  return res;
}

export function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "*";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET,OPTIONS,PATCH,DELETE,POST,PUT",
      "Access-Control-Allow-Headers":
        "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization",
    },
  });
}
