'use client';

export function PointsDashboard({ balance, tier }: { balance: number; tier: string }) {
  return (
    <div className="rounded border bg-white p-4">
      <h2 className="font-semibold">Loyalty Balance</h2>
      <p className="text-2xl font-bold">{balance} pts</p>
      <p className="text-sm text-slate-600">Tier: {tier}</p>
    </div>
  );
}
