import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingDetailsEntity, BookingEntity } from '../entities/booking.entity';
import { calculateBookingTotal } from '../utils/price-calculator';

@Injectable()
export class BookingRepository {
  constructor(private readonly db: PostgresClient) {}

  async create(userId: string, dto: CreateBookingDto): Promise<BookingDetailsEntity> {
    const duplicateSeats = new Set<string>();
    for (const passenger of dto.passengers) {
      if (duplicateSeats.has(passenger.seatNumber)) {
        throw new BadRequestException(`Duplicate seat in request: ${passenger.seatNumber}`);
      }
      duplicateSeats.add(passenger.seatNumber);
    }

    return this.db.withTransaction(async (client) => {
      const userRow = await client.query('SELECT id FROM users WHERE id = $1 LIMIT 1', [userId]);
      if (userRow.rows.length === 0) {
        throw new NotFoundException('User not found');
      }

      const flightsRes = await client.query(
        `SELECT id, base_fare::float8 as "baseFare", currency
         FROM flights
         WHERE id = ANY($1::uuid[])
         FOR UPDATE`,
        [dto.flightIds],
      );

      if (flightsRes.rows.length !== dto.flightIds.length) {
        throw new NotFoundException('One or more flights were not found');
      }

      const currency = dto.currency ?? flightsRes.rows[0].currency;
      const mixedCurrencies = flightsRes.rows.some((row: { currency: string }) => row.currency !== currency);
      if (mixedCurrencies) {
        throw new BadRequestException('All selected flights must share the same currency');
      }

      for (const seat of duplicateSeats) {
        const seatTaken = await client.query(
          `SELECT bp.id
           FROM booking_passengers bp
           JOIN bookings b ON b.id = bp.booking_id
           JOIN booking_flights bf ON bf.booking_id = b.id
           WHERE bf.flight_id = ANY($1::uuid[])
             AND bp.seat_number = $2
             AND b.status <> 'CANCELLED'
           LIMIT 1`,
          [dto.flightIds, seat],
        );

        if (seatTaken.rows.length > 0) {
          throw new BadRequestException(`Seat already booked: ${seat}`);
        }
      }

      const fares = flightsRes.rows.map((row: { baseFare: number }) => Number(row.baseFare));
      const total = calculateBookingTotal(fares, dto.passengers.length);
      const paymentStatus = dto.paymentStatus ?? 'PENDING';
      const status = paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING';

      const bookingRes = await client.query(
        `INSERT INTO bookings (user_id, status, payment_status, total_amount, total_price, currency)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, user_id as "userId", status, payment_status as "paymentStatus",
           total_amount::float8 as "totalAmount", total_price::float8 as "totalPrice",
           currency, created_at as "createdAt", updated_at as "updatedAt"`,
        [userId, status, paymentStatus, total, total, currency],
      );

      const booking = bookingRes.rows[0] as BookingEntity;

      for (const flightId of dto.flightIds) {
        const flight = flightsRes.rows.find((row: { id: string }) => row.id === flightId);
        await client.query(
          `INSERT INTO booking_flights (booking_id, flight_id, price)
           VALUES ($1, $2, $3)`,
          [booking.id, flightId, flight?.baseFare ?? 0],
        );
      }

      for (const passenger of dto.passengers) {
        await client.query(
          `INSERT INTO booking_passengers (booking_id, full_name, passport_number, seat_number, type)
           VALUES ($1, $2, $3, $4, $5)`,
          [booking.id, passenger.fullName, passenger.passportNumber, passenger.seatNumber, passenger.type],
        );
      }

      return this.findById(booking.id, userId, client);
    });
  }

  async findById(id: string, userId?: string, txClient?: any): Promise<BookingDetailsEntity> {
    const executor = txClient ?? this.db;
    const filters = userId ? 'AND b.user_id = $2' : '';
    const params = userId ? [id, userId] : [id];

    const bookingRows = await executor.query(
      `SELECT b.id, b.user_id as "userId", b.status, b.payment_status as "paymentStatus",
          b.total_amount::float8 as "totalAmount", b.total_price::float8 as "totalPrice",
          b.currency, b.created_at as "createdAt", b.updated_at as "updatedAt"
       FROM bookings b
       WHERE b.id = $1 ${filters}
       LIMIT 1`,
      params,
    );

    if (bookingRows.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    const booking = bookingRows[0] as BookingDetailsEntity;

    const [passengers, flights] = await Promise.all([
      executor.query(
        `SELECT id, booking_id as "bookingId", full_name as "fullName", passport_number as "passportNumber",
            seat_number as "seatNumber", type, created_at as "createdAt", updated_at as "updatedAt"
         FROM booking_passengers
         WHERE booking_id = $1
         ORDER BY created_at ASC`,
        [booking.id],
      ),
      executor.query(
        `SELECT id, booking_id as "bookingId", flight_id as "flightId", price::float8 as price,
            created_at as "createdAt", updated_at as "updatedAt"
         FROM booking_flights
         WHERE booking_id = $1
         ORDER BY created_at ASC`,
        [booking.id],
      ),
    ]);

    booking.passengers = passengers;
    booking.flights = flights;

    return booking;
  }

  async listByUser(userId: string): Promise<BookingEntity[]> {
    return this.db.query<BookingEntity>(
      `SELECT id, user_id as "userId", status, payment_status as "paymentStatus",
        total_amount::float8 as "totalAmount", total_price::float8 as "totalPrice", currency,
        created_at as "createdAt", updated_at as "updatedAt"
       FROM bookings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId],
    );
  }

  async cancel(id: string, userId: string): Promise<BookingDetailsEntity> {
    await this.db.queryOne(
      `UPDATE bookings SET status = 'CANCELLED', updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status IN ('PENDING', 'CONFIRMED')`,
      [id, userId],
    );
    return this.findById(id, userId);
  }
}
