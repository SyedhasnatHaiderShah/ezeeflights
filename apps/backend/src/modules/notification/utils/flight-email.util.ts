import {
  formatAirportWithCity,
  getAirportCityName,
} from "../../../common/utils/airport-lookup.util";
import { renderFlightCard } from "../templates/layout";
import { resolveDisplayAirport } from "../../flight/utils/airport-display.util";
import { pickConnectedItinerarySegments } from "../../flight/utils/itinerary-segments.util";

/** Matches admin/trips display: INQ-{first 8 hex chars of UUID} */
export function formatInquiryReference(inquiryId: string): string {
  const hex = inquiryId.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `INQ-${hex}`;
}

export type ParsedFlightSegment = {
  carrier: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  cabinClass?: string;
  baggage?: string;
  equipmentType?: string;
  duration?: string;
  originTerminal?: string;
  destinationTerminal?: string;
  isReturn?: boolean;
};

export type FlightEmailVariables = {
  origin: string;
  destination: string;
  departureDate: string;
  arrivalDate: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  originCity: string;
  destinationCity: string;
  duration: string;
  stops: number;
  stopsLabel: string;
  stopCity: string;
  currency: string;
  totalPrice: string;
  baseFare: string;
  tax: string;
  refundShieldOpted: string;
  refundShieldFee: string;
  refundShieldStatus: string;
  priceBreakdownSection: string;
  priceBreakdownText: string;
  cabinClass: string;
  tripType: string;
  passengersSummary: string;
  travelerNames: string;
  segmentsSection: string;
  flightCardSection: string;
  totalPriceDisplay: string;
  airlineCode: string;
  itinerarySection: string;
  outboundItineraryHtml: string;
  inboundItineraryHtml: string;
  contactEmail: string;
  contactPhone: string;
  bookingStatus: string;
  arrivalDateLine: string;
  originLabel: string;
  destinationLabel: string;
};

const formatTime = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatMoney = (value: unknown): string => {
  const n =
    typeof value === "number" ? value : parseFloat(String(value ?? "0"));
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
};

const toNumber = (value: unknown): number => {
  const n =
    typeof value === "number" ? value : parseFloat(String(value ?? "0"));
  return Number.isFinite(n) ? n : 0;
};

const currencySymbol = (currency: string): string => {
  const normalized = currency.toUpperCase();
  if (normalized === "PKR") return "Rs";
  if (normalized === "USD") return "$";
  if (normalized === "EUR") return "EUR";
  if (normalized === "GBP") return "GBP";
  if (normalized === "AED") return "AED";
  if (normalized === "SAR") return "SAR";
  return currency;
};

