import * as fs from "fs";
import * as path from "path";
import { resolveDisplayAirport } from "../../modules/flight/utils/airport-display.util";

type AirportRow = {
  iata_code?: string;
  municipality?: string;
  name?: string;
  country_name?: string;
  keywords?: string;
  score?: number;
};

let iataIndex: Map<string, AirportRow> | null = null;

function resolveAirportsJsonPath(): string {
  const candidates = [
    path.join(process.cwd(), "src/common/utils/active-airports.json"),
    path.join(__dirname, "active-airports.json"),
    path.join(__dirname, "../../../src/common/utils/active-airports.json"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

function loadAirportIndex(): Map<string, AirportRow> {
  if (iataIndex) return iataIndex;

  iataIndex = new Map();
  try {
    const raw = fs.readFileSync(resolveAirportsJsonPath(), "utf8");
    const rows = JSON.parse(raw) as AirportRow[];
    for (const row of rows) {
      const code = row.iata_code?.trim().toUpperCase();
      if (!code || code.length !== 3) continue;
      if (!iataIndex.has(code)) {
        iataIndex.set(code, row);
      }
    }
  } catch {
    iataIndex = new Map();
  }
  return iataIndex;
}

/** City or area name for an IATA code (from active-airports.json). */
export function getAirportCityName(
  airportCode?: string | null,
  searchedDestination?: string | null,
): string {
  const code = resolveDisplayAirport(airportCode, searchedDestination);
  if (!code) return "";

  const row = loadAirportIndex().get(code);
  if (row?.municipality?.trim()) {
    return row.municipality.trim();
  }
  if (row?.name?.trim()) {
    return row.name.replace(/\s+Airport.*$/i, "").trim();
  }
  return "";
}

/** Country name for an IATA code (from active-airports.json). */
export function getAirportCountryName(
  airportCode?: string | null,
  searchedDestination?: string | null,
): string {
  const code = resolveDisplayAirport(airportCode, searchedDestination);
  if (!code) return "";

  const row = loadAirportIndex().get(code);
  if (row?.country_name?.trim()) {
    return row.country_name.trim();
  }
  return "";
}

/** e.g. "London (LHR)" — code plus city for emails and UI. */
export function formatAirportWithCity(
  airportCode?: string | null,
  searchedDestination?: string | null,
): string {
  const code = resolveDisplayAirport(airportCode, searchedDestination);
  if (!code) return "";

  const city = getAirportCityName(code, searchedDestination);
  if (city && city.toUpperCase() !== code) {
    return `${city} (${code})`;
  }
  return code;
}

const MULTI_CITY_MAP: Record<string, string> = {
  NYS: "JFK",
  NYC: "JFK",
  LON: "LHR",
  PAR: "CDG",
  MIL: "MXP",
  ROM: "FCO",
  WAS: "IAD",
  CHI: "ORD",
  RIO: "GIG",
  BJS: "PEK",
  SHA: "PVG",
  TYO: "NRT",
  OSA: "KIX",
  SPK: "CTS",
  SEL: "ICN",
  STO: "ARN",
};

/** Resolves any city name, airport name, or description to a 3-letter IATA code. */
export function resolveCityToIata(input: string): string {
  if (!input) return "";
  const clean = input.trim().toUpperCase();
  if (MULTI_CITY_MAP[clean]) {
    return MULTI_CITY_MAP[clean];
  }
  if (clean.length === 3) {
    const index = loadAirportIndex();
    let bestMatchCode = "";
    let highestScore = -1;

    for (const [code, row] of index.entries()) {
      if (row.keywords) {
        const keywordsList = row.keywords.toUpperCase().split(",").map((k) => k.trim());
        if (keywordsList.includes(clean)) {
          const score = Number(row.score) || 0;
          if (score > highestScore) {
            highestScore = score;
            bestMatchCode = code;
          }
        }
      }
    }

    if (bestMatchCode) {
      return bestMatchCode;
    }

    return clean;
  }

  const index = loadAirportIndex();
  
  // 1. Exact match on municipality (city)
  for (const [code, row] of index.entries()) {
    if (row.municipality?.trim().toUpperCase() === clean) {
      return code;
    }
  }

  // 2. Substring/partial match on municipality or name
  for (const [code, row] of index.entries()) {
    if (
      row.municipality?.trim().toUpperCase().includes(clean) ||
      row.name?.trim().toUpperCase().includes(clean)
    ) {
      return code;
    }
  }

  // 3. Fallback for comma separated strings
  if (input.includes(",")) {
    const firstPart = input.split(",")[0].trim().toUpperCase();
    for (const [code, row] of index.entries()) {
      if (row.municipality?.trim().toUpperCase() === firstPart) {
        return code;
      }
    }
    for (const [code, row] of index.entries()) {
      if (
        row.municipality?.trim().toUpperCase().includes(firstPart) ||
        row.name?.trim().toUpperCase().includes(firstPart)
      ) {
        return code;
      }
    }
  }

  return input;
}
