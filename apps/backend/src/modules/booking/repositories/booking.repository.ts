import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { BookingEntity } from '../entities/booking.entity';
import { CreateBookingDto } from '../dto/create-booking.dto';

@Injectable()
export class BookingRepository {
  constructor(private readonly db: PostgresClient) {}

  async create(userId: string, dto: CreateBookingDto): Promise<BookingEntity> {
    const query = `
      INSERT INTO bookings (user_id, flight_id, hotel_id, trip_id, status, total_amount, currency)
      VALUES ($1, $2, $3, $4, 'PENDING', $5, $6)
      RETURNING
        id,
        user_id as "userId",
        flight_id as "flightId",
        hotel_id as "hotelId",
        trip_id as "tripId",
        status,
        total_amount as "totalAmount",
        currency,
        created_at as "createdAt"
    `;

    const row = await this.db.queryOne<BookingEntity>(query, [
      userId,
      dto.flightId ?? null,
      dto.hotelId ?? null,
      dto.tripId ?? null,
      dto.totalAmount,
      dto.currency,
    ]);

    if (!row) {
      throw new Error('Failed to create booking');
    }

    return row;
  }

  listByUser(userId: string): Promise<BookingEntity[]> {
    return this.db.query<BookingEntity>(
      `SELECT
         id,
         user_id as "userId",
         flight_id as "flightId",
         hotel_id as "hotelId",
         trip_id as "tripId",
         status,
         total_amount as "totalAmount",
         currency,
         created_at as "createdAt"
       FROM bookings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId],
    );
  }
}
