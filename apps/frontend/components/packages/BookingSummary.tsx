export function BookingSummary({
  counts,
  pricing,
}: {
  counts: { adult: number; child: number; infant: number };
  pricing: { adultPrice: number; childPrice: number; infantPrice: number };
}) {
  const total = counts.adult * pricing.adultPrice + counts.child * pricing.childPrice + counts.infant * pricing.infantPrice;
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">Booking Summary</h3>
      <p>Adults: {counts.adult} × {pricing.adultPrice}</p>
      <p>Children: {counts.child} × {pricing.childPrice}</p>
      <p>Infants: {counts.infant} × {pricing.infantPrice}</p>
      <p className="mt-2 font-semibold">Total: {total.toFixed(2)}</p>
    </div>
  );
}
