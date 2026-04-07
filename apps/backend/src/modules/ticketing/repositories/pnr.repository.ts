import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { PnrRecordEntity, PnrStatus } from '../entities/ticketing.entity';

@Injectable()
export class PnrRepository {
  constructor(private readonly db: PostgresClient) {}

  create(bookingId: string, pnrCode: string, provider: string): Promise<PnrRecordEntity | null> {
    return this.db.queryOne<PnrRecordEntity>(
      `INSERT INTO pnr_records (booking_id, pnr_code, provider, status)
       VALUES ($1, $2, $3, 'CREATED')
       RETURNING id, booking_id as "bookingId", pnr_code as "pnrCode", provider, status,
         created_at as "createdAt", updated_at as "updatedAt"`,
      [bookingId, pnrCode, provider],
    );
  }

  findByBookingId(bookingId: string): Promise<PnrRecordEntity | null> {
    return this.db.queryOne<PnrRecordEntity>(
      `SELECT id, booking_id as "bookingId", pnr_code as "pnrCode", provider, status,
         created_at as "createdAt", updated_at as "updatedAt"
       FROM pnr_records
       WHERE booking_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [bookingId],
    );
  }

  findByCode(pnrCode: string): Promise<PnrRecordEntity | null> {
    return this.db.queryOne<PnrRecordEntity>(
      `SELECT id, booking_id as "bookingId", pnr_code as "pnrCode", provider, status,
         created_at as "createdAt", updated_at as "updatedAt"
       FROM pnr_records
       WHERE pnr_code = $1
       LIMIT 1`,
      [pnrCode],
    );
  }

  updateStatus(id: string, status: PnrStatus): Promise<PnrRecordEntity | null> {
    return this.db.queryOne<PnrRecordEntity>(
      `UPDATE pnr_records SET status = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING id, booking_id as "bookingId", pnr_code as "pnrCode", provider, status,
         created_at as "createdAt", updated_at as "updatedAt"`,
      [id, status],
    );
  }
}
