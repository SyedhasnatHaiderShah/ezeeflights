'use client';

import { useState } from 'react';
import { submitInsuranceClaim } from '@/lib/api/insurance-api';

export function ClaimSubmissionForm({ policyId }: { policyId?: string }) {
  const [form, setForm] = useState({ policyId: policyId ?? '', claimType: '', description: '', incidentDate: '', claimedAmount: 0, supportingDocuments: '' });
  const [message, setMessage] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const claim = await submitInsuranceClaim({
        policyId: form.policyId,
        claimType: form.claimType,
        description: form.description,
        incidentDate: form.incidentDate,
        claimedAmount: Number(form.claimedAmount),
        supportingDocuments: form.supportingDocuments ? form.supportingDocuments.split(',').map((item) => item.trim()) : [],
      });
      setMessage(`Claim submitted: ${(claim as any).id}`);
    } catch (error) {
      setMessage((error as Error).message);
    }
  };

  return (
    <form className="space-y-3 rounded-xl border p-4" onSubmit={onSubmit}>
      <h2 className="text-lg font-semibold">Submit claim</h2>
      <input className="w-full rounded border px-2 py-1" placeholder="Policy id" value={form.policyId} onChange={(e) => setForm({ ...form, policyId: e.target.value })} />
      <input className="w-full rounded border px-2 py-1" placeholder="Claim type" value={form.claimType} onChange={(e) => setForm({ ...form, claimType: e.target.value })} />
      <textarea className="w-full rounded border px-2 py-1" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input className="w-full rounded border px-2 py-1" type="date" value={form.incidentDate} onChange={(e) => setForm({ ...form, incidentDate: e.target.value })} />
      <input className="w-full rounded border px-2 py-1" type="number" min={0} value={form.claimedAmount} onChange={(e) => setForm({ ...form, claimedAmount: Number(e.target.value || 0) })} />
      <input className="w-full rounded border px-2 py-1" placeholder="Supporting docs URLs (comma-separated)" value={form.supportingDocuments} onChange={(e) => setForm({ ...form, supportingDocuments: e.target.value })} />
      <button className="rounded bg-blue-600 px-4 py-2 text-white" type="submit">Submit claim</button>
      {message && <p className="text-sm">{message}</p>}
    </form>
  );
}
