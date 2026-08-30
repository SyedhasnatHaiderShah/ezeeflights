export type PassengerCounts = {
  adults: number;
  children: number;
  infants: number;
};

export type FlightFareShape = {
  adultFare?: number;
  adultTax?: number;
  childFare?: number;
  childTax?: number;
  infantFare?: number;
  infantTax?: number;
  grandTotal?: number;
  adult?: number;
  child?: number;
  infant?: number;
};

export type FareSource = {
  baseFare?: number;
  tax?: number;
  totalFare?: number;
  totalCost?: number;
  currency?: string;
  flightFare?: FlightFareShape;
  pricedFor?: PassengerCounts;
};

export type ComputedFareTotals = {
  baseFare: number;
  tax: number;
  total: number;
  currency: string;
};

/** Canonical currency for Postgres inquiry, CRM MySQL, and payment metadata */
export const BOOKING_LEDGER_CURRENCY = "USD";

export type CurrencyConvertFn = (
  amount: number,
  from: string,
  to: string,
) => number;

export type UsdLedgerTotals = {
  currency: typeof BOOKING_LEDGER_CURRENCY;
  baseFare: number;
  tax: number;
  seatTotal: number;
  ancillaryTotal: number;
  addonsTotal: number;
  refundShieldFee: number;
  affirmFee: number;
  subtotal: number;
  total: number;
};

/** Convert display-priced components to USD for API / CRM (display currency is UI-only). */
export function computeUsdLedgerTotals(input: {
  computedFare: ComputedFareTotals;
  seatTotal: number;
  ancillaryTotal: number;
  addonsTotal: number;
  /** Currency used for seatTotal, ancillaryTotal, addonsTotal (display currency). */
  displayCurrency: string;
  refundShieldOpted: boolean;
  isBid: boolean;
  paymentMethod: "standard" | "affirm";
  convert: CurrencyConvertFn;
  ledgerCurrency?: string;
}): UsdLedgerTotals {
  const ledgerCurrency = input.ledgerCurrency || BOOKING_LEDGER_CURRENCY;
  const toLedger = (amount: number, from: string) =>
    input.convert(amount, from, ledgerCurrency);

  const baseFare = toLedger(
    input.computedFare.baseFare,
    input.computedFare.currency,
  );
  const tax = toLedger(input.computedFare.tax, input.computedFare.currency);
  const seatTotal = toLedger(input.seatTotal, input.displayCurrency);
  const ancillaryTotal = toLedger(input.ancillaryTotal, input.displayCurrency);
  const addonsTotal = toLedger(input.addonsTotal, input.displayCurrency);

  const subtotal = baseFare + tax + seatTotal + ancillaryTotal + addonsTotal;
  const refundShieldFee =
    !input.isBid && input.refundShieldOpted ? subtotal * 0.1 : 0;
  const subtotalWithShield = subtotal + refundShieldFee;
  const affirmFee =
    !input.isBid && input.paymentMethod === "affirm"
      ? subtotalWithShield * 0.08
      : 0;
  const total = subtotalWithShield + affirmFee;

  return {
    currency: ledgerCurrency as any,
    baseFare,
    tax,
    seatTotal,
    ancillaryTotal,
    addonsTotal,
    refundShieldFee,
    affirmFee,
    subtotal,
    total,
  };
}

function totalPassengers(c: PassengerCounts): number {
  return Math.max(c.adults + c.children + c.infants, 1);
}

