'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthSession } from '@/lib/hooks/use-auth-session';
import { PointsDashboard } from '@/components/loyalty/PointsDashboard';
import { TransactionTable } from '@/components/loyalty/TransactionTable';

export default function LoyaltyPage() {
  const session = useAuthSession();
  const [points, setPoints] = useState(100);
  const account = useQuery({ queryKey: ['loyalty-me'], queryFn: () => apiFetch<any>('/loyalty/me'), enabled: !!session.data });
  const txs = useQuery({ queryKey: ['loyalty-tx'], queryFn: () => apiFetch<any[]>('/loyalty/transactions'), enabled: !!session.data });

  if (!session.data) return <p className="rounded border bg-amber-50 p-4">Sign in required.</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Loyalty & Rewards</h1>
      <PointsDashboard balance={account.data?.pointsBalance ?? 0} tier={account.data?.tier ?? 'BRONZE'} />
      <div className="rounded border bg-white p-4">
        <input className="rounded border p-2" type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
        <button className="ml-2 rounded bg-black px-3 py-2 text-white" onClick={async () => {
          await apiFetch('/loyalty/redeem', { method: 'POST', body: JSON.stringify({ points }) });
          await Promise.all([account.refetch(), txs.refetch()]);
        }}>Redeem</button>
      </div>
      <TransactionTable txs={txs.data ?? []} />
    </section>
  );
}
