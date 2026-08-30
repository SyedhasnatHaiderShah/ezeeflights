import { Injectable } from '@nestjs/common';
import { InternalMockAdapter } from './internal-mock.adapter';

@Injectable()
export class AmadeusAdapter extends InternalMockAdapter {
  override provider = 'AMADEUS' as const;
}
