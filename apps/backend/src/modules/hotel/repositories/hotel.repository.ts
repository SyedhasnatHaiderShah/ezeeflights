import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { HotelEntity } from '../entities/hotel.entity';
import { SearchHotelsDto } from '../dto/search-hotels.dto';

@Injectable()
export class HotelRepository {
  constructor(private readonly db: PostgresClient) {}

  search(dto: SearchHotelsDto): Promise<HotelEntity[]> {
    const offset = (dto.page - 1) * dto.limit;
    return this.db.query<HotelEntity>(
      `SELECT
         id,
         name,
         city,
         country,
         star_rating as "starRating",
         nightly_rate as "nightlyRate",
         currency
       FROM hotels
       WHERE city = $1
         AND ($2::int IS NULL OR star_rating >= $2)
       ORDER BY nightly_rate ASC
       LIMIT $3 OFFSET $4`,
      [dto.city, dto.minStars ?? null, dto.limit, offset],
    );
  }
}
