import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AppEventBus } from '../../../common/events/app-event-bus.service';
import { TicketService } from './ticket.service';
import { PnrRepository } from '../repositories/pnr.repository';

interface PaymentSucceededPayload {
  paymentId: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
}

@Injectable()
export class TicketingEventListener implements OnModuleInit {
  private readonly logger = new Logger(TicketingEventListener.name);

  constructor(
    private readonly events: AppEventBus,
    private readonly ticketService: TicketService,
    private readonly pnrRepository: PnrRepository,
  ) {}

  onModuleInit() {
    this.events.on<PaymentSucceededPayload>('payment.succeeded', async (payload) => {
      this.logger.log(`Payment succeeded for booking ${payload.bookingId}. Checking for PNR to issue tickets.`);
      
      try {
        const pnr = await this.pnrRepository.findByBookingId(payload.bookingId);
        if (pnr) {
          this.logger.log(`Found PNR ${pnr.pnrCode} for booking ${payload.bookingId}. Issuing tickets.`);
          await this.ticketService.issueTickets(payload.userId, payload.bookingId, pnr);
        } else {
          this.logger.debug(`No PNR found for booking ${payload.bookingId}. Skipping ticketing flow.`);
        }
      } catch (error: any) {
        this.logger.error(`Failed to issue tickets for booking ${payload.bookingId}`, error.stack);
      }
    });
  }
}
