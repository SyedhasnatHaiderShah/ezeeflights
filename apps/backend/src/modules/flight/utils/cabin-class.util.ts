export type DbCabinClass =
  | "ECONOMY"
  | "PREMIUM_ECONOMY"
  | "BUSINESS"
  | "FIRST";

export const CABIN_CLASS_ORDER: DbCabinClass[] = [
  "ECONOMY",
  "PREMIUM_ECONOMY",
  "BUSINESS",
  "FIRST",
];

/** CabinClassSelector option ids (frontend). */
/** Travelport PermittedCabins / CabinClass Type attribute values. */
export function dbCabinToTravelportType(cabin: DbCabinClass): string {
  const map: Record<DbCabinClass, string> = {
    ECONOMY: "Economy",
    PREMIUM_ECONOMY: "PremiumEconomy",
    BUSINESS: "Business",
    FIRST: "First",
  };
  return map[cabin];
}

export function dbCabinClassToSelectorId(cabin: DbCabinClass): string {
  const map: Record<DbCabinClass, string> = {
    ECONOMY: "Economy",
    PREMIUM_ECONOMY: "PremiumEconomy",
    BUSINESS: "Business",
    FIRST: "First",
  };
  return map[cabin];
}

export function selectorIdToDbCabinClass(id?: string | null): DbCabinClass {
  return normalizeCabinClass(id, "ECONOMY");
}

/** Map Travelport / UI / query values to DB-allowed cabin_class. */
export function normalizeCabinClass(
  value?: string | null,
  fallback: DbCabinClass = "ECONOMY",
): DbCabinClass {
  if (!value?.trim()) return fallback;

  const raw = value.trim();
  const upper = raw.toUpperCase().replace(/[\s-]+/g, "_");

  if (upper === "ALL" || upper === "ANY" || upper === "ALL_CLASSES") {
    return fallback;
  }

  const map: Record<string, DbCabinClass> = {
    ECONOMY: "ECONOMY",
    Y: "ECONOMY",
    M: "ECONOMY",
    K: "ECONOMY",
    H: "ECONOMY",
    L: "ECONOMY",
    Q: "ECONOMY",
    V: "ECONOMY",
    W: "ECONOMY",
    PREMIUM_ECONOMY: "PREMIUM_ECONOMY",
    PREMIUM: "PREMIUM_ECONOMY",
    PE: "PREMIUM_ECONOMY",
    S: "PREMIUM_ECONOMY",
    BUSINESS: "BUSINESS",
    C: "BUSINESS",
    J: "BUSINESS",
    D: "BUSINESS",
    Z: "BUSINESS",
    FIRST: "FIRST",
    F: "FIRST",
    A: "FIRST",
    P: "FIRST",
  };

  if (map[upper]) return map[upper];

  const title = raw.toLowerCase();
  if (title.includes("premium")) return "PREMIUM_ECONOMY";
  if (title.includes("business")) return "BUSINESS";
  if (title.includes("first")) return "FIRST";
  if (title.includes("economy")) return "ECONOMY";

  return fallback;
}

/** Booking code / fare basis first letter (IATA). */
export function inferCabinFromFareBasis(
  fareBasis?: string | null,
): DbCabinClass | null {
  if (!fareBasis?.trim()) return null;
  const code = fareBasis.trim().charAt(0).toUpperCase();
  const mapped = normalizeCabinClass(code, "ECONOMY");
  if (code === "Y" || code === "M" || code === "K") return mapped;
  if (["C", "J", "D", "Z", "I"].includes(code)) return "BUSINESS";
  if (["F", "A", "P"].includes(code)) return "FIRST";
  if (["W", "S", "R"].includes(code)) return "PREMIUM_ECONOMY";
  return mapped;
}

export function collectCabinsFromBookingInfo(
  bookingInfo: Record<string, unknown> | undefined,
  fareBasis?: string | null,
): DbCabinClass[] {
  const cabins = new Set<DbCabinClass>();
  const raw =
    (bookingInfo?.CabinClass as string) || (bookingInfo?.cabinClass as string);
  if (raw) {
    cabins.add(normalizeCabinClass(raw));
  }
  const fb =
    fareBasis ||
    (bookingInfo?.FareBasis as string) ||
    (bookingInfo?.fareBasis as string);
  const inferred = inferCabinFromFareBasis(fb);
  if (inferred) cabins.add(inferred);
  return [...cabins];
}

export function sortDbCabinClasses(cabins: Iterable<DbCabinClass>): DbCabinClass[] {
  const unique = [...new Set(cabins)];
  return unique.sort(
    (a, b) => CABIN_CLASS_ORDER.indexOf(a) - CABIN_CLASS_ORDER.indexOf(b),
  );
}

/** Same physical itinerary across multiple AirPricePoint rows. */
export function itinerarySignature(segments: Array<Record<string, unknown>>): string {
  if (!segments?.length) return "";
  return segments
    .map(
      (s) =>
        `${s.Carrier}|${s.FlightNumber}|${s.Origin}|${s.Destination}|${String(s.DepartureTime || "").slice(0, 16)}`,
    )
    .join(">");
}

export function cabinClassToFlightClass(cabin?: string | null): number {
  if (!cabin) return 4; // Default to 4 (ALL)
  const upper = cabin.trim().toUpperCase().replace(/[\s_-]+/g, "");
  if (upper === "ECONOMY") return 0;
  if (upper === "PREMIUMECONOMY" || upper === "PREMIUM") return 3;
  if (upper === "BUSINESS") return 2;
  if (upper === "FIRST") return 1;
  if (upper === "ALL") return 4;
  return 4;
}
