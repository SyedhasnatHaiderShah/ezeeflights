import { Injectable, NotFoundException } from '@nestjs/common';
import { SearchFlightsDto } from '../dto/search-flights.dto';
import { FlightRepository } from '../repositories/flight.repository';
import { FlightEntity } from '../entities/flight.entity';
import { CircuitBreakerService } from '../../../common/circuit-breaker/circuit-breaker.service';

@Injectable()
export class FlightService {
  constructor(
    private readonly repository: FlightRepository,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  async searchFlights(dto: SearchFlightsDto): Promise<FlightEntity[]> {
    return this.circuitBreaker.execute(
      'amadeus',
      () => this.repository.search(dto),
      async () => [],
    );
  }

  async getFlightById(id: string): Promise<FlightEntity> {
    const flight = await this.repository.findById(id);

    if (!flight) {
      throw new NotFoundException(`Flight with id ${id} not found`);
    }

    return flight;
  }
}
