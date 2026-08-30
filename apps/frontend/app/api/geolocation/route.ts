import { NextRequest, NextResponse } from "next/server";
import { IPWho } from "@ipwho/ipwho";
import {
  LOCALE_REGION_TO_CURRENCY,
  getCurrencySymbol,
  getCurrencyLabel,
} from "@/lib/currency/currency-meta";

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

function getHintData(hint: string) {
  if (!hint || !/^[A-Z]{2}$/.test(hint)) return null;
  const currencyCode = LOCALE_REGION_TO_CURRENCY[hint];
  if (!currencyCode) return null;

  let country = hint;
  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    country = regionNames.of(hint) || hint;
  } catch {
    // fallback
  }

  return {
    countryCode: hint,
    country,
    currency: {
      code: currencyCode,
      symbol: getCurrencySymbol(currencyCode),
      name: getCurrencyLabel(currencyCode),
    },
  };
}

function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms),
    ),
  ]);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hint = searchParams.get("hint")?.toUpperCase() || "";

  // Extract client IP address
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  const xRealIp = request.headers.get("x-real-ip");
  const xClientIp = request.headers.get("x-client-ip");
  const forwardedFor = request.headers.get("x-forwarded-for");

  let ip = "";
  if (cfConnectingIp && !isLocalIp(cfConnectingIp)) {
    ip = cfConnectingIp;
  } else if (forwardedFor) {
    const parts = forwardedFor.split(",").map((p) => p.trim());
    const nonLocal = parts.find((p) => !isLocalIp(p));
    ip = nonLocal || parts[0] || "";
  } else if (xRealIp && !isLocalIp(xRealIp)) {
    ip = xRealIp;
  } else if (xClientIp && !isLocalIp(xClientIp)) {
    ip = xClientIp;
  }

  const apiKey = process.env.NEXT_PUBLIC_IPWHO_KEY;
  if (!apiKey) {
    console.error("IPWHO API Key not configured");
    return NextResponse.json(
      { success: false, error: "API Key not configured" },
      { status: 500 },
    );
  }

  try {
    const client = new IPWho(apiKey);
    let res: any = null;

    let isServerLocation = false;

    if (ip && !isLocalIp(ip)) {
      try {
        res = await withTimeout(client.getIp(ip), 2500);
      } catch (err: any) {
        console.warn(
          `[geolocation] IPWho getIp(${ip}) failed: ${err?.message}, falling back to getMe()`,
        );
        try {
          res = await withTimeout(client.getMe(), 2500);
          isServerLocation = true;
        } catch (innerErr) {
          console.warn(`[geolocation] IPWho getMe() failed:`, innerErr);
        }
      }
    } else {
      try {
        res = await withTimeout(client.getMe(), 2500);
        isServerLocation = true;
      } catch (err) {
        console.warn(`[geolocation] IPWho getMe() failed:`, err);
      }
    }

    const mappedHint = getHintData(hint);

    if (res && res.geoLocation) {
      const geo = res.geoLocation;
      const countryCode = geo.countryCode || "US";
      const country = geo.country || "United States";
      const currencyCode = res.currency?.code || "USD";
      const currencySymbol = res.currency?.symbol || "$";
      const currencyName = res.currency?.name || "US Dollar";

      return NextResponse.json({
        success: true,
        isServerFallback: isServerLocation,
        ip: ip || undefined,
        data: {
          geoLocation: {
            countryCode,
            country,
            city: geo.city || "",
            latitude: Number(geo.latitude || 0),
            longitude: Number(geo.longitude || 0),
          },
          currency: {
            code: currencyCode,
            symbol: currencySymbol,
            name: currencyName,
            name_plural: currencyName + "s",
          },
        },
      });
    }

    // Fallback to ipapi.co if IPWho fails or returns no geolocation
    const fallbackUrl =
      ip && !isLocalIp(ip)
        ? `https://ipapi.co/${ip}/json/`
        : "https://ipapi.co/json/";
    try {
      const ipapiRes = await fetch(fallbackUrl, {
        signal: AbortSignal.timeout(4000),
      });
      const ipapiData = await ipapiRes.json();
      if (ipapiData && (ipapiData.country_code || ipapiData.country_name)) {
        const countryCode = ipapiData.country_code || ipapiData.country || "US";
        const country = ipapiData.country_name || "United States";
        const currencyCode = ipapiData.currency || "USD";
        const currencySymbol = ipapiData.currency || "$";
        const currencyName = ipapiData.currency_name || "US Dollar";

        let ipapiIsServerLocation = !(ip && !isLocalIp(ip));

        return NextResponse.json({
          success: true,
          isServerFallback: ipapiIsServerLocation,
          ip: ip || ipapiData.ip || undefined,
          data: {
            geoLocation: {
              countryCode,
              country,
              city: ipapiData.city || "",
              latitude: Number(ipapiData.latitude || 0),
              longitude: Number(ipapiData.longitude || 0),
            },
            currency: {
              code: currencyCode,
              symbol: currencySymbol,
              name: currencyName,
              name_plural: currencyName + "s",
            },
          },
        });
      }
    } catch (fallbackErr) {
      console.warn(`[geolocation] ipapi.co fallback failed:`, fallbackErr);
    }

    // Default safe response so UI never breaks or receives 500
    let defaultCountryCode = "US";
    let defaultCountry = "United States";
    let defaultCurrencyCode = "USD";
    let defaultCurrencySymbol = "$";
    let defaultCurrencyName = "US Dollar";

    if (mappedHint) {
      defaultCountryCode = mappedHint.countryCode;
      defaultCountry = mappedHint.country;
      defaultCurrencyCode = mappedHint.currency.code;
      defaultCurrencySymbol = mappedHint.currency.symbol;
      defaultCurrencyName = mappedHint.currency.name;
    }

    return NextResponse.json({
      success: true,
      isServerFallback: true,
      ip: ip || undefined,
      data: {
        geoLocation: {
          countryCode: defaultCountryCode,
          country: defaultCountry,
          city: "New York",
          latitude: 40.7128,
          longitude: -74.006,
        },
        currency: {
          code: defaultCurrencyCode,
          symbol: defaultCurrencySymbol,
          name: defaultCurrencyName,
          name_plural: defaultCurrencyName + "s",
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Geolocation failed" },
      { status: 500 },
    );
  }
}
