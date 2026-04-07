import { Global, Module } from '@nestjs/common';
import { AppEventBus } from './app-event-bus.service';

@Global()
@Module({
  providers: [AppEventBus],
  exports: [AppEventBus],
})
export class EventsModule {}
