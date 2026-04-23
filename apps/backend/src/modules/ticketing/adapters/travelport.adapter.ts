import { Injectable } from '@nestjs/common';
import { TravelportProvider } from '../../../common/providers';
import { BookingDetailsEntity } from '../../booking/entities/booking.entity';
import { GdsCreatePnrResult, GdsIssueTicketResult, GdsProviderDriver } from '../providers/gds-provider.service';

@Injectable()
export class TravelportAdapter implements GdsProviderDriver {
  provider = 'TRAVELPORT' as const;

  constructor(private readonly travelportProvider: TravelportProvider) {}

  async createPNR(booking: BookingDetailsEntity): Promise<GdsCreatePnrResult> {
    // In a production environment, we would use the exact PricingSolution from the AirPrice step.
    // For now, we use a placeholder or the cached solution key.
    const result = await this.travelportProvider.createReservation(
      `<air:AirPricingSolution Key="${booking.flights?.[0]?.flightId || 'dummy-key'}"/>`,
      booking.passengers.map(p => ({
        firstName: p.fullName.split(' ')[0] || 'Guest',
        lastName: p.fullName.split(' ').slice(1).join(' ') || 'User',
        type: p.type,
      })),
    );

    const ur = result?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord'];
    const pnrCode = ur?.['@LocatorCode'] || `TRV${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return { pnrCode };
  }

  async issueTicket(params: {
    pnrCode: string;
    booking: BookingDetailsEntity;
    passengerId: string;
    flightId: string;
    preferredTicketNumber: string;
  }): Promise<GdsIssueTicketResult> {
    // Mocking the ticketing success for now as actual ticketing requires a high-level authority
    return {
      ticketNumber: params.preferredTicketNumber || `176-${Math.floor(Math.random() * 1000000000)}`,
    };
  }

  async cancelTicket(ticketNumber: string): Promise<void> {
    this.travelportProvider['logger'].info({ ticketNumber }, 'TravelportAdapter: Cancelling ticket (Mock)');
  }
}
