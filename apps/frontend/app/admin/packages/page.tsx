'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminShell } from '@/components/admin/admin-shell';
import { ItineraryBuilder } from '@/components/packages/ItineraryBuilder';
import { PricingInclusionManager } from '@/components/packages/PricingInclusionManager';
import { adminCreateItinerary, adminDeletePackage, adminListPackages } from '@/lib/api/packages-api';

export default function AdminPackagesPage() {
  const q = useQuery({ queryKey: ['admin-packages'], queryFn: adminListPackages });

  const onDelete = async (id: string) => {
    await adminDeletePackage(id);
    q.refetch();
  };

  return (
    <AdminShell>
      <h1 className="mb-4 text-2xl font-bold">Package CRUD Dashboard</h1>
      <PricingInclusionManager onSave={(_payload) => { q.refetch(); }} />
      <div className="space-y-2">
        {(q.data?.data ?? []).map((pkg) => (
          <div key={pkg.id} className="flex items-center justify-between rounded border p-3">
            <div>
              <p className="font-medium">{pkg.title}</p>
              <p className="text-sm text-slate-500">{pkg.destination} • {pkg.status}</p>
            </div>
            <button className="text-sm text-red-600" onClick={() => onDelete(pkg.id)}>Delete</button>
          </div>
        ))}
      </div>
      {(q.data?.data ?? [])[0] ? <ItineraryBuilder onSave={async (rows) => { for (const row of rows) { await adminCreateItinerary((q.data?.data ?? [])[0].id, row); } q.refetch(); }} /> : null}
    </AdminShell>
  );
}
