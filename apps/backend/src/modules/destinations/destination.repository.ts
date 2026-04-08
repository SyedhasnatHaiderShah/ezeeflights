import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { AttractionFilterDto, CityEventsQueryDto, CreateAttractionReviewDto, MapNearbyQueryDto } from './dto/destination.dto';
import { AttractionEntity, AttractionReviewEntity, CityEntity, CountryEntity, EventEntity } from './entities/destination.entity';

@Injectable()
export class DestinationRepository {
  constructor(private readonly db: PostgresClient) {}

  listCountries() {
    return this.db.query<CountryEntity>(`SELECT id,name,code,description,hero_image as "heroImage",created_at as "createdAt" FROM countries ORDER BY name ASC`);
  }

  findCountryByCode(code: string) {
    return this.db.queryOne<CountryEntity>(
      `SELECT id,name,code,description,hero_image as "heroImage",created_at as "createdAt" FROM countries WHERE LOWER(code)=LOWER($1) LIMIT 1`,
      [code],
    );
  }

  listCitiesByCountry(countryId: string) {
    return this.db.query<CityEntity>(
      `SELECT id,country_id as "countryId",name,slug,description,latitude::float8 as latitude,longitude::float8 as longitude,hero_image as "heroImage"
       FROM cities WHERE country_id = $1 ORDER BY name ASC`,
      [countryId],
    );
  }

  findCityBySlug(slug: string) {
    return this.db.queryOne<CityEntity>(
      `SELECT id,country_id as "countryId",name,slug,description,latitude::float8 as latitude,longitude::float8 as longitude,hero_image as "heroImage"
       FROM cities WHERE slug = $1 LIMIT 1`,
      [slug],
    );
  }

