import { Injectable, NotFoundException } from '@nestjs/common';
import { PostgresClient } from '../../database/postgres.client';
import { CreateTransferBookingDto } from './transfers.dto';
import { TransferBooking, TransferRoute, TransferVehicle } from './transfers.entity';

@Injectable()
export class TransfersRepository {
  constructor(private readonly db: PostgresClient) {}

  async searchRoutes(iata: string, city: string): Promise<TransferRoute[]> {
    return this.db.query<TransferRoute>(
      `SELECT id,
          provider_id as "providerId",
          origin_iata as "originIata",
          origin_name as "originName",
          destination_name as "destinationName",
          destination_city as "destinationCity",
          country_code as "countryCode",
          distance_km::float8 as "distanceKm",
          duration_minutes as "durationMinutes",
          is_active as "isActive"
       FROM transfer_routes
       WHERE is_active = true
         AND UPPER(origin_iata) = UPPER($1)
         AND LOWER(destination_city) = LOWER($2)
       ORDER BY destination_name ASC`,
      [iata, city],
    );
  }

  async listRoutes(iata?: string, city?: string): Promise<TransferRoute[]> {
    const clauses: string[] = ['is_active = true'];
    const params: string[] = [];

    if (iata) {
      params.push(iata);
      clauses.push(`UPPER(origin_iata) = UPPER($${params.length})`);
    }
    if (city) {
      params.push(city);
      clauses.push(`LOWER(destination_city) = LOWER($${params.length})`);
    }

    return this.db.query<TransferRoute>(
      `SELECT id,
          provider_id as "providerId",
          origin_iata as "originIata",
          origin_name as "originName",
          destination_name as "destinationName",
          destination_city as "destinationCity",
          country_code as "countryCode",
          distance_km::float8 as "distanceKm",
          duration_minutes as "durationMinutes",
          is_active as "isActive"
       FROM transfer_routes
       WHERE ${clauses.join(' AND ')}
       ORDER BY destination_city ASC, destination_name ASC
       LIMIT 200`,
      params,
    );
  }

  async getVehiclesByRoute(routeId: string, passengerCount?: number): Promise<TransferVehicle[]> {
    const params: Array<string | number> = [routeId];
    let passengerFilter = '';

    if (passengerCount) {
      params.push(passengerCount);
      passengerFilter = ` AND v.max_passengers >= $${params.length}`;
    }

    return this.db.query<TransferVehicle>(
      `SELECT v.id,
          v.route_id as "routeId",
          v.vehicle_type as "vehicleType",
          v.transfer_type as "transferType",
          v.max_passengers as "maxPassengers",
          v.max_luggage as "maxLuggage",
          v.price::float8 as price,
          v.currency,
          v.includes_meet_and_greet as "includesMeetAndGreet",
          v.includes_flight_tracking as "includesFlightTracking",
          v.free_waiting_minutes as "freeWaitingMinutes",
          v.description,
          v.image_url as "imageUrl"
       FROM transfer_vehicles v
       JOIN transfer_routes r ON r.id = v.route_id
       WHERE v.route_id = $1
         AND r.is_active = true${passengerFilter}
       ORDER BY v.price ASC`,
      params,
    );
  }

  async findById(vehicleId: string): Promise<TransferVehicle> {
    const vehicle = await this.db.queryOne<TransferVehicle>(
      `SELECT v.id,
          v.route_id as "routeId",
          v.vehicle_type as "vehicleType",
          v.transfer_type as "transferType",
          v.max_passengers as "maxPassengers",
          v.max_luggage as "maxLuggage",
          v.price::float8 as price,
          v.currency,
          v.includes_meet_and_greet as "includesMeetAndGreet",
          v.includes_flight_tracking as "includesFlightTracking",
          v.free_waiting_minutes as "freeWaitingMinutes",
          v.description,
          v.image_url as "imageUrl"
       FROM transfer_vehicles v
       JOIN transfer_routes r ON r.id = v.route_id
       WHERE v.id = $1
       LIMIT 1`,
      [vehicleId],
    );

    if (!vehicle) {
      throw new NotFoundException('Transfer vehicle not found');
    }

    const route = await this.db.queryOne<TransferRoute>(
      `SELECT id,
          provider_id as "providerId",
          origin_iata as "originIata",
          origin_name as "originName",
          destination_name as "destinationName",
          destination_city as "destinationCity",
          country_code as "countryCode",
          distance_km::float8 as "distanceKm",
          duration_minutes as "durationMinutes",
          is_active as "isActive"
       FROM transfer_routes
       WHERE id = $1`,
      [vehicle.routeId],
    );

    return {
      ...vehicle,
      route: route ?? undefined,
    };
  }

