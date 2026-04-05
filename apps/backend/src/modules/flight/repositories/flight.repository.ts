import { Injectable } from '@nestjs/common';
import { PostgresClient } from '../../../database/postgres.client';
import { FlightEntity } from '../entities/flight.entity';
import { SearchFlightsDto } from '../dto/search-flights.dto';

@Injectable()
export class FlightRepository {
  constructor(private readonly db: PostgresClient) {}

  async search(dto: SearchFlightsDto): Promise<FlightEntity[]> {
    const offset = (dto.page - 1) * dto.limit;
    const query = `
      SELECT
        id,
        airline_code as "airlineCode",
        flight_number as "flightNumber",
        departure_airport as "departureAirport",
        arrival_airport as "arrivalAirport",
        departure_at as "departureAt",
        arrival_at as "arrivalAt",
        cabin_class as "cabinClass",
        base_fare as "baseFare",
        currency,
        seats_available as "seatsAvailable",
        created_at as "createdAt"
      FROM flights
      WHERE departure_airport = $1
        AND arrival_airport = $2
        AND DATE(departure_at) = DATE($3)
        AND seats_available > 0
        AND ($4::text IS NULL OR cabin_class = $4)
        AND ($5::text IS NULL OR currency = $5)
      ORDER BY departure_at ASC
      LIMIT $6 OFFSET $7
    `;

    return this.db.query<FlightEntity>(query, [
      dto.origin,
      dto.destination,
      dto.departureDate,
      dto.cabinClass ?? null,
      dto.currency ?? null,
      dto.limit,
      offset,
    ]);
  }

  async findById(id: string): Promise<FlightEntity | null> {
    const rows = await this.db.query<FlightEntity>(
      `SELECT
         id,
         airline_code as "airlineCode",
         flight_number as "flightNumber",
         departure_airport as "departureAirport",
         arrival_airport as "arrivalAirport",
         departure_at as "departureAt",
         arrival_at as "arrivalAt",
         cabin_class as "cabinClass",
         base_fare as "baseFare",
         currency,
         seats_available as "seatsAvailable",
         created_at as "createdAt"
       FROM flights
       WHERE id = $1
       LIMIT 1`,
      [id],
    );

    return rows[0] ?? null;
  }
}