  async listAttractions(filter: AttractionFilterDto): Promise<{ data: AttractionEntity[]; total: number }> {
    const values: unknown[] = [];
    const where: string[] = [];

    if (filter.city) {
      values.push(filter.city);
      where.push(`c.slug = $${values.length}`);
    }
    if (filter.category) {
      values.push(filter.category);
      where.push(`a.category = $${values.length}`);
    }
    if (typeof filter.rating === 'number') {
      values.push(filter.rating);
      where.push(`a.rating >= $${values.length}`);
    }
    if (
      typeof filter.distanceKm === 'number' &&
      typeof filter.latitude === 'number' &&
      typeof filter.longitude === 'number'
    ) {
      values.push(filter.longitude, filter.latitude, filter.distanceKm * 1000);
      where.push(`ST_DWithin(ST_SetSRID(ST_MakePoint(a.longitude, a.latitude), 4326)::geography, ST_SetSRID(ST_MakePoint($${values.length - 2}, $${values.length - 1}), 4326)::geography, $${values.length})`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const dataValues = [...values, filter.limit, (filter.page - 1) * filter.limit];

    const data = await this.db.query<AttractionEntity>(
      `SELECT a.id,a.city_id as "cityId",a.name,a.slug,a.description,a.category,a.latitude::float8 as latitude,a.longitude::float8 as longitude,
        a.entry_fee::float8 as "entryFee",a.opening_hours as "openingHours",a.tips,a.rating::float8 as rating,a.total_reviews as "totalReviews",a.created_at as "createdAt"
       FROM attractions a
       INNER JOIN cities c ON c.id = a.city_id
       ${whereClause}
       ORDER BY a.rating DESC, a.total_reviews DESC
       LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length}`,
      dataValues,
    );

    const count = await this.db.queryOne<{ total: string }>(
      `SELECT COUNT(*)::text as total
       FROM attractions a INNER JOIN cities c ON c.id = a.city_id ${whereClause}`,
      values,
    );

    return { data, total: Number(count?.total ?? 0) };
  }

  async getAttractionById(id: string) {
    const attraction = await this.db.queryOne<AttractionEntity>(
      `SELECT id,city_id as "cityId",name,slug,description,category,latitude::float8 as latitude,longitude::float8 as longitude,
      entry_fee::float8 as "entryFee",opening_hours as "openingHours",tips,rating::float8 as rating,total_reviews as "totalReviews",created_at as "createdAt"
      FROM attractions WHERE id = $1 LIMIT 1`,
      [id],
    );
    if (!attraction) throw new NotFoundException('Attraction not found');

    const [images, packageLinks] = await Promise.all([
      this.db.query<{ id: string; imageUrl: string }>(`SELECT id,image_url as "imageUrl" FROM attraction_images WHERE attraction_id = $1 ORDER BY id DESC`, [id]),
      this.db.query<{ packageId: string; packageTitle: string; packageSlug: string }>(
        `SELECT p.id as "packageId", p.title as "packageTitle", p.slug as "packageSlug"
         FROM attraction_package_links apl INNER JOIN packages p ON p.id = apl.package_id
         WHERE apl.attraction_id = $1`,
        [id],
      ),
    ]);

    return { ...attraction, images, relatedPackages: packageLinks };
  }

  async listCityEvents(slug: string, query: CityEventsQueryDto): Promise<EventEntity[]> {
    const city = await this.findCityBySlug(slug);
    if (!city) throw new NotFoundException('City not found');

    const values: unknown[] = [city.id];
    const where = ['city_id = $1'];
    if (query.from) {
      values.push(query.from);
      where.push(`start_date >= $${values.length}::date`);
    }
    if (query.to) {
      values.push(query.to);
      where.push(`end_date <= $${values.length}::date`);
    }

    return this.db.query<EventEntity>(
      `SELECT id,city_id as "cityId",title,description,start_date::text as "startDate",end_date::text as "endDate"
       FROM events WHERE ${where.join(' AND ')} ORDER BY start_date ASC`,
      values,
    );
  }

  listNearbyAttractions(cityId: string, limit = 6) {
    return this.db.query<AttractionEntity>(
      `SELECT id,city_id as "cityId",name,slug,description,category,latitude::float8 as latitude,longitude::float8 as longitude,
       entry_fee::float8 as "entryFee",opening_hours as "openingHours",tips,rating::float8 as rating,total_reviews as "totalReviews",created_at as "createdAt"
       FROM attractions WHERE city_id = $1 ORDER BY rating DESC,total_reviews DESC LIMIT $2`,
      [cityId, limit],
    );
  }

  async addWishlist(userId: string, attractionId: string) {
    try {
      const row = await this.db.queryOne<{ id: string; attractionId: string; createdAt: Date }>(
        `INSERT INTO user_wishlist (user_id, attraction_id)
         VALUES ($1,$2)
         ON CONFLICT (user_id, attraction_id) DO NOTHING
         RETURNING id, attraction_id as "attractionId", created_at as "createdAt"`,
        [userId, attractionId],
      );
      if (!row) throw new BadRequestException('Attraction already in wishlist');
      return row;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Invalid attraction id');
    }
  }

  async removeWishlist(userId: string, attractionId: string) {
    const row = await this.db.queryOne<{ id: string }>(
      `DELETE FROM user_wishlist WHERE user_id = $1 AND attraction_id = $2 RETURNING id`,
      [userId, attractionId],
    );
    if (!row) throw new NotFoundException('Wishlist item not found');
  }

  getWishlist(userId: string) {
    return this.db.query(
      `SELECT uw.id, uw.created_at as "createdAt", a.id as "attractionId", a.name, a.slug, a.rating::float8 as rating,
       c.name as "city", c.slug as "citySlug", co.name as "country"
      FROM user_wishlist uw
      INNER JOIN attractions a ON a.id = uw.attraction_id
      INNER JOIN cities c ON c.id = a.city_id
      INNER JOIN countries co ON co.id = c.country_id
      WHERE uw.user_id = $1 ORDER BY uw.created_at DESC`,
      [userId],
    );
  }

  async addReview(userId: string, attractionId: string, dto: CreateAttractionReviewDto): Promise<AttractionReviewEntity> {
    return this.db.withTransaction(async (tx) => {
      const inserted = await tx.query(
        `INSERT INTO attraction_reviews (user_id, attraction_id, rating, comment, image_url)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id,user_id as "userId",attraction_id as "attractionId",rating,comment,image_url as "imageUrl",created_at as "createdAt"`,
        [userId, attractionId, dto.rating, dto.comment, dto.imageUrl ?? null],
      );
      if (!inserted[0]) {
        throw new BadRequestException('Review could not be saved');
      }

      await tx.query(
        `UPDATE attractions
         SET rating = COALESCE((SELECT AVG(rating)::numeric(3,2) FROM attraction_reviews WHERE attraction_id = $1), 0),
             total_reviews = (SELECT COUNT(*) FROM attraction_reviews WHERE attraction_id = $1)
         WHERE id = $1`,
        [attractionId],
      );
      return inserted[0] as AttractionReviewEntity;
    });
  }

  listReviews(attractionId: string) {
    return this.db.query<AttractionReviewEntity>(
      `SELECT id,user_id as "userId",attraction_id as "attractionId",rating,comment,image_url as "imageUrl",created_at as "createdAt"
       FROM attraction_reviews WHERE attraction_id = $1 ORDER BY created_at DESC`,
      [attractionId],
    );
  }

  async nearbyByGeo(query: MapNearbyQueryDto) {
    if (Math.abs(query.latitude) > 90 || Math.abs(query.longitude) > 180) {
      throw new BadRequestException('Invalid geo coordinates');
    }
    const clusterSize = query.zoom <= 5 ? 0.5 : query.zoom <= 9 ? 0.1 : 0.03;
    return this.db.query(
      `SELECT
          floor(latitude / $4) * $4 as "latBucket",
          floor(longitude / $4) * $4 as "lngBucket",
          COUNT(*)::int as "count",
          json_agg(json_build_object('id', id, 'name', name, 'lat', latitude, 'lng', longitude, 'rating', rating)) as points
        FROM attractions
        WHERE ST_DWithin(
          ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
        GROUP BY 1,2
        ORDER BY count DESC`,
      [query.longitude, query.latitude, query.radiusKm * 1000, clusterSize],
    );
  }

  async listUserContext(userId: string) {
    const [pref, wishlist, bookings] = await Promise.all([
      this.db.queryOne<{ preferences: Record<string, unknown> }>(`SELECT preferences FROM user_profiles WHERE user_id = $1 LIMIT 1`, [userId]),
      this.db.query<{ category: string }>(
        `SELECT a.category FROM user_wishlist w INNER JOIN attractions a ON a.id = w.attraction_id WHERE w.user_id = $1`,
        [userId],
      ),
      this.db.query<{ destination: string }>(
        `SELECT p.destination FROM package_bookings pb INNER JOIN packages p ON p.id = pb.package_id WHERE pb.user_id = $1 ORDER BY pb.created_at DESC LIMIT 10`,
        [userId],
      ),
    ]);

    return {
      preferences: pref?.preferences ?? {},
      wishlistCategories: wishlist.map((row) => row.category),
      pastDestinations: bookings.map((row) => row.destination),
    };
  }
}
