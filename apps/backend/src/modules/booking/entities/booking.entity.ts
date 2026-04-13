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

export type TripType = 'flight' | 'hotel' | 'car' | 'transfer' | 'package';

export interface TripSummaryEntity {
  id: string;
  type: TripType;
  status: string;
  confirmationCode: string;
  currency: string;
  total: number;
  startDate: string;
  endDate: string;
  title: string;
  subtitle: string;
  createdAt: string;
}

export interface TripDocumentEntity {
  fileName: string;
  content: Buffer;
}

export interface TripDetailEntity extends TripSummaryEntity {
  passengers: Array<{ fullName: string; type: string; seatNumber?: string }>;
  flight?: {
    origin: string;
    destination: string;
    departureAt: string;
    arrivalAt: string;
    pnr: string;
    timeline: Array<{ label: string; value: string }>;
  };
  hotel?: {
    propertyName: string;
    checkInDate: string;
    checkOutDate: string;
    roomType: string;
    address: string;
    mapUrl: string;
  };
  car?: {
    name: string;
    pickupDatetime: string;
    dropoffDatetime: string;
  };
  transfer?: {
    pickupAddress: string;
    dropoffAddress: string;
    pickupDatetime: string;
    flightNumber?: string;
  };
  package?: {
    title: string;
    destination: string;
    durationDays: number;
  };
  policy: {
    canCancel: boolean;
    cancellationWindow: string;
    refundEstimate: number;
    isModifiable: boolean;
  };
  availableDocuments: Array<'ticket' | 'voucher' | 'insurance'>;
}
