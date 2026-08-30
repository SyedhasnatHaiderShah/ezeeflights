import { Test } from '@nestjs/testing';
import { FlightService } from '../src/modules/flight/services/flight.service';
import { FlightRepository } from '../src/modules/flight/repositories/flight.repository';
import { TravelportProvider, ExternalFlightProvider } from '../src/common/providers';
import { CurrencyService } from '../src/modules/public/currency.service';
import { HybridCacheService } from '../src/modules/hybrid-engine/cache.service';
import { UsaMarkupService } from '../src/modules/usa-markup/usa-markup.service';
import { CheapBidService } from '../src/modules/cheap-bid/cheap-bid.service';

describe('FlightService', () => {
  it('searches flights with repository', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        FlightService,
        {
          provide: FlightRepository,
          useValue: {
            search: jest.fn().mockResolvedValue([{ id: 'f1' }]),
            findById: jest.fn(),
          },
        },
        {
          provide: TravelportProvider,
          useValue: {
            searchFlights: jest.fn().mockResolvedValue([{ id: 'f1', segments: [], basePriceNumeric: 100, taxesNumeric: 10, price: 110, currency: 'USD' }]),
          },
        },
        {
          provide: ExternalFlightProvider,
          useValue: {},
        },
        {
          provide: CurrencyService,
          useValue: {
            getRates: jest.fn().mockResolvedValue({ USD: 1, EUR: 0.85 }),
          },
        },
        {
          provide: HybridCacheService,
          useValue: {
            get: jest.fn().mockResolvedValue(null),
            set: jest.fn().mockResolvedValue(null),
          },
        },
        {
          provide: UsaMarkupService,
          useValue: {},
        },
        {
          provide: CheapBidService,
          useValue: {
            applyCheapBidsToFlights: jest.fn().mockImplementation((flights) => flights),
          },
        },
      ],
    }).compile();

    const service = moduleRef.get(FlightService);
    const result = await service.searchFlights({
      origin: 'DXB',
      destination: 'LHR',
      departureDate: '2026-10-01',
      adults: 1,
      children: 0,
      infants: 0,
      page: 1,
      limit: 20,
    });

    expect(result.data).toHaveLength(1);
  });
});
