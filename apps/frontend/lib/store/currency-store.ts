import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyCode =
  | "USD"
  | "INR"
  | "PKR"
  | "EUR"
  | "AED"
  | "GBP"
  | "SAR"
  | "CAD"
  | "AUD"
  | "QAR"
  | "KWD"
  | "BHD"
  | "OMR"
  | "JPY"
  | "SGD"
  | "TRY"
  | "CNY";

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  label: string;
  rate: number; // Rate relative to USD
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: "USD", symbol: "$", label: "US Dollar", rate: 1 },
  PKR: { code: "PKR", symbol: "Rs", label: "Pakistani Rupee", rate: 278.5 },
  INR: { code: "INR", symbol: "₹", label: "Indian Rupee", rate: 83.45 },
  EUR: { code: "EUR", symbol: "€", label: "Euro", rate: 0.92 },
  AED: { code: "AED", symbol: "د.إ", label: "UAE Dirham", rate: 3.67 },
  GBP: { code: "GBP", symbol: "£", label: "British Pound", rate: 0.79 },
  SAR: { code: "SAR", symbol: "﷼", label: "Saudi Riyal", rate: 3.75 },
  CAD: { code: "CAD", symbol: "C$", label: "Canadian Dollar", rate: 1.36 },
  AUD: { code: "AUD", symbol: "A$", label: "Australian Dollar", rate: 1.52 },
  QAR: { code: "QAR", symbol: "ر.ق", label: "Qatari Riyal", rate: 3.64 },
  KWD: { code: "KWD", symbol: "د.ك", label: "Kuwaiti Dinar", rate: 0.31 },
  BHD: { code: "BHD", symbol: ".د.ب", label: "Bahraini Dinar", rate: 0.38 },
  OMR: { code: "OMR", symbol: "ر.ع.", label: "Omani Rial", rate: 0.38 },
  JPY: { code: "JPY", symbol: "¥", label: "Japanese Yen", rate: 155.5 },
  SGD: { code: "SGD", symbol: "S$", label: "Singapore Dollar", rate: 1.35 },
  TRY: { code: "TRY", symbol: "₺", label: "Turkish Lira", rate: 32.4 },
  CNY: { code: "CNY", symbol: "¥", label: "Chinese Yuan", rate: 7.24 },
};

interface CurrencyState {
  baseCurrency: CurrencyCode;
  comparisonCurrencies: CurrencyCode[];
  lastUpdated: number;
  rates: Record<string, number>;
  isDetected: boolean;

  setBaseCurrency: (code: CurrencyCode) => void;
  toggleComparisonCurrency: (code: CurrencyCode) => void;
  getConvertedAmount: (
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
  ) => number;
  fetchRates: () => Promise<void>;
  detectCurrency: () => Promise<void>;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      baseCurrency: "USD",
      comparisonCurrencies: ["PKR", "AED"],
      lastUpdated: 0,
      rates: Object.fromEntries(
        Object.entries(SUPPORTED_CURRENCIES).map(([code, data]) => [
          code,
          data.rate,
        ]),
      ),
      isDetected: false,

      setBaseCurrency: (baseCurrency) => set({ baseCurrency }),

      toggleComparisonCurrency: (code) => {
        const { comparisonCurrencies } = get();
        if (comparisonCurrencies.includes(code)) {
          set({
            comparisonCurrencies: comparisonCurrencies.filter(
              (c) => c !== code,
            ),
          });
        } else {
          const next = [...comparisonCurrencies, code].slice(-2);
          set({ comparisonCurrencies: next });
        }
      },

      getConvertedAmount: (amount, from, to) => {
        const fromCode = from?.toUpperCase() as CurrencyCode;
        const toCode = to?.toUpperCase() as CurrencyCode;

        if (fromCode === toCode || !fromCode || !toCode) return amount;

        const { rates } = get();
        const fromRate =
          rates[fromCode] || SUPPORTED_CURRENCIES[fromCode]?.rate;
        const toRate = rates[toCode] || SUPPORTED_CURRENCIES[toCode]?.rate;

        if (!fromRate || !toRate) return amount;

        // Convert to USD then to target
        const usdAmount = amount / fromRate;
        return usdAmount * toRate;
      },

      fetchRates: async () => {
        try {
          const response = await fetch("https://open.er-api.com/v6/latest/USD");
          const data = await response.json();
          if (data.result === "success") {
            set({
              rates: data.rates,
              lastUpdated: Date.now(),
            });
          }
        } catch (error) {
          console.error("Failed to fetch rates:", error);
        }
      },

      detectCurrency: async () => {
        const { isDetected } = get();
        if (isDetected) return;

        try {
          const response = await fetch("https://ipapi.co/json/");
          const data = await response.json();
          if (
            data.currency &&
            SUPPORTED_CURRENCIES[data.currency as CurrencyCode]
          ) {
            set({
              baseCurrency: data.currency as CurrencyCode,
              isDetected: true,
            });
          } else {
            set({ isDetected: true }); // Mark as detected even if failed to avoid repeated calls
          }
        } catch (error) {
          console.error("Failed to detect currency:", error);
          set({ isDetected: true });
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
        isDetected: state.isDetected,
      }),
    },
  ),
);
