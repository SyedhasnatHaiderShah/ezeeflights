import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { CreatePackageDto, PackageQueryDto, UpdatePackageDto, UpsertItineraryDto } from './dto/package.dto';
import { PackageBookingEntity, PackageDetailsEntity, PackageEntity, PackageItineraryEntity } from './entities/package.entity';

@Injectable()
export class PackageRepository {
  constructor(private readonly db: PostgresClient) {}

  async createPackage(createdBy: string, slug: string, dto: CreatePackageDto): Promise<PackageDetailsEntity> {
    return this.db.withTransaction(async (tx) => {
      const duplicate = await tx.query('SELECT id FROM packages WHERE slug = $1 LIMIT 1', [slug]);
      if (duplicate.rows.length > 0) {
        throw new BadRequestException('Package slug already exists');
      }

      const inserted = await tx.query(
        `INSERT INTO packages
         (title, slug, description, destination, country, duration_days, base_price, currency, thumbnail_url, status, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING id`,
        [dto.title, slug, dto.description, dto.destination, dto.country, dto.durationDays, dto.basePrice, dto.currency, dto.thumbnailUrl ?? null, dto.status ?? 'draft', createdBy],
      );
      const packageId = inserted.rows[0].id as string;

      await tx.query(
        `INSERT INTO package_pricing (package_id, adult_price, child_price, infant_price)
         VALUES ($1,$2,$3,$4)`,
        [packageId, dto.pricing.adultPrice, dto.pricing.childPrice, dto.pricing.infantPrice],
      );

      for (const inclusion of dto.inclusions) {
        await tx.query(
          `INSERT INTO package_inclusions (package_id, type, description)
           VALUES ($1,$2,$3)`,
          [packageId, inclusion.type, inclusion.description],
        );
      }

      for (const exclusion of dto.exclusions) {
        await tx.query(
          `INSERT INTO package_exclusions (package_id, description)
           VALUES ($1,$2)`,
          [packageId, exclusion],
        );
      }

      return this.findPackageById(packageId, tx);
    });
  }

  async updatePackage(id: string, dto: UpdatePackageDto, slug?: string): Promise<PackageDetailsEntity> {
    return this.db.withTransaction(async (tx) => {
      const current = await this.findPackageById(id, tx);
      const nextSlug = slug ?? current.slug;

      await tx.query(
        `UPDATE packages
         SET title = COALESCE($2, title),
             slug = $3,
             description = COALESCE($4, description),
             destination = COALESCE($5, destination),
             country = COALESCE($6, country),
             duration_days = COALESCE($7, duration_days),
             base_price = COALESCE($8, base_price),
             currency = COALESCE($9, currency),
             thumbnail_url = COALESCE($10, thumbnail_url),
             status = COALESCE($11, status),
             updated_at = NOW()
         WHERE id = $1`,
        [id, dto.title ?? null, nextSlug, dto.description ?? null, dto.destination ?? null, dto.country ?? null, dto.durationDays ?? null, dto.basePrice ?? null, dto.currency ?? null, dto.thumbnailUrl ?? null, dto.status ?? null],
      );

      if (dto.pricing) {
        await tx.query(
          `UPDATE package_pricing
           SET adult_price = $2, child_price = $3, infant_price = $4
           WHERE package_id = $1`,
          [id, dto.pricing.adultPrice, dto.pricing.childPrice, dto.pricing.infantPrice],
        );
      }

      if (dto.inclusions) {
        await tx.query(`DELETE FROM package_inclusions WHERE package_id = $1`, [id]);
        for (const inclusion of dto.inclusions) {
          await tx.query(`INSERT INTO package_inclusions (package_id, type, description) VALUES ($1,$2,$3)`, [id, inclusion.type, inclusion.description]);
        }
      }

      if (dto.exclusions) {
        await tx.query(`DELETE FROM package_exclusions WHERE package_id = $1`, [id]);
        for (const exclusion of dto.exclusions) {
          await tx.query(`INSERT INTO package_exclusions (package_id, description) VALUES ($1,$2)`, [id, exclusion]);
        }
      }

      return this.findPackageById(id, tx);
    });
  }

  async deletePackage(id: string): Promise<void> {
    const rows = await this.db.query<{ id: string }>(`DELETE FROM packages WHERE id = $1 RETURNING id`, [id]);
    if (rows.length === 0) {
      throw new NotFoundException('Package not found');
    }
  }

