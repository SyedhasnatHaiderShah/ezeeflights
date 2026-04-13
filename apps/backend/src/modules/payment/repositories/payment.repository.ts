import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { PaymentEntity, PaymentStatus, PaymentTransactionEntity, RefundEntity } from '../entities/payment.entity';
import { WalletEntity, WalletTransactionEntity, WalletTransactionType } from '../entities/wallet.entity';

@Injectable()
export class PaymentRepository {
  constructor(private readonly db: PostgresClient) {}

  createPayment(params: {
    bookingId: string;
    userId: string;
    provider: string;
    amount: number;
    currency: string;
    walletAmount?: number;
    cardAmount?: number;
    isSplitPayment?: boolean;
    threedsRequired?: boolean;
    threedsRedirectUrl?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<PaymentEntity | null> {
    return this.db.queryOne<PaymentEntity>(
      `INSERT INTO payments (booking_id, user_id, provider, amount, currency, status, wallet_amount, card_amount, is_split_payment, threeds_required, threeds_redirect_url, metadata)
       VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7, $8, $9, $10, $11::jsonb)
       RETURNING id, booking_id as "bookingId", user_id as "userId", provider, amount::float as amount, currency, status,
         transaction_id as "transactionId", metadata, created_at as "createdAt", updated_at as "updatedAt"`,
      [
        params.bookingId,
        params.userId,
        params.provider,
        params.amount,
        params.currency,
        params.walletAmount ?? 0,
        params.cardAmount ?? null,
        params.isSplitPayment ?? false,
        params.threedsRequired ?? false,
        params.threedsRedirectUrl ?? null,
        JSON.stringify(params.metadata ?? {}),
      ],
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

  updateThreeDS(paymentId: string, required: boolean, redirectUrl: string | null): Promise<void> {
    return this.db
      .query(
        `UPDATE payments SET threeds_required = $2, threeds_redirect_url = $3, updated_at = NOW() WHERE id = $1`,
        [paymentId, required, redirectUrl],
      )
      .then(() => undefined);
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

  getOrCreateWallet(userId: string): Promise<WalletEntity | null> {
    return this.db.queryOne<WalletEntity>(
      `INSERT INTO wallets (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = wallets.updated_at
       RETURNING id, user_id as "userId", balance::float as balance, currency, is_frozen as "isFrozen", created_at as "createdAt", updated_at as "updatedAt"`,
      [userId],
    );
  }

  creditWallet(params: {
    userId: string;
    amount: number;
    type: WalletTransactionType;
    referenceId?: string;
    description?: string;
    metadata?: Record<string, unknown>;
  }): Promise<WalletTransactionEntity> {
    return this.db.withTransaction(async (client) => {
      const walletRes = await client.query(
        `INSERT INTO wallets (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO UPDATE SET updated_at = wallets.updated_at
         RETURNING id, user_id, balance::float as balance`,
        [params.userId],
      );
      const wallet = walletRes.rows[0];
      const before = Number(wallet.balance);
      const after = before + params.amount;

      await client.query(`UPDATE wallets SET balance = $2, updated_at = NOW() WHERE id = $1`, [wallet.id, after]);
      const txRes = await client.query(
        `INSERT INTO wallet_transactions (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)
         RETURNING id, wallet_id as "walletId", user_id as "userId", transaction_type as "transactionType", amount::float as amount,
           balance_before::float as "balanceBefore", balance_after::float as "balanceAfter", reference_id as "referenceId", description,
           metadata, created_at as "createdAt"`,
        [wallet.id, params.userId, params.type, params.amount, before, after, params.referenceId ?? null, params.description ?? null, JSON.stringify(params.metadata ?? {})],
      );
      return txRes.rows[0] as WalletTransactionEntity;
    });
  }

  deductWallet(params: { userId: string; amount: number; referenceId?: string; description?: string }): Promise<WalletTransactionEntity> {
    return this.db.withTransaction(async (client) => {
      const walletRes = await client.query(
        `INSERT INTO wallets (user_id)
         VALUES ($1)
         ON CONFLICT (user_id) DO UPDATE SET updated_at = wallets.updated_at
         RETURNING id`,
        [params.userId],
      );
      const walletId = walletRes.rows[0].id;
      const lockRes = await client.query(
        `SELECT id, balance::float as balance, is_frozen as "isFrozen"
         FROM wallets WHERE id = $1 FOR UPDATE`,
        [walletId],
      );
      const wallet = lockRes.rows[0];
      if (!wallet || wallet.isFrozen) throw new Error('Wallet unavailable');
      const before = Number(wallet.balance);
      if (before < params.amount) throw new Error('Insufficient wallet balance');
      const after = before - params.amount;

      await client.query(`UPDATE wallets SET balance = $2, updated_at = NOW() WHERE id = $1`, [walletId, after]);
      const txRes = await client.query(
        `INSERT INTO wallet_transactions (wallet_id, user_id, transaction_type, amount, balance_before, balance_after, reference_id, description, metadata)
         VALUES ($1, $2, 'booking_payment', $3, $4, $5, $6, $7, '{}'::jsonb)
         RETURNING id, wallet_id as "walletId", user_id as "userId", transaction_type as "transactionType", amount::float as amount,
           balance_before::float as "balanceBefore", balance_after::float as "balanceAfter", reference_id as "referenceId", description,
           metadata, created_at as "createdAt"`,
        [walletId, params.userId, params.amount, before, after, params.referenceId ?? null, params.description ?? null],
      );
      return txRes.rows[0] as WalletTransactionEntity;
    });
  }

  getWalletTransactions(userId: string, limit: number, offset: number): Promise<WalletTransactionEntity[]> {
    return this.db.query<WalletTransactionEntity>(
      `SELECT id, wallet_id as "walletId", user_id as "userId", transaction_type as "transactionType", amount::float as amount,
        balance_before::float as "balanceBefore", balance_after::float as "balanceAfter", reference_id as "referenceId", description,
        metadata, created_at as "createdAt"
       FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
  }
}
