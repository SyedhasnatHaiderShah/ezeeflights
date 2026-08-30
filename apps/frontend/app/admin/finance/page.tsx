'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin/admin-shell';
import { getFinanceReconciliation, getFinanceSettlements } from '@/lib/api/admin-api';

export default function AdminFinancePage() {
  const settlements = useQuery({ queryKey: ['admin-finance-settlements'], queryFn: getFinanceSettlements });
  const recon = useQuery({ queryKey: ['admin-finance-reconciliation'], queryFn: getFinanceReconciliation });

  return <AdminShell>
    <h1 className="text-2xl font-bold mb-4">Financial Control Panel</h1>
    <h2 className="font-semibold mb-2">Provider Settlements</h2>
    <div className="grid md:grid-cols-2 gap-3 mb-4">{(settlements.data ?? []).map((row) => <div className="border rounded p-3" key={row.id}><p>{row.provider}</p><p>Total: {row.totalAmount}</p><p>Settled: {row.settledAmount}</p><p>Pending: {row.pendingAmount}</p></div>)}</div>
    <h2 className="font-semibold mb-2">Reconciliation Logs</h2>
    <div className="border rounded p-3 max-h-[380px] overflow-auto">{(recon.data ?? []).map((row) => <div key={row.id} className="flex justify-between border-b py-1 text-sm"><span>{row.transactionId}</span><span className={row.status === 'MISMATCH' ? 'text-red-600' : 'text-green-700'}>{row.status}</span></div>)}</div>
  </AdminShell>;
}
