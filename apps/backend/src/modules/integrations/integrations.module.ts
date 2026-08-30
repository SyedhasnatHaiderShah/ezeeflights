import { Module } from '@nestjs/common';
import { BookingProviderService } from './booking-provider.service';
import { TravelportProvider } from '../../common/providers';

@Module({
  providers: [BookingProviderService, TravelportProvider],
  exports: [BookingProviderService, TravelportProvider],
})
export class IntegrationsModule {}