  async listPackages(query: PackageQueryDto, includeUnpublished = false): Promise<{ data: PackageEntity[]; total: number }> {
    const filters: string[] = [];
    const values: unknown[] = [];

    if (!includeUnpublished) {
      filters.push(`status = 'published'`);
    } else if (query.status) {
      values.push(query.status);
      filters.push(`status = $${values.length}`);
    }

    if (query.destination) {
      values.push(`%${query.destination}%`);
      filters.push(`destination ILIKE $${values.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    values.push(query.limit, (query.page - 1) * query.limit);

    const data = await this.db.query<PackageEntity>(
      `SELECT id,title,slug,description,destination,country,duration_days as "durationDays",base_price::float8 as "basePrice",
         currency,thumbnail_url as "thumbnailUrl",status,created_by as "createdBy",created_at as "createdAt",updated_at as "updatedAt"
       FROM packages ${where}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );

    const countValues = values.slice(0, values.length - 2);
    const count = await this.db.queryOne<{ total: string }>(`SELECT COUNT(*)::text as total FROM packages ${where}`, countValues);
    return { data, total: Number(count?.total ?? 0) };
  }

  async findPackageBySlug(slug: string): Promise<PackageDetailsEntity> {
    const row = await this.db.queryOne<{ id: string }>(`SELECT id FROM packages WHERE slug = $1 LIMIT 1`, [slug]);
    if (!row) {
      throw new NotFoundException('Package not found');
    }
    return this.findPackageById(row.id);
  }

  async findPackageById(id: string, tx?: any): Promise<PackageDetailsEntity> {
    const executor = tx ?? this.db;
    const base = await executor.query(
      `SELECT id,title,slug,description,destination,country,duration_days as "durationDays",base_price::float8 as "basePrice",
          currency,thumbnail_url as "thumbnailUrl",status,created_by as "createdBy",created_at as "createdAt",updated_at as "updatedAt"
       FROM packages WHERE id = $1 LIMIT 1`,
      [id],
    );
    if (base.length === 0) {
      throw new NotFoundException('Package not found');
    }

    const [pricingRows, inclusions, exclusions, itinerary] = await Promise.all([
      executor.query(
        `SELECT adult_price::float8 as "adultPrice",child_price::float8 as "childPrice",infant_price::float8 as "infantPrice"
         FROM package_pricing WHERE package_id = $1 LIMIT 1`,
        [id],
      ),
      executor.query(`SELECT id,type,description FROM package_inclusions WHERE package_id = $1 ORDER BY created_at ASC`, [id]),
      executor.query(`SELECT id,description FROM package_exclusions WHERE package_id = $1 ORDER BY created_at ASC`, [id]),
      executor.query(
        `SELECT id, package_id as "packageId", day_number as "dayNumber", title, description, hotel_id as "hotelId", created_at as "createdAt"
         FROM package_itineraries WHERE package_id = $1 ORDER BY day_number ASC`,
        [id],
      ),
    ]);

    return {
      ...base[0],
      pricing: pricingRows[0] ?? { adultPrice: 0, childPrice: 0, infantPrice: 0 },
      inclusions,
      exclusions,
      itinerary,
    } as PackageDetailsEntity;
  }

  async createItinerary(packageId: string, dto: UpsertItineraryDto): Promise<PackageItineraryEntity> {
    return this.db.withTransaction(async (tx) => {
      await this.findPackageById(packageId, tx);
      if (dto.hotelId) {
        const hotel = await tx.query('SELECT id FROM hotels WHERE id = $1 LIMIT 1', [dto.hotelId]);
        if (hotel.rows.length === 0) {
          throw new BadRequestException('Selected hotel does not exist');
        }
      }
      const existing = await tx.query('SELECT id FROM package_itineraries WHERE package_id = $1 AND day_number = $2 LIMIT 1', [packageId, dto.dayNumber]);
      if (existing.rows.length > 0) {
        throw new BadRequestException('Itinerary day already exists');
      }
      const row = await tx.query(
        `INSERT INTO package_itineraries (package_id, day_number, title, description, hotel_id)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, package_id as "packageId", day_number as "dayNumber", title, description, hotel_id as "hotelId", created_at as "createdAt"`,
        [packageId, dto.dayNumber, dto.title, dto.description, dto.hotelId ?? null],
      );
      return row[0] as PackageItineraryEntity;
    });
  }

  async updateItinerary(id: string, dto: UpsertItineraryDto): Promise<PackageItineraryEntity> {
    if (dto.hotelId) {
      const hotel = await this.db.query('SELECT id FROM hotels WHERE id = $1 LIMIT 1', [dto.hotelId]);
      if (hotel.length === 0) {
        throw new BadRequestException('Selected hotel does not exist');
      }
    }
    const row = await this.db.query<PackageItineraryEntity>(
      `UPDATE package_itineraries
       SET day_number = $2, title = $3, description = $4, hotel_id = $5
       WHERE id = $1
       RETURNING id, package_id as "packageId", day_number as "dayNumber", title, description, hotel_id as "hotelId", created_at as "createdAt"`,
      [id, dto.dayNumber, dto.title, dto.description, dto.hotelId ?? null],
    );
    if (row.length === 0) {
      throw new NotFoundException('Itinerary not found');
    }
    return row[0];
  }

  async deleteItinerary(id: string): Promise<void> {
    const row = await this.db.query<{ id: string }>(`DELETE FROM package_itineraries WHERE id = $1 RETURNING id`, [id]);
    if (row.length === 0) {
      throw new NotFoundException('Itinerary not found');
    }
  }

  async createPackageBooking(data: {
    userId: string;
    packageId: string;
    bookingId: string;
    travelersJson: unknown;
    totalAmount: number;
    currency: string;
  }): Promise<PackageBookingEntity> {
    const row = await this.db.query<PackageBookingEntity>(
      `INSERT INTO package_bookings (user_id, package_id, booking_id, travelers_json, total_amount, currency, payment_status, booking_status)
       VALUES ($1,$2,$3,$4::jsonb,$5,$6,'PENDING','PAYMENT_PENDING')
       RETURNING id,user_id as "userId",package_id as "packageId",booking_id as "bookingId",travelers_json as "travelersJson",
         total_amount::float8 as "totalAmount",currency,payment_status as "paymentStatus",booking_status as "bookingStatus",created_at as "createdAt"`,
      [data.userId, data.packageId, data.bookingId, JSON.stringify(data.travelersJson), data.totalAmount, data.currency],
    );
    return row[0];
  }

  async markPackageBookingPaid(id: string): Promise<void> {
    await this.db.query(
      `UPDATE package_bookings SET payment_status = 'PAID', booking_status = 'CONFIRMED' WHERE id = $1`,
      [id],
    );
  }
}
