import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BookingService } from '../src/modules/booking/services/booking.service';
import { NotificationService } from '../src/modules/notification/services/notification.service';
import { UserService } from '../src/modules/user/services/user.service';
import { GdsProviderService } from '../src/modules/ticketing/providers/gds-provider.service';
import { PnrRepository } from '../src/modules/ticketing/repositories/pnr.repository';
import { TicketRepository } from '../src/modules/ticketing/repositories/ticket.repository';
import { TicketService } from '../src/modules/ticketing/services/ticket.service';

describe('Ticketing dependency tests', () => {
  it('booking status dependency: requires confirmed status', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: BookingService,
          useValue: { getById: jest.fn().mockResolvedValue({ status: 'PENDING', paymentStatus: 'PAID', passengers: [], flights: [] }) },
        },
        { provide: PnrRepository, useValue: { updateStatus: jest.fn() } },
        { provide: TicketRepository, useValue: { hasTicketsForPnr: jest.fn().mockResolvedValue(false) } },
        { provide: GdsProviderService, useValue: { getDriver: jest.fn() } },
        { provide: NotificationService, useValue: { send: jest.fn() } },
        { provide: UserService, useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    await expect(
      moduleRef.get(TicketService).issueTickets('u1', 'b1', {
        id: 'pnr1',
        bookingId: 'b1',
        pnrCode: 'PNR123',
        provider: 'INTERNAL',
        status: 'CREATED',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
