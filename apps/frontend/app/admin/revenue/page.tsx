'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin/admin-shell';
import { getRevenueByModule, getRevenueOverview } from '@/lib/api/admin-api';

export default function AdminRevenuePage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const query = useMemo(() => ({ from: from || undefined, to: to || undefined }), [from, to]);

  const overview = useQuery({ queryKey: ['admin-revenue-overview', query], queryFn: () => getRevenueOverview(query) });
  const byModule = useQuery({ queryKey: ['admin-revenue-module', query], queryFn: () => getRevenueByModule(query) });

  const exportCsv = () => {
    const rows = byModule.data ?? [];
    const body = ['module,revenue,bookings', ...rows.map((r) => `${r.module},${r.revenue},${r.bookings}`)].join('\n');
    const blob = new Blob([body], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'revenue-by-module.csv';
    link.click();
  };

  return <AdminShell>
    <h1 className="text-2xl font-bold mb-4">Revenue Intelligence</h1>
    <div className="flex gap-2 mb-4">
      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded p-2" />
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded p-2" />
      <button onClick={exportCsv} className="border px-3 rounded">Export CSV</button>
    </div>
    {overview.isLoading ? 'Loading...' : <div className="grid md:grid-cols-3 gap-3 mb-4">{Object.entries(overview.data ?? {}).filter(([k]) => k !== 'byModule').map(([k,v]) => <div key={k} className="border rounded p-3"><p className="text-xs uppercase">{k}</p><p className="font-bold">{Number(v ?? 0).toLocaleString()}</p></div>)}</div>}
    <div className="border rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-100"><tr><th className="p-2 text-left">Module</th><th className="p-2 text-left">Revenue</th><th className="p-2 text-left">Bookings</th></tr></thead>
        <tbody>{(byModule.data ?? []).map((r) => <tr key={r.module} className="border-t"><td className="p-2">{r.module}</td><td className="p-2">{r.revenue.toLocaleString()}</td><td className="p-2">{r.bookings}</td></tr>)}</tbody>
      </table>
    </div>
  </AdminShell>;
}
