import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { PaymentEntity, PaymentStatus, PaymentTransactionEntity, RefundEntity } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(private readonly db: PostgresClient) {}

  createPayment(params: {
    bookingId: string;
    userId: string;
    provider: string;
    amount: number;
    currency: string;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentEntity | null> {
    return this.db.queryOne<PaymentEntity>(
      `INSERT INTO payments (booking_id, user_id, provider, amount, currency, status, metadata)
       VALUES ($1, $2, $3, $4, $5, 'PENDING', $6::jsonb)
       RETURNING id, booking_id as "bookingId", user_id as "userId", provider, amount::float as amount, currency, status,
         transaction_id as "transactionId", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
      [params.bookingId, params.userId, params.provider, params.amount, params.currency, JSON.stringify(params.metadata ?? {})],
    );
  }

  getPaymentById(paymentId: string): Promise<PaymentEntity | null> {
    return this.db.queryOne<PaymentEntity>(
      `SELECT id, booking_id as "bookingId", user_id as "userId", provider, amount::float as amount, currency, status,
         transaction_id as "transactionId", metadata, created_at as "createdAt", updated_at as "updatedAt"
       FROM payments WHERE id = $1 LIMIT 1`,
      [paymentId],
    );
  }

  getPaymentByProviderTransaction(provider: string, transactionId: string): Promise<PaymentEntity | null> {
    return this.db.queryOne<PaymentEntity>(
      `SELECT id, booking_id as "bookingId", user_id as "userId", provider, amount::float as amount, currency, status,
         transaction_id as "transactionId", metadata, created_at as "createdAt", updated_at as "updatedAt"
       FROM payments WHERE provider = $1 AND transaction_id = $2 LIMIT 1`,
      [provider, transactionId],
    );
  }

  getPaymentByBookingAndUser(bookingId: string, userId: string): Promise<PaymentEntity | null> {
    return this.db.queryOne<PaymentEntity>(
      `SELECT id, booking_id as "bookingId", user_id as "userId", provider, amount::float as amount, currency, status,
         transaction_id as "transactionId", metadata, created_at as "createdAt", updated_at as "updatedAt"
       FROM payments WHERE booking_id = $1 AND user_id = $2 AND status IN ('PENDING', 'SUCCESS')
       ORDER BY created_at DESC LIMIT 1`,
      [bookingId, userId],
    );
  }

  createTransaction(paymentId: string, providerResponse: Record<string, unknown>, status: PaymentStatus): Promise<PaymentTransactionEntity | null> {
    return this.db.queryOne<PaymentTransactionEntity>(
      `INSERT INTO payment_transactions (payment_id, provider_response, status)
       VALUES ($1, $2::jsonb, $3)
       RETURNING id, payment_id as "paymentId", provider_response as "providerResponse", status, created_at as "createdAt"`,
      [paymentId, JSON.stringify(providerResponse), status],
    );
  }

  updatePaymentStatus(paymentId: string, status: PaymentStatus, transactionId?: string): Promise<PaymentEntity | null> {
    return this.db.queryOne<PaymentEntity>(
      `UPDATE payments
       SET status = $2,
           transaction_id = COALESCE($3, transaction_id),
           updated_at = NOW()
       WHERE id = $1
       RETURNING id, booking_id as "bookingId", user_id as "userId", provider, amount::float as amount, currency, status,
         transaction_id as "transactionId", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
      [paymentId, status, transactionId ?? null],
    );
  }

  async findBooking(bookingId: string): Promise<{ id: string; userId: string; status: string; totalAmount: number } | null> {
    return this.db.queryOne<{ id: string; userId: string; status: string; totalAmount: number }>(
      `SELECT id, user_id as "userId", status, total_amount::float as "totalAmount" FROM bookings WHERE id = $1 LIMIT 1`,
      [bookingId],
    );
  }

  async confirmBooking(bookingId: string): Promise<void> {
    await this.db.query(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1`, [bookingId]);
  }

  createRefund(paymentId: string, amount: number, status: 'PENDING' | 'SUCCESS' | 'FAILED', providerRefundId: string | null): Promise<RefundEntity | null> {
    return this.db.queryOne<RefundEntity>(
      `INSERT INTO refunds (payment_id, amount, status, provider_refund_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, payment_id as "paymentId", amount::float as amount, status,
        provider_refund_id as "providerRefundId", created_at as "createdAt", updated_at as "updatedAt"`,
      [paymentId, amount, status, providerRefundId],
    );
  }

  listTransactions(limit = 200): Promise<PaymentTransactionEntity[]> {
    return this.db.query<PaymentTransactionEntity>(
      `SELECT id, payment_id as "paymentId", provider_response as "providerResponse", status, created_at as "createdAt"
       FROM payment_transactions ORDER BY created_at DESC LIMIT $1`,
      [limit],
    );
  }
}
