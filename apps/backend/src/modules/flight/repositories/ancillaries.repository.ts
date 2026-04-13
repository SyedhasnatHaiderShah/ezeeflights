import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { AddAncillaryItemDto } from '../dto/add-ancillary.dto';
import { AncillaryOptionEntity, BookingAncillaryEntity } from '../entities/seat-map.entity';

@Injectable()
export class AncillariesRepository {
  constructor(private readonly db: PostgresClient) {}

  async getOptions(airlineCode?: string, type?: string): Promise<AncillaryOptionEntity[]> {
    return this.db.query<AncillaryOptionEntity>(
      `SELECT id, ancillary_type as "ancillaryType", name, description,
          airline_code as "airlineCode", price::float8 as price, currency, unit, value, is_active as "isActive"
       FROM ancillary_options
       WHERE is_active = true
         AND ($1::text IS NULL OR airline_code = $1)
         AND ($2::text IS NULL OR ancillary_type = $2)
       ORDER BY ancillary_type ASC, price ASC`,
      [airlineCode ?? null, type ?? null],
    );
  }

  async addToBooking(userId: string, bookingId: string, items: AddAncillaryItemDto[]): Promise<BookingAncillaryEntity[]> {
    return this.db.withTransaction(async (client) => {
      const booking = await client.query(
        `SELECT id, user_id as "userId", currency FROM bookings WHERE id = $1 LIMIT 1 FOR UPDATE`,
        [bookingId],
      );
      if (!booking.rows[0]) throw new NotFoundException('Booking not found');
      if (booking.rows[0].userId !== userId) throw new BadRequestException('Booking does not belong to user');

      const inserted: BookingAncillaryEntity[] = [];
      let totalAdd = 0;

      for (const item of items) {
        const opt = await client.query(
          `SELECT id, price::float8 as price, currency FROM ancillary_options WHERE id = $1 AND is_active = true LIMIT 1`,
          [item.ancillaryId],
        );
        const option = opt.rows[0];
        if (!option) throw new NotFoundException(`Ancillary option not found: ${item.ancillaryId}`);

        const unitPrice = Number(option.price);
        const totalPrice = unitPrice * item.quantity;
        totalAdd += totalPrice;

        const row = await client.query(
          `INSERT INTO booking_ancillaries (booking_id, passenger_index, ancillary_id, quantity, unit_price, total_price, currency)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           RETURNING id, booking_id as "bookingId", passenger_index as "passengerIndex", ancillary_id as "ancillaryId",
             quantity, unit_price::float8 as "unitPrice", total_price::float8 as "totalPrice", currency,
             created_at as "createdAt"`,
          [bookingId, item.passengerIndex, item.ancillaryId, item.quantity, unitPrice, totalPrice, option.currency ?? booking.rows[0].currency],
        );
        inserted.push(row.rows[0] as BookingAncillaryEntity);
      }

      await client.query('UPDATE bookings SET total_price = total_price + $2, updated_at = NOW() WHERE id = $1', [bookingId, totalAdd]);

      return inserted;
    });
  }
}
