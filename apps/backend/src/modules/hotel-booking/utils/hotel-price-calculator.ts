export function calculateHotelBookingTotal(prices: number[], nights: number): number {
  if (nights <= 0) {
    return 0;
  }
  const base = prices.reduce((acc, value) => acc + value, 0);
  return Number((base * nights).toFixed(2));
}
