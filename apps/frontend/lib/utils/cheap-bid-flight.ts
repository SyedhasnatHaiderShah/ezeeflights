import {
  CheapBidOfferRow,
  CheapBidSegmentDto,
} from "@/lib/api/admin-api";
import {
  FlightListItem,
  FlightSegment,
  Airport,
  Airline,
} from "@/lib/types/flight-api";

function airportCode(code: string): Airport {
  return { id: 0, code, name: code, cityCode: code, cityName: code };
}

function parseFlightNo(airlineNameNumber?: string): string {
  if (!airlineNameNumber) return "";
  const digits = airlineNameNumber.replace(/\D/g, "");
  return digits || airlineNameNumber;
}

function parseDurationMins(str?: string): number {
  if (!str) return 0;
  const h = str.match(/(\d+)\s*h/i);
  const m = str.match(/(\d+)\s*m/i);
  return (h ? parseInt(h[1], 10) : 0) * 60 + (m ? parseInt(m[1], 10) : 0);
}

function mapSegment(seg: CheapBidSegmentDto, cabin: string): FlightSegment {
  const code = seg.airlineCode || "";
  const airline: Airline = { id: 0, code, name: code };
  const departDt = seg.departDateTime || new Date().toISOString();
  const arriveDt = seg.arriveDateTime || departDt;

  return {
    departureDate: departDt,
    arrivalDate: arriveDt,
    fromAirport: airportCode(seg.depart || ""),
    toAirport: airportCode(seg.arrive || ""),
    airline,
    operatingAirline: airline,
    flightNo: parseFlightNo(seg.airlineNameNumber),
    equipmentType: "",
    baggageAllowance: "0 PC",
    elapsedTime: seg.totalTime || "",
    totalTime: seg.totalTime || "",
    cabinClass: cabin.toUpperCase(),
    isReturn: seg.direction === "inbound",
  };
}

/** Build a FlightListItem from admin cheap-bid data so FlightCard can preview the customer view. */
export function cheapBidOfferToFlightListItem(
  offer: CheapBidOfferRow,
): FlightListItem | null {
  const cabin = offer.cabin || "Economy";
  const segments = offer.segments || [];

  let outbound = segments
    .filter((s) => s.direction === "outbound")
    .sort((a, b) => a.legOrder - b.legOrder)
    .map((s) => mapSegment(s, cabin));

  const inbound = segments
    .filter((s) => s.direction === "inbound")
    .sort((a, b) => a.legOrder - b.legOrder)
    .map((s) => mapSegment(s, cabin));

  if (outbound.length === 0 && offer.originFrom && offer.destinationTo) {
    outbound = [
      mapSegment(
        {
          direction: "outbound",
          legOrder: 1,
          depart: offer.originFrom,
          arrive: offer.destinationTo,
          airlineCode: offer.airLine || "",
          airlineNameNumber: offer.airLine || "",
          departDateTime: offer.departureDate,
          arriveDateTime: offer.departureDate,
        },
        cabin,
      ),
    ];
  }

  if (outbound.length === 0) return null;

  const adt = offer.bidAdtPrice || 0;
  const chd = offer.bidChdPrice ?? adt;
  const inf = offer.bidInfPrice ?? 0;
  const adultFare = adt * 0.85;
  const adultTax = adt * 0.15;

  const firstDep = outbound[0].departureDate;
  const lastArr = outbound[outbound.length - 1].arrivalDate;
  let totalMins = outbound.reduce(
    (sum, seg) => sum + parseDurationMins(seg.totalTime),
    0,
  );
  if (!totalMins && firstDep && lastArr) {
    totalMins = Math.max(
      0,
      Math.round(
        (new Date(lastArr).getTime() - new Date(firstDep).getTime()) / 60000,
      ),
    );
  }

  const airlineCode = offer.airLine || outbound[0].airline.code || "";

  const numChd = offer.bidChdPrice ? 1 : 0;
  const numInf = offer.bidInfPrice ? 1 : 0;
  const totalCost = adt + (numChd * chd) + (numInf * inf);

  const origAdt = offer.originalAdtPrice || adt;
  const origChd = offer.originalChdPrice ?? origAdt;
  const origInf = offer.originalInfPrice ?? 0;
  const originalTotal = origAdt + (numChd * origChd) + (numInf * origInf);

  return {
    flightId: `cheap-bid-${offer.id}`,
    airline: { id: 0, code: airlineCode, name: airlineCode },
    currency: offer.currency || "USD",
    totalTime: totalMins,
    totalCost: totalCost,
    stops: Math.max(0, outbound.length - 1),
    outbound,
    inbound,
    flightFare: {
      adultFare,
      adultTax,
      grandTotal: totalCost,
      adult: 1,
      child: numChd,
      infant: numInf,
      childFare: chd * 0.85,
      childTax: chd * 0.15,
      infantFare: inf * 0.85,
      infantTax: inf * 0.15,
    },
    cheapBidApplied: {
      bidId: offer.id,
      bidToken: String(offer.id),
      originalTotal: originalTotal,
      bidAdtPrice: adt,
      bidChdPrice: chd,
      bidInfPrice: inf,
      originalAdtPrice: origAdt,
      originalChdPrice: origChd,
      originalInfPrice: origInf,
      linkExpiryDate: offer.linkExpiryDate || null,
      providerTotalFare: originalTotal,
    },
  };
}
