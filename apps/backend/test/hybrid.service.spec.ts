import { HybridService } from '../src/modules/hybrid-engine/hybrid.service';

describe('HybridService merge logic', () => {
  const build = () =>
    new HybridService(
      {
        getFlights: jest.fn().mockResolvedValue([{ id: 'f1', provider: 'mock', airline: 'XY', departure: '', arrival: '', durationMinutes: 100, price: 300, currency: 'USD' }]),
      } as any,
      {
        getHotels: jest.fn().mockResolvedValue([{ id: 'h1', provider: 'mock', hotelName: 'Stay', rating: 4.2, amenities: [], pricePerNight: 150, currency: 'USD' }]),
      } as any,
      { recalculate: jest.fn().mockReturnValue({ totalPrice: 900, currency: 'USD' }) } as any,
      { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue(undefined) } as any,
      { query: jest.fn().mockResolvedValue(undefined) } as any,
    );

  it('builds tiered options and selects defaults', async () => {
    const service = build();
    const result = await service.generateLivePackage({
      destination: 'Paris',
      travelDates: { startDate: '2026-07-01', endDate: '2026-07-05' },
      travelers: 2,
      budget: 2500,
      preferences: ['culture'],
      currency: 'USD',
      origin: 'JFK',
    });

    expect(result.options.standard.flight.id).toBe('f1');
    expect(result.selectedDefaults.hotelId).toBe('h1');
  });
});
