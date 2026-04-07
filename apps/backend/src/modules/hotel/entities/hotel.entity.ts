export interface HotelSearchEntity {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  rating: number;
  description: string;
  amenities: Record<string, unknown>;
  images: string[];
  minPricePerNight: number;
  currency: string;
}

export interface HotelDetailsEntity {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  rating: number;
  description: string;
  amenities: Record<string, unknown>;
  images: string[];
}

export interface RoomEntity {
  id: string;
  hotelId: string;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  currency: string;
  availableRooms: number;
  images: string[];
}
