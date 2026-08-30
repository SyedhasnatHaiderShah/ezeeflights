import { NextResponse } from "next/server";

export const ACCESS_COOKIE = "ezee_access";
export const REFRESH_COOKIE = "ezee_refresh";
export const PENDING_2FA_COOKIE = "ezee_2fa_pending";

export function cookieBase(reqOrHost?: any) {
  let finalHostname: string | undefined = undefined;

  if (reqOrHost) {
    if (typeof reqOrHost === "string") {
      finalHostname = reqOrHost;
    } else if (reqOrHost && typeof reqOrHost === "object") {
      // It's a NextRequest or Request
      try {
        const hostHeader =
          reqOrHost.headers?.get("x-forwarded-host") ||
          reqOrHost.headers?.get("host");
        if (hostHeader) {
          finalHostname = hostHeader.split(":")[0];
        } else if (reqOrHost.nextUrl?.hostname) {
          finalHostname = reqOrHost.nextUrl.hostname;
        }
      } catch (e) {
        console.error("[cookieBase] Error parsing request object:", e);
      }
    }
  }

  if (!finalHostname && typeof window === "undefined") {
    try {
      const { headers } = require("next/headers");
      const h = headers();
      if (h && typeof h.get === "function") {
        const host = h.get("x-forwarded-host") || h.get("host");
        if (host) {
          finalHostname = host.split(":")[0];
        }
      } else if (h && typeof h.then === "function") {
        // Next.js 15 async headers promise - cannot await sync but log it
        console.warn(
          "[cookieBase] next/headers is a Promise in this environment; hostname should be passed explicitly.",
        );
      }
    } catch (e) {
      // next/headers might not be available in all contexts (e.g. middleware)
    }
  }

  // Fallback to env site URL
  if (!finalHostname && process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      finalHostname = new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname;
      console.log(
        "[cookieBase] Fallback hostname from NEXT_PUBLIC_SITE_URL:",
        finalHostname,
      );
    } catch (e) {
      console.error("[cookieBase] Failed to parse fallback hostname:", e);
    }
  }

  let domain: string | undefined = undefined;
  if (finalHostname) {
    try {
      const parts = finalHostname.split(".");
      // Check if it's a valid domain and not localhost/IP
      if (
        parts.length >= 2 &&
        !finalHostname.includes("localhost") &&
        !finalHostname.includes("127.0.0.1") &&
        !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(finalHostname)
      ) {
        const isDoubleSuffix =
          parts.length >= 3 &&
          ["co", "com", "org", "net", "gov", "edu"].includes(
            parts[parts.length - 2],
          );
        const sliceCount = isDoubleSuffix ? -3 : -2;
        domain = "." + parts.slice(sliceCount).join(".");
      }
    } catch (e) {
      console.error("Error parsing site domain for cookies", e);
    }
  }

  const isProd = process.env.NODE_ENV === "production";
  const isLocalhost = finalHostname
    ? finalHostname.includes("localhost") || finalHostname.includes("127.0.0.1")
    : false;

  const result = {
    path: "/" as const,
    domain,
    sameSite: "lax" as const,
    secure: isProd ? !isLocalhost : false,
    httpOnly: true as const,
  };
  // console.log('[cookieBase] Resolved cookie config:', {
  //   finalHostname,
  //   isProd,
  //   isLocalhost,
  //   domain,
  //   secure: result.secure,
  // });
  return result;
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
  if (u === "s") {
    return n;
  }
  if (u === "m") {
    return n * 60;
  }
  if (u === "h") {
    return n * 3600;
  }
  if (u === "d") {
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

export function applyAuthCookies(
  res: NextResponse,
  data: TokenPayload,
  reqOrHost?: any,
): void {
  const base = cookieBase(reqOrHost);
  console.log("[applyAuthCookies] Setting cookies with base options:", {
    reqOrHost: reqOrHost
      ? typeof reqOrHost === "string"
        ? reqOrHost
        : "[Request]"
      : undefined,
    base,
    hasAccessToken: Boolean(data.accessToken),
    hasRefreshToken: Boolean(data.refreshToken),
    expiresIn: data.expiresIn,
  });
  if (data.accessToken) {
    const maxAge = parseExpiresInSeconds(data.expiresIn);
    res.cookies.set(ACCESS_COOKIE, data.accessToken, {
      ...base,
      maxAge,
    });
    console.log(
      `[applyAuthCookies] Set ${ACCESS_COOKIE} cookie, maxAge=${maxAge}`,
    );
  }
  if (data.refreshToken) {
    const days = Number(process.env.JWT_REFRESH_DAYS ?? "14");
    const maxAge = (Number.isFinite(days) && days > 0 ? days : 14) * 86400;
    res.cookies.set(REFRESH_COOKIE, data.refreshToken, {
      ...base,
      maxAge,
    });
    console.log(
      `[applyAuthCookies] Set ${REFRESH_COOKIE} cookie, maxAge=${maxAge}`,
    );
  }
}

export function clearAuthCookies(res: NextResponse, reqOrHost?: any): void {
  const base = cookieBase(reqOrHost);
  res.cookies.set(ACCESS_COOKIE, "", { ...base, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, "", { ...base, maxAge: 0 });
  res.cookies.set(PENDING_2FA_COOKIE, "", { ...base, maxAge: 0 });
}
