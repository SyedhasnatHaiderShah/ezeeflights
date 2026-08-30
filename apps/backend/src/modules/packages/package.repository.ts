import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { MysqlClient } from "../../database/mysql.client";
import {
  CreatePackageDto,
  PackageQueryDto,
  UpdatePackageDto,
  UpsertItineraryDto,
} from "./dto/package.dto";
import {
  PackageBookingEntity,
  PackageDetailsEntity,
  PackageEntity,
  PackageItineraryEntity,
} from "./entities/package.entity";

@Injectable()
export class PackageRepository {
  constructor(private readonly db: MysqlClient) {}

  async createPackage(
    createdBy: string,
    slug: string,
    dto: CreatePackageDto,
  ): Promise<PackageDetailsEntity> {
    const tableName = dto.type === "flight_deal" ? "tbl_flightdeals" : "tbl_popularpackage";

    return this.db.withTransaction(async (tx) => {
      let duplicate = await tx.query(
        "SELECT id FROM tbl_popularpackage WHERE slug = $1 LIMIT 1",
        [slug],
      );
      if (duplicate.rows.length === 0) {
        duplicate = await tx.query(
          "SELECT id FROM tbl_flightdeals WHERE slug = $1 LIMIT 1",
          [slug],
        );
      }
      if (duplicate.rows.length > 0) {
        throw new BadRequestException("Package slug already exists");
      }

      const inserted = await tx.query(
        `INSERT INTO ${tableName}
         (title, slug, description, destination, country, duration_days, base_price, thumbnail_url, origin_city, airline_name, is_flash_sale, expires_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         RETURNING id`,
        [
          dto.title,
          slug,
          dto.description,
          dto.destination,
          dto.country,
          dto.durationDays,
          dto.basePrice,
          dto.thumbnailUrl ?? null,
          dto.originCity ?? null,
          dto.airlineName ?? null,
          dto.isFlashSale ? 1 : 0,
          dto.expiresAt ?? null,
        ],
      );
      const packageId = inserted.rows[0].id as string;

      // Mock pricing/inclusions/exclusions since tables don't exist in MySQL schema

      return this.findPackageById(packageId, dto.type, tx);
    });
  }

  async updatePackage(
    id: string,
    dto: UpdatePackageDto,
    slug?: string,
  ): Promise<PackageDetailsEntity> {
    return this.db.withTransaction(async (tx) => {
      const current = await this.findPackageById(id, dto.type, tx);
      const nextSlug = slug ?? current.slug;
      const tableName = current.type === "flight_deal" ? "tbl_flightdeals" : "tbl_popularpackage";

      await tx.query(
        `UPDATE ${tableName}
         SET title = COALESCE($2, title),
             slug = $3,
             description = COALESCE($4, description),
             destination = COALESCE($5, destination),
             country = COALESCE($6, country),
             duration_days = COALESCE($7, duration_days),
             base_price = COALESCE($8, base_price),
             thumbnail_url = COALESCE($9, thumbnail_url),
             origin_city = COALESCE($10, origin_city),
             airline_name = COALESCE($11, airline_name),
             is_flash_sale = COALESCE($12, is_flash_sale),
             expires_at = COALESCE($13, expires_at),
             updated_at = NOW()
         WHERE id = $1`,
        [
          id,
          dto.title ?? null,
          nextSlug,
          dto.description ?? null,
          dto.destination ?? null,
          dto.country ?? null,
          dto.durationDays ?? null,
          dto.basePrice ?? null,
          dto.thumbnailUrl ?? null,
          dto.originCity ?? null,
          dto.airlineName ?? null,
          dto.isFlashSale !== undefined ? (dto.isFlashSale ? 1 : 0) : null,
          dto.expiresAt ?? null,
        ],
      );

      // Mock pricing/inclusions/exclusions since tables don't exist in MySQL schema

      return this.findPackageById(id, dto.type, tx);
    });
  }

  async deletePackage(id: string, type?: "package" | "flight_deal"): Promise<void> {
    const current = await this.findPackageById(id, type);
    const tableName = current.type === "flight_deal" ? "tbl_flightdeals" : "tbl_popularpackage";

    const rows = await this.db.query<{ id: string }>(
      `DELETE FROM ${tableName} WHERE id = $1 RETURNING id`,
      [id],
    );
    if (rows.length === 0) {
      throw new NotFoundException("Package not found");
    }
  }

