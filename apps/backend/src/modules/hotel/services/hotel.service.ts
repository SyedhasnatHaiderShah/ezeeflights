import { Injectable } from '@nestjs/common';
import { HotelRepository } from '../repositories/hotel.repository';
import { SearchHotelsDto } from '../dto/search-hotels.dto';

@Injectable()
export class HotelService {
  constructor(private readonly repository: HotelRepository) {}

  search(dto: SearchHotelsDto) {
    return this.repository.search(dto);
  }

  health() {
    return { module: 'hotel', status: 'ok' };
  }
}
