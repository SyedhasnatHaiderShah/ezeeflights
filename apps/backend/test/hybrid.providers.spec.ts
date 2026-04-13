import { FlightProviderService } from '../src/modules/hybrid-engine/flight.provider';
import { HotelProviderService } from '../src/modules/hybrid-engine/hotel.provider';

describe('Hybrid provider wiring', () => {
  const originalEnv = {
    AMADEUS_CLIENT_ID: process.env.AMADEUS_CLIENT_ID,
    AMADEUS_CLIENT_SECRET: process.env.AMADEUS_CLIENT_SECRET,
    BOOKING_COM_API_KEY: process.env.BOOKING_COM_API_KEY,
    BOOKING_COM_BASE_URL: process.env.BOOKING_COM_BASE_URL,
  };

  afterEach(() => {
    jest.restoreAllMocks();
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
  });

  it('uses the Amadeus provider when env vars are present', async () => {
    process.env.AMADEUS_CLIENT_ID = 'client';
    process.env.AMADEUS_CLIENT_SECRET = 'secret';

    const cache = { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) };
    const amadeus = {
      searchFlights: jest.fn().mockResolvedValue([
        {
          id: 'offer-1',
          airline: 'XY',
          departure: '2026-05-01T08:00:00Z',
          arrival: '2026-05-01T10:00:00Z',
          duration: 120,
          price: { amount: '123', currency: 'USD' },
        },
      ]),
    };

    const service = new FlightProviderService(cache as any, amadeus as any);
    const rows = await service.getFlights({
      origin: 'DXB',
      destination: 'LHR',
      date: '2026-05-01',
      travelers: 1,
      currency: 'USD',
    });

    expect(amadeus.searchFlights).toHaveBeenCalled();
    expect(rows[0].provider).toBe('amadeus');
    expect(rows[0].price).toBe(123);
  });

  it('uses booking env vars when fetching hotel rows', async () => {
    process.env.BOOKING_COM_API_KEY = 'booking-key';
    process.env.BOOKING_COM_BASE_URL = 'https://booking.example.com';

    const cache = { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) };
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 'h1', hotel_name: 'Hotel One', rating: 4.3, amenities: ['wifi'], price_per_night: 220, currency: 'USD' }],
    } as any) as any;

    const service = new HotelProviderService(cache as any);
    const rows = await service.getHotels({
      destination: 'Dubai',
      checkIn: '2026-05-01',
      checkOut: '2026-05-03',
      travelers: 2,
      currency: 'USD',
    });

    expect(global.fetch).toHaveBeenCalled();
    expect(rows[0].hotelName).toBe('Hotel One');
    expect(rows[0].pricePerNight).toBe(220);
    global.fetch = originalFetch;
  });
});
