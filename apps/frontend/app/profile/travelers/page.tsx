'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthSession } from '@/lib/hooks/use-auth-session';
import { TravelerList } from '@/components/profile/TravelerList';

export default function TravelersPage() {
  const session = useAuthSession();
  const [form, setForm] = useState({ fullName: '', passportNumber: '', dob: '', nationality: '' });
  const travelers = useQuery({ queryKey: ['travelers'], queryFn: () => apiFetch<any[]>('/profile/travelers'), enabled: !!session.data });

  if (!session.data) return <p className="rounded border bg-amber-50 p-4">Sign in required.</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Saved Travelers</h1>
      <div className="grid gap-2 rounded border bg-white p-4">
        <input className="rounded border p-2" placeholder="Full name" value={form.fullName} onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))} />
        <input className="rounded border p-2" placeholder="Passport" value={form.passportNumber} onChange={(e) => setForm((p) => ({ ...p, passportNumber: e.target.value }))} />
        <input className="rounded border p-2" type="date" value={form.dob} onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))} />
        <input className="rounded border p-2" placeholder="Nationality" value={form.nationality} onChange={(e) => setForm((p) => ({ ...p, nationality: e.target.value }))} />
        <button className="rounded bg-black px-3 py-2 text-white" onClick={async () => {
          await apiFetch('/profile/travelers', { method: 'POST', body: JSON.stringify(form) });
          setForm({ fullName: '', passportNumber: '', dob: '', nationality: '' });
          await travelers.refetch();
        }}>Add traveler</button>
      </div>
      <TravelerList travelers={travelers.data ?? []} onDelete={async (id) => {
        await apiFetch(`/profile/travelers/${id}`, { method: 'DELETE' });
        await travelers.refetch();
      }} />
    </section>
  );
}
