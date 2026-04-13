import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { AmadeusProvider } from '../../../common/providers';
import { SearchFlightsDto } from '../dto/search-flights.dto';
import { FlightRepository } from '../repositories/flight.repository';
import { FlightEntity } from '../entities/flight.entity';

@Injectable()
export class FlightService {
  constructor(
    private readonly repository: FlightRepository,
    private readonly amadeusProvider: AmadeusProvider,
  ) {}

  async searchFlights(dto: SearchFlightsDto): Promise<FlightEntity[]> {
    try {
      const localResults = await this.repository.search(dto);
      if (localResults.length > 0) {
        return localResults;
      }

      const providerResults = await this.amadeusProvider.searchFlights({
        origin: dto.origin,
        destination: dto.destination,
        date: dto.departureDate,
        travelers: 1,
        currency: dto.currency,
      });

      return providerResults.map((offer, index) => ({
        id: String(offer.id ?? `amadeus-${index}`),
        airline: String(((offer as any).validatingAirlineCodes?.[0] ?? (offer as any).airline ?? 'AMADEUS')),
        airlineCode: String(((offer as any).validatingAirlineCodes?.[0] ?? (offer as any).airline ?? 'AMA')),
        flightNumber: String((offer as any).itineraries?.[0]?.segments?.[0]?.number ?? 'N/A'),
        departureAirport: String((offer as any).itineraries?.[0]?.segments?.[0]?.departure?.iataCode ?? dto.origin),
        arrivalAirport: String((offer as any).itineraries?.[0]?.segments?.slice(-1)?.[0]?.arrival?.iataCode ?? dto.destination),
        departureAt: new Date(String((offer as any).itineraries?.[0]?.segments?.[0]?.departure?.at ?? dto.departureDate)),
        arrivalAt: new Date(String((offer as any).itineraries?.[0]?.segments?.slice(-1)?.[0]?.arrival?.at ?? dto.departureDate)),
        duration: Number(String((offer as any).itineraries?.[0]?.duration ?? 0).replace(/[^\d]/g, '') || 0),
        stops: Math.max((((offer as any).itineraries?.[0]?.segments?.length ?? 1) as number) - 1, 0),
        cabinClass: dto.cabinClass ?? 'ECONOMY',
        baseFare: Number((offer as any).price?.total ?? 0),
        currency: String((offer as any).price?.currency ?? dto.currency ?? 'USD'),
        seatsAvailable: Number((offer as any).numberOfBookableSeats ?? 1),
        createdAt: new Date(),
      })) as FlightEntity[];
    } catch {
      throw new ServiceUnavailableException('Flight provider failed to return search results');
    }
  }

  async getFlightById(id: string): Promise<FlightEntity> {
    const flight = await this.repository.findById(id);

    if (!flight) {
      throw new NotFoundException(`Flight with id ${id} not found`);
    }

    return flight;
  }
}
