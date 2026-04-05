import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchFlightsDto } from '../dto/search-flights.dto';
import { FlightRepository } from '../repositories/flight.repository';
import { FlightEntity } from '../entities/flight.entity';

@Injectable()
export class FlightService {
  constructor(private readonly repository: FlightRepository) {}

  searchFlights(dto: SearchFlightsDto): Promise<FlightEntity[]> {
    return this.repository.search(dto);
  }

  async getFlightById(id: string): Promise<FlightEntity> {
    const flight = await this.repository.findById(id);

    if (!flight) {
      throw new NotFoundException(`Flight with id ${id} not found`);
    }

    return flight;
  }
}
