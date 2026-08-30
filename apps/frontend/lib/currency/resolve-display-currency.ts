import {
  getLocaleCountryCode,
  getLocaleCurrencyCode,
  getOffsetCurrencyCode,
  getPhysicalCountryCode,
  getTimezoneCountryCode,
  getTimezoneCurrencyCode,
  getTimezoneOffsetCountryCode,
  LOCALE_REGION_TO_CURRENCY,
} from "./currency-meta";
import type { ClientGeoResult } from "./client-geo";

export type CurrencyDetectSource =
  | "profile"
  | "browser-timezone"
  | "browser-offset"
  | "browser-locale"
  | "browser-ip"
  | "backend"
  | "none";

export type ResolvedDisplayCurrency = {
  currency?: string;
  countryCode?: string;
  source: CurrencyDetectSource;
};

function currencyFromCountry(countryCode?: string): string | undefined {
  if (!countryCode) return undefined;
  return LOCALE_REGION_TO_CURRENCY[countryCode.toUpperCase()];
}

/** Default profile USD should not override timezone (e.g. PK from Asia/Karachi). */
function shouldUseProfileCurrency(
  profileCurrency: string,
  timezoneCurrency?: string,
): boolean {
  const profile = profileCurrency.toUpperCase();
  if (profile !== "USD") return true;
  if (!timezoneCurrency || timezoneCurrency === "USD") return true;
  return false;
}

/**
 * Pick display currency for this user (dynamic, per device).
 *
 * Priority:
 * 1. Profile preference (unless default USD conflicts with timezone)
 * 2. Browser IP geo (client-side IP lookup)
 * 3. Backend /detect (server-side IP/header lookup)
 * 4. Timezone (Asia/Karachi → PKR) — beats en-US locale
 * 5. UTC offset
 * 6. Locale region (en-US → USD)
 */
export function resolveDisplayCurrency(input: {
  catalog: Record<string, unknown>;
  profileCurrency?: string | null;
  browserGeo?: ClientGeoResult | null;
  backend?: {
    currency?: string;
    countryCode?: string;
    source?: string;
  } | null;
}): ResolvedDisplayCurrency {
  const has = (code?: string | null) =>
    !!code && !!input.catalog[code.toUpperCase()];

  const timezoneCurrency = getTimezoneCurrencyCode();
  const offsetCurrency = getOffsetCurrencyCode();
  const physicalCountry = getPhysicalCountryCode();

  if (input.profileCurrency && has(input.profileCurrency)) {
    const profile = input.profileCurrency.toUpperCase();
    if (shouldUseProfileCurrency(profile, timezoneCurrency)) {
      return {
        currency: profile,
        source: "profile",
      };
    }
  }

  const geo = input.browserGeo;
  if (geo?.currency && has(geo.currency)) {
    return {
      currency: geo.currency.toUpperCase(),
      countryCode: geo.countryCode,
      source: "browser-ip",
    };
  }
  if (geo?.countryCode) {
    const fromGeo = currencyFromCountry(geo.countryCode);
    if (fromGeo && has(fromGeo)) {
      return {
        currency: fromGeo,
        countryCode: geo.countryCode,
        source: "browser-ip",
      };
    }
  }

  const backend = input.backend;
  const backendCurrency = backend?.currency?.toUpperCase();
  const isUsdFallback =
    backend?.source === "fallback" &&
    (!backendCurrency || backendCurrency === "USD");

  if (
    backendCurrency &&
    has(backendCurrency) &&
    !isUsdFallback &&
    (backend?.source === "client-hint" ||
      backend?.source === "headers" ||
      backend?.source === "client-ip")
  ) {
    return {
      currency: backendCurrency,
      countryCode: backend?.countryCode,
      source: "backend",
    };
  }

  if (timezoneCurrency && has(timezoneCurrency)) {
    return {
      currency: timezoneCurrency.toUpperCase(),
      countryCode: getTimezoneCountryCode() ?? physicalCountry,
      source: "browser-timezone",
    };
  }

  if (offsetCurrency && has(offsetCurrency)) {
    return {
      currency: offsetCurrency.toUpperCase(),
      countryCode: getTimezoneOffsetCountryCode() ?? physicalCountry,
      source: "browser-offset",
    };
  }

  const localeCurrency = getLocaleCurrencyCode();
  if (localeCurrency && has(localeCurrency)) {
    return {
      currency: localeCurrency.toUpperCase(),
      countryCode: getLocaleCountryCode(),
      source: "browser-locale",
    };
  }

  return { source: "none" };
}
