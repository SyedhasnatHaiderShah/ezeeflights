import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { PaymentEntity } from '../entities/payment.entity';

@Injectable()
export class PaymentRepository {
  constructor(private readonly db: PostgresClient) {}

  async create(dto: CreatePaymentDto): Promise<PaymentEntity> {
    const providerReference = `PMT-${Date.now()}`;
    const query = `
      INSERT INTO payments (booking_id, amount, currency, provider, provider_reference, status)
      VALUES ($1, $2, $3, $4, $5, 'CAPTURED')
      RETURNING
        id,
        booking_id as "bookingId",
        amount,
        currency,
        provider,
        provider_reference as "providerReference",
        status,
        created_at as "createdAt"
    `;

    const row = await this.db.queryOne<PaymentEntity>(query, [
      dto.bookingId,
      dto.amount,
      dto.currency,
      dto.provider,
      providerReference,
    ]);

    if (!row) {
      throw new Error('Failed to create payment');
    }

    await this.db.query(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1`, [dto.bookingId]);

    return row;
  }
}