/** Per-passenger unit fares from search / external API. */
function computeFromPerPassengerFares(
  fare: FlightFareShape,
  counts: PassengerCounts,
): ComputedFareTotals | null {
  const hasUnit =
    fare.adultFare != null ||
    fare.childFare != null ||
    fare.infantFare != null ||
    fare.grandTotal != null;
  if (!hasUnit) return null;

  const adultFare = Number(fare.adultFare || 0);
  const childFare = Number(fare.childFare || adultFare * 0.75);
  const infantFare = Number(fare.infantFare || adultFare * 0.1);
  const adultTax = 0;
  const childTax = 0;
  const infantTax = 0;

  const tax = 0;

  // Prefer grandTotal from EzeeFlights — adultFare is base, not tax-inclusive.
  if (fare.grandTotal != null && fare.grandTotal > 0) {
    const searchCounts: PassengerCounts = {
      adults: Math.max(Number(fare.adult ?? counts.adults), 1),
      children: Number(fare.child ?? counts.children),
      infants: Number(fare.infant ?? counts.infants),
    };
    const searchTax = 0;
    // grandTotal is the all-pax total already in the source currency.
    // Scale it proportionally if the current pax counts differ from the searched counts.
    const searchBase = fare.grandTotal;

    const scaled = scaleTotals(searchBase, searchTax, searchCounts, counts);
    return scaled;
  }

  // adultFare / childFare / infantFare are base fares; taxes are separate.
  const baseFare =
    counts.adults * adultFare +
    counts.children * childFare +
    counts.infants * infantFare;

  return {
    baseFare,
    tax,
    total: baseFare + tax,
    // currency is intentionally omitted here — caller (computeBookingFareTotals) stamps the correct source.currency
    currency: "USD",
  };
}

function scaleTotals(
  baseFare: number,
  tax: number,
  fromCounts: PassengerCounts,
  toCounts: PassengerCounts,
): ComputedFareTotals {
  const fromPax = totalPassengers(fromCounts);
  const toPax = totalPassengers(toCounts);
  const ratio = toPax / fromPax;
  const scaledBase = baseFare * ratio;
  const scaledTax = tax * ratio;
  return {
    baseFare: scaledBase,
    tax: scaledTax,
    total: scaledBase + scaledTax,
    currency: "USD",
  };
}

/**
 * Compute base fare + tax for the current passenger mix.
 * Prefer per-type fares from flightFare; otherwise scale stored totals from pricedFor / search counts.
 */
export function computeBookingFareTotals(
  source: FareSource | null | undefined,
  counts: PassengerCounts,
  isBid?: boolean,
): ComputedFareTotals {
  if (!source) {
    return { baseFare: 0, tax: 0, total: 0, currency: "USD" };
  }

  if (isBid) {
    const fare = source.flightFare;
    const adultFare = Number(fare?.adultFare || source.baseFare || 0);
    const childFare = Number(fare?.childFare ?? adultFare * 0.75);
    const infantFare = Number(fare?.infantFare ?? adultFare * 0.1);

    const baseFare =
      counts.adults * adultFare +
      counts.children * childFare +
      counts.infants * infantFare;

    return {
      baseFare,
      tax: 0,
      total: baseFare,
      currency: source.currency || "USD",
    };
  }

  const fare = source.flightFare;
  if (fare) {
    const fromPerPax = computeFromPerPassengerFares(fare, counts);
    if (fromPerPax && fromPerPax.total > 0) {
      // Always stamp the source currency so GBP/GDS fares aren't treated as USD on non-UK domains
      return { ...fromPerPax, currency: source.currency || "USD" };
    }
  }

  const totalFare = Number(source.totalFare ?? source.totalCost ?? 0);
  let baseFare = Number(source.baseFare ?? 0);
  let tax = Number(source.tax ?? 0);
  if (baseFare <= 0 && tax <= 0 && totalFare > 0) {
    baseFare = totalFare * 0.85;
    tax = totalFare * 0.15;
  } else if (tax <= 0 && totalFare > baseFare) {
    tax = totalFare - baseFare;
  }

  const pricedFor: PassengerCounts = source.pricedFor ?? {
    adults: Math.max(counts.adults, 1),
    children: counts.children,
    infants: counts.infants,
  };

  const scaled = scaleTotals(baseFare, tax, pricedFor, counts);
  return { ...scaled, currency: source.currency || "USD" };
}