  async createBooking(userId: string, dto: CreateTransferBookingDto, unitPrice: number, currency: string, confirmationCode: string): Promise<TransferBooking> {
    const booking = await this.db.queryOne<TransferBooking>(
      `INSERT INTO transfer_bookings
          (user_id, vehicle_id, direction, status, flight_number, flight_arrival_datetime, pickup_datetime,
            pickup_address, dropoff_address, passenger_count, luggage_count, passenger_name, passenger_phone,
            passenger_email, meet_and_greet, special_requests, price, currency, confirmation_code)
       VALUES
          ($1, $2, $3, 'confirmed', $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING id,
          user_id as "userId",
          vehicle_id as "vehicleId",
          direction,
          status,
          flight_number as "flightNumber",
          flight_arrival_datetime as "flightArrivalDatetime",
          pickup_datetime as "pickupDatetime",
          pickup_address as "pickupAddress",
          dropoff_address as "dropoffAddress",
          passenger_count as "passengerCount",
          luggage_count as "luggageCount",
          passenger_name as "passengerName",
          passenger_phone as "passengerPhone",
          passenger_email as "passengerEmail",
          meet_and_greet as "meetAndGreet",
          special_requests as "specialRequests",
          price::float8 as price,
          currency,
          payment_id as "paymentId",
          confirmation_code as "confirmationCode",
          driver_name as "driverName",
          driver_phone as "driverPhone",
          driver_vehicle_plate as "driverVehiclePlate",
          cancelled_at as "cancelledAt",
          created_at as "createdAt",
          updated_at as "updatedAt"`,
      [
        userId,
        dto.vehicleId,
        dto.direction,
        dto.flightNumber ?? null,
        dto.flightArrivalDatetime ?? null,
        dto.pickupDatetime,
        dto.pickupAddress,
        dto.dropoffAddress,
        dto.passengerCount,
        dto.luggageCount,
        dto.passengerName,
        dto.passengerPhone,
        dto.passengerEmail ?? null,
        dto.meetAndGreet ?? false,
        dto.specialRequests ?? null,
        unitPrice,
        currency,
        confirmationCode,
      ],
    );

    if (!booking) {
      throw new NotFoundException('Unable to create transfer booking');
    }

    return booking;
  }

  async getBookingById(bookingId: string): Promise<TransferBooking> {
    const booking = await this.db.queryOne<TransferBooking>(
      `SELECT id,
          user_id as "userId",
          vehicle_id as "vehicleId",
          direction,
          status,
          flight_number as "flightNumber",
          flight_arrival_datetime as "flightArrivalDatetime",
          pickup_datetime as "pickupDatetime",
          pickup_address as "pickupAddress",
          dropoff_address as "dropoffAddress",
          passenger_count as "passengerCount",
          luggage_count as "luggageCount",
          passenger_name as "passengerName",
          passenger_phone as "passengerPhone",
          passenger_email as "passengerEmail",
          meet_and_greet as "meetAndGreet",
          special_requests as "specialRequests",
          price::float8 as price,
          currency,
          payment_id as "paymentId",
          confirmation_code as "confirmationCode",
          driver_name as "driverName",
          driver_phone as "driverPhone",
          driver_vehicle_plate as "driverVehiclePlate",
          cancelled_at as "cancelledAt",
          created_at as "createdAt",
          updated_at as "updatedAt"
       FROM transfer_bookings
       WHERE id = $1
       LIMIT 1`,
      [bookingId],
    );

    if (!booking) {
      throw new NotFoundException('Transfer booking not found');
    }

    return booking;
  }

  async listBookingsByUser(userId: string): Promise<TransferBooking[]> {
    return this.db.query<TransferBooking>(
      `SELECT id,
          user_id as "userId",
          vehicle_id as "vehicleId",
          direction,
          status,
          flight_number as "flightNumber",
          flight_arrival_datetime as "flightArrivalDatetime",
          pickup_datetime as "pickupDatetime",
          pickup_address as "pickupAddress",
          dropoff_address as "dropoffAddress",
          passenger_count as "passengerCount",
          luggage_count as "luggageCount",
          passenger_name as "passengerName",
          passenger_phone as "passengerPhone",
          passenger_email as "passengerEmail",
          meet_and_greet as "meetAndGreet",
          special_requests as "specialRequests",
          price::float8 as price,
          currency,
          payment_id as "paymentId",
          confirmation_code as "confirmationCode",
          driver_name as "driverName",
          driver_phone as "driverPhone",
          driver_vehicle_plate as "driverVehiclePlate",
          cancelled_at as "cancelledAt",
          created_at as "createdAt",
          updated_at as "updatedAt"
       FROM transfer_bookings
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [userId],
    );
  }

  async cancelBooking(bookingId: string, userId: string): Promise<TransferBooking> {
    const booking = await this.db.queryOne<TransferBooking>(
      `UPDATE transfer_bookings
       SET status = 'cancelled',
           cancelled_at = NOW(),
           updated_at = NOW()
       WHERE id = $1
         AND user_id = $2
         AND status IN ('pending', 'confirmed', 'driver_assigned')
       RETURNING id,
          user_id as "userId",
          vehicle_id as "vehicleId",
          direction,
          status,
          flight_number as "flightNumber",
          flight_arrival_datetime as "flightArrivalDatetime",
          pickup_datetime as "pickupDatetime",
          pickup_address as "pickupAddress",
          dropoff_address as "dropoffAddress",
          passenger_count as "passengerCount",
          luggage_count as "luggageCount",
          passenger_name as "passengerName",
          passenger_phone as "passengerPhone",
          passenger_email as "passengerEmail",
          meet_and_greet as "meetAndGreet",
          special_requests as "specialRequests",
          price::float8 as price,
          currency,
          payment_id as "paymentId",
          confirmation_code as "confirmationCode",
          driver_name as "driverName",
          driver_phone as "driverPhone",
          driver_vehicle_plate as "driverVehiclePlate",
          cancelled_at as "cancelledAt",
          created_at as "createdAt",
          updated_at as "updatedAt"`,
      [bookingId, userId],
    );

    if (!booking) {
      throw new NotFoundException('Transfer booking not found or cannot be cancelled');
    }

    return booking;
  }

  async updatePickupDatetimeByFlightNumber(flightNumber: string, pickupDatetime: string): Promise<number> {
    const rows = await this.db.query<{ id: string }>(
      `UPDATE transfer_bookings
       SET pickup_datetime = $2,
           updated_at = NOW()
       WHERE flight_number = $1
         AND status IN ('pending', 'confirmed', 'driver_assigned')
       RETURNING id`,
      [flightNumber, pickupDatetime],
    );

    return rows.length;
  }
}
