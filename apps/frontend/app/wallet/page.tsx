'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';

interface WalletResponse {
  wallet: { currency: string };
  balance: number;
}

interface WalletTx {
  id: string;
  transactionType: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

export default function WalletPage() {
  const [amount, setAmount] = useState('50');
  const [currency, setCurrency] = useState<'USD' | 'AED' | 'EUR' | 'GBP'>('USD');
  const queryClient = useQueryClient();

  const wallet = useQuery<WalletResponse>({ queryKey: ['wallet-me'], queryFn: () => apiFetch('/payments/wallet/me') });
  const history = useQuery<WalletTx[]>({ queryKey: ['wallet-history'], queryFn: () => apiFetch('/payments/wallet/transactions?limit=20&offset=0') });

  const topUp = useMutation({
    mutationFn: () =>
      apiFetch('/payments/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amount: Number(amount), currency, paymentMethodId: 'pm_card_visa' }),
      }),
    onSuccess: async () => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['wallet-me'] }), queryClient.invalidateQueries({ queryKey: ['wallet-history'] })]);
    },
  });

  const symbol = useMemo(() => ({ USD: '$', EUR: '€', GBP: '£', AED: 'AED ' }[currency]), [currency]);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-8">
      <h1 className="text-3xl font-bold">ezeeFlight Wallet</h1>

      <section className="rounded-xl border bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white">
        <p className="text-sm uppercase tracking-wide text-indigo-100">Available balance</p>
        <p className="text-5xl font-bold">{symbol}{(wallet.data?.balance ?? 0).toFixed(2)}</p>
        <div className="mt-4 flex gap-2">
          {(['USD', 'AED', 'EUR', 'GBP'] as const).map((code) => (
            <button key={code} type="button" onClick={() => setCurrency(code)} className={`rounded px-3 py-1 text-sm ${currency === code ? 'bg-white text-indigo-700' : 'bg-indigo-500'}`}>
              {code}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Top up wallet</h2>
        <div className="flex flex-wrap items-center gap-3">
          <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" min="1" className="rounded border px-3 py-2" />
          <button type="button" onClick={() => topUp.mutate()} className="rounded bg-black px-4 py-2 text-white">
            {topUp.isPending ? 'Processing…' : 'Top up with card'}
          </button>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Transaction history</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Type</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Date</th>
              <th className="py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {(history.data ?? []).map((tx) => (
              <tr key={tx.id} className="border-b">
                <td className="py-2">{tx.transactionType}</td>
                <td className="py-2">{tx.amount.toFixed(2)}</td>
                <td className="py-2">{new Date(tx.createdAt).toLocaleString()}</td>
                <td className="py-2">{tx.description ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border bg-amber-50 p-4">
        <h2 className="mb-2 text-lg font-semibold">How to earn</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          <li>Invite friends via referral links and earn referral bonuses.</li>
          <li>Leave verified trip reviews to unlock promotional credits.</li>
          <li>Complete more bookings to receive wallet cashback campaigns.</li>
        </ul>
      </section>
    </main>
  );
}
