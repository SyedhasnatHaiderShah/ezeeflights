export type ApiSource = "travelport" | "external" | "proxy";
export type ApiService = "flights" | "hotels" | "cars";

const VALID_SOURCES = new Set<ApiSource>(["travelport", "external", "proxy"]);

const SERVICE_ENV_KEYS: Record<ApiService, string> = {
  flights: "FLIGHTS_API_SOURCE",
  hotels: "HOTELS_API_SOURCE",
  cars: "CARS_API_SOURCE",
};

function parseSource(value?: string): ApiSource | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized && VALID_SOURCES.has(normalized as ApiSource)) {
    return normalized as ApiSource;
  }
  return undefined;
}

/**
 * Resolves which API backend a service should use.
 *
 * 1. Per-service env: FLIGHTS_API_SOURCE / HOTELS_API_SOURCE / CARS_API_SOURCE
 * 2. Fallback: legacy TRAVELPORT_API flag
 *    - true  → all services use Travelport
 *    - false → flights use external, hotels/cars use proxy
 */
export function resolveApiSource(service: ApiService): ApiSource {
  const explicit = parseSource(process.env[SERVICE_ENV_KEYS[service]]);
  if (explicit) {
    return explicit;
  }

  const useTravelport = process.env.TRAVELPORT_API !== "false";
  if (useTravelport) {
    return "travelport";
  }

  if (service === "flights") {
    return "external";
  }
  return "proxy";
}

/** True when the service should call Travelport SOAP directly. */
export function usesTravelportSource(service: ApiService): boolean {
  return resolveApiSource(service) === "travelport";
}

/** True when flights should use ExternalFlightProvider (external API or RDP proxy URL). */
export function usesExternalFlightApi(): boolean {
  return resolveApiSource("flights") !== "travelport";
}

/** True when hotels/cars should route via EZEEFLIGHTS_*_SEARCH_URL. */
export function usesRemoteSearchUrl(service: "hotels" | "cars"): boolean {
  const source = resolveApiSource(service);
  return source === "proxy" || source === "external";
}
