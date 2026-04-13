import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { SeatMapEntity, SeatSelectionEntity } from '../entities/seat-map.entity';

@Injectable()
export class SeatMapRepository {
  constructor(private readonly db: PostgresClient) {}

  async findSeatMap(flightId: string): Promise<SeatMapEntity | null> {
    return this.db.queryOne<SeatMapEntity>(
      `SELECT flight_id as "flightId", aircraft_type as "aircraftType", total_rows as "totalRows",
          columns_layout as "columnsLayout", seat_map_data as "seatMapData", last_synced_at as "lastSyncedAt"
       FROM aircraft_seat_maps WHERE flight_id = $1 LIMIT 1`,
      [flightId],
    );
  }

  async upsertSeatMap(seatMap: SeatMapEntity): Promise<void> {
    const updated = await this.db.query(
      `UPDATE aircraft_seat_maps
       SET aircraft_type = $2, total_rows = $3, columns_layout = $4, seat_map_data = $5::jsonb, last_synced_at = NOW()
       WHERE flight_id = $1
       RETURNING id`,
      [seatMap.flightId, seatMap.aircraftType, seatMap.totalRows, seatMap.columnsLayout, JSON.stringify(seatMap.seatMapData)],
    );

    if (updated.length === 0) {
      await this.db.query(
        `INSERT INTO aircraft_seat_maps (flight_id, aircraft_type, total_rows, columns_layout, seat_map_data, last_synced_at)
         VALUES ($1, $2, $3, $4, $5::jsonb, NOW())`,
        [seatMap.flightId, seatMap.aircraftType, seatMap.totalRows, seatMap.columnsLayout, JSON.stringify(seatMap.seatMapData)],
      );
    }
  }

  async reserveSeat(bookingId: string, flightId: string, row: number, col: string, passengerIndex: number): Promise<SeatSelectionEntity> {
    return this.db.withTransaction(async (client) => {
      const booking = await client.query(
        'SELECT id, currency FROM bookings WHERE id = $1 LIMIT 1 FOR UPDATE',
        [bookingId],
      );
      if (!booking.rows[0]) throw new NotFoundException('Booking not found');

      const existing = await client.query(
        `SELECT id FROM seat_selections
         WHERE flight_id = $1 AND seat_row = $2 AND seat_column = $3 AND status IN ('reserved', 'occupied')
         LIMIT 1 FOR UPDATE`,
        [flightId, row, col],
      );
      if (existing.rows[0]) {
        throw new BadRequestException('Seat is not available');
      }

      const seatData = await client.query(
        `SELECT seat_map_data FROM aircraft_seat_maps WHERE flight_id = $1 LIMIT 1`,
        [flightId],
      );
      const mappedRow = (seatData.rows[0]?.seat_map_data ?? []).find((r: { row: number }) => r.row === row);
      const mappedSeat = mappedRow?.seats?.find((s: { col: string }) => s.col === col.toUpperCase());
      if (!mappedSeat || mappedSeat.status !== 'available') {
        throw new BadRequestException('Seat is not available in current seat map');
      }

      const result = await client.query(
        `INSERT INTO seat_selections (
            booking_id, passenger_index, flight_id, seat_row, seat_column, seat_class, seat_position, price, currency, status
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'reserved')
          RETURNING id, booking_id as "bookingId", passenger_index as "passengerIndex", flight_id as "flightId",
            seat_row as "seatRow", seat_column as "seatColumn", seat_class as "seatClass", seat_position as "seatPosition",
            price::float8 as price, currency, status, created_at as "createdAt"`,
        [bookingId, passengerIndex, flightId, row, col.toUpperCase(), mappedSeat.class, mappedSeat.position, Number(mappedSeat.price ?? 0), booking.rows[0].currency ?? 'USD'],
      );

      await client.query(
        `UPDATE bookings SET total_price = total_price + $2, updated_at = NOW() WHERE id = $1`,
        [bookingId, Number(mappedSeat.price ?? 0)],
      );

      return result.rows[0] as SeatSelectionEntity;
    });
  }

  async releaseSeat(selectionId: string): Promise<void> {
    await this.db.withTransaction(async (client) => {
      const seat = await client.query(
        `DELETE FROM seat_selections WHERE id = $1
         RETURNING booking_id as "bookingId", price::float8 as price`,
        [selectionId],
      );
      const deleted = seat.rows[0];
      if (!deleted) {
        throw new NotFoundException('Seat selection not found');
      }

      await client.query(
        `UPDATE bookings SET total_price = GREATEST(total_price - $2, 0), updated_at = NOW() WHERE id = $1`,
        [deleted.bookingId, Number(deleted.price ?? 0)],
      );
    });
  }
}
