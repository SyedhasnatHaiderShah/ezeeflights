/**
 * Travelport sometimes ends itineraries at metro/ground codes (e.g. XNB = Dubai bus
 * from AUH) while the user searched a nearby airport (DXB). Show the searched airport.
 */
const GROUND_TO_AIRPORT: Record<string, string> = {
  XNB: "DXB",
};

/** True when segment terminus satisfies the user's searched destination. */
export function destinationMatchesSearch(
  segmentDestination: string,
  searchedDestination?: string | null,
): boolean {
  const seg = (segmentDestination || "").trim().toUpperCase();
  const req = (searchedDestination || "").trim().toUpperCase();
  if (!seg || !req) return seg === req;
  if (seg === req) return true;
  const alias = GROUND_TO_AIRPORT[seg];
  return alias === req;
}

/** User-facing airport code for UI and emails. */
export function resolveDisplayAirport(
  airportCode?: string | null,
  searchedDestination?: string | null,
): string {
  const code = (airportCode || "").trim().toUpperCase();
  const searched = (searchedDestination || "").trim().toUpperCase();

  if (!code) return searched;

  const mapped = GROUND_TO_AIRPORT[code];
  if (mapped) {
    if (!searched || searched === mapped) return mapped;
  }

  return code;
}
