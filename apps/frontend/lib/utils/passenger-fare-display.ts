import type { CurrencyCode } from "@/lib/store/currency-store";
import type { FlightFareShape } from "@/lib/utils/booking-fare";
import {
  buildTravelerSlots,
  type PassengerCategory,
} from "@/lib/validation/flight-passenger";

export type PassengerCountsInput = {
  adults: number;
  children: number;
  infants: number;
};

export type PassengerFareLine = {
  key: "adults" | "children" | "infants";
  count: number;
  label: string;
  amount: number;
  amountUsd: number;
};

export type NamedTravelerFare = {
  index: number;
  name: string;
  category: PassengerCategory;
  categoryLabel: string;
  amount: number;
  amountUsd: number;
};

type ConvertFn = (
  amount: number,
  from: CurrencyCode | string,
  to: CurrencyCode | string,
) => number;

type UnitFareOptions = {
  flightFare?: FlightFareShape | null;
  counts: PassengerCountsInput;
  targetTotal: number;
  sourceCurrency: string;
  displayCurrency: CurrencyCode;
  convert: ConvertFn;
  isBid?: boolean;
};

function totalPax(counts: PassengerCountsInput): number {
  return Math.max(counts.adults + counts.children + counts.infants, 1);
}

/** Tax-inclusive unit fare per passenger type in display currency. */
export function getScaledUnitFares(options: UnitFareOptions): {
  unitAdult: number;
  unitChild: number;
  unitInfant: number;
  /** Source-currency amounts (before display conversion) – use for USD approx to avoid double-conversion loss. */
  srcAdult: number;
  srcChild: number;
  srcInfant: number;
} {
  const {
    flightFare,
    counts,
    targetTotal,
    sourceCurrency,
    displayCurrency,
    convert,
  } = options;

  const pax = totalPax(counts);
  const fallbackUnit = targetTotal / pax;

  const adultFareUnit =
    flightFare?.adultFare ||
    (convert(fallbackUnit, displayCurrency, sourceCurrency) || fallbackUnit);
  const childFareUnit = flightFare?.childFare ?? adultFareUnit;
  const infantFareUnit = flightFare?.infantFare ?? adultFareUnit;

  let unitAdult = convert(adultFareUnit, sourceCurrency, displayCurrency);
  let unitChild = convert(childFareUnit, sourceCurrency, displayCurrency);
  let unitInfant = convert(infantFareUnit, sourceCurrency, displayCurrency);

  // srcX mirrors the source-currency values so amountUsd is calculated
  // as srcX → USD (single conversion) rather than displayCurrency → USD
  // (double conversion), which avoids precision loss like $900 → ₹86183 → $904.89.
  let srcAdult = adultFareUnit;
  let srcChild = childFareUnit;
  let srcInfant = infantFareUnit;

  if (targetTotal > 0 && !options.isBid) {
    const currentSum =
      unitAdult * counts.adults +
      unitChild * counts.children +
      unitInfant * counts.infants;
    if (currentSum > 0 && Math.abs(currentSum - targetTotal) > 0.01) {
      const scale = targetTotal / currentSum;
      unitAdult *= scale;
      unitChild *= scale;
      unitInfant *= scale;
      srcAdult *= scale;
      srcChild *= scale;
      srcInfant *= scale;
    }
  }

  return { unitAdult, unitChild, unitInfant, srcAdult, srcChild, srcInfant };
}

function travelerDisplayName(traveler: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
}): string {
  return [traveler.firstName, traveler.middleName, traveler.lastName]
    .filter(Boolean)
    .join(" ");
}

