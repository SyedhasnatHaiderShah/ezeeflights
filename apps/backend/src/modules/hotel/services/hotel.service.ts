import { Injectable } from '@nestjs/common';

@Injectable()
export class HotelService {
  health() {
    return { module: 'hotel', status: 'ok' };
  }
}
