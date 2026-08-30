import { FlightListItem, FlightSegment } from "@/lib/types/flight-api";

const GROUND_TO_AIRPORT: Record<string, string> = {
  XNB: "DXB",
};

/** User-facing airport code (e.g. XNB → DXB when searching Dubai). */
export function resolveDisplayAirportCode(
  code?: string | null,
  searchedDestination?: string | null,
): string {
  const c = (code || "").trim().toUpperCase();
  const searched = (searchedDestination || "").trim().toUpperCase();
  if (!c) return searched;
  const mapped = GROUND_TO_AIRPORT[c];
  if (mapped && (!searched || searched === mapped)) return mapped;
  return c;
}

function destinationMatchesSearch(
  segmentDestination: string,
  searchedDestination?: string | null,
): boolean {
  const seg = segmentDestination.toUpperCase();
  const req = (searchedDestination || "").toUpperCase();
  if (!seg || !req) return seg === req;
  if (seg === req) return true;
  return GROUND_TO_AIRPORT[seg] === req;
}

type RawSeg = Record<string, unknown>;

function parseRawSegments(entity: Record<string, unknown>): RawSeg[] {
  let raw = entity.rawSegments ?? entity.raw_segments ?? entity.segments ?? [];
  if (typeof raw === "string" && raw.length > 0) {
    try {
      raw = JSON.parse(raw as string);
    } catch {
      raw = [];
    }
  }
  return Array.isArray(raw) ? raw : [];
}

/** One connected path — not every Travelport routing option. */
export function pickConnectedRawSegments(
  segments: RawSeg[],
  opts: { origin?: string; destination?: string; preferredFlightNumber?: string },
): RawSeg[] {
  if (segments.length <= 1) return segments;

  const origin = (opts.origin || "").toUpperCase();
  const destination = resolveDisplayAirportCode(
    opts.destination,
    opts.destination,
  );
  if (!origin || !destination) return segments;

  const norm = (s: RawSeg) => {
    const x = (s as any)["air:AirSegment"] ?? s;
    return {
      origin: String(x.Origin || x.origin || "").toUpperCase(),
      destination: String(x.Destination || x.destination || "").toUpperCase(),
      departureAt: String(x.DepartureTime || x.departureTime || x.departureAt || ""),
      arrivalAt: String(x.ArrivalTime || x.arrivalTime || x.arrivalAt || ""),
      flightNumber: String(x.FlightNumber || x.flightNumber || ""),
      raw: x,
    };
  };

  const parsed = segments.map(norm);
  const preferredFn = (opts.preferredFlightNumber || "").replace(/\D/g, "");

  const starts = parsed.filter((s) => s.origin === origin);
  const rank = (s: (typeof parsed)[0]) => {
    const fn = s.flightNumber.replace(/\D/g, "");
    const fnMatch = preferredFn && fn === preferredFn ? 0 : 1;
    return fnMatch * 1e15 + new Date(s.departureAt || 0).getTime();
  };

  let best: RawSeg[] = [];

  for (const start of [...starts].sort((a, b) => rank(a) - rank(b))) {
    const path: RawSeg[] = [start.raw];
    const used = new Set([start.raw]);
    let city = start.destination;

    while (
      !destinationMatchesSearch(city, destination) &&
      path.length < segments.length
    ) {
      const lastArr = new Date(
        (path[path.length - 1] as any).ArrivalTime ||
          (path[path.length - 1] as any).arrivalAt ||
          0,
      ).getTime();
      const next = parsed
        .filter((s) => !used.has(s.raw) && s.origin === city)
        .filter((s) => {
          const dep = new Date(s.departureAt || 0).getTime();
          return !lastArr || dep >= lastArr - 6 * 60 * 60 * 1000;
        })
        .sort(
          (a, b) =>
            new Date(a.departureAt || 0).getTime() -
            new Date(b.departureAt || 0).getTime(),
        )[0];
      if (!next) break;
      path.push(next.raw);
      used.add(next.raw);
      city = next.destination;
    }

    if (destinationMatchesSearch(city, destination)) {
      if (!best.length || path.length < best.length) best = path;
    }
  }

  return best.length > 0 ? best : segments;
}

