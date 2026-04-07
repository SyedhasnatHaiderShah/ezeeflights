import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import {
  BookingHistoryEntity,
  BookingLogEntity,
  BookingModificationChangeType,
  BookingModificationEntity,
  BookingRefundEntity,
} from './entities/bookingMgmt.entity';

@Injectable()
export class BookingMgmtRepository {
  constructor(private readonly db: PostgresClient) {}

  async findBookingForUser(bookingId: string, userId?: string, tx?: any) {
    const executor = tx ?? this.db;
    const userFilter = userId ? 'AND b.user_id = $2' : '';
    const params = userId ? [bookingId, userId] : [bookingId];
    const rows = await executor.query(
      `SELECT b.id, b.user_id as "userId", b.status, b.payment_status as "paymentStatus", b.total_amount::float8 as "totalAmount", b.currency
       FROM bookings b
       WHERE b.id = $1 ${userFilter}
       LIMIT 1`,
      params,
    );
    if (rows.length === 0) {
      throw new NotFoundException('Booking not found');
    }
    return rows[0] as { id: string; userId: string; status: string; paymentStatus: string; totalAmount: number; currency: string };
  }

  async modify(bookingId: string, modifier: { type: BookingModificationChangeType; oldValue: Record<string, unknown>; newValue: Record<string, unknown> }, userId: string) {
    return this.db.withTransaction(async (tx) => {
      await this.findBookingForUser(bookingId, userId, tx);
      await tx.query(`UPDATE bookings SET updated_at = NOW() WHERE id = $1`, [bookingId]);

      if (modifier.type === 'DATE_CHANGE') {
        await tx.query(
          `UPDATE booking_flights
           SET updated_at = NOW()
           WHERE booking_id = $1 AND flight_id = $2`,
          [bookingId, modifier.newValue.flightId],
        );
      }

      if (modifier.type === 'PASSENGER_UPDATE') {
        const nextFullName = modifier.newValue.fullName ?? modifier.oldValue.fullName;
        const nextPassport = modifier.newValue.passportNumber ?? modifier.oldValue.passportNumber;
        const nextSeat = modifier.newValue.seatNumber ?? modifier.oldValue.seatNumber;

        await tx.query(
          `UPDATE booking_passengers
           SET full_name = $3, passport_number = $4, seat_number = $5, updated_at = NOW()
           WHERE id = $2 AND booking_id = $1`,
          [bookingId, modifier.newValue.passengerId, nextFullName, nextPassport, nextSeat],
        );
      }

      const modRow = await tx.query(
        `INSERT INTO booking_modifications (booking_id, change_type, old_value, new_value)
         VALUES ($1, $2, $3::jsonb, $4::jsonb)
         RETURNING id, booking_id as "bookingId", change_type as "changeType", old_value as "oldValue", new_value as "newValue", changed_at as "changedAt"`,
        [bookingId, modifier.type, JSON.stringify(modifier.oldValue), JSON.stringify(modifier.newValue)],
      );

      await this.createLog(bookingId, `MODIFY_${modifier.type}`, 'USER', tx);

      return modRow[0] as BookingModificationEntity;
    });
  }

  async cancelBooking(bookingId: string, actor: 'USER' | 'ADMIN' | 'SYSTEM', userId?: string) {
    return this.db.withTransaction(async (tx) => {
      await this.findBookingForUser(bookingId, userId, tx);
      const updated = await tx.query(
        `UPDATE bookings
         SET status = 'CANCELLED', updated_at = NOW()
         WHERE id = $1
         RETURNING id, user_id as "userId", status, payment_status as "paymentStatus", total_amount::float8 as "totalAmount", currency`,
        [bookingId],
      );
      await this.createLog(bookingId, 'CANCEL_BOOKING', actor, tx);
      return updated[0] as { id: string; userId: string; status: string; paymentStatus: string; totalAmount: number; currency: string };
    });
  }

  async createRefund(bookingId: string, amount: number, status: 'PENDING' | 'PROCESSED' | 'FAILED', paymentReference?: string | null) {
    const row = await this.db.queryOne<BookingRefundEntity>(
      `INSERT INTO refunds (booking_id, amount, status, payment_reference)
       VALUES ($1, $2, $3, $4)
       RETURNING id, booking_id as "bookingId", amount::float8 as amount, status, payment_reference as "paymentReference", created_at as "createdAt"`,
      [bookingId, amount, status, paymentReference ?? null],
    );
    return row;
  }

  async createLog(bookingId: string, action: string, performedBy: 'USER' | 'ADMIN' | 'SYSTEM', tx?: any): Promise<BookingLogEntity | null> {
    const executor = tx ?? this.db;
    const rows = await executor.query(
      `INSERT INTO booking_logs (booking_id, action, performed_by)
       VALUES ($1, $2, $3)
       RETURNING id, booking_id as "bookingId", action, performed_by as "performedBy", created_at as "createdAt"`,
      [bookingId, action, performedBy],
    );
    return rows[0] ?? null;
  }

  async getHistory(bookingId: string, userId?: string): Promise<BookingHistoryEntity> {
    const booking = await this.findBookingForUser(bookingId, userId);

    const [modifications, refunds, logs] = await Promise.all([
      this.db.query<BookingModificationEntity>(
        `SELECT id, booking_id as "bookingId", change_type as "changeType", old_value as "oldValue", new_value as "newValue", changed_at as "changedAt"
         FROM booking_modifications WHERE booking_id = $1 ORDER BY changed_at DESC`,
        [bookingId],
      ),
      this.db.query<BookingRefundEntity>(
        `SELECT id, booking_id as "bookingId", amount::float8 as amount, status, payment_reference as "paymentReference", created_at as "createdAt"
         FROM refunds WHERE booking_id = $1 ORDER BY created_at DESC`,
        [bookingId],
      ),
      this.db.query<BookingLogEntity>(
        `SELECT id, booking_id as "bookingId", action, performed_by as "performedBy", created_at as "createdAt"
         FROM booking_logs WHERE booking_id = $1 ORDER BY created_at DESC`,
        [bookingId],
      ),
    ]);

    return {
      bookingId,
      status: booking.status,
      modifications,
      refunds,
      logs,
    };
  }
}
