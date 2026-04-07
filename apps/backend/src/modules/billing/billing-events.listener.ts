import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppEventBus } from '../../common/events/app-event-bus.service';
import { InvoiceService } from './invoice.service';

@Injectable()
export class BillingEventsListener implements OnModuleInit {
  constructor(
    private readonly events: AppEventBus,
    private readonly invoiceService: InvoiceService,
  ) {}

  onModuleInit(): void {
    this.events.on<{ bookingId: string }>('booking.confirmed', async (event) => {
      await this.invoiceService.generateFromBooking(event.bookingId);
    });
  }
}
