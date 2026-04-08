'use client';

export function LivePriceCard({ tier, total, currency }: { tier: string; total: number; currency: string }) {
  return (
    <article className="rounded-lg border bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold capitalize">{tier} package</h3>
      <p className="mt-2 text-2xl font-bold">
        {currency} {total.toFixed(2)}
      </p>
      <p className="text-sm text-slate-500">Live pricing with margin + seasonal updates</p>
    </article>
  );
}