  async listPackages(
    query: PackageQueryDto,
    includeUnpublished = false,
  ): Promise<{ data: PackageEntity[]; total: number }> {
    const filters: string[] = [];
    const values: unknown[] = [];

    if (query.destination) {
      values.push(`%${query.destination}%`);
      filters.push(`destination ILIKE $${values.length}`);
    }

    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    values.push(query.limit, (query.page - 1) * query.limit);
    const tableName = query.type === "flight_deal" ? "tbl_flightdeals" : "tbl_popularpackage";
    const typeValue = query.type === "flight_deal" ? "flight_deal" : "package";

    console.log(`[DB DEBUG] listPackages SQL: SELECT ... FROM ${tableName} ${where} LIMIT $${values.length - 1} OFFSET $${values.length}`);
    console.log(`[DB DEBUG] listPackages VALUES:`, JSON.stringify(values));

    const data = await this.db.query<PackageEntity>(
      `SELECT id,title,slug,description,destination,country,duration_days as "durationDays",base_price as "basePrice",
         'USD' as currency,thumbnail_url as "thumbnailUrl",origin_city as "originCity",airline_name as "airlineName",
         is_flash_sale as "isFlashSale",expires_at as "expiresAt",'${typeValue}' as type,
         'published' as status,'admin' as "createdBy",created_at as "createdAt",updated_at as "updatedAt"
       FROM ${tableName} ${where}
       ORDER BY created_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values,
    );

    const countValues = values.slice(0, values.length - 2);
    const count = await this.db.queryOne<{ total: string }>(
      `SELECT COUNT(*) as total FROM ${tableName} ${where}`,
      countValues,
    );

    const mappedData = data.map(pkg => ({
      ...pkg,
      isFlashSale: Boolean(pkg.isFlashSale),
      basePrice: Number(pkg.basePrice),
    }));

    return { data: mappedData, total: Number(count?.total ?? 0) };
  }

  async findPackageBySlug(slug: string): Promise<PackageDetailsEntity> {
    let row = await this.db.queryOne<{ id: string; type: "package" | "flight_deal" }>(
      `SELECT id, 'package' as type FROM tbl_popularpackage WHERE slug = $1 LIMIT 1`,
      [slug],
    );
    if (!row) {
      row = await this.db.queryOne<{ id: string; type: "package" | "flight_deal" }>(
        `SELECT id, 'flight_deal' as type FROM tbl_flightdeals WHERE slug = $1 LIMIT 1`,
        [slug],
      );
    }
    if (!row) {
      throw new NotFoundException("Package not found");
    }
    return this.findPackageById(row.id, row.type);
  }

  async findPackageById(id: string, type?: "package" | "flight_deal", tx?: any): Promise<PackageDetailsEntity> {
    console.log(`[DEBUG] findPackageById: id=${id}, type=${type}`);
    const executor = tx ?? this.db;
    let typeValue = "package";
    let base: any[] = [];

    if (!type || type === "package") {
      base = await executor.query(
        `SELECT id,title,slug,description,destination,country,duration_days as "durationDays",base_price as "basePrice",
            'USD' as currency,thumbnail_url as "thumbnailUrl",origin_city as "originCity",airline_name as "airlineName",
            is_flash_sale as "isFlashSale",expires_at as "expiresAt",'package' as type,
            'published' as status,'admin' as "createdBy",created_at as "createdAt",updated_at as "updatedAt"
         FROM tbl_popularpackage WHERE id = $1 LIMIT 1`,
        [id],
      );
      console.log(`[DEBUG] findPackageById: base length from tbl_popularpackage = ${base.length}`);
    }

    if (base.length === 0 && (!type || type === "flight_deal")) {
      base = await executor.query(
        `SELECT id,title,slug,description,destination,country,duration_days as "durationDays",base_price as "basePrice",
            'USD' as currency,thumbnail_url as "thumbnailUrl",origin_city as "originCity",airline_name as "airlineName",
            is_flash_sale as "isFlashSale",expires_at as "expiresAt",'flight_deal' as type,
            'published' as status,'admin' as "createdBy",created_at as "createdAt",updated_at as "updatedAt"
         FROM tbl_flightdeals WHERE id = $1 LIMIT 1`,
        [id],
      );
      typeValue = "flight_deal";
    }

    if (base.length === 0) {
      throw new NotFoundException("Package not found");
    }

    const mappedBasePrice = Number(base[0].basePrice);

    return {
      ...base[0],
      isFlashSale: Boolean(base[0].isFlashSale),
      basePrice: mappedBasePrice,
      pricing: {
        adultPrice: mappedBasePrice,
        childPrice: mappedBasePrice * 0.8,
        infantPrice: mappedBasePrice * 0.2,
      },
      inclusions: [],
      exclusions: [],
      itinerary: [],
    } as PackageDetailsEntity;
  }

  async createItinerary(
    packageId: string,
    dto: UpsertItineraryDto,
  ): Promise<PackageItineraryEntity> {
    return this.db.withTransaction(async (tx) => {
      await this.findPackageById(packageId, undefined, tx);
      if (dto.hotelId) {
        const hotel = await tx.query(
          "SELECT id FROM hotels WHERE id = $1 LIMIT 1",
          [dto.hotelId],
        );
        if (hotel.rows.length === 0) {
          throw new BadRequestException("Selected hotel does not exist");
        }
      }
      const existing = await tx.query(
        "SELECT id FROM package_itineraries WHERE package_id = $1 AND day_number = $2 LIMIT 1",
        [packageId, dto.dayNumber],
      );
      if (existing.rows.length > 0) {
        throw new BadRequestException("Itinerary day already exists");
      }
      const row = await tx.query(
        `INSERT INTO package_itineraries (package_id, day_number, title, description, hotel_id)
         VALUES ($1,$2,$3,$4,$5)
         RETURNING id, package_id as "packageId", day_number as "dayNumber", title, description, hotel_id as "hotelId", created_at as "createdAt"`,
        [
          packageId,
          dto.dayNumber,
          dto.title,
          dto.description,
          dto.hotelId ?? null,
        ],
      );
      return row[0] as PackageItineraryEntity;
    });
  }

  async updateItinerary(
    id: string,
    dto: UpsertItineraryDto,
  ): Promise<PackageItineraryEntity> {
    if (dto.hotelId) {
      const hotel = await this.db.query(
        "SELECT id FROM hotels WHERE id = $1 LIMIT 1",
        [dto.hotelId],
      );
      if (hotel.length === 0) {
        throw new BadRequestException("Selected hotel does not exist");
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
      throw new NotFoundException("Itinerary not found");
    }
    return row[0];
  }

  async deleteItinerary(id: string): Promise<void> {
    const row = await this.db.query<{ id: string }>(
      `DELETE FROM package_itineraries WHERE id = $1 RETURNING id`,
      [id],
    );
    if (row.length === 0) {
      throw new NotFoundException("Itinerary not found");
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
      [
        data.userId,
        data.packageId,
        data.bookingId,
        JSON.stringify(data.travelersJson),
        data.totalAmount,
        data.currency,
      ],
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
