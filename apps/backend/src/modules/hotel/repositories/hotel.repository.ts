import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { SearchHotelsDto } from '../dto/search-hotels.dto';
import { HotelDetailsEntity, HotelSearchEntity, RoomEntity } from '../entities/hotel.entity';

@Injectable()
export class HotelRepository {
  constructor(private readonly db: PostgresClient) {}

  async search(dto: SearchHotelsDto): Promise<{ data: HotelSearchEntity[]; total: number; page: number; limit: number }> {
    const offset = (dto.page - 1) * dto.limit;
    const amenities = dto.amenities?.split(',').map((item) => item.trim()).filter(Boolean) ?? [];

    const rows = await this.db.query<HotelSearchEntity & { totalCount: string }>(
      `SELECT
         h.id,
         h.name,
         h.city,
         h.country,
         h.address,
         h.rating::float8 as rating,
         h.description,
         h.amenities,
         COALESCE(array_remove(array_agg(DISTINCT hi.image_url), NULL), '{}') as images,
         MIN(r.price_per_night)::float8 as "minPricePerNight",
         MIN(r.currency) as currency,
         COUNT(*) OVER() as "totalCount"
       FROM hotels h
       JOIN rooms r ON r.hotel_id = h.id
       LEFT JOIN hotel_images hi ON hi.hotel_id = h.id
       WHERE LOWER(h.city) = LOWER($1)
         AND ($2::date IS NULL OR $3::date IS NULL OR $2::date < $3::date)
         AND ($4::numeric IS NULL OR r.price_per_night >= $4)
         AND ($5::numeric IS NULL OR r.price_per_night <= $5)
         AND ($6::numeric IS NULL OR h.rating >= $6)
         AND ($7::text[] IS NULL OR h.amenities ?& $7::text[])
       GROUP BY h.id
       ORDER BY h.rating DESC, "minPricePerNight" ASC
       LIMIT $8 OFFSET $9`,
      [
        dto.city,
        dto.checkInDate,
        dto.checkOutDate,
        dto.minPrice ?? null,
        dto.maxPrice ?? null,
        dto.minRating ?? null,
        amenities.length > 0 ? amenities : null,
        dto.limit,
        offset,
      ],
    );

    const total = rows.length > 0 ? Number(rows[0].totalCount) : 0;
    return { data: rows.map(({ totalCount, ...item }) => item), total, page: dto.page, limit: dto.limit };
  }

  async getById(id: string): Promise<HotelDetailsEntity> {
    const row = await this.db.queryOne<HotelDetailsEntity>(
      `SELECT
         h.id,
         h.name,
         h.city,
         h.country,
         h.address,
         h.rating::float8 as rating,
         h.description,
         h.amenities,
         COALESCE(array_remove(array_agg(DISTINCT hi.image_url), NULL), '{}') as images
       FROM hotels h
       LEFT JOIN hotel_images hi ON hi.hotel_id = h.id
       WHERE h.id = $1
       GROUP BY h.id`,
      [id],
    );

    if (!row) {
      throw new NotFoundException('Hotel not found');
    }

    return row;
  }

  async getRooms(hotelId: string, checkInDate: string, checkOutDate: string): Promise<RoomEntity[]> {
    return this.db.query<RoomEntity>(
      `SELECT
         r.id,
         r.hotel_id as "hotelId",
         r.room_type as "roomType",
         r.capacity,
         r.price_per_night::float8 as "pricePerNight",
         r.currency,
         GREATEST(
           0,
           r.available_rooms - COALESCE(SUM(br.quantity) FILTER (
             WHERE hb.status IN ('PENDING', 'CONFIRMED')
               AND hb.check_in_date < $3::date
               AND hb.check_out_date > $2::date
           ), 0)
         )::int as "availableRooms",
         COALESCE(array_remove(array_agg(DISTINCT ri.image_url), NULL), '{}') as images
       FROM rooms r
       LEFT JOIN booking_rooms br ON br.room_id = r.id
       LEFT JOIN hotel_bookings hb ON hb.id = br.booking_id
       LEFT JOIN room_images ri ON ri.room_id = r.id
       WHERE r.hotel_id = $1
       GROUP BY r.id
       ORDER BY r.price_per_night ASC`,
      [hotelId, checkInDate, checkOutDate],
    );
  }
}
