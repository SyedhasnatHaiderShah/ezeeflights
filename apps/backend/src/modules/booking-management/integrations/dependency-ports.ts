export interface TicketingPort {
  cancelByBookingId(bookingId: string): Promise<void>;
}

export interface LoyaltyPort {
  adjustOnCancellation(userId: string, bookingId: string, amount: number): Promise<void>;
}

export const TICKETING_PORT = 'TICKETING_PORT';
export const LOYALTY_PORT = 'BOOKING_MGMT_LOYALTY_PORT';
