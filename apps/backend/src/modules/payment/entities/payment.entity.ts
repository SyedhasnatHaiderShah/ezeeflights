export interface PaymentEntity {
  id: string;
  bookingId: string;
  amount: number;
  currency: 'USD' | 'AED' | 'EUR' | 'GBP';
  provider: string;
  providerReference: string | null;
  status: 'INITIATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED';
  createdAt: Date;
}
