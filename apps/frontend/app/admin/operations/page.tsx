'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin/admin-shell';
import { getOperationsSla, getOperationsStatus } from '@/lib/api/admin-api';

export default function AdminOperationsPage() {
  const status = useQuery({ queryKey: ['admin-ops-status'], queryFn: () => getOperationsStatus({}) });
  const sla = useQuery({ queryKey: ['admin-ops-sla'], queryFn: () => getOperationsSla({}) });

  return <AdminShell>
    <h1 className="text-2xl font-bold mb-4">Operations Management</h1>
    {status.isLoading ? 'Loading...' : <div className="grid md:grid-cols-3 gap-3 mb-4">{Object.entries(status.data ?? {}).map(([k,v]) => <div key={k} className="border rounded p-3"><p className="text-xs uppercase">{k}</p><p className="font-bold">{Number(v ?? 0).toLocaleString()}</p></div>)}</div>}
    <h2 className="font-semibold mb-2">SLA Breaches</h2>
    <ul className="space-y-2">{(sla.data ?? []).slice(0, 15).map((item) => <li key={item.bookingId} className="border rounded p-2 flex justify-between"><span>{item.bookingId}</span><span className={item.status === 'DELAYED' ? 'text-red-600 font-semibold' : 'text-green-600'}>{item.status}</span></li>)}</ul>
  </AdminShell>;
}
