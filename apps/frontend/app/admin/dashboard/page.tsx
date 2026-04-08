'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin/admin-shell';
import { adminFetch } from '@/lib/api/admin-api';

type DashboardData = { kpi: { totalRevenue: string; totalBookings: string; activeUsers: string; conversionRate: string }; charts: Record<string, { date: string; value: string }[]> };

export default function AdminDashboardPage() {
  const q = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminFetch<DashboardData>('/dashboard') });
  return <AdminShell><h1 className="text-2xl font-bold mb-4">Control Center Dashboard</h1>{q.isLoading ? 'Loading...' : <div className="grid grid-cols-2 gap-3">{Object.entries(q.data?.kpi ?? {}).map(([k,v]) => <div key={k} className="rounded border p-3"><p className="text-sm text-slate-500">{k}</p><p className="font-bold">{v}</p></div>)}</div>}</AdminShell>;
}
