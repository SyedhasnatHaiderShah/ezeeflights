'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin/admin-shell';
import { getExecutiveOverview } from '@/lib/api/admin-api';

export default function ExecutiveDashboardPage() {
  const q = useQuery({ queryKey: ['admin-executive-overview'], queryFn: getExecutiveOverview });

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold mb-4">Executive Command Center</h1>
      {q.isLoading ? 'Loading...' : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(q.data?.revenue ?? {}).map(([key, value]) => (
            <div key={key} className="rounded border p-3 bg-white">
              <p className="text-xs uppercase text-slate-500">{key}</p>
              <p className="font-semibold">{typeof value === 'number' ? value.toLocaleString() : String(value)}</p>
            </div>
          ))}
          <div className="rounded border p-3 bg-white md:col-span-3">
            <h2 className="font-semibold mb-2">SLA Alerts</h2>
            <p className="text-sm">Breaches: {q.data?.operations?.slaBreaches ?? 0}</p>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
