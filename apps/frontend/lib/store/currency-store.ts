import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchClientGeo } from "@/lib/currency/client-geo";
import {
  isCurrencyDebugEnabled,
  logCurrencyDebug,
} from "@/lib/currency/currency-debug";
import {
  buildCurrencyCatalog,
  getBrowserSignalsSnapshot,
  getPhysicalCountryCode,
  type CurrencyMeta,
} from "@/lib/currency/currency-meta";
import { resolveDisplayCurrency } from "@/lib/currency/resolve-display-currency";
import { getActiveHostname } from "@/lib/utils/domain";

/** Any ISO 4217 code present in the rates catalog */
export type CurrencyCode = string;

/** External flight Select API only accepts USD */
export const SELECT_API_CURRENCY = "USD" as const;

export const getCheckoutCurrency = (): string => {
  return getDefaultBaseCurrency();
};

export type Currency = CurrencyMeta;

/** Legacy fallback until /rates loads */
export const SUPPORTED_CURRENCIES: Record<string, Currency> =
  buildCurrencyCatalog({
    USD: 1,
    PKR: 278.5,
    INR: 83.45,
    EUR: 0.92,
    AED: 3.67,
    GBP: 0.79,
    SAR: 3.75,
    CAD: 1.36,
    AUD: 1.52,
    QAR: 3.64,
    KWD: 0.31,
    BHD: 0.38,
    OMR: 0.38,
    JPY: 155.5,
    SGD: 1.35,
    TRY: 32.4,
    CNY: 7.24,
    SEK: 10.7,
  });

interface CurrencyDetectResponse {
  currency?: string;
  country?: string;
  countryCode?: string;
  source?: string;
}

export interface GeoLocationState {
  countryCode?: string;
  country?: string;
  city?: string;
}

interface CurrencyState {
  baseCurrency: CurrencyCode;
  /** Full catalog from /public/currency/rates */
  currencies: Record<string, Currency>;
  comparisonCurrencies: CurrencyCode[];
  lastUpdated: number;
  rates: Record<string, number>;
  isDetected: boolean;
  /** User picked a currency manually — do not overwrite on detect */
  userPinned: boolean;
  geoLocation: GeoLocationState | null;

  setBaseCurrency: (code: CurrencyCode, pinned?: boolean) => void;
  toggleComparisonCurrency: (code: CurrencyCode) => void;
  getCurrency: (code: string) => Currency | undefined;
  getConvertedAmount: (
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
  ) => number;
  fetchRates: () => Promise<void>;
  detectCurrency: (
    profileCurrency?: string | null,
    force?: boolean,
  ) => Promise<void>;
  applyPreferredCurrency: (code?: string | null) => void;
  setGeoLocation: (geo: GeoLocationState | null) => void;
}

const RATES_TTL_MS = 15 * 60 * 1000;

export const getDefaultBaseCurrency = (): string => {
  if (typeof window !== "undefined") {
    const host = getActiveHostname();
    if (host.includes("uk.ezeeflights.com")) return "GBP";
    if (host.includes("ezeeflights.ca")) return "CAD";
    if (host.includes("ezeeflights.ae")) return "AED";
    if (host.includes("tr.ezeeflights.com")) return "TRY";
    if (host.includes("in.ezeeflights.com")) return "INR";
    // if (host.includes("ezeeflights.com")) return "USD";
  }
  return "USD";
};

