import { Injectable } from '@nestjs/common';
import { InternalMockAdapter } from './internal-mock.adapter';

@Injectable()
export class TravelportAdapter extends InternalMockAdapter {
  override provider = 'TRAVELPORT' as const;
}
