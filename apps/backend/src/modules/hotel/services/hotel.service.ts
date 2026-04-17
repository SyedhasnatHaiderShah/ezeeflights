import { Injectable } from '@nestjs/common';
import { HotelRepository } from '../repositories/hotel.repository';
import { SearchHotelsDto } from '../dto/search-hotels.dto';
import { CircuitBreakerService } from '../../../common/circuit-breaker/circuit-breaker.service';

@Injectable()
export class HotelService {
  constructor(
    private readonly repository: HotelRepository,
    private readonly circuitBreaker: CircuitBreakerService,
  ) {}

  search(dto: SearchHotelsDto) {
    return this.circuitBreaker.execute(
      'amadeus',
      () => this.repository.search(dto),
      async () => [],
    );
  }

  health() {
    return { module: 'hotel', status: 'ok' };
  }
}
