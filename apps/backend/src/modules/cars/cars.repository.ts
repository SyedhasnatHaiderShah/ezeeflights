import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { Car, CarBooking, CarLocation } from './cars.entity';

@Injectable()
export class CarRepository {
  constructor(private readonly db: PostgresClient) {}

  async searchAvailable(
    pickupLocationId: string,
    pickupDate: string,
    dropoffDate: string,
    category?: string,
    maxPricePerDay?: number,
  ): Promise<Car[]> {
    const params: unknown[] = [pickupLocationId, pickupDate, dropoffDate];
    let where = `c.location_id = $1
      AND c.is_available = true
      AND NOT EXISTS (
        SELECT 1
        FROM car_bookings cb
        WHERE cb.car_id = c.id
          AND cb.status IN ('pending', 'confirmed', 'active')
          AND tstzrange(cb.pickup_datetime, cb.dropoff_datetime, '[)') && tstzrange($2::timestamptz, $3::timestamptz, '[)')
      )`;

    if (category) {
      params.push(category);
      where += ` AND c.category = $${params.length}`;
    }

    if (typeof maxPricePerDay === 'number' && !Number.isNaN(maxPricePerDay)) {
      params.push(maxPricePerDay);
      where += ` AND c.price_per_day <= $${params.length}`;
    }

    return this.db.query<Car>(
      `SELECT c.id,
          c.vendor_id as "vendorId",
          c.location_id as "locationId",
          c.category,
          c.make,
          c.model,
          c.year,
          c.seats,
          c.doors,
          c.transmission,
          c.fuel_type as "fuelType",
          c.fuel_policy as "fuelPolicy",
          c.air_conditioning as "airConditioning",
          c.unlimited_mileage as "unlimitedMileage",
          c.mileage_limit_km as "mileageLimitKm",
          c.price_per_day::float8 as "pricePerDay",
          c.currency,
          c.deposit_amount::float8 as "depositAmount",
          c.minimum_driver_age as "minimumDriverAge",
          c.images,
          c.features,
          c.is_available as "isAvailable",
          c.external_id as "externalId",
          c.created_at as "createdAt",
          c.updated_at as "updatedAt"
       FROM cars c
       WHERE ${where}
       ORDER BY c.price_per_day ASC, c.created_at DESC`,
      params,
    );
  }

