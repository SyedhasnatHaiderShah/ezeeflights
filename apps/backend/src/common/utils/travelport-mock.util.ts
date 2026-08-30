import * as fs from "fs";
import * as path from "path";

let flightsCache: unknown[] | null = null;
let hotelsCache: unknown[] | null = null;
let carsCache: unknown[] | null = null;


/**
 * Mock Travelport disabled.
 */
export function isTravelportMockEnabled(): boolean {
  return false;
}


function mockDataDir(): string {
  return path.join(__dirname, "../mock-data");
}

function readJsonArray(filename: string): unknown[] {
  const filePath = path.join(mockDataDir(), filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Travelport mock file missing: ${filePath}. Run: npm run generate:travelport-mocks`,
    );
  }
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  return Array.isArray(raw) ? raw : [];
}

/** Mapped flight offers (same shape as TravelportProvider.mapResponse). */
export function loadMockFlightsSearch(): any[] {
  if (!flightsCache) {
    flightsCache = readJsonArray("travelport-flights-search.mock.json");
  }
  return flightsCache as any[];
}

/** Mapped hotel list (same shape as TravelportProvider.mapHotelResponse). */
export function loadMockHotelsSearch(): any[] {
  if (!hotelsCache) {
    hotelsCache = readJsonArray("travelport-hotels-search.mock.json");
  }
  return hotelsCache as any[];
}

/** Mapped cars list. */
export function loadMockCarsSearch(): any[] {
  if (!carsCache) {
    carsCache = readJsonArray("travelport-cars-search.mock.json");
  }
  return carsCache as any[];
}

export function findMockHotelById(hotelId: string): any | null {
  const hotels = loadMockHotelsSearch();
  return hotels.find((h) => h.id === hotelId) ?? null;
}

/** Same shape as HotelSearchAvailabilityRsp mapping — no synthetic room types. */
export function mockHotelToDetails(hotel: any): any {
  return {
    ...hotel,
    type: hotel.type || "Hotel",
    coordinates: hotel.coordinates ?? { lat: 0, lng: 0 },
    reviews: hotel.reviews ?? [],
  };
}
