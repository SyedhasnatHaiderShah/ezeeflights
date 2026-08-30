export interface Airport {
  id: string;
  ident: string;
  type: string;
  name: string;
  country_name: string;
  municipality: string;
  gps_code: string;
  icao_code: string;
  iata_code: string;
  keywords: string;
  score: number;
}

let cachedAirports: Airport[] | null = null;
let isLoading = false;
let loadPromise: Promise<Airport[]> | null = null;

export const fetchAirports = async (): Promise<Airport[]> => {
  if (cachedAirports) return cachedAirports;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    isLoading = true;
    try {
      const response = await fetch("/active-airports.json");
      if (!response.ok) {
        throw new Error("Failed to load active-airports.json");
      }
      cachedAirports = (await response.json()) as Airport[];
      isLoading = false;
      return cachedAirports;
    } catch (error) {
      isLoading = false;
      loadPromise = null; // Reset on failure so we can retry
      throw error;
    }
  })();

  return loadPromise;
};

export const searchAirports = async (query: string): Promise<Airport[]> => {
  const airports = await fetchAirports();
  if (!query) return [];

  const lowerQuery = query.toLowerCase();

  if (lowerQuery.length === 3) {
    const exactIataMatches = airports.filter(
      (a) => a.iata_code?.toLowerCase() === lowerQuery
    );
    if (exactIataMatches.length > 0) {
      return exactIataMatches;
    }
  }

  // Helper to check if any word in a string starts with the query or if the query is a substring
  const matchesStartOfWord = (text: string | undefined | null) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    if (lowerText.includes(lowerQuery)) return true;
    return lowerText
      .split(/[\s,.-]+/)
      .some((word) => word.startsWith(lowerQuery));
  };

  return airports
    .filter((airport) => {
      // Exclude closed airports unless they have an IATA code
      if (!airport.iata_code && airport.type === "closed") return false;

      const iata = airport.iata_code?.toLowerCase() || "";
      const icao = airport.icao_code?.toLowerCase() || "";

      // Match if:
      // 1. IATA code starts with query (e.g. "LH" -> "LHE")
      // 2. ICAO code starts with query
      // 3. Any word in name, municipality or keywords starts with query
      return (
        iata.startsWith(lowerQuery) ||
        icao.startsWith(lowerQuery) ||
        matchesStartOfWord(airport.name) ||
        matchesStartOfWord(airport.municipality) ||
        matchesStartOfWord(airport.keywords)
      );
    })
    .sort((a, b) => {
      const aIata = a.iata_code?.toLowerCase() || "";
      const bIata = b.iata_code?.toLowerCase() || "";

      // 1. Prioritize exact IATA matches
      if (aIata === lowerQuery) return -1;
      if (bIata === lowerQuery) return 1;

      // 2. Prioritize IATA starts with query
      const aIataStart = aIata.startsWith(lowerQuery);
      const bIataStart = bIata.startsWith(lowerQuery);
      if (aIataStart && !bIataStart) return -1;
      if (!aIataStart && bIataStart) return 1;

      // 3. Prioritize Municipality starts with query
      const aMuniStart = a.municipality?.toLowerCase().startsWith(lowerQuery);
      const bMuniStart = b.municipality?.toLowerCase().startsWith(lowerQuery);
      if (aMuniStart && !bMuniStart) return -1;
      if (!aMuniStart && bMuniStart) return 1;

      // 4. Prioritize Name starts with query
      const aNameStart = a.name?.toLowerCase().startsWith(lowerQuery);
      const bNameStart = b.name?.toLowerCase().startsWith(lowerQuery);
      if (aNameStart && !bNameStart) return -1;
      if (!aNameStart && bNameStart) return 1;

      // 5. Use score from JSON for remaining (higher score first)
      const aScore = a.score || 0;
      const bScore = b.score || 0;
      return bScore - aScore;
    })
    .slice(0, 20);
};

export const getPopularAirports = async (): Promise<Airport[]> => {
  const airports = await fetchAirports();
  return airports
    .filter((a) => a.iata_code && a.type === "large_airport" && a.score)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 5);
};

export const getAirportByCode = async (
  code: string,
): Promise<Airport | null> => {
  if (!code) return null;
  const airports = await fetchAirports();
  const lowerCode = code.toLowerCase();
  return airports.find((a) => a.iata_code?.toLowerCase() === lowerCode) || null;
};

export const getAirportByCodeSync = (
  code: string,
): Airport | null => {
  if (!cachedAirports || !code) return null;
  const lowerCode = code.toLowerCase();
  return cachedAirports.find((a) => a.iata_code?.toLowerCase() === lowerCode) || null;
};
