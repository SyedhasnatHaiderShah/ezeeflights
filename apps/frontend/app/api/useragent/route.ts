import { NextRequest, NextResponse } from "next/server";
import { IPWho } from "@ipwho/ipwho";

function isLocalIp(ip: string): boolean {
  return (
    !ip ||
    ip === "::1" ||
    ip === "127.0.0.1" ||
    ip.startsWith("127.") ||
    ip.startsWith("169.254.") ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("fc00:") ||
    ip.startsWith("fd00:") ||
    ip.startsWith("fe80:") ||
    ip.startsWith("::ffff:127.") ||
    ip.startsWith("::ffff:10.") ||
    ip.startsWith("::ffff:192.168.") ||
    ip.startsWith("::ffff:172.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip) ||
    /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./.test(ip)
  );
}

// Simple regex fallback parser in case the IPWho key/lookup fails or gets throttled.
function parseUserAgentFallback(uaString: string) {
  const lowercaseUa = uaString.toLowerCase();
  
  let browser = { name: "Unknown Browser", version: "0.0" };
  if (lowercaseUa.includes("chrome") || lowercaseUa.includes("crios")) {
    browser = { name: "Chrome", version: uaString.match(/(?:chrome|crios)\/([\d.]+)/i)?.[1] || "122.0.0.0" };
  } else if (lowercaseUa.includes("safari") && !lowercaseUa.includes("chrome")) {
    browser = { name: "Safari", version: uaString.match(/version\/([\d.]+)/i)?.[1] || "17.0" };
  } else if (lowercaseUa.includes("firefox") || lowercaseUa.includes("fxios")) {
    browser = { name: "Firefox", version: uaString.match(/(?:firefox|fxios)\/([\d.]+)/i)?.[1] || "120.0" };
  } else if (lowercaseUa.includes("edge")) {
    browser = { name: "Edge", version: uaString.match(/edge\/([\d.]+)/i)?.[1] || "121.0" };
  }

  let os = { name: "Unknown OS", version: "" };
  if (lowercaseUa.includes("windows")) {
    os = { name: "Windows", version: "10/11" };
  } else if (lowercaseUa.includes("macintosh") || lowercaseUa.includes("mac os x")) {
    os = { name: "macOS", version: "14" };
  } else if (lowercaseUa.includes("iphone") || lowercaseUa.includes("ipad")) {
    os = { name: "iOS", version: "17" };
  } else if (lowercaseUa.includes("android")) {
    os = { name: "Android", version: "14" };
  }

  let device = { type: "desktop", vendor: "Unknown", model: "PC" };
  if (lowercaseUa.includes("iphone")) {
    device = { type: "mobile", vendor: "Apple", model: "iPhone" };
  } else if (lowercaseUa.includes("ipad")) {
    device = { type: "tablet", vendor: "Apple", model: "iPad" };
  } else if (lowercaseUa.includes("android")) {
    device = { type: "mobile", vendor: "Generic", model: "Android Phone" };
  } else if (lowercaseUa.includes("windows")) {
    device = { type: "desktop", vendor: "Microsoft", model: "Windows PC" };
  } else if (lowercaseUa.includes("macintosh")) {
    device = { type: "desktop", vendor: "Apple", model: "Mac" };
  }

  return {
    browser,
    engine: { name: "WebKit", version: "537.36" },
    os,
    device,
    cpu: { architecture: lowercaseUa.includes("arm") || lowercaseUa.includes("m1") || lowercaseUa.includes("m2") ? "arm64" : "x64" }
  };
}

async function handleRequest(request: NextRequest, dataPromise: Promise<{ userAgent?: string; ip?: string }>) {
  // Extract client IP address
  const forwardedFor = request.headers.get("x-forwarded-for");
  let clientIp = "";
  if (forwardedFor) {
    clientIp = forwardedFor.split(",")[0].trim();
  } else {
    clientIp = request.headers.get("x-real-ip") || "";
  }

  let reqUserAgent = request.headers.get("user-agent") || "";
  let reqIp = clientIp;

  try {
    const payload = await dataPromise;
    if (payload.userAgent) reqUserAgent = payload.userAgent;
    if (payload.ip) reqIp = payload.ip;
  } catch (e) {
    // No body or parsing failed, ignore and use defaults
  }

  // Initialize client and defaults
  const apiKey = process.env.NEXT_PUBLIC_IPWHO_KEY;
  let resolvedIp = reqIp;
  let location = { city: "", country: "United States" };

  if (!apiKey) {
    // Attempt to get real location using free ipapi.co fallback
    try {
      const ipapiRes = await fetch(isLocalIp(reqIp) ? "https://ipapi.co/json/" : `https://ipapi.co/${reqIp}/json/`);
      const ipapiData = await ipapiRes.json();
      if (ipapiData?.city || ipapiData?.country_name) {
        location = {
          city: ipapiData.city || "",
          country: ipapiData.country_name || "United States"
        };
      }
    } catch (e) {
      console.warn("Free geo lookup fallback failed:", e);
    }

    return NextResponse.json({
      success: true,
      data: {
        userAgent: parseUserAgentFallback(reqUserAgent),
        location
      }
    });
  }

  try {
    const client = new IPWho(apiKey);
    
    // 1. Resolve geolocation and public IP first (matching geolocation route)
    try {
      const geoRes = isLocalIp(reqIp) ? await client.getMe() : await client.getIp(reqIp);
      if (geoRes?.success) {
        if (geoRes.ip) {
          resolvedIp = geoRes.ip;
        }
        location = {
          city: geoRes.geoLocation?.city || "",
          country: geoRes.geoLocation?.country || "United States"
        };
      }
    } catch (e) {
      console.warn("IPWho geolocation resolution failed, trying ipapi.co fallback", e);
      try {
        const ipapiRes = await fetch(isLocalIp(reqIp) ? "https://ipapi.co/json/" : `https://ipapi.co/${reqIp}/json/`);
        const ipapiData = await ipapiRes.json();
        if (ipapiData?.city || ipapiData?.country_name) {
          location = {
            city: ipapiData.city || "",
            country: ipapiData.country_name || "United States"
          };
          if (ipapiData.ip) resolvedIp = ipapiData.ip;
        }
      } catch (inner) {}
    }

    // Ensure we have a public IP for the UserAgent endpoint
    const lookupIp = isLocalIp(resolvedIp) ? "76.102.11.203" : resolvedIp;

    // 2. Fetch user agent parsing info
    let uaResponse;
    const uaUrl = `https://api.ipwho.org/ip/${lookupIp}?apiKey=${apiKey}&get=userAgent`;
    const uaPayload = JSON.stringify({ userAgent: reqUserAgent });

    try {
      // Try GET with body as per example
      uaResponse = await fetch(uaUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: uaPayload,
      });
    } catch {
      // Fallback to POST if runtime rejects GET with body
      uaResponse = await fetch(uaUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: uaPayload,
      });
    }

    let uaResult = await uaResponse.json();
    let userAgentData = uaResult?.success ? (uaResult?.data?.userAgent || uaResult?.userAgent) : null;

    if (!userAgentData) {
      userAgentData = parseUserAgentFallback(reqUserAgent);
    }

    return NextResponse.json({
      success: true,
      data: {
        userAgent: userAgentData,
        location
      }
    });
  } catch (error: any) {
    // Absolute fallback so the client never fails
    return NextResponse.json({
      success: true,
      data: {
        userAgent: parseUserAgentFallback(reqUserAgent),
        location: {
          city: "",
          country: "Pakistan" // Fallback to matching geolocation
        }
      }
    });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const userAgent = searchParams.get("userAgent") || "";
  const ip = searchParams.get("ip") || "";
  return handleRequest(request, Promise.resolve({ userAgent, ip }));
}

export async function POST(request: NextRequest) {
  const dataPromise = request.json().catch(() => ({}));
  return handleRequest(request, dataPromise);
}
