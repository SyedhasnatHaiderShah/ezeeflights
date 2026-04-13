import { Test } from '@nestjs/testing';
import { BookingProviderService } from '../src/modules/integrations/booking-provider.service';
import { HotelRepository } from '../src/modules/hotel/repositories/hotel.repository';
import { HotelService } from '../src/modules/hotel/services/hotel.service';

describe('HotelService', () => {
  it('searches local repository first', async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HotelService,
        {
          provide: HotelRepository,
          useValue: {
            search: jest.fn().mockResolvedValue({ data: [{ id: 'h1' }], total: 1, page: 1, limit: 20 }),
            getById: jest.fn(),
            getRooms: jest.fn(),
          },
        },
        {
          provide: BookingProviderService,
          useValue: { searchHotels: jest.fn(), getHotelDetails: jest.fn(), getRooms: jest.fn() },
        },
      ],
    }).compile();

    const service = moduleRef.get(HotelService);
    const response = await service.search({ city: 'Dubai', checkInDate: '2026-07-01', checkOutDate: '2026-07-02', page: 1, limit: 20 });
    expect(response.total).toBe(1);
  });

  it('falls back to provider if local list is empty', async () => {
    const providerSearch = jest.fn().mockResolvedValue([{ id: 'remote-hotel' }]);
    const moduleRef = await Test.createTestingModule({
      providers: [
        HotelService,
        { provide: HotelRepository, useValue: { search: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 }) } },
        { provide: BookingProviderService, useValue: { searchHotels: providerSearch, getHotelDetails: jest.fn(), getRooms: jest.fn() } },
      ],
    }).compile();

    const service = moduleRef.get(HotelService);
    const response = await service.search({ city: 'Paris', checkInDate: '2026-07-01', checkOutDate: '2026-07-02', page: 1, limit: 20 });
    expect(providerSearch).toHaveBeenCalled();
    expect((response as any).source).toBe('provider-fallback');
  });
});
