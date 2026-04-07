export type HotelBookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type HotelPaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

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
  type: 'ADULT' | 'CHILD';
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
  rooms?: HotelBookingRoomEntity[];
  guests?: HotelBookingGuestEntity[];
}
