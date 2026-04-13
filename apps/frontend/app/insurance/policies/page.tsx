'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listMyPolicies } from '@/lib/api/insurance-api';

export default function MyPoliciesPage() {
  const [policies, setPolicies] = useState<any[]>([]);

  useEffect(() => {
    listMyPolicies().then(setPolicies).catch(() => setPolicies([]));
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-bold">My Insurance Policies</h1>
      <div className="space-y-3">
        {policies.map((policy) => (
          <Link href={`/insurance/policies/${policy.id}`} key={policy.id} className="block rounded border p-4 hover:bg-gray-50">
            <p className="font-medium">{policy.policyNumber}</p>
            <p className="text-sm text-gray-600">{policy.startDate} → {policy.endDate} • {policy.currency} {policy.totalPremium}</p>
          </Link>
        ))}
        {policies.length === 0 && <p className="text-sm text-gray-500">No policies found.</p>}
      </div>
    </main>
  );
}