const formatMoneyWithCurrency = (value: unknown, currency: string): string => {
  const n = toNumber(value);
  return `${currencySymbol(currency)} ${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/** Display currency + total — never mix ledger USD with UI (e.g. PKR) amounts. */
const resolveDisplayPricing = (
  snapshot: Record<string, any>,
  overrides: Record<string, unknown> = {},
) => {
  const savedBreakdown =
    snapshot.priceBreakdown && typeof snapshot.priceBreakdown === "object"
      ? snapshot.priceBreakdown
      : {};
  const ledgerCurrency = String(snapshot.currency ?? "USD").toUpperCase();
  const userCurrency = snapshot.userCurrency
    ? String(snapshot.userCurrency).toUpperCase()
    : "";

  let displayCurrency = getVal(
    overrides.currency,
    savedBreakdown.displayCurrency,
    userCurrency,
    savedBreakdown.currency,
    ledgerCurrency,
  ).toUpperCase();

  let displayTotal = 0;
  if (savedBreakdown.displayTotal != null) {
    displayTotal = toNumber(savedBreakdown.displayTotal);
  } else if (userCurrency && snapshot.userTotalFare != null) {
    displayCurrency = userCurrency;
    displayTotal = toNumber(snapshot.userTotalFare);
  } else if (savedBreakdown.total != null) {
    displayTotal = toNumber(savedBreakdown.total);
  } else if (overrides.amount != null) {
    displayTotal = toNumber(overrides.amount);
  } else {
    displayCurrency = ledgerCurrency;
    displayTotal = toNumber(snapshot.totalFare ?? snapshot.totalCost);
  }

  return { displayCurrency, displayTotal, savedBreakdown, ledgerCurrency };
};

const buildPriceBreakdown = (
  snapshot: Record<string, any>,
  currency: string,
  displayTotal: number,
  ledgerCurrency: string,
  inquiry?: Record<string, any>,
) => {
  let savedBreakdown: Record<string, any> = {};
  if (snapshot.priceBreakdown) {
    if (typeof snapshot.priceBreakdown === "string") {
      try {
        savedBreakdown = JSON.parse(snapshot.priceBreakdown);
      } catch {
        savedBreakdown = {};
      }
    } else if (typeof snapshot.priceBreakdown === "object") {
      savedBreakdown = snapshot.priceBreakdown;
    }
  }

  const useLedgerFallback = currency === ledgerCurrency;

  let baseFare = 0;
  let taxesAndFees = 0;
  let seatTotal = 0;
  let ancillaryTotal = 0;
  let addonsTotal = 0;
  let refundShieldFee = 0;

  if (
    currency === savedBreakdown.displayCurrency &&
    savedBreakdown.displayBaseFare != null
  ) {
    baseFare = toNumber(savedBreakdown.displayBaseFare);
    taxesAndFees = toNumber(savedBreakdown.displayTaxesAndFees);
    seatTotal = toNumber(savedBreakdown.displaySeatTotal);
    ancillaryTotal = toNumber(savedBreakdown.displayAncillaryTotal);
    addonsTotal = toNumber(savedBreakdown.displayAddonsTotal);
    refundShieldFee = toNumber(savedBreakdown.displayRefundShieldFee);
  } else if (
    currency === snapshot.userCurrency &&
    snapshot.userBaseFare != null
  ) {
    baseFare = toNumber(snapshot.userBaseFare);
    taxesAndFees = toNumber(snapshot.userTax);
    seatTotal = toNumber(snapshot.userSeatTotal ?? 0);
    ancillaryTotal = toNumber(snapshot.userAncillaryTotal ?? 0);
    addonsTotal = toNumber(snapshot.userAddonsTotal ?? 0);
    refundShieldFee = toNumber(snapshot.userRefundShieldFee ?? 0);
  } else {
    baseFare = toNumber(
      savedBreakdown.baseFare ?? (useLedgerFallback ? snapshot.baseFare : 0),
    );
    taxesAndFees = toNumber(
      savedBreakdown.taxesAndFees ?? (useLedgerFallback ? snapshot.tax : 0),
    );
    seatTotal = toNumber(savedBreakdown.seatTotal ?? snapshot.seatTotal);
    ancillaryTotal = toNumber(
      savedBreakdown.ancillaryTotal ?? snapshot.ancillaryTotal,
    );
    addonsTotal = toNumber(savedBreakdown.addonsTotal ?? snapshot.addonsTotal);
    refundShieldFee = toNumber(
      savedBreakdown.refundShieldFee ?? snapshot.refundShieldFee,
    );
  }

  const rawOpted = savedBreakdown.refundShieldOpted ?? snapshot.refundShieldOpted;
  const refundShieldOpted = rawOpted === true || rawOpted === "true" || rawOpted === 1 || rawOpted === "1" || snapshot.RefundShieldBooking === "Yes" || inquiry?.RefundShieldBooking === "Yes";
  
  const total = toNumber(
    savedBreakdown.displayTotal ?? savedBreakdown.total ?? displayTotal,
  );

  // Derive USD total equivalent if display currency is not USD
  let usdTotal = toNumber(snapshot.totalCost ?? snapshot.totalFare ?? 0);
  if (!usdTotal && currency === "USD") usdTotal = total;
  if (!usdTotal && snapshot.priceBreakdown?.total) usdTotal = toNumber(snapshot.priceBreakdown.total);

  // Extract travelers list from inquiry or snapshot
  let travelersList: { name: string; type: string }[] = [];
  const rawTravelers = inquiry?.travelers ?? snapshot?.travelers ?? snapshot?.passengerDetails ?? snapshot?.passengers;
  
  if (Array.isArray(rawTravelers) && rawTravelers.length > 0) {
    travelersList = rawTravelers.map((t: any) => ({
      name: `${t.firstName || t.first_name || ""} ${t.lastName || t.last_name || ""}`.trim() || "Traveler",
      type: (t.type || t.passengerType || t.ptype || "adult").toLowerCase(),
    }));
  } else {
    const rawNames = inquiry?.travelerNames ?? snapshot?.travelerNames;
    if (typeof rawNames === "string" && rawNames.trim()) {
      const names = rawNames.split(",").map((s: string) => s.trim()).filter(Boolean);
      travelersList = names.map((name: string) => ({
        name,
        type: "adult",
      }));
    }
  }

  // Count passenger categories
  let adults = inquiry?.adults ? Number(inquiry.adults) : snapshot?.adults ? Number(snapshot.adults) : 0;
  let children = inquiry?.children ? Number(inquiry.children) : snapshot?.children ? Number(snapshot.children) : 0;
  let infants = inquiry?.infants ? Number(inquiry.infants) : snapshot?.infants ? Number(snapshot.infants) : 0;
  
  if (!adults && !children && !infants && travelersList.length > 0) {
    adults = travelersList.filter((t) => t.type.includes("adult")).length || 1;
    children = travelersList.filter((t) => t.type.includes("child")).length;
    infants = travelersList.filter((t) => t.type.includes("infant")).length;
  }
  if (!adults) adults = 1;

  // Fallback: If no explicit traveler names exist, synthesize rows from passenger counts
  if (travelersList.length === 0) {
    for (let i = 1; i <= adults; i++) {
      travelersList.push({ name: `Passenger ${travelersList.length + 1}`, type: "adult" });
    }
    for (let i = 1; i <= children; i++) {
      travelersList.push({ name: `Passenger ${travelersList.length + 1}`, type: "child" });
    }
    for (let i = 1; i <= infants; i++) {
      travelersList.push({ name: `Passenger ${travelersList.length + 1}`, type: "infant" });
    }
  }

  // Retrieve base extra charges in USD
  const seatTotalUsd = toNumber(savedBreakdown.seatTotal ?? snapshot.seatTotal ?? 0);
  const ancillaryTotalUsd = toNumber(savedBreakdown.ancillaryTotal ?? snapshot.ancillaryTotal ?? 0);
  const addonsTotalUsd = toNumber(savedBreakdown.addonsTotal ?? snapshot.addonsTotal ?? 0);
  const refundShieldFeeUsd = toNumber(savedBreakdown.refundShieldFee ?? snapshot.refundShieldFee ?? 0);
  const affirmFeeUsd = toNumber(savedBreakdown.affirmFee ?? snapshot.affirmFee ?? 0);

  // Compute base ticket subtotal (base + tax) in USD
  const baseFareUsd = toNumber(snapshot.baseFare ?? 0);
  const taxUsd = toNumber(snapshot.tax ?? 0);
  let ticketSubtotalUsd = baseFareUsd + taxUsd;
  if (!ticketSubtotalUsd) {
    ticketSubtotalUsd = usdTotal - (seatTotalUsd + ancillaryTotalUsd + addonsTotalUsd + refundShieldFeeUsd + affirmFeeUsd);
  }

  // Retrieve passenger base fares in USD
  let adtUsd = toNumber(inquiry?.adtPrice ?? snapshot?.flightFare?.adultFare ?? 0);
  let chdUsd = toNumber(inquiry?.chdPrice ?? snapshot?.flightFare?.childFare ?? 0);
  let infUsd = toNumber(inquiry?.infPrice ?? snapshot?.flightFare?.infantFare ?? 0);

  if (adtUsd === 0 && ticketSubtotalUsd > 0) {
    const totalPaxWeight = adults * 1.0 + children * 0.7 + infants * 0.1;
    const effectiveWeight = totalPaxWeight > 0 ? totalPaxWeight : 1;
    adtUsd = ticketSubtotalUsd / effectiveWeight;
    if (children > 0) chdUsd = adtUsd * 0.7;
    if (infants > 0) infUsd = adtUsd * 0.1;
  } else {
    if (children > 0 && chdUsd === 0) chdUsd = adtUsd * 0.7;
    if (infants > 0 && infUsd === 0) infUsd = adtUsd * 0.1;
  }

  // Scale USD passenger base fares to match base ticket subtotal
  const sumUsd = adtUsd * adults + chdUsd * children + infUsd * infants;
  if (sumUsd > 0 && Math.abs(sumUsd - ticketSubtotalUsd) > 0.01) {
    const scale = ticketSubtotalUsd / sumUsd;
    adtUsd *= scale;
    chdUsd *= scale;
    infUsd *= scale;
  }

  // Retrieve ticket base fare and tax in display currency
  let baseFareDisplay = 0;
  let taxDisplay = 0;
  if (currency === "USD") {
    baseFareDisplay = baseFareUsd;
    taxDisplay = taxUsd;
  } else {
    baseFareDisplay = toNumber(snapshot.userBaseFare ?? savedBreakdown.displayBaseFare ?? 0);
    taxDisplay = toNumber(snapshot.userTax ?? savedBreakdown.displayTaxesAndFees ?? 0);
    if (!baseFareDisplay && !taxDisplay) {
      const conversionRate = usdTotal > 0 ? total / usdTotal : 0;
      baseFareDisplay = baseFareUsd * conversionRate;
      taxDisplay = taxUsd * conversionRate;
    }
  }
  const ticketSubtotalDisplay = baseFareDisplay + taxDisplay;

  // Determine individual passenger display prices
  let unitAdultPrice = 0;
  let unitChildPrice = 0;
  let unitInfantPrice = 0;

  if (currency === "USD") {
    unitAdultPrice = adtUsd;
    unitChildPrice = chdUsd;
    unitInfantPrice = infUsd;
  } else {
    const conversionRate = ticketSubtotalUsd > 0 ? ticketSubtotalDisplay / ticketSubtotalUsd : (usdTotal > 0 ? total / usdTotal : 0);
    unitAdultPrice = adtUsd * conversionRate;
    unitChildPrice = chdUsd * conversionRate;
    unitInfantPrice = infUsd * conversionRate;
  }

  // Convert other extra fees to display currency
  let seatTotalDisplay = 0;
  let ancillaryTotalDisplay = 0;
  let addonsTotalDisplay = 0;
  let refundShieldFeeDisplay = 0;
  let affirmFeeDisplay = 0;

  if (currency === "USD") {
    seatTotalDisplay = seatTotalUsd;
    ancillaryTotalDisplay = ancillaryTotalUsd;
    addonsTotalDisplay = addonsTotalUsd;
    refundShieldFeeDisplay = refundShieldFeeUsd;
    affirmFeeDisplay = affirmFeeUsd;
  } else {
    const conversionRate = usdTotal > 0 ? total / usdTotal : 0;
    seatTotalDisplay = toNumber(snapshot.userSeatTotal ?? savedBreakdown.displaySeatTotal ?? (seatTotalUsd * conversionRate));
    ancillaryTotalDisplay = toNumber(snapshot.userAncillaryTotal ?? savedBreakdown.displayAncillaryTotal ?? (ancillaryTotalUsd * conversionRate));
    addonsTotalDisplay = toNumber(snapshot.userAddonsTotal ?? savedBreakdown.displayAddonsTotal ?? (addonsTotalUsd * conversionRate));
    refundShieldFeeDisplay = toNumber(snapshot.userRefundShieldFee ?? savedBreakdown.displayRefundShieldFee ?? (refundShieldFeeUsd * conversionRate));
    affirmFeeDisplay = affirmFeeUsd * conversionRate;
  }

  const travelerRowsHtml = travelersList.map((t, idx) => {
    const pType = t.type.includes("child") ? "CHILD" : t.type.includes("infant") ? "INFANT" : "ADULT";
    const paxPrice = pType === "CHILD" ? unitChildPrice : pType === "INFANT" ? unitInfantPrice : unitAdultPrice;
    const paxUsd = pType === "CHILD" ? chdUsd : pType === "INFANT" ? infUsd : adtUsd;

    const badgeBg = pType === "CHILD" ? "#e0f2fe" : pType === "INFANT" ? "#fef3c7" : "#fee2e2";
    const badgeColor = pType === "CHILD" ? "#0369a1" : pType === "INFANT" ? "#b45309" : "#991b1b";

    return `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td width="36" style="vertical-align:middle; text-align:center; padding:12px 0 12px 16px;">
        <span style="display:inline-block; width:26px; height:26px; border-radius:50%; background:#f1f5f9; color:#475569; font-weight:500; font-size:12px; line-height:26px; text-align:center;">${idx + 1}</span>
      </td>
      <td style="vertical-align:middle; padding:12px 8px;">
        <p style="margin:0; font-size:14px; font-weight:600; color:#0f172a;">${t.name}</p>
        <p style="margin:3px 0 0 0;"><span style="display:inline-block; background:${badgeBg}; color:${badgeColor}; padding:1px 7px; border-radius:4px; font-size:10px; font-weight:600; text-transform:uppercase;">${pType}</span></p>
      </td>
      <td style="vertical-align:middle; text-align:right; padding:12px 16px 12px 8px;">
        <p style="margin:0; font-size:14px; font-weight:600; color:#0f172a;">${formatMoneyWithCurrency(paxPrice, currency)}</p>
        ${paxUsd && currency !== "USD" ? `<p style="margin:1px 0 0 0; font-size:11px; color:#64748b;">approx. ${formatMoneyWithCurrency(paxUsd, "USD")} USD</p>` : ""}
      </td>
    </tr>`;
  }).join("");

  const extraRows: string[] = [];

  if (seatTotalDisplay > 0) {
    extraRows.push(`
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td width="36" style="padding:12px 0 12px 16px;">&nbsp;</td>
      <td style="vertical-align:middle; padding:12px 8px;">
        <p style="margin:0; font-size:13px; font-weight:500; color:#475569;">Seating Charges</p>
      </td>
      <td style="vertical-align:middle; text-align:right; padding:12px 16px 12px 8px;">
        <p style="margin:0; font-size:13px; font-weight:600; color:#475569;">+${formatMoneyWithCurrency(seatTotalDisplay, currency)}</p>
        ${seatTotalUsd && currency !== "USD" ? `<p style="margin:1px 0 0 0; font-size:11px; color:#64748b;">approx. +${formatMoneyWithCurrency(seatTotalUsd, "USD")} USD</p>` : ""}
      </td>
    </tr>`);
  }

  if (ancillaryTotalDisplay > 0) {
    extraRows.push(`
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td width="36" style="padding:12px 0 12px 16px;">&nbsp;</td>
      <td style="vertical-align:middle; padding:12px 8px;">
        <p style="margin:0; font-size:13px; font-weight:500; color:#475569;">Extras</p>
      </td>
      <td style="vertical-align:middle; text-align:right; padding:12px 16px 12px 8px;">
        <p style="margin:0; font-size:13px; font-weight:600; color:#475569;">+${formatMoneyWithCurrency(ancillaryTotalDisplay, currency)}</p>
        ${ancillaryTotalUsd && currency !== "USD" ? `<p style="margin:1px 0 0 0; font-size:11px; color:#64748b;">approx. +${formatMoneyWithCurrency(ancillaryTotalUsd, "USD")} USD</p>` : ""}
      </td>
    </tr>`);
  }

  if (addonsTotalDisplay > 0) {
    extraRows.push(`
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td width="36" style="padding:12px 0 12px 16px;">&nbsp;</td>
      <td style="vertical-align:middle; padding:12px 8px;">
        <p style="margin:0; font-size:13px; font-weight:500; color:#475569;">Add-ons</p>
      </td>
      <td style="vertical-align:middle; text-align:right; padding:12px 16px 12px 8px;">
        <p style="margin:0; font-size:13px; font-weight:600; color:#475569;">+${formatMoneyWithCurrency(addonsTotalDisplay, currency)}</p>
        ${addonsTotalUsd && currency !== "USD" ? `<p style="margin:1px 0 0 0; font-size:11px; color:#64748b;">approx. +${formatMoneyWithCurrency(addonsTotalUsd, "USD")} USD</p>` : ""}
      </td>
    </tr>`);
  }

  if (refundShieldOpted && refundShieldFeeDisplay > 0) {
    extraRows.push(`
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td width="36" style="padding:12px 0 12px 16px;">&nbsp;</td>
      <td style="vertical-align:middle; padding:12px 8px;">
        <p style="margin:0; font-size:13px; font-weight:500; color:#475569;">Refund Shield Protection</p>
      </td>
      <td style="vertical-align:middle; text-align:right; padding:12px 16px 12px 8px;">
        <p style="margin:0; font-size:13px; font-weight:600; color:#475569;">+${formatMoneyWithCurrency(refundShieldFeeDisplay, currency)}</p>
        ${refundShieldFeeUsd && currency !== "USD" ? `<p style="margin:1px 0 0 0; font-size:11px; color:#64748b;">approx. +${formatMoneyWithCurrency(refundShieldFeeUsd, "USD")} USD</p>` : ""}
      </td>
    </tr>`);
  }

  if (affirmFeeDisplay > 0) {
    extraRows.push(`
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td width="36" style="padding:12px 0 12px 16px;">&nbsp;</td>
      <td style="vertical-align:middle; padding:12px 8px;">
        <p style="margin:0; font-size:13px; font-weight:500; color:#475569;">Affirm Fee (8%)</p>
      </td>
      <td style="vertical-align:middle; text-align:right; padding:12px 16px 12px 8px;">
        <p style="margin:0; font-size:13px; font-weight:600; color:#475569;">+${formatMoneyWithCurrency(affirmFeeDisplay, currency)}</p>
        ${affirmFeeUsd && currency !== "USD" ? `<p style="margin:1px 0 0 0; font-size:11px; color:#64748b;">approx. +${formatMoneyWithCurrency(affirmFeeUsd, "USD")} USD</p>` : ""}
      </td>
    </tr>`);
  }

  const paymentMethod = savedBreakdown.paymentMethod ?? snapshot.paymentMethod ?? (inquiry?.paymentMethod ?? "");
  let methodLabel = "";
  if (paymentMethod === "affirm") {
    methodLabel = "Affirm BNPL Plan";
  } else if (paymentMethod === "bid_deposit") {
    methodLabel = "Cheap Bid deposit";
  } else if (paymentMethod === "refund_shield") {
    methodLabel = "Standard Booking + Refund Shield";
  } else if (paymentMethod === "standard") {
    methodLabel = "Standard Booking";
  }

  if (methodLabel) {
    extraRows.push(`
    <tr style="border-bottom:1px solid #f1f5f9; background:#fafafa;">
      <td width="36" style="padding:10px 0 10px 16px;">&nbsp;</td>
      <td style="vertical-align:middle; padding:10px 8px;">
        <p style="margin:0; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.04em;">Payment Method</p>
      </td>
      <td style="vertical-align:middle; text-align:right; padding:10px 16px 10px 8px;">
        <p style="margin:0; font-size:11px; font-weight:600; color:#475569;">${methodLabel}</p>
      </td>
    </tr>`);
  }

  const priceBreakdownSection = `
    <div style="margin:0 0 16px 0; border:1px solid #e2e8f0; border-radius:14px; background:#ffffff; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.03);">
      ${travelerRowsHtml ? `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        ${travelerRowsHtml}
        ${extraRows.join("")}
      </table>` : ""}
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse; background:#ffffff; ${travelerRowsHtml ? 'border-top:1px solid #e2e8f0;' : ''}">
        <tr>
          <td style="padding:16px; vertical-align:middle;">
            <p style="margin:0; font-size:16px; font-weight:600; color:#0f172a;">Total Amount</p>
          </td>
          <td style="padding:16px; vertical-align:middle; text-align:right;">
            <p style="margin:0; font-size:22px; font-weight:600; color:#c52a2a; line-height:1.2;">${formatMoneyWithCurrency(total, currency)}</p>
            ${usdTotal && currency !== "USD" ? `<p style="margin:2px 0 0 0; font-size:11px; color:#64748b;">approx. ${formatMoneyWithCurrency(usdTotal, "USD")} USD</p>` : ""}
          </td>
        </tr>
      </table>
    </div>`;

  const priceBreakdownText = `Total Amount: ${formatMoneyWithCurrency(total, currency)}${usdTotal && currency !== "USD" ? ` (approx. ${formatMoneyWithCurrency(usdTotal, "USD")} USD)` : ""}`;

  return {
    refundShieldOpted,
    refundShieldFee,
    priceBreakdownText,
    priceBreakdownSection,
  };
};

const getVal = (...values: unknown[]): string => {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return "";
};

export function parseSegmentsFromSnapshot(
  snapshot: Record<string, any>,
  searchedDestination?: string | null,
): ParsedFlightSegment[] {
  if (!snapshot) return [];

  if (Array.isArray(snapshot.outbound) && snapshot.outbound.length > 0) {
    const parsedOutbound = snapshot.outbound.map((seg: any) => ({
      carrier: getVal(
        typeof seg.airline === "object" ? seg.airline?.code : seg.airline,
        seg.carrier,
        seg.carrierCode,
        snapshot.airlineCode,
        snapshot.airline,
      ),
      flightNumber: getVal(seg.flightNo, seg.flightNumber),
      origin: getVal(
        typeof seg.fromAirport === "object" ? seg.fromAirport?.code : seg.fromAirport,
        seg.fromAirportCode,
        seg.origin,
      ),
      destination: getVal(
        typeof seg.toAirport === "object" ? seg.toAirport?.code : seg.toAirport,
        seg.toAirportCode,
        seg.destination,
      ),
      departureAt: getVal(
        seg.departureDate,
        seg.departureAt,
        seg.departureTime,
        seg.DepartureTime,
        seg.DepartureDate,
      ),
      arrivalAt: getVal(
        seg.arrivalDate,
        seg.arrivalAt,
        seg.arrivalTime,
        seg.ArrivalTime,
        seg.ArrivalDate,
      ),
      cabinClass: getVal(seg.cabinClass, seg.class),
      baggage: getVal(seg.baggage, seg.baggageAllowance),
      equipmentType: getVal(seg.equipmentType, seg.equipment),
      duration: getVal(seg.elapsedTime, seg.duration, seg.totalTime),
      isReturn: false,
    }));

    const parsedInbound = (
      Array.isArray(snapshot.inbound) ? snapshot.inbound : []
    ).map((seg: any) => ({
      carrier: getVal(
        typeof seg.airline === "object" ? seg.airline?.code : seg.airline,
        seg.carrier,
        seg.carrierCode,
        snapshot.airlineCode,
        snapshot.airline,
      ),
      flightNumber: getVal(seg.flightNo, seg.flightNumber),
      origin: getVal(
        typeof seg.fromAirport === "object" ? seg.fromAirport?.code : seg.fromAirport,
        seg.fromAirportCode,
        seg.origin,
      ),
      destination: getVal(
        typeof seg.toAirport === "object" ? seg.toAirport?.code : seg.toAirport,
        seg.toAirportCode,
        seg.destination,
      ),
      departureAt: getVal(
        seg.departureDate,
        seg.departureAt,
        seg.departureTime,
        seg.DepartureTime,
        seg.DepartureDate,
      ),
      arrivalAt: getVal(
        seg.arrivalDate,
        seg.arrivalAt,
        seg.arrivalTime,
        seg.ArrivalTime,
        seg.ArrivalDate,
      ),
      cabinClass: getVal(seg.cabinClass, seg.class),
      baggage: getVal(seg.baggage, seg.baggageAllowance),
      equipmentType: getVal(seg.equipmentType, seg.equipment),
      duration: getVal(seg.elapsedTime, seg.duration, seg.totalTime),
      isReturn: true,
    }));

    return [...parsedOutbound, ...parsedInbound].map((seg) => ({
      ...seg,
      origin: resolveDisplayAirport(seg.origin),
      destination: resolveDisplayAirport(seg.destination),
    }));
  }

  let raw = snapshot.rawSegments || snapshot.segments;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const parsed = raw.map((seg: any) => {
    const s = seg?.["air:AirSegment"] ?? seg;
    return {
      carrier: getVal(
        typeof s.airline === "object" ? s.airline?.code : s.airline,
        s.Carrier,
        s.carrier,
        snapshot.airlineCode,
        snapshot.airline,
      ),
      flightNumber: getVal(s.flightNo, s.FlightNumber, s.flightNumber),
      origin: getVal(
        typeof s.fromAirport === "object" ? s.fromAirport?.code : s.fromAirport,
        s.fromAirportCode,
        s.Origin,
        s.origin,
      ),
      destination: getVal(
        typeof s.toAirport === "object" ? s.toAirport?.code : s.toAirport,
        s.toAirportCode,
        s.Destination,
        s.destination,
      ),
      departureAt: getVal(
        s.departureDate,
        s.DepartureTime,
        s.departureTime,
        s.departureAt,
      ),
      arrivalAt: getVal(
        s.arrivalDate,
        s.ArrivalTime,
        s.arrivalTime,
        s.arrivalAt,
      ),
      cabinClass: getVal(s.CabinClass, s.cabinClass, s.class, snapshot.cabinClass),
      baggage: getVal(s.BaggageAllowance, s.baggageAllowance, s.baggage),
      equipmentType: getVal(s.Equipment, s.equipmentType, s.equipment),
      duration: getVal(s.FlightTime, s.duration, s.elapsedTime, s.totalTime),
      isReturn: s.isReturn ?? (s.Group === 1 || s.group === 1 || s.Group === "1" || s.group === "1" || s.isReturn === "true"),
    };
  });

  const destForPath = getVal(
    searchedDestination,
    snapshot.searchedDestination,
    snapshot.arrivalAirport,
    snapshot.destination,
  );

  const originForPath = getVal(snapshot.departureAirport, snapshot.origin);

  const outboundRaw = parsed.filter((s) => !s.isReturn);
  const inboundRaw = parsed.filter((s) => s.isReturn);

  const outboundPath = pickConnectedItinerarySegments(outboundRaw, {
    origin: originForPath,
    destination: destForPath,
    preferredFlightNumber: getVal(snapshot.flightNumber),
  });

  const inboundPath =
    inboundRaw.length > 0
      ? pickConnectedItinerarySegments(inboundRaw, {
          origin: destForPath,
          destination: originForPath,
        })
      : [];

  return [...outboundPath, ...inboundPath].map((seg) => ({
    ...seg,
    origin: resolveDisplayAirport(seg.origin),
    destination: resolveDisplayAirport(seg.destination),
  }));
}

function getTimeEmoji(iso: string): string {
  if (!iso) return "✈️";
  try {
    const h = new Date(iso).getHours();
    if (isNaN(h)) return "✈️";
    if (h >= 0 && h < 5) return "🌙";
    if (h >= 5 && h < 10) return "🌅";
    if (h >= 10 && h < 16) return "☀️";
    if (h >= 16 && h < 20) return "🌆";
    if (h >= 20 && h < 22) return "🌙";
    return "🕛";
  } catch {
    return "✈️";
  }
}

export function buildSegmentsSection(
  segments: ParsedFlightSegment[],
  searchedDestination?: string | null,
): string {
  if (!segments.length) return "";

  const durationFmt = (mins: number) => {
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const outboundSegments = segments.filter((s) => !s.isReturn);
  const inboundSegments = segments.filter((s) => s.isReturn);

  const renderLegBlock = (group: ParsedFlightSegment[], legTitle: string, isFirstLeg: boolean) => {
    if (!group.length) return "";
    const first = group[0];
    const last = group[group.length - 1];

    const carrier = (first.carrier || "XX").toUpperCase();
    const logoUrl = `https://www.kayak.com/rimg/provider-logos/airlines/v/${carrier}.png?crop=1:1`;
    const flightNum = first.flightNumber || "";

    // Compute total leg duration
    let totalMins = 0;
    group.forEach((seg, i) => {
      let dur = Number(seg.duration);
      if (isNaN(dur) || dur <= 0) {
        if (seg.departureAt && seg.arrivalAt) {
          const d1 = new Date(seg.departureAt).getTime();
          const d2 = new Date(seg.arrivalAt).getTime();
          if (!isNaN(d1) && !isNaN(d2) && d2 > d1) dur = Math.round((d2 - d1) / 60000);
        }
      }
      if (dur > 0) totalMins += dur;

      if (i < group.length - 1 && seg.arrivalAt && group[i + 1].departureAt) {
        const arr = new Date(seg.arrivalAt).getTime();
        const dep = new Date(group[i + 1].departureAt).getTime();
        if (!isNaN(arr) && !isNaN(dep) && dep > arr) {
          totalMins += Math.round((dep - arr) / 60000);
        }
      }
    });

    const stopsCount = Math.max(0, group.length - 1);
    const stopCity = stopsCount > 0 ? getAirportCityName(first.destination, searchedDestination) : "";
    const stopsLabel = stopsCount === 0 ? "DIRECT" : `${stopsCount} STOP (${first.destination || "ATL"})`;
    const stopSubtext = stopsCount > 0 && stopCity ? `(${stopCity})` : "";
    const durationStr = totalMins > 0 ? durationFmt(totalMins) : "";

    const depTimeFormatted = formatTime(first.departureAt) || "--:--";
    const arrTimeFormatted = formatTime(last.arrivalAt) || "--:--";
    const depEmoji = getTimeEmoji(first.departureAt);

    const originCode = first.origin || "LGA";
    const destCode = last.destination || "PUJ";
    const originCityName = getAirportCityName(originCode);
    const destCityName = getAirportCityName(destCode, searchedDestination);

    let overnight = false;
    if (first.departureAt && last.arrivalAt) {
      try {
        const d1 = new Date(first.departureAt).getDate();
        const d2 = new Date(last.arrivalAt).getDate();
        if (!isNaN(d1) && !isNaN(d2) && d1 !== d2) overnight = true;
      } catch {
        overnight = false;
      }
    }

    return `
    <div style="${!isFirstLeg ? 'border-top:1px dashed #e2e8f0; margin-top:12px; padding-top:16px;' : ''}">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
        <tr>
          <!-- Airline Logo & Flight Number Column (Text Only) -->
          <td width="15%" style="vertical-align:top; padding-right:12px;">
            <p style="margin:0; font-size:14px; font-weight:600; color:#0f172a; line-height:1.1;">${carrier}</p>
            <p style="margin:2px 0 0 0; font-size:11px; font-weight:500; color:#64748b;">${flightNum}</p>
          </td>

          <!-- Departure Time & Airport -->
          <td width="26%" style="vertical-align:top;">
            <p style="margin:0; font-size:17px; font-weight:600; color:#0f172a; line-height:1.2;">
              ${depTimeFormatted} <span style="font-size:13px;">${depEmoji}</span>
            </p>
            <p style="margin:4px 0 0 0; font-size:13px; color:#64748b;">
              <strong style="color:#0f172a; font-weight:600;">${originCode}</strong> ${originCityName}
            </p>
          </td>

          <!-- Duration & Stops Line (Image 2) -->
          <td width="33%" style="vertical-align:middle; text-align:center; padding:0 6px;">
            ${durationStr ? `<p style="margin:0 0 3px 0; font-size:11px; font-weight:500; color:#0f172a;">${durationStr} <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#0284c7; color:#ffffff; font-size:8px; line-height:12px; text-align:center; vertical-align:middle;">🌐</span></p>` : ""}
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
              <tr>
                <td style="height:2px; background:#e2e8f0; text-align:center; vertical-align:middle; position:relative;">
                  <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#ef4444; margin-top:-2px; vertical-align:middle;"></span>
                </td>
              </tr>
            </table>
            <p style="margin:4px 0 0 0; font-size:10px; font-weight:500; color:#0f172a; letter-spacing:0.02em;">${stopsLabel}</p>
            ${stopSubtext ? `<p style="margin:1px 0 0 0; font-size:9px; font-weight:500; color:#64748b;">${stopSubtext}</p>` : ""}
          </td>

          <!-- Arrival Time & Airport -->
          <td width="26%" style="vertical-align:top; text-align:right;">
            <p style="margin:0; font-size:17px; font-weight:600; color:#0f172a; line-height:1.2;">
              ${arrTimeFormatted}
              ${overnight ? `<span style="font-size:10px; font-weight:500; color:#ef4444; vertical-align:super;">+1d</span>` : ""}
            </p>
            <p style="margin:4px 0 0 0; font-size:13px; color:#64748b;">
              <strong style="color:#0f172a; font-weight:600;">${destCode}</strong> ${destCityName}
            </p>
          </td>
        </tr>
      </table>
    </div>`;
  };

  const outboundGroup = outboundSegments.length ? outboundSegments : segments;
  const outboundHtml = renderLegBlock(outboundGroup, "OUTBOUND", true);
  const inboundHtml = inboundSegments.length ? renderLegBlock(inboundSegments, "RETURN", false) : "";

  return `
  <div style="border:1px solid #e2e8f0; border-radius:12px; background:#ffffff; padding:16px;">
    ${outboundHtml}
    ${inboundHtml}
  </div>`;
}

export function buildPassengersSummary(inquiry?: Record<string, any>, snapshot?: Record<string, any>): string {
  const ads = inquiry?.adults ? Number(inquiry.adults) : snapshot?.adults ? Number(snapshot.adults) : 0;
  const chs = inquiry?.children ? Number(inquiry.children) : snapshot?.children ? Number(snapshot.children) : 0;
  const infs = inquiry?.infants ? Number(inquiry.infants) : snapshot?.infants ? Number(snapshot.infants) : 0;

  const parts: string[] = [];
  if (ads)
    parts.push(`${ads} Adult${ads > 1 ? "s" : ""}`);
  if (chs)
    parts.push(`${chs} Child${chs > 1 ? "ren" : ""}`);
  if (infs)
    parts.push(`${infs} Infant${infs > 1 ? "s" : ""}`);

  if (parts.length === 0) {
    const rawTravelers = inquiry?.travelers ?? snapshot?.travelers ?? snapshot?.passengerDetails ?? snapshot?.passengers;
    if (Array.isArray(rawTravelers) && rawTravelers.length > 0) {
      let tAds = 0, tChs = 0, tInfs = 0;
      rawTravelers.forEach((t: any) => {
        const type = String(t.type || t.passengerType || t.ptype || "adult").toLowerCase();
        if (type.includes("child")) tChs++;
        else if (type.includes("infant")) tInfs++;
        else tAds++;
      });
      if (tAds) parts.push(`${tAds} Adult${tAds > 1 ? "s" : ""}`);
      if (tChs) parts.push(`${tChs} Child${tChs > 1 ? "ren" : ""}`);
      if (tInfs) parts.push(`${tInfs} Infant${tInfs > 1 ? "s" : ""}`);
    }
  }

  return parts.join(", ");
}

export function buildFlightEmailVariables(
  snapshot: Record<string, any>,
  inquiry?: Record<string, any>,
  overrides: Record<string, unknown> = {},
): FlightEmailVariables {
  const searchedDestination = getVal(
    inquiry?.destination,
    overrides.destination,
    snapshot.searchedDestination,
  );

  const segments = parseSegmentsFromSnapshot(snapshot, searchedDestination);
  const first = segments[0];
  const last = segments[segments.length - 1] ?? first;

  const stops = Math.max(0, segments.length - 1);
  let stopCity = "";
  if (stops > 0 && segments.length > 1) {
    stopCity = resolveDisplayAirport(
      segments[0].destination,
      searchedDestination,
    );
  }
  const stopLabel = stopCity
    ? formatAirportWithCity(stopCity, searchedDestination)
    : "";
  const stopsLabel =
    stops === 0
      ? "Direct"
      : `${stops} stop${stops > 1 ? "s" : ""}${stopLabel ? ` via ${stopLabel}` : ""}`;

  let flightDuration = snapshot.duration || snapshot.totalTime || 0;
  if (segments.length > 0) {
    const firstDep = new Date(segments[0].departureAt || 0).getTime();
    const lastArr = new Date(
      segments[segments.length - 1].arrivalAt || 0,
    ).getTime();
    if (firstDep > 0 && lastArr > firstDep) {
      flightDuration = Math.round((lastArr - firstDep) / 60000);
    }
  }
  const duration =
    flightDuration > 0
      ? `${Math.floor(flightDuration / 60)}h ${flightDuration % 60}m`
      : "";

  const { displayCurrency, displayTotal, ledgerCurrency } =
    resolveDisplayPricing(snapshot, overrides);
  const priceBreakdown = buildPriceBreakdown(
    snapshot,
    displayCurrency,
    displayTotal,
    ledgerCurrency,
    inquiry,
  );
  const totalPriceDisplay = formatMoneyWithCurrency(
    displayTotal,
    displayCurrency,
  );

  const outboundSegs = segments.filter((s) => !s.isReturn);
  const inboundSegs = segments.filter((s) => s.isReturn);

  const outboundFirst = outboundSegs[0] ?? first;
  const outboundLast = outboundSegs[outboundSegs.length - 1] ?? last;

  const origin = resolveDisplayAirport(
    getVal(
      outboundFirst?.origin,
      snapshot.departureAirport,
      inquiry?.origin,
      overrides.origin,
    ),
    inquiry?.origin,
  );
  const destination = resolveDisplayAirport(
    getVal(
      outboundLast?.destination,
      searchedDestination,
      snapshot.arrivalAirport,
      inquiry?.destination,
      overrides.destination,
    ),
    searchedDestination,
  );

  const originLabel = formatAirportWithCity(origin, inquiry?.origin);
  const destinationLabel = formatAirportWithCity(
    destination,
    searchedDestination,
  );
  const originCity = getAirportCityName(origin, inquiry?.origin);
  const destinationCity = getAirportCityName(destination, searchedDestination);

  const departRaw = getVal(
    outboundFirst?.departureAt,
    snapshot.departureAt,
    inquiry?.departDate,
    overrides.departDate,
  );
  const arriveRaw = getVal(
    (inboundSegs[inboundSegs.length - 1] ?? outboundLast)?.arrivalAt,
    snapshot.arrivalAt,
  );

  const cabinClass = getVal(
    inquiry?.cabinClass,
    snapshot.cabinClass,
    first?.cabinClass,
  );
  const hasInbound =
    inboundSegs.length > 0 ||
    (Array.isArray(snapshot.inbound) && snapshot.inbound.length > 0);
  const rawTripType = getVal(
    inquiry?.tripType,
    overrides.tripType,
    snapshot.tripType,
  ).toLowerCase();
  const tripType =
    rawTripType.includes("round") || rawTripType === "r" || hasInbound
      ? "round-trip"
      : rawTripType.includes("multi")
        ? "multi-city"
        : "one-way";
  const tripTypeLabel =
    tripType === "round-trip"
      ? "Round trip"
      : tripType === "multi-city"
        ? "Multi-city"
        : "One way";

  let travelerNames = "";
  const travelers = inquiry?.travelers;
  if (Array.isArray(travelers)) {
    travelerNames = travelers
      .map((t: any) => `${t.firstName || ""} ${t.lastName || ""}`.trim())
      .filter(Boolean)
      .join(", ");
  }

  const airlineCode = getVal(
    snapshot.airline?.code,
    snapshot.airlineCode,
    first?.carrier,
    "XX",
  ).toUpperCase();
  const airline = getVal(
    snapshot.airline?.name,
    snapshot.airline?.code,
    snapshot.airline,
    snapshot.airlineCode,
    first?.carrier,
  );
  const flightNumber = getVal(first?.flightNumber, snapshot.flightNumber);
  const arrivalDateFormatted = formatDate(arriveRaw);
  const departureDateFormatted = formatDate(departRaw);

  let flightCardSection = buildSegmentsSection(segments, searchedDestination);

  return {
    origin,
    destination,
    departureDate: departureDateFormatted,
    arrivalDate: arrivalDateFormatted,
    arrivalDateLine:
      arrivalDateFormatted && arrivalDateFormatted !== departureDateFormatted
        ? ` · Arrive ${arrivalDateFormatted}`
        : "",
    airline,
    flightNumber,
    departureTime: formatTime(departRaw),
    arrivalTime: formatTime(arriveRaw),
    originCity,
    destinationCity,
    originLabel,
    destinationLabel,
    duration,
    stops,
    stopsLabel,
    stopCity,
    currency: displayCurrency,
    totalPrice: formatMoney(displayTotal),
    totalPriceDisplay,
    airlineCode,
    baseFare: formatMoney(snapshot.userBaseFare ?? snapshot.baseFare),
    tax: formatMoney(snapshot.userTax ?? snapshot.tax),
    refundShieldOpted: priceBreakdown.refundShieldOpted ? "true" : "false",
    refundShieldFee: formatMoney(priceBreakdown.refundShieldFee),
    refundShieldStatus: priceBreakdown.refundShieldOpted
      ? "Selected"
      : "Not selected",
    priceBreakdownSection: priceBreakdown.priceBreakdownSection,
    priceBreakdownText: priceBreakdown.priceBreakdownText,
    cabinClass: cabinClass
      ? cabinClass.charAt(0).toUpperCase() + cabinClass.slice(1).toLowerCase()
      : "",
    tripType: tripTypeLabel,
    passengersSummary: buildPassengersSummary(inquiry, snapshot),
    travelerNames,
    segmentsSection: buildSegmentsSection(segments, searchedDestination),
    flightCardSection,
    itinerarySection: "",
    outboundItineraryHtml: "",
    inboundItineraryHtml: "",
    contactEmail: getVal(inquiry?.contactEmail, overrides.email),
    contactPhone: getVal(inquiry?.contactPhone),
    bookingStatus: getVal(inquiry?.status, "CONTACTED"),
  };
}
