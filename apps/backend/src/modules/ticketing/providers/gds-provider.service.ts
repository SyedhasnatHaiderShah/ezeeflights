import { Injectable } from '@nestjs/common';
import { BookingDetailsEntity } from '../../booking/entities/booking.entity';
import { PnrProvider } from '../entities/ticketing.entity';

export interface GdsCreatePnrResult {
  pnrCode: string;
}

export interface GdsIssueTicketResult {
  ticketNumber: string;
}

export interface GdsProviderDriver {
  provider: PnrProvider;
  createPNR(booking: BookingDetailsEntity, preferredPnrCode: string): Promise<GdsCreatePnrResult>;
  issueTicket(params: {
    pnrCode: string;
    booking: BookingDetailsEntity;
    passengerId: string;
    flightId: string;
    preferredTicketNumber: string;
  }): Promise<GdsIssueTicketResult>;
  cancelTicket(ticketNumber: string): Promise<void>;
}

@Injectable()
export class GdsProviderService {
  private readonly providers = new Map<PnrProvider, GdsProviderDriver>();

  constructor(drivers: GdsProviderDriver[]) {
    for (const driver of drivers) {
      this.providers.set(driver.provider, driver);
    }
  }

  getDriver(provider: PnrProvider): GdsProviderDriver {
    return this.providers.get(provider) ?? this.providers.get('INTERNAL')!;
  }
}
