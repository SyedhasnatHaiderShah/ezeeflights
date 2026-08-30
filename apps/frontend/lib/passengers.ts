/** Flight passenger buckets aligned with GDS PTCs (ADT 12+, CNN 2–11, INF under 2). */
export interface FlightPassengers {
  adults: number;
  children: number;
  infants: number;
}

/**
 * Hard cap: adults + children + infants combined cannot exceed this.
 * All three types share the same pool — 1 adult + 0 children + 8 infants = 9 ✓
 */
export const MAX_TOTAL_PASSENGERS = 9;
/** Alias kept so existing imports don't break. */
export const MAX_SEATED_PASSENGERS = MAX_TOTAL_PASSENGERS;

/**
 * Returns the valid min/max for a given passenger type.
 * Each type's max = 9 - (sum of the other two types).
 * Adults always have a minimum of 1.
 */
export function getPassengerLimits(
  passengers: FlightPassengers,
  key: keyof FlightPassengers,
): { min: number; max: number } {
  const total = passengers.adults + passengers.children + passengers.infants;
  // How many more of *this* type can we add without exceeding MAX_TOTAL_PASSENGERS?
  const remaining = MAX_TOTAL_PASSENGERS - (total - passengers[key]);

  switch (key) {
    case "adults":
      return { min: 1, max: Math.max(1, remaining) };
    case "children":
      return { min: 0, max: Math.max(0, remaining) };
    case "infants":
      return { min: 0, max: Math.max(0, remaining) };
  }
}

/** Apply a counter change, clamped so the total never exceeds MAX_TOTAL_PASSENGERS. */
export function applyPassengerChange(
  current: FlightPassengers,
  key: keyof FlightPassengers,
  value: number,
): FlightPassengers {
  const limits = getPassengerLimits(current, key);
  const clamped = Math.min(limits.max, Math.max(limits.min, value));
  return { ...current, [key]: clamped };
}