function mapRawSegment(
  s: RawSeg,
  entity: Record<string, unknown>,
  searchedDestination?: string | null,
): FlightSegment {
  const x = (s as any)["air:AirSegment"] ?? s;
  const durationMins =
    parseInt(
      String(x.FlightTime || x.flightTime || x.Duration || x.duration || x.elapsedTime || x.totalTime || "0"),
    ) || 0;
  const fromCode = resolveDisplayAirportCode(
    String(x.fromAirport?.code || x.fromAirport || x.Origin || x.departureAirport || ""),
    searchedDestination,
  );
  const toCode = resolveDisplayAirportCode(
    String(x.toAirport?.code || x.toAirport || x.Destination || x.arrivalAirport || ""),
    searchedDestination,
  );

  const depDate = String(x.departureDate || x.DepartureTime || x.departureAt || x.departureTime || "");
  const arrDate = String(x.arrivalDate || x.ArrivalTime || x.arrivalAt || x.arrivalTime || "");

  const airlineCode = String(x.airline?.code || x.Carrier || entity.airlineCode || "");
  const airlineName = String(
    x.airline?.name ||
      x.Carrier ||
      (typeof entity.airline === "object" && entity.airline !== null
        ? (entity.airline as any).name
        : entity.airline) ||
      entity.airlineCode ||
      "",
  );

  const isReturn = x.isReturn === true || x.Group > 0 || x.Group === "1";

  return {
    departureDate: depDate,
    arrivalDate: arrDate,
    fromAirport: {
      id: 0,
      code: fromCode,
      name: fromCode,
      cityCode: fromCode,
      cityName: fromCode,
    },
    toAirport: {
      id: 0,
      code: toCode,
      name: toCode,
      cityCode: toCode,
      cityName: toCode,
    },
    airline: {
      id: 0,
      code: airlineCode,
      name: airlineName || "Airline",
    },
    operatingAirline: {
      id: 0,
      code: airlineCode,
      name: airlineName || "Airline",
    },
    flightNo: String(x.flightNo || x.FlightNumber || x.flightNumber || entity.flightNumber || ""),
    equipmentType: String(x.Equipment || x.equipment || x.equipmentType || ""),
    baggageAllowance: String(
      x.BaggageAllowance || x.baggageAllowance || x.baggage || entity.baggageAllowance || "",
    ),
    elapsedTime: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
    totalTime: `${Math.floor(durationMins / 60)}h ${durationMins % 60}m`,
    cabinClass: String(entity.cabinClass ?? x.CabinClass ?? x.cabinClass ?? "ECONOMY").toUpperCase(),
    isReturn,
  };
}

