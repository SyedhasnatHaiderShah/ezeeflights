import { Test } from '@nestjs/testing';
import { FlightService } from '../src/modules/flight/services/flight.service';
import { FlightRepository } from '../src/modules/flight/repositories/flight.repository';

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
      ],
    }).compile();

    const service = moduleRef.get(FlightService);
    const result = await service.searchFlights({
      origin: 'DXB',
      destination: 'LHR',
      departureDate: '2026-10-01',
      page: 1,
      limit: 20,
    });

    expect(result).toHaveLength(1);
  });
});
