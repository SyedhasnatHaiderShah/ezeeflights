import { Injectable } from '@nestjs/common';
import { MysqlClient } from '../../../database/mysql.client';
import { SearchFlightsDto } from '../dto/search-flights.dto';
import { FlightEntity } from '../entities/flight.entity';

@Injectable()
export class FlightRepository {
  constructor(private readonly db: MysqlClient) {}

  async search(dto: SearchFlightsDto): Promise<FlightEntity[]> {
    const offset = (dto.page - 1) * dto.limit;
    const query = `
      SELECT
        id,
        COALESCE(airline, airline_code) as airline,
        airline_code as "airlineCode",
        flight_number as "flightNumber",
        departure_airport as "departureAirport",
        arrival_airport as "arrivalAirport",
        departure_at as "departureAt",
        arrival_at as "arrivalAt",
        duration_minutes as duration,
        stops,
        cabin_class as "cabinClass",
        available_cabin_classes as "availableCabinClasses",
        base_fare::float8 as "baseFare",
        currency,
        seats_available as "seatsAvailable",
        created_at as "createdAt",
        raw_segments as "rawSegments"
      FROM flights
      WHERE departure_airport = $1
        AND arrival_airport = $2
        AND DATE(departure_at) = DATE($3)
        AND seats_available > 0
        AND ($4::text IS NULL OR cabin_class = $4)
        AND ($5::text IS NULL OR currency = $5)
        AND ($6::text IS NULL OR airline_code = $6 OR airline = $6)
        AND ($7::int IS NULL OR stops = $7)
        AND ($8::numeric IS NULL OR base_fare >= $8)
        AND ($9::numeric IS NULL OR base_fare <= $9)
      ORDER BY departure_at ASC
      LIMIT $10 OFFSET $11
    `;

    return this.db.query<FlightEntity>(query, [
      dto.origin,
      dto.destination,
      dto.departureDate,
      dto.cabinClass ?? null,
      dto.currency ?? null,
      dto.airline ?? null,
      dto.stops ?? null,
      dto.minPrice ?? null,
      dto.maxPrice ?? null,
      dto.limit,
      offset,
    ]);
  }

  async findById(id: string): Promise<FlightEntity | null> {
    const query = `
      SELECT
        id,
        COALESCE(airline, airline_code) as airline,
        airline_code as "airlineCode",
        flight_number as "flightNumber",
        departure_airport as "departureAirport",
        arrival_airport as "arrivalAirport",
        departure_at as "departureAt",
        arrival_at as "arrivalAt",
        duration_minutes as duration,
        stops,
        cabin_class as "cabinClass",
        available_cabin_classes as "availableCabinClasses",
        base_fare::float8 as "baseFare",
        tax::float8 as "tax",
        total_fare::float8 as "totalFare",
        currency,
        seats_available as "seatsAvailable",
        created_at as "createdAt",
        raw_segments as "rawSegments"
      FROM flights
      WHERE id = $1
      LIMIT 1`;

    const rows = await this.db.query<FlightEntity>(query, [id]);
    return rows[0] ?? null;
  }

  async upsert(flight: Partial<FlightEntity>): Promise<void> {
    const query = `
      INSERT INTO flights (
        id, airline, airline_code, flight_number,
        departure_airport, arrival_airport,
        departure_at, arrival_at,
        duration_minutes, stops, cabin_class, available_cabin_classes,
        base_fare, tax, total_fare, currency, 
        seats_available, raw_segments
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        airline = EXCLUDED.airline,
        airline_code = EXCLUDED.airline_code,
        flight_number = EXCLUDED.flight_number,
        departure_airport = EXCLUDED.departure_airport,
        arrival_airport = EXCLUDED.arrival_airport,
        departure_at = EXCLUDED.departure_at,
        arrival_at = EXCLUDED.arrival_at,
        duration_minutes = EXCLUDED.duration_minutes,
        stops = EXCLUDED.stops,
        cabin_class = EXCLUDED.cabin_class,
        available_cabin_classes = EXCLUDED.available_cabin_classes,
        base_fare = EXCLUDED.base_fare,
        tax = EXCLUDED.tax,
        total_fare = EXCLUDED.total_fare,
        currency = EXCLUDED.currency,
        seats_available = EXCLUDED.seats_available,
        raw_segments = EXCLUDED.raw_segments
    `;

    try {
      await this.db.query(query, [
        flight.id,
        flight.airline,
        flight.airlineCode,
        flight.flightNumber,
        flight.departureAirport,
        flight.arrivalAirport,
        flight.departureAt,
        flight.arrivalAt,
        flight.duration || 0,
        flight.stops || 0,
        flight.cabinClass,
        JSON.stringify(flight.availableCabinClasses || [flight.cabinClass || "ECONOMY"]),
        flight.baseFare,
        flight.tax || 0,
        flight.totalFare || flight.baseFare,
        flight.currency,
        flight.seatsAvailable || 9,
        JSON.stringify(flight.rawSegments || []),
      ]);
    } catch (err: any) {
      console.error(`[FlightRepository] Upsert error for flight ${flight.id}:`, err.message || err);
      throw err;
    }
  }
}
