/**
 * Geo lookup from the user's browser (uses their real public IP, not the server's).
 * Use when locale/timezone are ambiguous and the BFF/backend only see Docker IPs.
 */

import {
  LOCALE_REGION_TO_CURRENCY,
  getPhysicalCountryCode,
} from "./currency-meta";

export type ClientGeoResult = {
  countryCode?: string;
  currency?: string;
  country?: string;
  ip?: string;
  source: "browser-ip";
};

const GEO_TTL_MS = 10 * 1000; // 10 seconds cache to allow quick updates on VPN changes
let cached: { at: number; data: ClientGeoResult | null } | null = null;

async function fetchWithTimeout(
  url: string,
  ms = 4500,
): Promise<Response | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    return res.ok ? res : null;
  } catch {
    return null;
  }
}

/** ipwho.org — subscription geolocation API proxy */
async function tryIpWhoOrg(): Promise<ClientGeoResult | null> {
  const res = await fetchWithTimeout(`/api/geolocation`);
  if (!res) return null;

  const data = await res.json();
  if (!data?.success || !data?.data?.geoLocation || data?.isServerFallback) return null;

  const geo = data.data.geoLocation;
  const countryCode = String(geo.countryCode || "").toUpperCase();
  const currency = data.data.currency?.code
    ? String(data.data.currency.code).toUpperCase()
    : countryCode
      ? LOCALE_REGION_TO_CURRENCY[countryCode]
      : undefined;

  return {
    countryCode: countryCode || undefined,
    currency: currency || undefined,
    country: geo.country,
    ip: data.ip || undefined,
    source: "browser-ip",
  };
}

/** Direct browser-side IP lookup when backend proxy times out (e.g. localhost/VPN) */
async function tryDirectBrowserGeo(): Promise<ClientGeoResult | null> {
  try {
    const res = await fetchWithTimeout("https://ipapi.co/json/", 3000);
    if (res) {
      const data = await res.json();
      if (data?.country_code) {
        const countryCode = String(data.country_code).toUpperCase();
        const currency = data.currency
          ? String(data.currency).toUpperCase()
          : LOCALE_REGION_TO_CURRENCY[countryCode];
        return {
          countryCode,
          currency,
          country: data.country_name || data.country,
          ip: data.ip || undefined,
          source: "browser-ip",
        };
      }
    }
  } catch {
    /* fallback */
  }

  try {
    const res = await fetchWithTimeout("https://ipwho.is/", 3000);
    if (res) {
      const data = await res.json();
      if (data?.success && data?.country_code) {
        const countryCode = String(data.country_code).toUpperCase();
        const currency = data.currency?.code
          ? String(data.currency.code).toUpperCase()
          : LOCALE_REGION_TO_CURRENCY[countryCode];
        return {
          countryCode,
          currency,
          country: data.country,
          ip: data.ip || undefined,
          source: "browser-ip",
        };
      }
    }
  } catch {
    /* fallback */
  }

  return null;
}

export async function fetchClientGeo(): Promise<ClientGeoResult | null> {
  if (typeof window === "undefined") return null;

  if (cached && Date.now() - cached.at < GEO_TTL_MS) {
    return cached.data;
  }

  // 1. Try backend proxy first
  let result = await tryIpWhoOrg();

  // 2. Fall back to direct browser lookup if proxy fails/times out
  if (!result || !result.countryCode) {
    result = await tryDirectBrowserGeo();
  }

  cached = { at: Date.now(), data: result };
  return result;
}

export function resetClientGeoCache(): void {
  cached = null;
}
