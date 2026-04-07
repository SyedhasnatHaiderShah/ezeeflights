'use client';

import { useState } from 'react';

type ProfilePayload = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  nationality?: string;
  passportNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  preferences?: Record<string, unknown>;
};

export function ProfileForm({ initial, onSave }: { initial?: ProfilePayload; onSave: (payload: ProfilePayload) => Promise<void> }) {
  const [form, setForm] = useState<ProfilePayload>(initial ?? {});
  const [error, setError] = useState('');

  async function submit() {
    try {
      setError('');
      await onSave(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    }
  }

  return (
    <div className="space-y-3 rounded border bg-white p-4">
      <h2 className="font-semibold">Profile</h2>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <input className="w-full rounded border p-2" placeholder="First name" value={form.firstName ?? ''} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
      <input className="w-full rounded border p-2" placeholder="Last name" value={form.lastName ?? ''} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
      <input className="w-full rounded border p-2" placeholder="Phone" value={form.phone ?? ''} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
      <input className="w-full rounded border p-2" placeholder="Nationality" value={form.nationality ?? ''} onChange={(e) => setForm((p) => ({ ...p, nationality: e.target.value }))} />
      <input className="w-full rounded border p-2" placeholder="Passport Number" value={form.passportNumber ?? ''} onChange={(e) => setForm((p) => ({ ...p, passportNumber: e.target.value }))} />
      <button className="rounded bg-black px-4 py-2 text-white" onClick={submit}>Save profile</button>
    </div>
  );
}
