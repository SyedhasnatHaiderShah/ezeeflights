import { destinationMatchesSearch } from "./airport-display.util";

/** One leg of a trip (minimal fields for path building). */
export type ItineraryLeg = {
  origin: string;
  destination: string;
  departureAt?: string;
  arrivalAt?: string;
  flightNumber?: string;
  carrier?: string;
};

const normAirport = (code?: string) => (code || "").trim().toUpperCase();

/**
 * Travelport AirPricePoint lists multiple routing Options (LHR→BAH→DXB variants).
 * We must return only ONE connected path, not every segment from every option.
 */
export function pickConnectedItinerarySegments<T extends ItineraryLeg>(
  segments: T[],
  opts: {
    origin?: string;
    destination?: string;
    preferredFlightNumber?: string;
  } = {},
): T[] {
  if (segments.length <= 1) return segments;

  const origin = normAirport(opts.origin);
  const destination = normAirport(opts.destination);
  if (!origin || !destination) return segments;

  const preferredFn = opts.preferredFlightNumber
    ? String(opts.preferredFlightNumber).replace(/\D/g, "")
    : "";

  const starts = segments.filter((s) => normAirport(s.origin) === origin);
  if (!starts.length) return segments;

  const rankStart = (s: T) => {
    const fn = String(s.flightNumber || "").replace(/\D/g, "");
    const fnMatch = preferredFn && fn === preferredFn ? 0 : 1;
    const dep = new Date(s.departureAt || 0).getTime();
    return fnMatch * 1e15 + dep;
  };

  const sortedStarts = [...starts].sort((a, b) => rankStart(a) - rankStart(b));

  let bestPath: T[] = [];

  for (const start of sortedStarts) {
    const path: T[] = [start];
    const used = new Set<T>([start]);
    let city = normAirport(start.destination);

    while (
      !destinationMatchesSearch(city, destination) &&
      path.length < segments.length
    ) {
      const last = path[path.length - 1];
      const lastArrival = new Date(last.arrivalAt || last.departureAt || 0).getTime();

      const candidates = segments
        .filter((s) => !used.has(s) && normAirport(s.origin) === city)
        .filter((s) => {
          const dep = new Date(s.departureAt || 0).getTime();
          return !lastArrival || dep >= lastArrival - 6 * 60 * 60 * 1000;
        })
        .sort(
          (a, b) =>
            new Date(a.departureAt || 0).getTime() -
            new Date(b.departureAt || 0).getTime(),
        );

      const next = candidates[0];
      if (!next) break;
      path.push(next);
      used.add(next);
      city = normAirport(next.destination);
    }

    if (destinationMatchesSearch(city, destination)) {
      if (!bestPath.length || path.length < bestPath.length) {
        bestPath = path;
      }
    }
  }

  return bestPath.length > 0 ? bestPath : segments;
}
