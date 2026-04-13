'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PolicyDocumentDownload } from '@/components/insurance/PolicyDocumentDownload';
import { getPolicy } from '@/lib/api/insurance-api';

export default function PolicyDetailPage({ params }: { params: { id: string } }) {
  const [policy, setPolicy] = useState<any | null>(null);

  useEffect(() => {
    getPolicy(params.id).then(setPolicy).catch(() => setPolicy(null));
  }, [params.id]);

  if (!policy) return <main className="p-6">Loading policy…</main>;

  return (
    <main className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Policy {policy.policyNumber}</h1>
      <div className="rounded border p-4 text-sm">
        <p>Status: {policy.status}</p>
        <p>Period: {policy.startDate} to {policy.endDate}</p>
        <p>Premium: {policy.currency} {policy.totalPremium}</p>
      </div>
      <PolicyDocumentDownload url={policy.policyDocumentUrl} />
      <Link className="inline-block rounded bg-blue-600 px-4 py-2 text-white" href={`/insurance/claims/new?policyId=${policy.id}`}>
        Submit a claim
      </Link>
    </main>
  );
}
