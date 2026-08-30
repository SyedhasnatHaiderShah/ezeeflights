export interface FlightSegment {
  logo?: string;
  flightNo?: string;
  airline?: string;
  depTime?: string;
  depDetails?: string;
  arrTime?: string;
  arrDetails?: string;
  cabin?: string;
  isStopover?: boolean;
  stopoverText?: string;
}

export interface FlightDirectionDetails {
  title: string;      // OUTBOUND or INBOUND
  origin: string;
  destination: string;
  date: string;
  segments: FlightSegment[];
}

export interface ParsedFlightDetails {
  parsed: boolean;
  outbound: FlightDirectionDetails | null;
  inbound: FlightDirectionDetails | null;
}

function normalizeUrl(url: string): string {
  if (!url) return "";
  const cleaned = url.trim();
  if (cleaned.startsWith("http") || cleaned.startsWith("//")) {
    return cleaned;
  }
  // Normalise relative logo paths
  return `https://www.ezeeflights.com/${cleaned.replace(/^\//, "")}`;
}

export function parseFlightHtml(html: string | null | undefined): FlightDirectionDetails | null {
  if (!html || !html.trim()) return null;

  try {
    // Split the table into row segments
    const rows = html.split(/<tr[^>]*>/gi);
    
    let title = "";
    let origin = "";
    let destination = "";
    let date = "";
    const segments: FlightSegment[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Extract cells from the row
      const cells = row.split(/<td[^>]*>/gi).slice(1);
      const cleanedCells = cells.map(cell => cell.replace(/<\/td>[\s\S]*/gi, "").trim());

      if (cleanedCells.length === 0) continue;

      const cell1 = cleanedCells[0];

      // 1. Check if it's a stopover row
      if (cell1.toLowerCase().includes("stop-over") || cell1.toLowerCase().includes("stopover")) {
        const text = cell1.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        segments.push({
          isStopover: true,
          stopoverText: text,
        });
        continue;
      }

      // 2. Check if it's the header row (contains OUTBOUND or INBOUND)
      if (cell1.toUpperCase().includes("OUTBOUND") || cell1.toUpperCase().includes("INBOUND")) {
        const headerText = cell1.replace(/<[^>]*>/g, "").trim();
        title = headerText.includes("OUTBOUND") ? "OUTBOUND" : "INBOUND";
        
        // Find Origin in Cell 2
        const cell2 = cleanedCells[1] || "";
        const originMatch = cell2.replace(/<[^>]*>/g, " ").trim().match(/([A-Z]{3})/i);
        if (originMatch) origin = originMatch[1].toUpperCase();

        // Find Destination in Cell 4
        const cell4 = cleanedCells[3] || "";
        const destMatch = cell4.replace(/<[^>]*>/g, " ").trim().match(/([A-Z]{3})/i);
        if (destMatch) destination = destMatch[1].toUpperCase();
        
        continue;
      }

      // 3. Extract date if present in cell1
      const dateTextClean = cell1.replace(/<[^>]*>/g, "").trim();
      const datePattern = /(?:[A-Za-z]{3}\s+\d{1,2}|\d{1,2}\s+[A-Za-z]{3}),?\s+\d{4}/i;
      const dateMatch = dateTextClean.match(datePattern);
      if (dateMatch) {
        date = dateMatch[0];
      }

      // Check for flight number indicators (e.g. UA-1784, DL1994, airlinelogo)
      const hasFlightCode = /([A-Z]{2}-?\d+|[A-Z]\d-?\d+|\d[A-Z]-?\d+)/i.test(cell1);
      const hasFlightImage = cell1.includes("airlinelogo") || cell1.includes("<img");
      const isPureDateRow = dateMatch && !hasFlightImage && !hasFlightCode;
      
      if (isPureDateRow) {
        continue;
      }

      // 4. Flight segment row
      if (cleanedCells.length >= 4 && (hasFlightImage || hasFlightCode)) {
        // Logo URL
        const logoMatch = cell1.match(/<img[^>]+src=["']([^"']+)["']/i);
        const logo = logoMatch ? normalizeUrl(logoMatch[1]) : "";

        // Flight Number & Airline Code
        const text1 = cell1.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        const flightNoMatch = text1.match(/([A-Z0-9]{2}-?\d+)/i);
        const flightNo = flightNoMatch ? flightNoMatch[1].toUpperCase() : text1.split(" ")[0] || "";
        const airlineCode = flightNo.split("-")[0] || "";
        const airline = airlineCode;

        // Departure Info (Cell 2) - Split by <br> or extract text
        const cell2 = cleanedCells[1] || "";
        const cell2Parts = cell2.split(/<br\s*\/?>/gi).map((p) => p.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()).filter(Boolean);
        const depTime = cell2Parts[0] || cell2.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        const depDetails = cell2Parts[1] || "";

        // Arrival Info (Cell 4) - Split by <br> or extract text
        const cell4 = cleanedCells[3] || "";
        const cell4Parts = cell4.split(/<br\s*\/?>/gi).map((p) => p.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim()).filter(Boolean);
        const arrTime = cell4Parts[0] || cell4.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
        const arrDetails = cell4Parts[1] || "";

        // Cabin Info (Cell 5 or last cell)
        const lastCell = cleanedCells[cleanedCells.length - 1] || "";
        const cabinClean = lastCell.replace(/<[^>]*>/g, "").replace(/[\.\s]+/g, " ").trim();
        const cabin = cabinClean.includes("Economy") ? "Economy" : cabinClean.includes("Business") ? "Business" : cabinClean || "Economy";

        segments.push({
          logo,
          flightNo,
          airline,
          depTime,
          depDetails,
          arrTime,
          arrDetails,
          cabin,
        });
      }
    }

    // Fallback: If origin or destination were missing in header row, extract from segments!
    if (!origin && segments.length > 0) {
      const firstSeg = segments.find((s) => s.depTime);
      if (firstSeg && firstSeg.depTime) {
        const match = firstSeg.depTime.match(/([A-Z]{3})/i);
        if (match) origin = match[1].toUpperCase();
      }
    }

    if (!destination && segments.length > 0) {
      const lastSeg = [...segments].reverse().find((s) => s.arrTime);
      if (lastSeg && lastSeg.arrTime) {
        const match = lastSeg.arrTime.match(/([A-Z]{3})/i);
        if (match) destination = match[1].toUpperCase();
      }
    }

    if (!title && !origin && !destination && segments.length === 0) {
      return null;
    }

    return {
      title: title || "FLIGHT",
      origin,
      destination,
      date,
      segments,
    };
  } catch (error) {
    console.error("[FlightDetailsParser] Failed to parse flight HTML:", error);
    return null;
  }
}
