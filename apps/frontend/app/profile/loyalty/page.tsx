'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthSession } from '@/lib/hooks/use-auth-session';
import { useReactTable, getCoreRowModel, createColumnHelper, flexRender } from '@tanstack/react-table';
import { Gift, Plane, Hotel, Star, MessageSquare, Users, CreditCard } from 'lucide-react';

export default function LoyaltyPage() {
  const session = useAuthSession();
  const account = useQuery({ queryKey: ['loyalty-me'], queryFn: () => apiFetch<any>('/loyalty/me'), enabled: !!session.data });
  const txs = useQuery({ queryKey: ['loyalty-tx'], queryFn: () => apiFetch<any[]>('/loyalty/transactions'), enabled: !!session.data });
  if (!session.data) return <p className="rounded border bg-amber-50 p-4">Sign in required.</p>;

  const points = account.data?.pointsBalance ?? 0;
  const toNext = 1200;
  const progress = Math.min(100, Math.round((points / (points + toNext)) * 100));

  const columnHelper = createColumnHelper<any>();
  const columns = [
    columnHelper.accessor('createdAt', { header: 'Date', cell: (info) => new Date(info.getValue()).toLocaleDateString() }),
    columnHelper.accessor('description', { header: 'Description', cell: (info) => info.getValue() || '-' }),
    columnHelper.accessor('points', { header: 'Points +/-', cell: (info) => <span className={info.getValue() >= 0 ? 'text-green-600' : 'text-red-600'}>{info.getValue() >= 0 ? '+' : ''}{info.getValue()}</span> }),
    columnHelper.accessor('balanceAfter', { header: 'Balance' }),
  ];

  const table = useReactTable({ data: txs.data ?? [], columns, getCoreRowModel: getCoreRowModel() });

  const earnWays = useMemo(() => [
    { icon: Plane, label: 'Book flights', value: '5 pts / $' },
    { icon: Hotel, label: 'Hotels', value: '3 pts / $' },
    { icon: MessageSquare, label: 'Reviews', value: '50 pts' },
    { icon: Users, label: 'Referrals', value: '500 pts' },
    { icon: CreditCard, label: 'Wallet topup', value: '2 pts / $' },
    { icon: Gift, label: 'Promotions', value: 'Bonus pts' },
  ], []);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-brand-dark-blue to-[#173a84] p-6 text-white">
        <p className="text-brand-yellow text-lg font-semibold">Gold Member</p>
        <p className="mt-2 text-4xl font-bold">{points.toLocaleString()} pts</p>
        <p className="text-sm text-white/80">= ${(points / 100).toFixed(2)} in rewards</p>
        <div className="mt-4"><p className="mb-1 text-sm">1,200 points to Platinum</p><div className="h-2 rounded-full bg-white/20"><div className="h-2 rounded-full bg-brand-yellow transition-all" style={{ width: `${progress}%` }} /></div></div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">{[
        { icon: Plane, title: 'Free bags', desc: 'One free checked bag on eligible flights.' },
        { icon: Star, title: 'Lounge access', desc: 'Complimentary lounge passes each quarter.' },
        { icon: Gift, title: 'Priority boarding', desc: 'Board early on participating airlines.' },
      ].map((b) => <div key={b.title} className="rounded-xl border bg-card p-4"><b.icon className="h-5 w-5 text-redmix" /><p className="mt-2 font-semibold">{b.title}</p><p className="text-sm text-muted-foreground">{b.desc}</p></div>)}</div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Transaction history</h2>
        <table className="w-full text-sm">
          <thead>{table.getHeaderGroups().map((hg) => <tr key={hg.id}>{hg.headers.map((h) => <th key={h.id} className="border-b py-2 text-left">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>)}</thead>
          <tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id} className="border-b py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody>
        </table>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">How to earn</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {earnWays.map((item) => <div key={item.label} className="rounded-xl border bg-card p-4 text-sm"><item.icon className="h-5 w-5 text-redmix" /><p className="mt-2 font-medium">{item.label}</p><p className="text-muted-foreground">{item.value}</p></div>)}
        </div>
      </div>
    </section>
  );
}
