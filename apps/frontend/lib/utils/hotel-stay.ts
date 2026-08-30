import type { Hotel } from "@/lib/types/hotels";

/** Hotel-level stay from Travelport search RateInfo (MinimumAmount). */
export function getHotelStaySelection(hotel: Hotel) {
  return {
    roomId: hotel.id,
    roomType: hotel.name,
    quantity: 1,
    pricePerNight: hotel.minPricePerNight || 0,
  };
}

export function resolveHotelPricePerNight(hotel: Hotel): number {
  return getHotelStaySelection(hotel).pricePerNight;
}
