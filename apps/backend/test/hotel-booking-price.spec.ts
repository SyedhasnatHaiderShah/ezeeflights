import { calculateHotelBookingTotal } from '../src/modules/hotel-booking/utils/hotel-price-calculator';

describe('Hotel price calculator', () => {
  it('calculates nights * per-night subtotal', () => {
    expect(calculateHotelBookingTotal([200], 3)).toBe(600);
  });

  it('returns zero for invalid stay length', () => {
    expect(calculateHotelBookingTotal([200], 0)).toBe(0);
  });
});
