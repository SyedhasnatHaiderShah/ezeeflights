'use client';

import { useReactTable, getCoreRowModel, createColumnHelper, flexRender } from '@tanstack/react-table';
import { Gift, Plane, Hotel, Star } from 'lucide-react';
import { useLoyaltyProfile, useLoyaltyTierBenefits, useLoyaltyTransactions, useReferralCode } from '@/lib/api/loyalty';

export default function LoyaltyPage() {
  const account = useLoyaltyProfile();
  const txs = useLoyaltyTransactions();
  const benefits = useLoyaltyTierBenefits();
  const referral = useReferralCode();

  const points = (account.data as any)?.pointsBalance ?? 0;
  const toNext = 1200;
  const progress = Math.min(100, Math.round((points / (points + toNext)) * 100));

  const columnHelper = createColumnHelper<any>();
  const columns = [
    columnHelper.accessor('createdAt', { header: 'Date', cell: (info) => new Date(info.getValue()).toLocaleDateString() }),
    columnHelper.accessor('description', { header: 'Description', cell: (info) => info.getValue() || '-' }),
    columnHelper.accessor('points', { header: 'Points +/-', cell: (info) => <span className={info.getValue() >= 0 ? 'text-green-600' : 'text-red-600'}>{info.getValue() >= 0 ? '+' : ''}{info.getValue()}</span> }),
    columnHelper.accessor('balanceAfter', { header: 'Balance' }),
  ];

  const table = useReactTable({ data: (txs.data as any[]) ?? [], columns, getCoreRowModel: getCoreRowModel() });

  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-brand-dark-blue to-[#173a84] p-6 text-white">
        <p className="text-brand-yellow text-lg font-semibold">{(account.data as any)?.tier ?? 'Member'}</p>
        <p className="mt-2 text-4xl font-bold">{points.toLocaleString()} pts</p>
        <p className="text-sm text-white/80">Referral code: {(account.data as any)?.referralCode ?? referral.data?.code ?? '—'}</p>
        <div className="mt-4"><p className="mb-1 text-sm">1,200 points to Platinum</p><div className="h-2 rounded-full bg-white/20"><div className="h-2 rounded-full bg-brand-yellow transition-all" style={{ width: `${progress}%` }} /></div></div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">{((benefits.data as any[])?.[0]?.benefits ?? ['Free bags', 'Lounge access', 'Priority boarding']).slice(0, 3).map((desc: string, idx: number) => {
        const icon = [Plane, Star, Gift][idx] || Hotel;
        const Icon = icon;
        return <div key={desc} className="rounded-xl border bg-card p-4"><Icon className="h-5 w-5 text-redmix" /><p className="mt-2 font-semibold">Benefit</p><p className="text-sm text-muted-foreground">{desc}</p></div>;
      })}</div>

      <div className="rounded-xl border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Transaction history</h2>
        <table className="w-full text-sm"><thead>{table.getHeaderGroups().map((hg) => <tr key={hg.id}>{hg.headers.map((h) => <th key={h.id} className="border-b py-2 text-left">{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>)}</thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id} className="border-b py-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table>
      </div>
    </section>
  );
}
