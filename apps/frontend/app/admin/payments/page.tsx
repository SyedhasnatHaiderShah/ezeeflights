'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin/admin-shell';
import { adminFetch } from '@/lib/api/admin-api';

export default function Page() {
  const q = useQuery({ queryKey: ['admin-payments'], queryFn: () => adminFetch<any[]>('/payments') });
  return <AdminShell><h1 className="text-2xl font-bold mb-4">Payments</h1>{q.isLoading ? 'Loading...' : <pre className="text-xs bg-slate-50 p-3 rounded overflow-auto">{JSON.stringify(q.data, null, 2)}</pre>}</AdminShell>;
}
