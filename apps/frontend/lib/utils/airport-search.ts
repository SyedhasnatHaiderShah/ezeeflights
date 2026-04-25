import Papa from "papaparse";

export interface Airport {
  id: string;
  ident: string;
  type: string;
  name: string;
  latitude_deg: string;
  longitude_deg: string;
  elevation_ft: string;
  continent: string;
  country_name: string;
  iso_country: string;
  region_name: string;
  iso_region: string;
  local_region: string;
  municipality: string;
  scheduled_service: string;
  gps_code: string;
  icao_code: string;
  iata_code: string;
  local_code: string;
  home_link: string;
  wikipedia_link: string;
  keywords: string;
  score: string;
  last_updated: string;
}

let cachedAirports: Airport[] | null = null;
let isLoading = false;
let loadPromise: Promise<Airport[]> | null = null;

export const fetchAirports = async (): Promise<Airport[]> => {
  if (cachedAirports) return cachedAirports;
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    isLoading = true;
    Papa.parse("/world-airports.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        cachedAirports = results.data as Airport[];
        isLoading = false;
        resolve(cachedAirports);
      },
      error: (error) => {
        isLoading = false;
        reject(error);
      },
    });
  });

  return loadPromise;
};

export const searchAirports = async (query: string): Promise<Airport[]> => {
  const airports = await fetchAirports();
  if (!query) return [];

  const lowerQuery = query.toLowerCase();
  
  // Filter and sort by relevance
  return airports
    .filter((airport) => {
      // We only care about airports with IATA codes for flight searching usually
      // but let's include all for now if they match
      if (!airport.iata_code && airport.type === 'closed') return false;
      
      return (
        airport.iata_code?.toLowerCase().includes(lowerQuery) ||
        airport.name?.toLowerCase().includes(lowerQuery) ||
        airport.municipality?.toLowerCase().includes(lowerQuery) ||
        airport.icao_code?.toLowerCase().includes(lowerQuery) ||
        airport.keywords?.toLowerCase().includes(lowerQuery)
      );
    })
    .sort((a, b) => {
      // Prioritize exact IATA matches
      if (a.iata_code?.toLowerCase() === lowerQuery) return -1;
      if (b.iata_code?.toLowerCase() === lowerQuery) return 1;
      
      // Prioritize matches at the start of the name/city
      const aNameStart = a.name?.toLowerCase().startsWith(lowerQuery);
      const bNameStart = b.name?.toLowerCase().startsWith(lowerQuery);
      if (aNameStart && !bNameStart) return -1;
      if (!aNameStart && bNameStart) return 1;

      const aCityStart = a.municipality?.toLowerCase().startsWith(lowerQuery);
      const bCityStart = b.municipality?.toLowerCase().startsWith(lowerQuery);
      if (aCityStart && !bCityStart) return -1;
      if (!aCityStart && bCityStart) return 1;

      // Use score from CSV if available (higher score first)
      const aScore = parseInt(a.score) || 0;
      const bScore = parseInt(b.score) || 0;
      return bScore - aScore;
    })
    .slice(0, 20);
};

export const getPopularAirports = async (): Promise<Airport[]> => {
  const airports = await fetchAirports();
  return airports
    .filter((a) => a.iata_code && a.type === "large_airport" && a.score)
    .sort((a, b) => (parseInt(b.score) || 0) - (parseInt(a.score) || 0))
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