/** One row per named traveler with category label and individual fare. */
export function buildNamedTravelerFares(options: {
  travelers: Array<{
    firstName?: string;
    middleName?: string;
    lastName?: string;
  }>;
  flightFare?: FlightFareShape | null;
  searchParams?:
    | URLSearchParams
    | Record<string, string | null | undefined>
    | null
    | undefined;
  targetTotal: number;
  sourceCurrency: string;
  displayCurrency: CurrencyCode;
  convert: ConvertFn;
  categoryLabels: Record<PassengerCategory, string>;
  isBid?: boolean;
}): NamedTravelerFare[] {
  const counts = readPassengerCountsFromSearch(
    options.searchParams,
    options.flightFare,
  );
  const { unitAdult, unitChild, unitInfant, srcAdult, srcChild, srcInfant } = getScaledUnitFares({
    flightFare: options.flightFare,
    counts,
    targetTotal: options.targetTotal,
    sourceCurrency: options.sourceCurrency,
    displayCurrency: options.displayCurrency,
    convert: options.convert,
    isBid: options.isBid,
  });

  const slots = buildTravelerSlots(counts.adults, counts.children, counts.infants);
  const unitByCategory: Record<PassengerCategory, number> = {
    adult: unitAdult,
    child: unitChild,
    infant: unitInfant,
  };
  // Source-currency amounts used to derive USD approximation via a single
  // conversion (srcX → USD), avoiding the double-conversion rounding error
  // that occurs when going displayCurrency → USD (e.g. INR → USD ≠ original $).
  const srcByCategory: Record<PassengerCategory, number> = {
    adult: srcAdult,
    child: srcChild,
    infant: srcInfant,
  };

  return slots.map((slot) => {
    const traveler = options.travelers[slot.globalIndex];
    const name =
      traveler && travelerDisplayName(traveler)
        ? travelerDisplayName(traveler)
        : `${options.categoryLabels[slot.type]} ${slot.indexInType}`;
    const amount = unitByCategory[slot.type];
    const srcAmount = srcByCategory[slot.type];

    return {
      index: slot.globalIndex + 1,
      name,
      category: slot.type,
      categoryLabel: options.categoryLabels[slot.type],
      amount,
      // Convert source-currency fare → USD directly (single hop) so the
      // approx USD figure matches the original fare without rounding drift.
      amountUsd: options.convert(srcAmount, options.sourceCurrency, "USD"),
    };
  });
}

/** Per-type fares in display currency (tax-inclusive), scaled to match target total. */
export function computePassengerFareLines(options: {
  flightFare?: FlightFareShape | null;
  counts: PassengerCountsInput;
  targetTotal: number;
  sourceCurrency: string;
  displayCurrency: CurrencyCode;
  convert: ConvertFn;
  labels: {
    adult: string;
    child: string;
    infant: string;
  };
  isBid?: boolean;
}): PassengerFareLine[] {
  const { counts, labels, sourceCurrency, convert } = options;
  const { unitAdult, unitChild, unitInfant, srcAdult, srcChild, srcInfant } = getScaledUnitFares(options);

  const lines: PassengerFareLine[] = [];

  if (counts.adults > 0) {
    const amount = unitAdult * counts.adults;
    const srcAmount = srcAdult * counts.adults;
    lines.push({
      key: "adults",
      count: counts.adults,
      label: labels.adult,
      amount,
      amountUsd: convert(srcAmount, sourceCurrency, "USD"),
    });
  }
  if (counts.children > 0) {
    const amount = unitChild * counts.children;
    const srcAmount = srcChild * counts.children;
    lines.push({
      key: "children",
      count: counts.children,
      label: labels.child,
      amount,
      amountUsd: convert(srcAmount, sourceCurrency, "USD"),
    });
  }
  if (counts.infants > 0) {
    const amount = unitInfant * counts.infants;
    const srcAmount = srcInfant * counts.infants;
    lines.push({
      key: "infants",
      count: counts.infants,
      label: labels.infant,
      amount,
      amountUsd: convert(srcAmount, sourceCurrency, "USD"),
    });
  }

  return lines;
}

export function readPassengerCountsFromSearch(
  searchParams:
    | URLSearchParams
    | Record<string, string | null | undefined>
    | null
    | undefined,
  flightFare?: FlightFareShape | null,
): PassengerCountsInput {
  const get = (key: string): string | null => {
    if (!searchParams) return null;
    if (typeof (searchParams as URLSearchParams).get === "function") {
      return (searchParams as URLSearchParams).get(key);
    }
    return (searchParams as Record<string, string | null | undefined>)[key] ?? null;
  };

  return {
    adults: parseInt(get("adt") ?? get("adults") ?? get("adult") ?? String(flightFare?.adult ?? 1), 10) || 1,
    children: parseInt(get("chld") ?? get("chd") ?? get("children") ?? get("child") ?? String(flightFare?.child ?? 0), 10) || 0,
    infants: parseInt(get("inf") ?? get("infants") ?? get("infant") ?? String(flightFare?.infant ?? 0), 10) || 0,
  };
}
