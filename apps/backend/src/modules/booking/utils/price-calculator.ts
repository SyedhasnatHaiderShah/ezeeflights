export function calculateBookingTotal(baseFares: number[], passengerCount: number): number {
  const subtotal = baseFares.reduce((acc, fare) => acc + fare, 0) * passengerCount;
  const serviceFee = subtotal * 0.03;
  return Number((subtotal + serviceFee).toFixed(2));
}
