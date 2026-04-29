export type PropertyType =
  | "Hotel"
  | "Apartment"
  | "Villa"
  | "Resort"
  | "Hostel"
  | "Riad"
  | "Boutique";

export interface HotelImage {
  url: string;
  caption?: string;
  category?: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
  flightRating?: number;
  hotelRating?: number;
  carRating?: number;
  supplierResponse?: string | null;
  flaggedCount?: number;
  photos?: string[];
}

export interface AISentimentSummary {
  pros: string[];
  cons: string[];
  overallSummary: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  totalPrice: number;
  images: HotelImage[];
  amenities: string[];
  isAvailableForUpgrade: boolean;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  capacity: number;
}

export interface Hotel {
  id: string;
  name: string;
  type: PropertyType;
  starRating: number;
  userRating: number;
  reviewCount: number;
  address: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  minPricePerNight: number;
  currency: string;
  images: HotelImage[];
  amenities: string[];
  isBestForTrip?: boolean; // AI Badge
  aiSentimentSummary?: AISentimentSummary;
  reviews: Review[];
  rooms: RoomType[];
  description?: string;
  rating?: number;
}

export interface HotelSearchParams {
  location: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
}

export interface HotelFilters {
  propertyTypes: PropertyType[];
  starRatings: number[];
  freeCancellation: boolean;
  breakfastIncluded: boolean;
  minPrice?: number;
  maxPrice?: number;
}
