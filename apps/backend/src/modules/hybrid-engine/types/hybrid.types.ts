export type TravelTier = 'budget' | 'standard' | 'luxury';

export interface NormalizedFlightOption {
  provider: string;
  id: string;
  airline: string;
  departure: string;
  arrival: string;
  durationMinutes: number;
  price: number;
  currency: string;
}

export interface NormalizedHotelOption {
  provider: string;
  id: string;
  hotelName: string;
  rating: number;
  amenities: string[];
  pricePerNight: number;
  currency: string;
}

export interface PricingInput {
  flightPrice: number;
  hotelPrice: number;
  activitiesCost: number;
  baseCurrency?: string;
  targetCurrency?: string;
  packageTier?: TravelTier;
  discountPct?: number;
}

export interface PricingOutput {
  currency: string;
  baseSubtotal: number;
  margin: number;
  seasonalAdjustment: number;
  surgeAdjustment: number;
  discount: number;
  totalPrice: number;
  details: Record<string, number>;
}
