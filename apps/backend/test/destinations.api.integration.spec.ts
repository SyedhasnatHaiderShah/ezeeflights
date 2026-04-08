import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DestinationController } from '../src/modules/destinations/destination.controller';
import { AiRecommendationService } from '../src/modules/destinations/ai.recommendation.service';
import { AttractionService } from '../src/modules/destinations/attraction.service';
import { DestinationService } from '../src/modules/destinations/destination.service';
import { MapService } from '../src/modules/destinations/map.service';
import { WishlistService } from '../src/modules/destinations/wishlist.service';

describe('Destinations API integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      controllers: [DestinationController],
      providers: [
        { provide: DestinationService, useValue: { getDestinations: jest.fn().mockResolvedValue([]), getCountryDestinations: jest.fn(), getCityLanding: jest.fn(), getCityEvents: jest.fn() } },
        { provide: AttractionService, useValue: { list: jest.fn().mockResolvedValue({ data: [], total: 0 }), getById: jest.fn(), getTours: jest.fn().mockResolvedValue([]), listReviews: jest.fn().mockResolvedValue([]), addReview: jest.fn() } },
        { provide: WishlistService, useValue: { add: jest.fn(), remove: jest.fn(), list: jest.fn().mockResolvedValue([]) } },
        { provide: AiRecommendationService, useValue: { rankForUser: jest.fn().mockResolvedValue([]), topFive: jest.fn().mockResolvedValue({ top_5: [] }) } },
        { provide: MapService, useValue: { getClusters: jest.fn().mockResolvedValue([]) } },
      ],
    }).compile();

    app = mod.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('supports attractions listing endpoint', async () => {
    await request(app.getHttpServer()).get('/v1/attractions?city=dubai').expect(200);
  });
});
