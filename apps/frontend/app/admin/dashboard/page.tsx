'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { AdminShell } from '@/components/admin/admin-shell';
import { adminFetch } from '@/lib/api/admin-api';

type DashboardData = { kpi: { totalRevenue: string; totalBookings: string; activeUsers: string; conversionRate: string }; charts: Record<string, { date: string; value: string }[]> };

export default function AdminDashboardPage() {
  const q = useQuery({ queryKey: ['admin-dashboard'], queryFn: () => adminFetch<DashboardData>('/dashboard') });
  const kpis = Object.entries(q.data?.kpi ?? {});

  return <AdminShell><h1 className="mb-4 text-2xl font-bold">Control Center Dashboard</h1>{q.isLoading ? 'Loading...' : <div className="space-y-6"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{kpis.map(([k,v]) => <div key={k} className="rounded-xl border bg-white p-3"><p className="text-xs text-slate-500">{k}</p><p className="text-xl font-bold">{v}</p><div className="mt-3 h-12"><ResponsiveContainer width="100%" height="100%"><LineChart data={(q.data?.charts?.revenue || []).slice(0,8)}><Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></div>)}</div><div className="rounded-xl border bg-white p-4">Recent bookings table</div><div className="h-64 rounded-xl border bg-white p-4">Revenue line chart</div></div>}</AdminShell>;
}
