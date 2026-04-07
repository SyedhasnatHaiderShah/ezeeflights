import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { CreateHotelBookingDto } from '../dto/create-hotel-booking.dto';
import { HotelBookingEntity } from '../entities/hotel-booking.entity';
import { calculateHotelBookingTotal } from '../utils/hotel-price-calculator';

@Injectable()
export class HotelBookingRepository {
  constructor(private readonly db: PostgresClient) {}

  async create(userId: string, dto: CreateHotelBookingDto): Promise<HotelBookingEntity> {
    return this.db.withTransaction(async (client) => {
      const dateNights = this.getNights(dto.checkInDate, dto.checkOutDate);
      if (dateNights < 1) {
        throw new BadRequestException('Invalid stay dates');
      }

      const roomIds = dto.rooms.map((room) => room.roomId);
      const hotelExists = await client.query('SELECT id FROM hotels WHERE id = $1 LIMIT 1', [dto.hotelId]);
      if (hotelExists.rows.length === 0) {
        throw new NotFoundException('Hotel not found');
      }

      const roomRowsResult = await client.query(
        `SELECT id, hotel_id, capacity, price_per_night::float8 as "pricePerNight", currency, available_rooms
         FROM rooms
         WHERE id = ANY($1::uuid[])
           AND hotel_id = $2
         FOR UPDATE`,
        [roomIds, dto.hotelId],
      );
      const roomRows = roomRowsResult.rows as Array<{
        id: string;
        hotel_id: string;
        capacity: number;
        pricePerNight: number;
        currency: string;
        available_rooms: number;
      }>;

      if (roomRows.length !== roomIds.length) {
        throw new BadRequestException('One or more rooms do not belong to selected hotel');
      }

      const roomMap = new Map(roomRows.map((room) => [room.id, room]));

      for (const selectedRoom of dto.rooms) {
        const room = roomMap.get(selectedRoom.roomId);
        if (!room) {
          throw new BadRequestException(`Invalid room ${selectedRoom.roomId}`);
        }

        const overlappingResult = await client.query(
          `SELECT COALESCE(SUM(br.quantity), 0)::int as booked
           FROM booking_rooms br
           JOIN hotel_bookings hb ON hb.id = br.booking_id
           WHERE br.room_id = $1
             AND hb.status IN ('PENDING', 'CONFIRMED')
             AND hb.check_in_date < $3::date
             AND hb.check_out_date > $2::date`,
          [selectedRoom.roomId, dto.checkInDate, dto.checkOutDate],
        );
        const booked = Number(overlappingResult.rows[0]?.booked ?? 0);
        if (booked + selectedRoom.quantity > Number(room.available_rooms)) {
          throw new BadRequestException(`No availability for room ${selectedRoom.roomId}`);
        }
      }

      const currencies = new Set(roomRows.map((room) => room.currency));
      if (currencies.size > 1) {
        throw new BadRequestException('All selected rooms must have same currency');
      }
      const currency = roomRows[0].currency;

      const perNightSubtotal = dto.rooms.reduce((acc, room) => {
        const selected = roomMap.get(room.roomId);
        return acc + (selected?.pricePerNight ?? 0) * room.quantity;
      }, 0);

      const totalPrice = calculateHotelBookingTotal([perNightSubtotal], dateNights);

      const bookingResult = await client.query(
        `INSERT INTO hotel_bookings
           (user_id, hotel_id, total_price, check_in_date, check_out_date, status, payment_status, currency)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', 'PENDING', $6)
         RETURNING id`,
        [userId, dto.hotelId, totalPrice, dto.checkInDate, dto.checkOutDate, currency],
      );
      const bookingId = bookingResult.rows[0].id as string;

      for (const room of dto.rooms) {
        const selected = roomMap.get(room.roomId);
        await client.query(
          `INSERT INTO booking_rooms (booking_id, room_id, quantity, price)
           VALUES ($1, $2, $3, $4)`,
          [bookingId, room.roomId, room.quantity, Number(selected?.pricePerNight ?? 0)],
        );
      }

      for (const guest of dto.guests) {
        await client.query(
          `INSERT INTO booking_guests (booking_id, room_id, full_name, age, type)
           VALUES ($1, $2, $3, $4, $5)`,
          [bookingId, guest.roomId, guest.fullName, guest.age, guest.type],
        );
      }

      return this.findById(bookingId, userId, client);
    });
  }

  async findById(id: string, userId?: string, txClient?: any): Promise<HotelBookingEntity> {
    const executor = txClient ?? this.db;
    const filters = userId ? 'AND hb.user_id = $2' : '';
    const params = userId ? [id, userId] : [id];

    const bookingRows = await executor.query(
      `SELECT hb.id,
          hb.user_id as "userId",
          hb.hotel_id as "hotelId",
          hb.total_price::float8 as "totalPrice",
          hb.check_in_date as "checkInDate",
          hb.check_out_date as "checkOutDate",
          hb.status,
          hb.payment_status as "paymentStatus",
          hb.currency,
          hb.created_at as "createdAt",
          hb.updated_at as "updatedAt"
       FROM hotel_bookings hb
       WHERE hb.id = $1 ${filters}
       LIMIT 1`,
      params,
    );

    if (bookingRows.length === 0) {
      throw new NotFoundException('Hotel booking not found');
    }

    const booking = bookingRows[0] as HotelBookingEntity;

    const [rooms, guests] = await Promise.all([
      executor.query(
        `SELECT id, booking_id as "bookingId", room_id as "roomId", quantity,
            price::float8 as price, created_at as "createdAt", updated_at as "updatedAt"
         FROM booking_rooms
         WHERE booking_id = $1
         ORDER BY created_at ASC`,
        [id],
      ),
      executor.query(
        `SELECT id, booking_id as "bookingId", room_id as "roomId", full_name as "fullName", age, type,
            created_at as "createdAt", updated_at as "updatedAt"
         FROM booking_guests
         WHERE booking_id = $1
         ORDER BY created_at ASC`,
        [id],
      ),
    ]);

    booking.rooms = rooms;
    booking.guests = guests;

    return booking;
  }

  async listByUser(userId: string): Promise<HotelBookingEntity[]> {
    return this.db.query<HotelBookingEntity>(
      `SELECT id,
          user_id as "userId",
          hotel_id as "hotelId",
          total_price::float8 as "totalPrice",
          check_in_date as "checkInDate",
          check_out_date as "checkOutDate",
          status,
          payment_status as "paymentStatus",
          currency,
          created_at as "createdAt",
          updated_at as "updatedAt"
       FROM hotel_bookings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId],
    );
  }

  async cancel(id: string, userId: string): Promise<HotelBookingEntity> {
    await this.db.query(
      `UPDATE hotel_bookings
       SET status = 'CANCELLED',
           updated_at = NOW()
       WHERE id = $1
         AND user_id = $2
         AND status IN ('PENDING', 'CONFIRMED')`,
      [id, userId],
    );

    return this.findById(id, userId);
  }

  async markPaymentStatus(id: string, paymentStatus: 'PENDING' | 'PAID' | 'FAILED'): Promise<void> {
    const status = paymentStatus === 'PAID' ? 'CONFIRMED' : 'PENDING';
    await this.db.query(
      `UPDATE hotel_bookings
       SET payment_status = $2,
           status = $3,
           updated_at = NOW()
       WHERE id = $1`,
      [id, paymentStatus, status],
    );
  }

  private getNights(checkIn: string, checkOut: string): number {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  }
}
