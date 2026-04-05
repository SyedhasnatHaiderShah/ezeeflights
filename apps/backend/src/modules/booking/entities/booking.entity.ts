export interface BookingEntity {
  id: string;
  userId: string;
  flightId: string | null;
  hotelId: string | null;
  tripId: string | null;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'FAILED';
  totalAmount: number;
  currency: 'USD' | 'AED' | 'EUR' | 'GBP';
  createdAt: Date;
}
