import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BookingService } from '../src/modules/booking/services/booking.service';
import { NotificationService } from '../src/modules/notification/services/notification.service';
import { UserService } from '../src/modules/user/services/user.service';
import { GdsProviderService } from '../src/modules/ticketing/providers/gds-provider.service';
import { PnrRepository } from '../src/modules/ticketing/repositories/pnr.repository';
import { TicketRepository } from '../src/modules/ticketing/repositories/ticket.repository';
import { TicketService } from '../src/modules/ticketing/services/ticket.service';

describe('TicketService', () => {
  it('issues tickets for each passenger and flight', async () => {
    const createTicket = jest.fn().mockResolvedValue({ id: 't1', ticketNumber: '1760000000001' });

    const moduleRef = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: BookingService,
          useValue: {
            getById: jest.fn().mockResolvedValue({
              id: 'b1',
              status: 'CONFIRMED',
              paymentStatus: 'PAID',
              passengers: [{ id: 'p1', fullName: 'Alice Example' }],
              flights: [{ flightId: 'f1' }],
            }),
          },
        },
        { provide: PnrRepository, useValue: { updateStatus: jest.fn() } },
        {
          provide: TicketRepository,
          useValue: {
            hasTicketsForPnr: jest.fn().mockResolvedValue(false),
            createTicket,
            addDocument: jest.fn().mockResolvedValue({ id: 'd1' }),
            findTicketsByPnrCode: jest.fn(),
          },
        },
        {
          provide: GdsProviderService,
          useValue: {
            getDriver: () => ({ issueTicket: jest.fn(async ({ preferredTicketNumber }: { preferredTicketNumber: string }) => ({ ticketNumber: preferredTicketNumber })) }),
          },
        },
        { provide: NotificationService, useValue: { send: jest.fn() } },
        { provide: UserService, useValue: { findOne: jest.fn().mockResolvedValue({ email: 'a@b.com' }) } },
      ],
    }).compile();

    const service = moduleRef.get(TicketService);
    const result = await service.issueTickets('u1', 'b1', {
      id: 'pnr1',
      bookingId: 'b1',
      pnrCode: 'ABC123',
      provider: 'INTERNAL',
      status: 'CREATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    expect(result.tickets).toHaveLength(1);
    expect(createTicket).toHaveBeenCalledTimes(1);
  });

  it('blocks ticket issuance when booking is not paid', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: BookingService,
          useValue: {
            getById: jest.fn().mockResolvedValue({ status: 'CONFIRMED', paymentStatus: 'PENDING', passengers: [], flights: [] }),
          },
        },
        { provide: PnrRepository, useValue: { updateStatus: jest.fn() } },
        { provide: TicketRepository, useValue: { hasTicketsForPnr: jest.fn().mockResolvedValue(false) } },
        { provide: GdsProviderService, useValue: { getDriver: jest.fn() } },
        { provide: NotificationService, useValue: { send: jest.fn() } },
        { provide: UserService, useValue: { findOne: jest.fn() } },
      ],
    }).compile();

    const service = moduleRef.get(TicketService);
    await expect(
      service.issueTickets('u1', 'b1', {
        id: 'pnr1',
        bookingId: 'b1',
        pnrCode: 'ABC123',
        provider: 'INTERNAL',
        status: 'CREATED',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
