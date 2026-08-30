import { create } from "zustand";
import type { DestinationInsights } from "@/lib/api/destination-insights";

const STORAGE_KEY = "ezee-destination-insights-v1";
const PERSIST_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Pull a 3-letter IATA code from raw location text (codes, "City (DXB)", etc.). */
export function extractIataCodeFromLocation(
  destination?: string | null,
): string {
  const raw = (destination || "").trim();
  if (!raw) return "";

  const upper = raw.toUpperCase();
  if (/^[A-Z]{3}$/.test(upper)) return upper;

  const fromParens = upper.match(/\(([A-Z]{3})\)/);
  if (fromParens) return fromParens[1];

  const tokens = upper.split(/[\s,()]+/).filter(Boolean);
  const iataToken = tokens.find((t) => /^[A-Z]{3}$/.test(t));
  if (iataToken) return iataToken;

  return "";
}

export function normalizeDestinationCode(
  destination?: string | null,
): string {
  return extractIataCodeFromLocation(destination);
}

type PersistedEntry = { data: DestinationInsights; savedAt: number };

function readPersistedCache(): Record<string, DestinationInsights> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PersistedEntry>;
    const out: Record<string, DestinationInsights> = {};
    const now = Date.now();
    for (const [code, entry] of Object.entries(parsed)) {
      if (entry?.data && now - entry.savedAt < PERSIST_TTL_MS) {
        out[code] = entry.data;
      }
    }
    return out;
  } catch {
    return {};
  }
}

function writePersistedCache(cache: Record<string, DestinationInsights>) {
  if (typeof window === "undefined") return;
  try {
    const persisted: Record<string, PersistedEntry> = {};
    const now = Date.now();
    for (const [code, data] of Object.entries(cache)) {
      persisted[code] = { data, savedAt: now };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    /* quota / private mode */
  }
}

interface DestinationInsightsStore {
  searchDestination: string | null;
  cache: Record<string, DestinationInsights>;
  setSearchDestination: (destination: string) => void;
  setCachedInsights: (destination: string, data: DestinationInsights) => void;
  getCachedInsights: (destination: string) => DestinationInsights | undefined;
  hydratePersisted: () => void;
}

export const useDestinationInsightsStore = create<DestinationInsightsStore>(
  (set, get) => ({
    searchDestination: null,
    // Hydrated in Providers/useEffect — not at init (avoids SSR/client mismatch).
    cache: {},
    hydratePersisted: () => {
      const persisted = readPersistedCache();
      if (Object.keys(persisted).length === 0) return;
      set((state) => ({ cache: { ...persisted, ...state.cache } }));
    },
    setSearchDestination: (destination) => {
      const code = normalizeDestinationCode(destination);
      if (!code) return;
      set({ searchDestination: code });
    },
    setCachedInsights: (destination, data) => {
      const code = normalizeDestinationCode(destination);
      if (!code) return;
      set((state) => {
        const cache = { ...state.cache, [code]: data };
        writePersistedCache(cache);
        return { cache, searchDestination: code };
      });
    },
    getCachedInsights: (destination) => {
      const code = normalizeDestinationCode(destination);
      if (!code) return undefined;
      return get().cache[code];
    },
  }),
);
