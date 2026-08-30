'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin/admin-shell';
import { adminFetch } from '@/lib/api/admin-api';

export default function Page() {
  const [status, setStatus] = useState('all');
  const [drawer, setDrawer] = useState<any>(null);
  const q = useQuery({ queryKey: ['admin-bookings'], queryFn: () => adminFetch<any[]>('/bookings') });
  const rows = (q.data ?? []).filter((b: any) => status === 'all' || b.status === status);

  return <AdminShell><div className="mb-4 flex items-center justify-between"><h1 className="text-2xl font-bold">Bookings</h1><button className="rounded border px-3 py-2 text-sm">Export CSV</button></div><div className="mb-3 flex gap-2">{['all','pending','confirmed','cancelled'].map((s) => <button key={s} onClick={() => setStatus(s)} className={`rounded-full border px-3 py-1 text-sm ${status===s?'bg-brand-red text-white':''}`}>{s}</button>)}</div><div className="overflow-auto rounded-xl border bg-white"><table className="min-w-full text-sm"><thead><tr><th className="p-2 text-left">Booking</th><th className="p-2 text-left">Status</th><th className="p-2"/></tr></thead><tbody>{rows.map((b: any, i: number) => <tr key={i}><td className="border-t p-2">{b.id || `BK-${i+1}`}</td><td className="border-t p-2">{b.status || 'pending'}</td><td className="border-t p-2"><button onClick={() => setDrawer(b)} className="text-brand-red">View</button></td></tr>)}</tbody></table></div>{drawer && <div className="fixed inset-y-0 right-0 w-96 border-l bg-white p-4 shadow-2xl"><button className="mb-2 text-sm" onClick={() => setDrawer(null)}>Close</button><pre className="text-xs">{JSON.stringify(drawer, null, 2)}</pre></div>}</AdminShell>;
}
