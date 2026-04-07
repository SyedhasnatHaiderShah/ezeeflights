import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { SearchFlightsDto } from '../dto/search-flights.dto';
import { FlightRepository } from '../repositories/flight.repository';
import { FlightEntity } from '../entities/flight.entity';

@Injectable()
export class FlightService {
  constructor(private readonly repository: FlightRepository) {}

  async searchFlights(dto: SearchFlightsDto): Promise<FlightEntity[]> {
    try {
      return await this.repository.search(dto);
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
