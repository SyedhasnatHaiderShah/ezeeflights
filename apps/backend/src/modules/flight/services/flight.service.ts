import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { TravelportProvider } from '../../../common/providers';
import { SearchFlightsDto } from '../dto/search-flights.dto';
import { FlightRepository } from '../repositories/flight.repository';
import { FlightEntity } from '../entities/flight.entity';

@Injectable()
export class FlightService {
  constructor(
    private readonly repository: FlightRepository,
    private readonly travelportProvider: TravelportProvider,
  ) {}

  async searchFlights(dto: SearchFlightsDto): Promise<FlightEntity[]> {
    try {
      const localResults = await this.repository.search(dto);
      if (localResults.length > 0) {
        return localResults;
      }

      const providerResults = await this.travelportProvider.searchFlights({
        origin: dto.origin,
        destination: dto.destination,
        date: dto.departureDate,
        returnDate: dto.returnDate,
        adults: dto.adults,
        children: dto.children,
        infants: dto.infants,
        currency: dto.currency,
      });

      return providerResults.map((offer) => ({
        id: String(offer.id),
        airline: String(offer.airline || 'TRAVELPORT'),
        airlineCode: String(offer.airlineCode || 'TRV'),
        flightNumber: String(offer.flightNumber || 'N/A'),
        departureAirport: String(offer.departureAirport || dto.origin),
        arrivalAirport: String(offer.arrivalAirport || dto.destination),
        departureAt: new Date(offer.departureAt || dto.departureDate),
        arrivalAt: new Date(offer.arrivalAt || dto.departureDate),
        duration: Number(offer.duration || 0),
        stops: Number(offer.stops || 0),
        cabinClass: (dto.cabinClass as any) || 'ECONOMY',
        baseFare: Number(offer.basePriceNumeric || offer.price || 0),
        tax: Number(offer.taxesNumeric || 0),
        totalFare: Number(offer.price || 0),
        currency: String(offer.currency || dto.currency || 'USD'),
        seatsAvailable: 1,
        createdAt: new Date(),
        rawSegments: offer.segments,
      })) as FlightEntity[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableException(`Flight provider failed: ${errorMessage}`);
    }
  }

  async getFlightById(id: string): Promise<FlightEntity> {
    // Check if ID is a valid UUID to avoid Postgres casting errors
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    
    if (isUuid) {
      const flight = await this.repository.findById(id);
      if (flight) return flight;
    }

    // If not in DB, it's a transient Travelport flight
    // We return a minimal entity. In a production app, you might want to 
    // fetch this from a cache or re-verify with the provider.
    return {
      id,
      airline: 'TRAVELPORT',
      airlineCode: 'TRV',
      flightNumber: 'Live Result',
      departureAirport: 'Pending',
      arrivalAirport: 'Pending',
      departureAt: new Date(),
      arrivalAt: new Date(),
      duration: 0,
      stops: 0,
      cabinClass: 'ECONOMY',
      baseFare: 0,
      currency: 'USD',
      seatsAvailable: 1,
      createdAt: new Date(),
    } as FlightEntity;
  }

  async upsert(flight: Partial<FlightEntity>): Promise<void> {
    return this.repository.upsert(flight);
  }
}
