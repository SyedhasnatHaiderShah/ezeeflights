export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type PassengerType = 'ADULT' | 'CHILD' | 'INFANT';

export interface BookingEntity {
  id: string;
  userId: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  totalPrice: number;
  currency: 'USD' | 'AED' | 'EUR' | 'GBP';
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingPassengerEntity {
  id: string;
  bookingId: string;
  fullName: string;
  passportNumber: string;
  seatNumber: string;
  type: PassengerType;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingFlightEntity {
  id: string;
  bookingId: string;
  flightId: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingDetailsEntity extends BookingEntity {
  passengers: BookingPassengerEntity[];
  flights: BookingFlightEntity[];
}
