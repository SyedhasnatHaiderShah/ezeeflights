import airlinesCatalog from "@/lib/data/airlines-complete-name.json";

export type AirlineCatalogEntry = {
  name: string;
  iata: string;
  airports?: number;
};

type RawAirlineCatalogEntry = {
  name?: string | null;
  iata?: string | null;
  airports?: number;
};

function normalizeEntry(entry: RawAirlineCatalogEntry): AirlineCatalogEntry | null {
  const iata = entry.iata?.trim();
  if (!iata) return null;
  const name = entry.name?.trim() || iata;
  return { name, iata, airports: entry.airports };
}

const AIRLINES: AirlineCatalogEntry[] = (
  airlinesCatalog as RawAirlineCatalogEntry[]
)
  .map(normalizeEntry)
  .filter((entry): entry is AirlineCatalogEntry => entry !== null);

const AIRLINE_NAME_BY_CODE = new Map<string, string>(
  AIRLINES.map((entry) => [entry.iata.toUpperCase(), entry.name]),
);

/** Prefer the local IATA catalog (sync, no network). API names are used only as fallback. */
export function resolveAirlineName(
  code?: string | null,
  apiName?: string | null,
): string {
  const normalizedCode = String(code || "")
    .trim()
    .toUpperCase();
  const trimmedApiName = apiName?.trim();

  if (normalizedCode) {
    const catalogName = AIRLINE_NAME_BY_CODE.get(normalizedCode);
    if (catalogName) return catalogName;
  }

  if (
    trimmedApiName &&
    trimmedApiName.toUpperCase() !== normalizedCode
  ) {
    return trimmedApiName;
  }

  return trimmedApiName || normalizedCode;
}

export function getAirlineByCode(code: string): AirlineCatalogEntry | undefined {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return undefined;
  return AIRLINES.find((entry) => entry.iata.toUpperCase() === normalized);
}

export function formatAirlineDisplay(entry: AirlineCatalogEntry): string {
  return `${entry.name} (${entry.iata.toUpperCase()})`;
}

export function searchAirlines(query: string, limit = 20): AirlineCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return AIRLINES.slice(0, limit);

  return AIRLINES.filter(
    (entry) =>
      entry.iata.toLowerCase().includes(q) ||
      entry.name.toLowerCase().includes(q),
  )
    .sort((a, b) => {
      const aExact = a.iata.toLowerCase() === q ? 0 : 1;
      const bExact = b.iata.toLowerCase() === q ? 0 : 1;
      if (aExact !== bExact) return aExact - bExact;
      const aStarts = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStarts = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts || a.name.localeCompare(b.name);
    })
    .slice(0, limit);
}

export function getPopularAirlines(limit = 12): AirlineCatalogEntry[] {
  return [...AIRLINES]
    .sort((a, b) => (b.airports ?? 0) - (a.airports ?? 0))
    .slice(0, limit);
}
