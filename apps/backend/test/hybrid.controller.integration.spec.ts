import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { HybridController } from '../src/modules/hybrid-engine/hybrid.controller';
import { HybridService } from '../src/modules/hybrid-engine/hybrid.service';

describe('HybridController integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HybridController],
      providers: [
        {
          provide: HybridService,
          useValue: {
            generateLivePackage: jest.fn().mockResolvedValue({ ok: true }),
            recalculatePrice: jest.fn().mockReturnValue({ totalPrice: 999, currency: 'USD' }),
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('handles full generation request', async () => {
    await request(app.getHttpServer())
      .post('/v1/hybrid/generate-live-package')
      .send({
        destination: 'Dubai',
        travelDates: { startDate: '2026-07-01', endDate: '2026-07-06' },
        travelers: 2,
        budget: 3000,
        preferences: ['beach'],
      })
      .expect(201);
  });

  it('supports pricing refresh endpoint', async () => {
    await request(app.getHttpServer())
      .get('/v1/pricing/recalculate?flightPrice=100&hotelPrice=200&activitiesCost=50')
      .expect(200);
  });
});