  async findById(id: string): Promise<Car> {
    const car = await this.db.queryOne<Car>(
      `SELECT id,
          vendor_id as "vendorId",
          location_id as "locationId",
          category,
          make,
          model,
          year,
          seats,
          doors,
          transmission,
          fuel_type as "fuelType",
          fuel_policy as "fuelPolicy",
          air_conditioning as "airConditioning",
          unlimited_mileage as "unlimitedMileage",
          mileage_limit_km as "mileageLimitKm",
          price_per_day::float8 as "pricePerDay",
          currency,
          deposit_amount::float8 as "depositAmount",
          minimum_driver_age as "minimumDriverAge",
          images,
          features,
          is_available as "isAvailable",
          external_id as "externalId",
          created_at as "createdAt",
          updated_at as "updatedAt"
       FROM cars
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    if (!car) {
      throw new NotFoundException('Car not found');
    }
    return car;
  }

  findByVendor(vendorId: string): Promise<Car[]> {
    return this.db.query<Car>(
      `SELECT id,
          vendor_id as "vendorId",
          location_id as "locationId",
          category,
          make,
          model,
          year,
          seats,
          doors,
          transmission,
          fuel_type as "fuelType",
          fuel_policy as "fuelPolicy",
          air_conditioning as "airConditioning",
          unlimited_mileage as "unlimitedMileage",
          mileage_limit_km as "mileageLimitKm",
          price_per_day::float8 as "pricePerDay",
          currency,
          deposit_amount::float8 as "depositAmount",
          minimum_driver_age as "minimumDriverAge",
          images,
          features,
          is_available as "isAvailable",
          external_id as "externalId",
          created_at as "createdAt",
          updated_at as "updatedAt"
       FROM cars
       WHERE vendor_id = $1
       ORDER BY created_at DESC`,
      [vendorId],
    );
  }

  async updateAvailability(carId: string, isAvailable: boolean): Promise<void> {
    await this.db.query(
      `UPDATE cars
       SET is_available = $2,
           updated_at = NOW()
       WHERE id = $1`,
      [carId, isAvailable],
    );
  }

  async createBooking(booking: Omit<CarBooking, 'id' | 'createdAt' | 'updatedAt'>): Promise<CarBooking> {
    const created = await this.db.queryOne<CarBooking>(
      `INSERT INTO car_bookings (
          user_id, car_id, pickup_location_id, dropoff_location_id, pickup_datetime, dropoff_datetime,
          total_days, base_price, insurance_type, insurance_price, extras_price, extras, total_price,
          currency, status, driver_name, driver_license_number, driver_nationality, additional_drivers,
          payment_id, confirmation_code, vendor_booking_ref, notes
       ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12::jsonb, $13,
          $14, $15, $16, $17, $18, $19::jsonb,
          $20, $21, $22, $23
       )
       RETURNING id,
          user_id as "userId",
          car_id as "carId",
          pickup_location_id as "pickupLocationId",
          dropoff_location_id as "dropoffLocationId",
          pickup_datetime as "pickupDatetime",
          dropoff_datetime as "dropoffDatetime",
          total_days as "totalDays",
          base_price::float8 as "basePrice",
          insurance_type as "insuranceType",
          insurance_price::float8 as "insurancePrice",
          extras_price::float8 as "extrasPrice",
          extras,
          total_price::float8 as "totalPrice",
          currency,
          status,
          driver_name as "driverName",
          driver_license_number as "driverLicenseNumber",
          driver_nationality as "driverNationality",
          additional_drivers as "additionalDrivers",
          payment_id as "paymentId",
          confirmation_code as "confirmationCode",
          vendor_booking_ref as "vendorBookingRef",
          notes,
          cancelled_at as "cancelledAt",
          cancellation_reason as "cancellationReason",
          created_at as "createdAt",
          updated_at as "updatedAt"`,
      [
        booking.userId,
        booking.carId,
        booking.pickupLocationId,
        booking.dropoffLocationId,
        booking.pickupDatetime,
        booking.dropoffDatetime,
        booking.totalDays,
        booking.basePrice,
        booking.insuranceType,
        booking.insurancePrice,
        booking.extrasPrice,
        JSON.stringify(booking.extras ?? []),
        booking.totalPrice,
        booking.currency,
        booking.status,
        booking.driverName,
        booking.driverLicenseNumber,
        booking.driverNationality,
        JSON.stringify(booking.additionalDrivers ?? []),
        booking.paymentId,
        booking.confirmationCode,
        booking.vendorBookingRef,
        booking.notes,
      ],
    );

    if (!created) {
      throw new NotFoundException('Failed to create booking');
    }
    return created;
  }

  async findLocationList(query?: string): Promise<CarLocation[]> {
    const params: unknown[] = [];
    let where = '';
    if (query?.trim()) {
      params.push(`%${query.trim()}%`);
      where = `WHERE name ILIKE $1 OR city ILIKE $1`;
    }
    return this.db.query<CarLocation>(
      `SELECT id,
          vendor_id as "vendorId",
          name,
          address,
          city,
          country_code as "countryCode",
          iata_code as "iataCode",
          latitude::float8 as latitude,
          longitude::float8 as longitude,
          is_airport_pickup as "isAirportPickup",
          operating_hours as "operatingHours",
          created_at as "createdAt"
      FROM car_locations
      ${where}
      ORDER BY city ASC, name ASC`,
      params,
    );
  }

  async findBookingById(id: string): Promise<CarBooking | null> {
    return this.db.queryOne<CarBooking>(
      `SELECT id,
          user_id as "userId",
          car_id as "carId",
          pickup_location_id as "pickupLocationId",
          dropoff_location_id as "dropoffLocationId",
          pickup_datetime as "pickupDatetime",
          dropoff_datetime as "dropoffDatetime",
          total_days as "totalDays",
          base_price::float8 as "basePrice",
          insurance_type as "insuranceType",
          insurance_price::float8 as "insurancePrice",
          extras_price::float8 as "extrasPrice",
          extras,
          total_price::float8 as "totalPrice",
          currency,
          status,
          driver_name as "driverName",
          driver_license_number as "driverLicenseNumber",
          driver_nationality as "driverNationality",
          additional_drivers as "additionalDrivers",
          payment_id as "paymentId",
          confirmation_code as "confirmationCode",
          vendor_booking_ref as "vendorBookingRef",
          notes,
          cancelled_at as "cancelledAt",
          cancellation_reason as "cancellationReason",
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM car_bookings
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
  }

  async listUserBookings(userId: string): Promise<CarBooking[]> {
    return this.db.query<CarBooking>(
      `SELECT id,
          user_id as "userId",
          car_id as "carId",
          pickup_location_id as "pickupLocationId",
          dropoff_location_id as "dropoffLocationId",
          pickup_datetime as "pickupDatetime",
          dropoff_datetime as "dropoffDatetime",
          total_days as "totalDays",
          base_price::float8 as "basePrice",
          insurance_type as "insuranceType",
          insurance_price::float8 as "insurancePrice",
          extras_price::float8 as "extrasPrice",
          extras,
          total_price::float8 as "totalPrice",
          currency,
          status,
          driver_name as "driverName",
          driver_license_number as "driverLicenseNumber",
          driver_nationality as "driverNationality",
          additional_drivers as "additionalDrivers",
          payment_id as "paymentId",
          confirmation_code as "confirmationCode",
          vendor_booking_ref as "vendorBookingRef",
          notes,
          cancelled_at as "cancelledAt",
          cancellation_reason as "cancellationReason",
          created_at as "createdAt",
          updated_at as "updatedAt"
      FROM car_bookings
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [userId],
    );
  }

  async cancelBooking(id: string, reason?: string): Promise<void> {
    await this.db.query(
      `UPDATE car_bookings
       SET status = 'cancelled', cancelled_at = NOW(), cancellation_reason = $2, updated_at = NOW()
       WHERE id = $1 AND status IN ('pending', 'confirmed', 'active')`,
      [id, reason ?? null],
    );
  }

  async hasDateConflict(carId: string, pickupDatetime: string, dropoffDatetime: string): Promise<boolean> {
    const row = await this.db.queryOne<{ conflict: boolean }>(
      `SELECT EXISTS(
          SELECT 1
          FROM car_bookings cb
          WHERE cb.car_id = $1
            AND cb.status IN ('pending', 'confirmed', 'active')
            AND tstzrange(cb.pickup_datetime, cb.dropoff_datetime, '[)') && tstzrange($2::timestamptz, $3::timestamptz, '[)')
      ) as conflict`,
      [carId, pickupDatetime, dropoffDatetime],
    );

    return row?.conflict ?? false;
  }
}
