'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthSession } from '@/lib/hooks/use-auth-session';

type Tier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

const TIER_ORDER: Tier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
const TIER_COLORS: Record<Tier, string> = {
  blue: '#6B7280',
  silver: '#9CA3AF',
  gold: '#F59E0B',
  platinum: '#7C3AED',
};

export default function LoyaltyPage() {
  const session = useAuthSession();
  const [filter, setFilter] = useState<'all' | 'earned' | 'redeemed' | 'expired'>('all');

  const account = useQuery({ queryKey: ['loyalty-me'], queryFn: () => apiFetch<any>('/loyalty/me'), enabled: !!session.data });
  const txs = useQuery({ queryKey: ['loyalty-tx'], queryFn: () => apiFetch<any[]>('/loyalty/transactions'), enabled: !!session.data });
  const referrals = useQuery({ queryKey: ['loyalty-referrals'], queryFn: () => apiFetch<any[]>('/loyalty/referrals').catch(() => []), enabled: !!session.data });
  const milestones = useQuery({ queryKey: ['loyalty-milestones'], queryFn: () => apiFetch<any[]>('/loyalty/milestones').catch(() => []), enabled: !!session.data });

  const currentTier = (account.data?.tier ?? 'BRONZE') as Tier;
  const points = account.data?.pointsBalance ?? 0;

  const nextTier = useMemo(() => TIER_ORDER[TIER_ORDER.indexOf(currentTier) + 1], [currentTier]);
  const threshold: Record<Tier, number> = { blue: 0, silver: 5000, gold: 25000, platinum: 100000 };
  const currentMin = threshold[currentTier];
  const nextMin = nextTier ? threshold[nextTier] : threshold.platinum;
  const progress = nextTier ? Math.min(100, Math.floor(((points - currentMin) / (nextMin - currentMin)) * 100)) : 100;

  const filteredTx = (txs.data ?? []).filter((tx) => {
    if (filter === 'all') return true;
    if (filter === 'earned') return String(tx.type).startsWith('earned') || String(tx.type).includes('bonus');
    if (filter === 'redeemed') return tx.type === 'redeemed';
    return tx.type === 'expired';
  });

  const expiringSoon = (txs.data ?? []).filter((tx) => tx.expiresAt && new Date(tx.expiresAt).getTime() - Date.now() < 60 * 24 * 60 * 60 * 1000 && tx.points > 0);

  if (!session.data) return <p className="rounded border bg-amber-50 p-4">Sign in required.</p>;

  return (
    <section className="space-y-5">
      <h1 className="text-2xl font-bold">Loyalty Dashboard</h1>

      <div className="rounded border bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Current tier</p>
            <p className="text-xl font-semibold" style={{ color: TIER_COLORS[currentTier] }}>{currentTier.toUpperCase()} ★</p>
          </div>
          <p className="text-3xl font-bold">{points.toLocaleString()} pts</p>
        </div>
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-slate-500"><span>Progress to {nextTier?.toUpperCase() ?? 'MAX'}</span><span>{progress}%</span></div>
          <div className="h-2 rounded bg-slate-100"><div className="h-2 rounded" style={{ width: `${progress}%`, backgroundColor: TIER_COLORS[currentTier] }} /></div>
          {nextTier && <p className="mt-1 text-xs text-slate-500">{Math.max(nextMin - points, 0).toLocaleString()} points needed for {nextTier.toUpperCase()}.</p>}
        </div>
      </div>

      {!!expiringSoon.length && <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm">⚠ {expiringSoon.length} points batches will expire within 60 days.</p>}

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Tier benefits</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Tier</th><th>Multiplier</th><th>Companion discount</th></tr></thead>
          <tbody>
            {TIER_ORDER.map((tier) => <tr className="border-t" key={tier}><td className="py-2" style={{ color: TIER_COLORS[tier] }}>{tier.toUpperCase()}</td><td>{tier === 'BRONZE' ? '1.0x' : tier === 'SILVER' ? '1.25x' : tier === 'GOLD' ? '1.5x' : '2.0x'}</td><td>{tier === 'BRONZE' ? '0%' : tier === 'SILVER' ? '5%' : tier === 'GOLD' ? '10%' : '20%'}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Points history</h2>
        <div className="mb-3 flex gap-2 text-sm">
          {(['all', 'earned', 'redeemed', 'expired'] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className={`rounded border px-2 py-1 ${filter === f ? 'bg-slate-900 text-white' : ''}`}>{f}</button>)}
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500"><th>Type</th><th>Description</th><th>Date</th><th>Points</th><th>Balance</th></tr></thead>
          <tbody>
            {filteredTx.map((tx) => <tr className="border-t" key={tx.id}><td className="py-2">{tx.type}</td><td>{tx.description ?? '-'}</td><td>{new Date(tx.createdAt).toLocaleDateString()}</td><td className={tx.points >= 0 ? 'text-emerald-600' : 'text-red-600'}>{tx.points >= 0 ? '+' : ''}{tx.points}</td><td>{tx.balanceAfter ?? '-'}</td></tr>)}
          </tbody>
        </table>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Referral programme</h2>
        <p className="mb-2 text-sm text-slate-500">You earn 500 pts · Your friend earns 250 pts.</p>
        <div className="flex gap-2">
          <code className="rounded bg-slate-100 px-2 py-1">{account.data?.referralCode ?? 'Generate on backend'}</code>
          <button className="rounded border px-2 py-1" onClick={() => navigator.clipboard.writeText(account.data?.referralCode ?? '')}>Copy</button>
          <a className="rounded border px-2 py-1" href={`https://wa.me/?text=Use my referral code ${account.data?.referralCode ?? ''}`}>WhatsApp</a>
          <a className="rounded border px-2 py-1" href={`mailto:?subject=Join EzeeFlights&body=Use my referral code ${account.data?.referralCode ?? ''}`}>Email</a>
        </div>
        <ul className="mt-2 text-sm">
          {(referrals.data ?? []).map((ref) => <li key={ref.id}>{ref.referee_email ?? ref.referee_id} — {ref.status}</li>)}
        </ul>
      </div>

      <div className="rounded border bg-white p-4">
        <h2 className="mb-2 font-semibold">Milestones & badges</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(milestones.data ?? []).map((m) => {
            const achieved = Boolean(m.achievedAt);
            return (
              <div key={m.id} className={`rounded border p-3 text-center ${achieved ? '' : 'grayscale opacity-70'}`} title={m.description ?? JSON.stringify(m.criteria)}>
                <p className="text-xl">🏅</p>
                <p className="text-sm font-medium">{m.name}</p>
                <div className="mt-2 h-1 rounded bg-slate-100"><div className="h-1 rounded bg-emerald-500" style={{ width: `${m.progress ?? (achieved ? 100 : 0)}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
