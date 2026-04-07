export type PaymentProvider = 'STRIPE' | 'PAYTABS' | 'TABBY' | 'TAMARA';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PaymentEntity {
  id: string;
  bookingId: string;
  userId: string;
  provider: PaymentProvider;
  amount: number;
  currency: 'USD' | 'AED' | 'EUR' | 'GBP';
  status: PaymentStatus;
  transactionId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTransactionEntity {
  id: string;
  paymentId: string;
  providerResponse: Record<string, unknown>;
  status: PaymentStatus;
  createdAt: Date;
}

export interface RefundEntity {
  id: string;
  paymentId: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  providerRefundId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
