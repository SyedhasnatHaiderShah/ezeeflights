import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BookingService } from '../src/modules/booking/services/booking.service';
import { GdsProviderService } from '../src/modules/ticketing/providers/gds-provider.service';
import { PnrRepository } from '../src/modules/ticketing/repositories/pnr.repository';
import { PnrService } from '../src/modules/ticketing/services/pnr.service';
import { TicketService } from '../src/modules/ticketing/services/ticket.service';

describe('PnrService', () => {
  it('generates a pnr for confirmed booking', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'x', bookingId: 'b1', pnrCode: 'ABC123', provider: 'INTERNAL', status: 'CREATED' });
    const moduleRef = await Test.createTestingModule({
      providers: [
        PnrService,
        { provide: BookingService, useValue: { getById: jest.fn().mockResolvedValue({ status: 'CONFIRMED' }) } },
        { provide: PnrRepository, useValue: { findByBookingId: jest.fn().mockResolvedValue(null), create, findByCode: jest.fn() } },
        { provide: TicketService, useValue: { issueTickets: jest.fn(), getByPnrCode: jest.fn(), getByBookingId: jest.fn() } },
        {
          provide: GdsProviderService,
          useValue: {
            getDriver: () => ({ createPNR: jest.fn(async (_booking: unknown, preferredPnrCode: string) => ({ pnrCode: preferredPnrCode })) }),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(PnrService);
    const result = await service.generatePnr('u1', { bookingId: 'b1' });
    expect(result.pnrCode).toHaveLength(6);
    expect(create).toHaveBeenCalled();
  });

  it('rejects pnr generation for non-confirmed booking', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PnrService,
        { provide: BookingService, useValue: { getById: jest.fn().mockResolvedValue({ status: 'PENDING' }) } },
        { provide: PnrRepository, useValue: { findByBookingId: jest.fn(), create: jest.fn(), findByCode: jest.fn() } },
        { provide: TicketService, useValue: { issueTickets: jest.fn(), getByPnrCode: jest.fn(), getByBookingId: jest.fn() } },
        { provide: GdsProviderService, useValue: { getDriver: jest.fn() } },
      ],
    }).compile();

    await expect(moduleRef.get(PnrService).generatePnr('u1', { bookingId: 'b1' })).rejects.toBeInstanceOf(BadRequestException);
  });
});
