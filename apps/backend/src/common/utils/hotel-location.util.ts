/**
 * Travelport hotel search uses HotelLocation city codes (e.g. LON for London)
 * which often differ from IATA airport codes (e.g. LHR).
 */
const IATA_TO_TRAVELPORT_HOTEL_LOCATION: Record<string, string> = {
  // London
  LHR: "LON",
  LGW: "LON",
  STN: "LON",
  LTN: "LON",
  LCY: "LON",
  // New York
  JFK: "NYC",
  LGA: "NYC",
  EWR: "NYC",
  // Paris
  CDG: "PAR",
  ORY: "PAR",
  // Rome
  FCO: "ROM",
  CIA: "ROM",
  // Milan
  MXP: "MIL",
  LIN: "MIL",
  // Tokyo
  NRT: "TYO",
  HND: "TYO",
  // Bangkok
  BKK: "BKK",
  DMK: "BKK",
  // Dubai / Abu Dhabi — airport code matches Travelport
  DXB: "DXB",
  AUH: "AUH",
};

/** Best Travelport HotelLocation code for a user search (IATA or city code). */
export function resolveTravelportHotelLocation(searchCode: string): string {
  const clean = searchCode.trim().toUpperCase();
  if (!clean) return clean;
  return IATA_TO_TRAVELPORT_HOTEL_LOCATION[clean] ?? clean;
}

/** All HotelLocation codes that should match a given search (IATA + Travelport aliases). */
export function getAcceptedHotelLocationCodes(searchCode: string): Set<string> {
  const clean = searchCode.trim().toUpperCase();
  const accepted = new Set<string>();
  if (!clean) return accepted;

  accepted.add(clean);

  const travelportCode = IATA_TO_TRAVELPORT_HOTEL_LOCATION[clean];
  if (travelportCode) {
    accepted.add(travelportCode);
  }

  // Searching by Travelport city code (e.g. LON) — accept related airport IATA codes too
  for (const [iata, tpCode] of Object.entries(IATA_TO_TRAVELPORT_HOTEL_LOCATION)) {
    if (tpCode === clean) {
      accepted.add(iata);
    }
  }

  return accepted;
}

export function hotelLocationMatchesSearch(
  hotelLocation: string | undefined | null,
  searchCode: string,
): boolean {
  if (!hotelLocation?.trim()) {
    return true;
  }
  const loc = hotelLocation.trim().toUpperCase();
  return getAcceptedHotelLocationCodes(searchCode).has(loc);
}
