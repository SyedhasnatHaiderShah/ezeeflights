'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';

export default function RedeemPage() {
  const [points, setPoints] = useState(1000);
  const [message, setMessage] = useState('');
  const value = (points / 100).toFixed(2);

  return (
    <section className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Redeem Points</h1>
      <div className="rounded border bg-white p-4">
        <label className="mb-2 block text-sm">Points to redeem</label>
        <input className="w-full rounded border p-2" type="number" min={1} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
        <p className="mt-2 text-sm text-slate-600">Estimated discount: <strong>${value}</strong></p>
        <button
          className="mt-3 rounded bg-slate-900 px-3 py-2 text-white"
          onClick={async () => {
            const result = await apiFetch<any>('/loyalty/redeem', { method: 'POST', body: JSON.stringify({ points }) });
            setMessage(`Applied. Discount: $${Number(result.discountAmount ?? 0).toFixed(2)}`);
          }}
        >
          Apply to booking
        </button>
        {!!message && <p className="mt-2 text-sm text-emerald-600">{message}</p>}
      </div>
    </section>
  );
}
