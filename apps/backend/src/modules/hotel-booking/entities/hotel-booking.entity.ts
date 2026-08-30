export type HotelBookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type HotelPaymentStatus = "PENDING" | "PAID" | "FAILED";

export interface HotelBookingRoomEntity {
  id: string;
  bookingId: string;
  roomId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HotelBookingGuestEntity {
  id: string;
  bookingId: string;
  roomId: string;
  fullName: string;
  age: number;
  type: "ADULT" | "CHILD";
  preferences?: string;
  createdAt: Date;
  updatedAt: Date;
  email?: string | null;
  phone?: string | null;
}

export interface HotelBookingEntity {
  id: string;
  userId: string;
  hotelId: string;
  totalPrice: number;
  checkInDate: string;
  checkOutDate: string;
  status: HotelBookingStatus;
  paymentStatus: HotelPaymentStatus;
  currency: string;
  /** Base/provider snapshot currency at booking time (USD, same as flight bookings) */
  defaultCurrency?: string;
  createdAt: Date;
  updatedAt: Date;
  rooms?: HotelBookingRoomEntity[];
  guests?: HotelBookingGuestEntity[];
  /** Stripe / provider PaymentIntent id — set after initiating payment */
  paymentIntentId?: string;
  hotelName?: string | null;
  city?: string | null;
  country?: string | null;
}