function pickCurrency(
  catalog: Record<string, Currency>,
  code?: string | null,
): CurrencyCode | undefined {
  if (!code) return undefined;
  const upper = code.toUpperCase();
  return catalog[upper] ? upper : undefined;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      baseCurrency: getDefaultBaseCurrency(),
      currencies: { ...SUPPORTED_CURRENCIES },
      comparisonCurrencies: [],
      lastUpdated: 0,
      rates: Object.fromEntries(
        Object.entries(SUPPORTED_CURRENCIES).map(([code, data]) => [
          code,
          data.rate,
        ]),
      ),
      isDetected: false,
      userPinned: false,
      geoLocation: null,

      setGeoLocation: (geoLocation) => set({ geoLocation }),

      setBaseCurrency: (baseCurrency, pinned = true) =>
        set({
          baseCurrency: baseCurrency.toUpperCase(),
          userPinned: pinned,
        }),

      getCurrency: (code) => {
        const upper = code?.toUpperCase();
        if (!upper) return undefined;
        const { currencies } = get();
        return currencies[upper] ?? SUPPORTED_CURRENCIES[upper];
      },

      toggleComparisonCurrency: (code) => {
        const { comparisonCurrencies } = get();
        const upper = code.toUpperCase();
        if (comparisonCurrencies.includes(upper)) {
          set({
            comparisonCurrencies: comparisonCurrencies.filter(
              (c) => c !== upper,
            ),
          });
        } else {
          const next = [...comparisonCurrencies, upper].slice(-2);
          set({ comparisonCurrencies: next });
        }
      },

      getConvertedAmount: (amount, from, to) => {
        const fromCode = from?.toUpperCase();
        const toCode = to?.toUpperCase();

        if (fromCode === toCode || !fromCode || !toCode) return amount;

        const { rates, currencies } = get();
        const fromRate =
          rates[fromCode] ??
          currencies[fromCode]?.rate ??
          SUPPORTED_CURRENCIES[fromCode]?.rate;
        const toRate =
          rates[toCode] ??
          currencies[toCode]?.rate ??
          SUPPORTED_CURRENCIES[toCode]?.rate;

        if (!fromRate || !toRate) return amount;

        const usdAmount = amount / fromRate;
        return usdAmount * toRate;
      },

      fetchRates: async () => {
        try {
          const { apiClient } = await import("@/lib/api/api-client");
          const rates = await apiClient<Record<string, number>>(
            "/public/currency/rates",
          ).catch(() => null);
          if (!rates || typeof rates !== "object") return;

          const catalog = buildCurrencyCatalog(rates);
          const { baseCurrency } = get();
          const nextBase = catalog[baseCurrency] ? baseCurrency : "USD";

          set({
            rates,
            currencies: catalog,
            lastUpdated: Date.now(),
            baseCurrency: nextBase,
          });
        } catch {
          /* keep cached */
        }
      },

      detectCurrency: async (
        profileCurrency?: string | null,
        force = false,
      ) => {
        const {
          userPinned,
          currencies,
          baseCurrency: previousBase,
          isDetected,
        } = get();
        console.log("[Currency][Frontend] detectCurrency check:", {
          baseCurrency: get().baseCurrency,
          userPinned,
          isDetected,
          force,
        });
        if (userPinned || (isDetected && !force)) {
          return;
        }

        const browserSignals = getBrowserSignalsSnapshot();
        const physicalCountry = getPhysicalCountryCode();
        const browserGeo = await fetchClientGeo().catch((err) => {
          logCurrencyDebug("browser-ip geo failed", {
            error: err instanceof Error ? err.message : String(err),
          });
          return null;
        });

        const countryForApi =
          browserGeo?.countryCode ?? physicalCountry ?? undefined;

        const debug = isCurrencyDebugEnabled();
        const detectParams = new URLSearchParams();
        if (countryForApi) {
          detectParams.set("countryCode", countryForApi);
        }
        if (debug) {
          detectParams.set("debug", "1");
        }
        const detectPath = `/public/currency/detect${
          detectParams.toString() ? `?${detectParams.toString()}` : ""
        }`;

        let backend: (CurrencyDetectResponse & { _debug?: unknown }) | null =
          null;
        try {
          const { apiClient } = await import("@/lib/api/api-client");
          const query = detectParams.toString()
            ? `?${detectParams.toString()}`
            : "";

          const browserLanguages =
            typeof navigator !== "undefined"
              ? navigator.languages?.length
                ? navigator.languages.join(",")
                : navigator.language
              : "";

          backend = await apiClient<
            CurrencyDetectResponse & { _debug?: unknown }
          >(`/public/currency/detect${query}`, {
            headers: {
              ...(browserLanguages
                ? { "Accept-Language": browserLanguages }
                : {}),
              ...(countryForApi ? { "X-Client-Country": countryForApi } : {}),
            },
          }).catch((err) => {
            logCurrencyDebug("backend detect failed", {
              error: err instanceof Error ? err.message : String(err),
            });
            return null;
          });
        } catch (err) {
          logCurrencyDebug("backend detect exception", {
            error: err instanceof Error ? err.message : String(err),
          });
          backend = null;
        }

        const resolved = resolveDisplayCurrency({
          catalog: currencies,
          profileCurrency,
          browserGeo,
          backend,
        });

        let overrideCurrency: string | undefined = undefined;
        if (typeof window !== "undefined") {
          const host = getActiveHostname();
          if (host.includes("uk.ezeeflights.com")) {
            overrideCurrency = "GBP";
          } else if (host.includes("ezeeflights.ca")) {
            overrideCurrency = "CAD";
          } else if (host.includes("ezeeflights.ae")) {
            overrideCurrency = "AED";
          } else if (host.includes("tr.ezeeflights.com")) {
            overrideCurrency = "TRY";
          } else if (host.includes("in.ezeeflights.com")) {
            overrideCurrency = "INR";
            //   } else if (host.includes("ezeeflights.com")) {
            // overrideCurrency = "USD";
          }
        }

        const resolvedCurrency = overrideCurrency || resolved.currency;
        const chosen = pickCurrency(currencies, resolvedCurrency);

        console.log("[Currency][Frontend] detection summary:", {
          previousBaseCurrency: previousBase,
          profileCurrency: profileCurrency ?? null,
          browser: browserSignals,
          browserIpGeo: browserGeo ?? null,
          sentToBackend: {
            countryCode: countryForApi ?? null,
            detectPath,
          },
          backendResponse: backend ?? null,
          backendDebug: backend?._debug ?? null,
          frontendResolved: resolved,
          finalCurrency: chosen ?? "USD (unchanged)",
          catalogSize: Object.keys(currencies).length,
        });

        const detectedCountryCode =
          browserGeo?.countryCode ||
          backend?.countryCode ||
          physicalCountry ||
          undefined;
        const detectedCountryName =
          browserGeo?.country || backend?.country || undefined;

        set({
          isDetected: true,
          ...(chosen ? { baseCurrency: chosen } : {}),
          geoLocation: detectedCountryCode
            ? {
                countryCode: detectedCountryCode,
                country: detectedCountryName,
              }
            : null,
        });
      },

      applyPreferredCurrency: (code?: string | null) => {
        if (get().userPinned || !code) return;
        const pick = pickCurrency(get().currencies, code.toUpperCase());
        console.log("[Currency][Frontend] profile preference:", {
          preferredCurrency: code,
          applied: pick ?? null,
        });
        if (pick) {
          set({ baseCurrency: pick, isDetected: true });
        }
      },
    }),
    {
      name: "ezee-currency-storage",
      partialize: (state) => ({
        baseCurrency: state.baseCurrency,
        comparisonCurrencies: state.comparisonCurrencies,
        lastUpdated: state.lastUpdated,
        rates: state.rates,
        currencies: state.currencies,
        userPinned: state.userPinned,
        geoLocation: state.geoLocation,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<CurrencyState>),
        isDetected: false,
      }),
    },
  ),
);

export function shouldRefreshRates(lastUpdated: number): boolean {
  return Date.now() - lastUpdated > RATES_TTL_MS;
}
