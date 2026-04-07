import { calculateBookingTotal } from '../src/modules/booking/utils/price-calculator';

describe('Booking price calculation', () => {
  it('calculates service fee on itinerary total', () => {
    expect(calculateBookingTotal([100, 200], 2)).toBe(618);
  });
});
