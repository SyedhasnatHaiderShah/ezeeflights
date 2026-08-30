import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppEventBus } from '../../common/events/app-event-bus.service';
import { appLogger } from '../../common/logging/winston';
import { InvoiceService } from './invoice.service';

@Injectable()
export class BillingEventsListener implements OnModuleInit {
  constructor(
    private readonly events: AppEventBus,
    private readonly invoiceService: InvoiceService,
  ) {}

  onModuleInit(): void {
    this.events.on<{ bookingId: string; bookingType?: string }>('booking.confirmed', async (event) => {
      if (event.bookingType && event.bookingType !== 'flight') {
        return;
      }

      try {
        await this.invoiceService.generateFromBooking(event.bookingId);
      } catch (err) {
        appLogger.warn(
          `[BillingEventsListener] Skipped invoice for booking ${event.bookingId}: ${(err as Error).message}`,
        );
      }
    });
  }
}
