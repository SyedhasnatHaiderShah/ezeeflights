import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PackageController } from '../src/modules/packages/package.controller';
import { PackageBookingService } from '../src/modules/packages/booking.service';
import { ItineraryService } from '../src/modules/packages/itinerary.service';
import { PackageService } from '../src/modules/packages/package.service';

describe('Packages integration', () => {
  let app: INestApplication;

  const packageService = {
    list: jest.fn().mockResolvedValue({ data: [{ id: 'p1', slug: 'bali' }], total: 1 }),
    getBySlug: jest.fn().mockResolvedValue({ id: 'p1', slug: 'bali' }),
  } as any;

  const bookingService = {
    book: jest.fn().mockResolvedValue({ booking: { id: 'pb1' }, payment: { status: 'PENDING' } }),
  } as any;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [PackageController],
      providers: [
        { provide: PackageService, useValue: packageService },
        { provide: ItineraryService, useValue: {} },
        { provide: PackageBookingService, useValue: bookingService },
      ],
    }).compile();

    app = mod.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('supports browsing packages', async () => {
    await request(app.getHttpServer()).get('/v1/packages').expect(200);
  });

  it('returns package details by slug', async () => {
    await request(app.getHttpServer()).get('/v1/packages/bali').expect(200);
  });


});
