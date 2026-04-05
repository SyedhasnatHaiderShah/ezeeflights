import { Injectable } from '@nestjs/common';

@Injectable()
export class BookingService {
  health() {
    return { module: 'booking', status: 'ok' };
  }
}