/** Build FlightListItem shape from GET /flights/:id (same as results page). */
export function apiFlightToListItem(
  entity: Record<string, unknown> | null | undefined,
  opts?: {
    searchedOrigin?: string | null;
    searchedDestination?: string | null;
  },
): FlightListItem | null {
  if (!entity) return null;

  const searchedOrigin = opts?.searchedOrigin || null;
  const searchedDestination = opts?.searchedDestination || null;

  const allRaw = parseRawSegments(entity);
  const connected = pickConnectedRawSegments(allRaw, {
    origin:
      searchedOrigin ||
      String(entity.departureAirport || ""),
    destination:
      searchedDestination ||
      String(entity.arrivalAirport || ""),
    preferredFlightNumber: String(entity.flightNumber || ""),
  });

  const outbound = allRaw
    .filter((s: RawSeg) => {
      const g = (s as any).Group ?? (s as any).group;
      const isRet = (s as any).isReturn;
      if (isRet !== undefined) {
        return isRet === false;
      }
      return g === 0 || g === "0" || g === undefined || g === null;
    })
    .map((s) => mapRawSegment(s, entity, searchedDestination));

  const inbound = allRaw
    .filter((s: RawSeg) => {
      const g = (s as any).Group ?? (s as any).group;
      const isRet = (s as any).isReturn;
      if (isRet !== undefined) {
        return isRet === true;
      }
      return g > 0 || g === "1";
    })
    .map((s) => mapRawSegment(s, entity, searchedDestination));

  const segments =
    outbound.length > 0 ? outbound : allRaw.map((s) => mapRawSegment(s, entity, searchedDestination));

  const baseFare = Number(entity.baseFare ?? 0);
  const tax = Number(entity.tax ?? 0);
  const totalCost = Number(entity.totalFare ?? entity.price ?? baseFare + tax);

  const first = segments[0];
  const last = segments[segments.length - 1];

  let totalMinutes = Number(entity.duration || 0);
  if (!totalMinutes && first?.departureDate && last?.arrivalDate) {
    const ms =
      new Date(last.arrivalDate).getTime() -
      new Date(first.departureDate).getTime();
    totalMinutes = Math.max(0, Math.round(ms / 60000));
  }

  const entAirline = entity.airline;
  const entAirlineCode = entity.airlineCode;

  const airlineCodeStr = String(
    entAirlineCode ||
      (typeof entAirline === "object" && entAirline !== null
        ? (entAirline as any).code
        : entAirline) ||
      first?.airline?.code ||
      "",
  );
  const airlineNameStr = String(
    (typeof entAirline === "object" && entAirline !== null
      ? (entAirline as any).name
      : entAirline) ||
      first?.airline?.name ||
      entAirlineCode ||
      "Airline",
  );

  return {
    flightId: String(entity.id ?? entity.flightId ?? ""),
    airline: {
      id: 0,
      code: airlineCodeStr,
      name: airlineNameStr,
    },
    currency: String(entity.currency || "USD"),
    totalTime: totalMinutes,
    totalCost,
    stops: Math.max(0, segments.length - 1),
    outbound: segments,
    inbound,
    flightFare: {
      adultFare: baseFare,
      adultTax: tax,
      grandTotal: totalCost,
    },
  };
}

/** Prefer results-card data; merge live fares from GET /flights/:id. */
export function mergeDisplayFlight(
  storeFlight: FlightListItem | null | undefined,
  apiEntity: Record<string, unknown> | null | undefined,
  opts: {
    flightId?: string | null;
    searchedOrigin?: string | null;
    searchedDestination?: string | null;
  },
): FlightListItem | null {
  const fromApi = apiFlightToListItem(apiEntity, {
    searchedOrigin: opts.searchedOrigin,
    searchedDestination: opts.searchedDestination,
  });

  const id = opts.flightId || "";
  const storeMatches =
    storeFlight &&
    id &&
    !id.includes(",") &&
    (storeFlight.flightId === id ||
      storeFlight.flightId.split("::")[0] === id ||
      storeFlight.flightId === String(apiEntity?.id ?? "") ||
      storeFlight.flightId.split("::")[0] === String(apiEntity?.id ?? ""));

  if (storeMatches && storeFlight.outbound?.length) {
    return {
      ...storeFlight,
      // Prefer the ORIGINAL search-result price (storeFlight) over the live-repriced
      // value that comes through flightDetails → apiFlightToListItem → fromApi.
      // The live /flights/price call applies markup a second time, so fromApi.totalCost
      // is inflated (e.g. $1,955 search price → $3,065 live repriced).
      totalCost: storeFlight.totalCost ?? fromApi?.totalCost,
      currency: storeFlight.currency ?? fromApi?.currency,
      // Also keep the rich per-passenger flightFare from the search result rather than
      // the flattened { adultFare: totalCost, adultTax: 0 } that apiFlightToListItem builds.
      flightFare: storeFlight.flightFare ?? fromApi?.flightFare,
      totalTime: storeFlight.totalTime || fromApi?.totalTime || 0,
    };
  }

  return fromApi;
}
