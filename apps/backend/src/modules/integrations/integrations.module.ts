import { Module } from '@nestjs/common';
import { BookingProviderService } from './booking-provider.service';

@Module({
  providers: [BookingProviderService],
  exports: [BookingProviderService],
})
export class IntegrationsModule {}
