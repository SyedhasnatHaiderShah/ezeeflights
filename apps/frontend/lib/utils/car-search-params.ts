/**
 * Normalizes car search URL params from both car-native and shared booking-form aliases.
 * Booking form uses org/des/dDate/rDate (same as flights); car search uses pickup/dropoff/pickupDate/dropoffDate.
 */
export type ParsedCarSearchParams = {
  pickup: string;
  dropoff: string;
  pickupDate: string;
  dropoffDate: string;
};

type ParamSource =
  | URLSearchParams
  | { get(name: string): string | null }
  | Record<string, string | undefined>;

function readParam(source: ParamSource, key: string): string {
  if (source instanceof URLSearchParams) {
    return source.get(key) || "";
  }
  if (typeof (source as { get?: unknown }).get === "function") {
    return (source as { get(name: string): string | null }).get(key) || "";
  }
  const record = source as Record<string, string | undefined>;
  const value = record[key];
  return value ?? "";
}

export function parseCarSearchParams(source: ParamSource): ParsedCarSearchParams {
  const pickup =
    readParam(source, "pickup") ||
    readParam(source, "pickup_location") ||
    readParam(source, "org") ||
    "";

  const dropoff =
    readParam(source, "dropoff") ||
    readParam(source, "dropoff_location") ||
    readParam(source, "des") ||
    pickup;

  const pickupDate =
    readParam(source, "pickupDate") ||
    readParam(source, "pickup_date") ||
    readParam(source, "dDate") ||
    "";

  const dropoffDate =
    readParam(source, "dropoffDate") ||
    readParam(source, "dropoff_date") ||
    readParam(source, "rDate") ||
    "";

  return { pickup, dropoff, pickupDate, dropoffDate };
}

/** Query params for the cars search API (pickup_location, pickup_date, …). */
export function toCarApiSearchParams(
  parsed: ParsedCarSearchParams,
): URLSearchParams {
  const apiParams = new URLSearchParams();
  if (parsed.pickup) apiParams.set("pickup_location", parsed.pickup);
  if (parsed.dropoff) apiParams.set("dropoff_location", parsed.dropoff);
  if (parsed.pickupDate) apiParams.set("pickup_date", parsed.pickupDate);
  if (parsed.dropoffDate) apiParams.set("dropoff_date", parsed.dropoffDate);
  return apiParams;
}
