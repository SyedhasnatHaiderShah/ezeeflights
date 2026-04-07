import { Injectable } from '@nestjs/common';
import { BookingDetailsEntity } from '../../booking/entities/booking.entity';
import { GdsCreatePnrResult, GdsIssueTicketResult, GdsProviderDriver } from '../providers/gds-provider.service';

@Injectable()
export class InternalMockAdapter implements GdsProviderDriver {
  provider = 'INTERNAL' as const;

  async createPNR(_booking: BookingDetailsEntity, preferredPnrCode: string): Promise<GdsCreatePnrResult> {
    return { pnrCode: preferredPnrCode };
  }

  async issueTicket(params: {
    pnrCode: string;
    booking: BookingDetailsEntity;
    passengerId: string;
    flightId: string;
    preferredTicketNumber: string;
  }): Promise<GdsIssueTicketResult> {
    return { ticketNumber: params.preferredTicketNumber };
  }

  async cancelTicket(_ticketNumber: string): Promise<void> {
    return;
  }
}
