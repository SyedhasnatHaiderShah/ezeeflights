'use client';

import { useEffect, useState } from 'react';
import { AdminShell } from '@/components/admin/admin-shell';
import { getMonitoringLive } from '@/lib/api/admin-api';

export default function AdminMonitoringPage() {
  const [live, setLive] = useState<any>(null);

  useEffect(() => {
    getMonitoringLive().then(setLive).catch(() => null);
    const timer = window.setInterval(() => {
      getMonitoringLive().then(setLive).catch(() => null);
    }, 10000);

    return () => window.clearInterval(timer);
  }, []);

  return <AdminShell>
    <h1 className="text-2xl font-bold mb-4">Real-time Monitoring</h1>
    <div className="border rounded p-3 mb-3">
      <p className="text-sm">Payment Failures (live): <span className="font-bold text-red-600">{live?.paymentFailureCount ?? 0}</span></p>
      <p className="text-xs text-slate-500">Last update: {live?.timestamp ?? '-'}</p>
    </div>
    <h2 className="font-semibold mb-2">Live Booking Feed</h2>
    <ul className="space-y-2">{(live?.liveBookings ?? []).slice(0, 20).map((b: any) => <li key={b.id} className="border rounded p-2 flex justify-between"><span>{b.id}</span><span>{b.status}</span></li>)}</ul>
  </AdminShell>;
}
