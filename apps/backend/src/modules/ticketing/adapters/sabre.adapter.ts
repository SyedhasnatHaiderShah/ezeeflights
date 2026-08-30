import { Injectable } from '@nestjs/common';
import { InternalMockAdapter } from './internal-mock.adapter';

@Injectable()
export class SabreAdapter extends InternalMockAdapter {
  override provider = 'SABRE' as const;
}
