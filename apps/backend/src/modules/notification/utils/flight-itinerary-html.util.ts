import {
  parseSegmentsFromSnapshot,
  type ParsedFlightSegment,
} from "./flight-email.util";

/** CRM tbl_customerdetails.bookingRef — yyMMddHHmmss */
export function generateCrmBookingRef(now = new Date()): string {
  const istStr = now.toLocaleString("sv-SE", { timeZone: "Asia/Kolkata" }); // "YYYY-MM-DD HH:mm:ss"
  const yy = istStr.slice(2, 4);
  const MM = istStr.slice(5, 7);
  const dd = istStr.slice(8, 10);
  const HH = istStr.slice(11, 13);
  const mm = istStr.slice(14, 16);
  const ss = istStr.slice(17, 19);
  return `${yy}${MM}${dd}${HH}${mm}${ss}`;
}

export function isCrmBookingRef(ref: unknown): boolean {
  return /^\d{12}$/.test(String(ref ?? "").trim());
}

const EZEE_LOGO_BASE = "https://www.ezeeflights.com/assets/airlinelogo";
const PLANE_ICON_URL = "https://www.ezeeflights.com/Content/images/plane.png";
const TICKET_ICON_URL = "https://www.ezeeflights.com/Content/images/ticket.png";

export type ItineraryDirection = "OUTBOUND" | "INBOUND";

export type BookingItineraryLeg = {
  label: ItineraryDirection;
  segments: ParsedFlightSegment[];
  html: string;
};

export type BookingConfirmationItinerary = {
  bookingRef: string;
  outboundHtml: string;
  inboundHtml: string | null;
  itineraryHtml: string;
  legs: BookingItineraryLeg[];
};

const getVal = (...values: unknown[]): string => {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== "") return String(v);
  }
  return "";
};

const formatLegDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatTimeAirport = (dateStr: string, airport: string): string => {
  if (!dateStr) return airport || "";
  try {
    const d = new Date(dateStr);
    const time = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${time} ${airport}`.trim();
  } catch {
    return airport || "";
  }
};

const formatTerminalLine = (
  dateStr: string,
  airport: string,
  terminal?: string,
): string => {
  let dayPart = "";
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      const day = String(d.getDate()).padStart(2, "0");
      const mon = d.toLocaleString("en-US", { month: "short" });
      dayPart = `${day} ${mon} `;
    } catch {
      dayPart = "";
    }
  }
  const term = terminal ? `Terminal ${terminal} ` : "";
  return `${dayPart}${term}${airport}`.trim();
};

function mapOutboundFromSnapshot(
  snapshot: Record<string, any>,
): ParsedFlightSegment[] {
  if (Array.isArray(snapshot.outbound) && snapshot.outbound.length > 0) {
    return snapshot.outbound.map((seg: any) => ({
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
      ),
      arrivalAt: getVal(
        seg.arrivalDate,
        seg.arrivalAt,
        seg.arrivalTime,
        seg.ArrivalTime,
      ),
      cabinClass: getVal(seg.cabinClass, seg.class, snapshot.cabinClass),
      baggage: getVal(seg.baggageAllowance, seg.baggage),
      originTerminal: getVal(
        typeof seg.fromAirport === "object" ? seg.fromAirport?.terminal : undefined,
        seg.fromTerminal,
        seg.originTerminal,
      ),
      destinationTerminal: getVal(
        typeof seg.toAirport === "object" ? seg.toAirport?.terminal : undefined,
        seg.toTerminal,
        seg.destinationTerminal,
      ),
      duration: getVal(
        seg.elapsedTime,
        seg.totalTime,
        seg.duration,
        seg.FlightTime,
      ),
      equipmentType: getVal(seg.equipmentType, seg.Equipment),
    })) as ParsedFlightSegment[];
  }
  return parseSegmentsFromSnapshot(snapshot).filter(
    (seg) => !(seg as any).isReturn,
  );
}

function mapInboundFromSnapshot(
  snapshot: Record<string, any>,
): ParsedFlightSegment[] {
  if (Array.isArray(snapshot.inbound) && snapshot.inbound.length > 0) {
    return snapshot.inbound.map((seg: any) => ({
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
      ),
      arrivalAt: getVal(
        seg.arrivalDate,
        seg.arrivalAt,
        seg.arrivalTime,
        seg.ArrivalTime,
      ),
      cabinClass: getVal(seg.cabinClass, seg.class, snapshot.cabinClass),
      baggage: getVal(seg.baggageAllowance, seg.baggage),
      originTerminal: getVal(
        typeof seg.fromAirport === "object" ? seg.fromAirport?.terminal : undefined,
        seg.fromTerminal,
        seg.originTerminal,
      ),
      destinationTerminal: getVal(
        typeof seg.toAirport === "object" ? seg.toAirport?.terminal : undefined,
        seg.toTerminal,
        seg.destinationTerminal,
      ),
      duration: getVal(
        seg.elapsedTime,
        seg.totalTime,
        seg.duration,
        seg.FlightTime,
      ),
      equipmentType: getVal(seg.equipmentType, seg.Equipment),
    })) as ParsedFlightSegment[];
  }

  return parseSegmentsFromSnapshot(snapshot).filter(
    (seg) => (seg as any).isReturn,
  );
}

export function buildItineraryTableHtml(
  direction: ItineraryDirection,
  segments: ParsedFlightSegment[],
  options?: { cabinClass?: string; departDateFallback?: string },
): string {
  if (!segments.length) return "";

  const first = segments[0];
  const last = segments[segments.length - 1];
  const origin = first.origin || "";
  const destination = last.destination || "";
  const legDate = formatLegDate(
    getVal(first.departureAt, options?.departDateFallback),
  );
  const cabin = options?.cabinClass || getVal(first.cabinClass, "Economy");
  const cabinLabel =
    cabin.charAt(0).toUpperCase() + cabin.slice(1).toLowerCase();

  let totalDurationMins = 0;
  let hasValidDuration = true;

  const segmentRows = segments
    .map((seg, i) => {
      let flightMins = Number(seg.duration);
      if (isNaN(flightMins) || flightMins <= 0) {
        hasValidDuration = false;
      } else {
        totalDurationMins += flightMins;
      }

      const carrier = (seg.carrier || "XX").toUpperCase();
      const flightLine = `${carrier}-${seg.flightNumber || ""}`.replace(
        /-+$/,
        "",
      );
      const logoUrl = `${EZEE_LOGO_BASE}/${carrier}.png`;
      const depLine = formatTimeAirport(seg.departureAt, seg.origin);
      const arrLine = formatTimeAirport(seg.arrivalAt, seg.destination);
      const depSub = formatTerminalLine(
        seg.departureAt,
        seg.origin,
        (seg as any).originTerminal,
      );
      const arrSub = formatTerminalLine(
        seg.arrivalAt,
        seg.destination,
        (seg as any).destinationTerminal,
      );

      const html = `
  <tr>
    <td style="width:350px;font-size:14px;">
      <img src="${logoUrl}" style="float:left; padding-right:5px;" />
      ${flightLine}<br />${carrier}
    </td>
    <td style="width:160px;">
      <span style="font-size:20px;">${depLine}</span><br />
      <span style="font-size:9px;">${depSub}</span>
    </td>
    <td style="width:60px;text-align:center;"></td>
    <td style="width:160px;text-align:right;">
      <span style="font-size:20px;">${arrLine}</span><br />
      <span style="font-size:9px;text-align:right;display:block;">${arrSub}</span>
    </td>
    <td style="width:350px; font-size:12px;text-align:right;">.<br />
      <img src="Content/images/ticket.png" width="12px" height="12px" /><span>${cabinLabel}</span>
    </td>
  </tr>`;

      let stopOverHtml = "";
      if (i < segments.length - 1) {
        const nextSeg = segments[i + 1];
        if (seg.arrivalAt && nextSeg.departureAt) {
          const diffMs =
            new Date(nextSeg.departureAt).getTime() -
            new Date(seg.arrivalAt).getTime();
          const diffMins = Math.max(0, Math.round(diffMs / 60000));
          if (diffMins > 0) {
            totalDurationMins += diffMins;
            const h = Math.floor(diffMins / 60);
            const m = diffMins % 60;
            stopOverHtml = `<tr><td style="text-align:center;font-size:12px; border-top:1px dashed #bbb; border-bottom:1px dashed #bbb;" colspan="5"> Stop-Over: ${h} Hrs. ${m} Mins CHANGE OF PLANE REQUIRED.</td></tr>`;
          }
        } else {
          hasValidDuration = false;
        }
      }

      return html + stopOverHtml;
    })
    .join("");

  const durationText =
    hasValidDuration && totalDurationMins > 0
      ? `Duration: ${Math.floor(totalDurationMins / 60)}h ${totalDurationMins % 60}m`
      : "";

  return `
<table style="width:100%;background:#f1f1f1;border-collapse: collapse;border: 1px solid #999;" cellpadding="5px">
  <tr>
    <td style="width:160px;font-size:20px;border-bottom:1px dashed #bbb;font-weight:bold;">${direction}</td>
    <td style="width:160px;border-bottom:1px dashed #bbb;">${origin}<br /><span style="font-size:12px;">${origin}</span></td>
    <td style="width:60px;border-bottom:1px dashed #bbb;text-align:center;"><img src="${PLANE_ICON_URL}" alt="" width="24" height="24" ${direction === "INBOUND" ? 'style="transform:rotate(-180deg)"' : ""} /></td>
    <td style="width:160px;border-bottom:1px dashed #bbb;text-align:right;">${destination}<br /><span style="font-size:12px;">${destination}</span></td>
    <td style="width:160px;border-bottom:1px dashed #bbb;"></td>
  </tr>
  <tr>
    <td style="width:350px; font-size:14px; font-weight:bold;">${legDate}</td>
    <td style="width:160px;"></td>
    <td style="width:60px;text-align:center;"></td>
    <td style="width:160px;text-align:right;"></td>
    ${durationText ? `<td style="width:350px; font-size:14px; text-align:right; font-weight:bold;">${durationText}</td></tr>` : ""}
  ${segmentRows}
</table>`;
}

export function buildBookingConfirmationItinerary(
  snapshot: Record<string, any> | null | undefined,
  inquiry: Record<string, any>,
  bookingRef: string,
): BookingConfirmationItinerary {
  const snap = snapshot || {};
  const tripType = getVal(inquiry.tripType, snap.tripType, "one-way");
  const cabinClass = getVal(inquiry.cabinClass, snap.cabinClass, "Economy");
  const departFallback = getVal(inquiry.departDate, snap.departureAt);

  const outboundSegs = mapOutboundFromSnapshot(snap);
  let inboundSegs = mapInboundFromSnapshot(snap);

  const isRoundTrip =
    tripType === "round-trip" ||
    tripType === "roundTrip" ||
    tripType === "round_trip" ||
    tripType === "return" ||
    // Fallback 1: snapshot has a raw inbound array
    (Array.isArray(snap.inbound) && snap.inbound.length > 0) ||
    // Fallback 2: mapInboundFromSnapshot already found real inbound segments
    // (via snap.segments/rawSegments Group===1) — trust that over the tripType string.
    inboundSegs.length > 0 ||
    // Fallback 3: caller explicitly passed a returnDate
    Boolean(getVal(inquiry.returnDate, snap.returnDate));
  if (!isRoundTrip) {
    inboundSegs = [];
  }

  const legs: BookingItineraryLeg[] = [];

  if (outboundSegs.length) {
    const html = buildItineraryTableHtml("OUTBOUND", outboundSegs, {
      cabinClass,
      departDateFallback: departFallback,
    });
    legs.push({ label: "OUTBOUND", segments: outboundSegs, html });
  }

  if (inboundSegs.length) {
    const html = buildItineraryTableHtml("INBOUND", inboundSegs, {
      cabinClass,
      departDateFallback: getVal(snap.returnDate, inquiry.returnDate),
    });
    legs.push({ label: "INBOUND", segments: inboundSegs, html });
  }

  if (!legs.length && (snap.departureAirport || snap.arrivalAirport)) {
    const fallbackSeg: ParsedFlightSegment = {
      carrier: getVal(snap.airlineCode, snap.airline, "XX"),
      flightNumber: getVal(snap.flightNumber, ""),
      origin: getVal(snap.departureAirport, inquiry.origin),
      destination: getVal(snap.arrivalAirport, inquiry.destination),
      departureAt: getVal(snap.departureAt, departFallback),
      arrivalAt: getVal(snap.arrivalAt, ""),
      cabinClass,
    };
    const html = buildItineraryTableHtml("OUTBOUND", [fallbackSeg], {
      cabinClass,
      departDateFallback: departFallback,
    });
    legs.push({ label: "OUTBOUND", segments: [fallbackSeg], html });
  }

  const outboundHtml = legs.find((l) => l.label === "OUTBOUND")?.html ?? "";
  const inboundHtml = legs.find((l) => l.label === "INBOUND")?.html ?? null;
  const itineraryHtml = legs
    .map((l) => l.html)
    .join("<br style='line-height:16px;'/>");

  return {
    bookingRef: bookingRef.trim(),
    outboundHtml,
    inboundHtml,
    itineraryHtml,
    legs,
  };
}
