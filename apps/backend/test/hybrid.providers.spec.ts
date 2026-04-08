import { FlightProviderService } from '../src/modules/hybrid-engine/flight.provider';
import { HotelProviderService } from '../src/modules/hybrid-engine/hotel.provider';

describe('Hybrid provider normalization', () => {
  it('normalizes flight rows', () => {
    const service = new FlightProviderService({} as any);
    const rows = service.normalize('amadeus', [{ id: '1', airline: 'XY', departure: 'a', arrival: 'b', duration: 99, price: 123, currency: 'USD' }]);
    expect(rows[0].airline).toBe('XY');
    expect(rows[0].price).toBe(123);
  });

  it('normalizes hotel rows', () => {
    const service = new HotelProviderService({} as any);
    const rows = service.normalize('booking', [{ id: 'h1', hotel_name: 'Hotel One', rating: 4.3, amenities: ['wifi'], price_per_night: 220, currency: 'USD' }]);
    expect(rows[0].hotelName).toBe('Hotel One');
    expect(rows[0].pricePerNight).toBe(220);
  });
});
