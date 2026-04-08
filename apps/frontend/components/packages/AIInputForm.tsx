'use client';

import { useState } from 'react';
import { AiGenerateInput } from '@/lib/api/ai-itinerary-api';

const prefValues: AiGenerateInput['preferences'] = ['luxury', 'adventure', 'cultural', 'relaxation'];

export function AIInputForm({ onSubmit, loading }: { onSubmit: (payload: AiGenerateInput) => Promise<void>; loading: boolean }) {
  const [form, setForm] = useState<AiGenerateInput>({
    destination: '',
    durationDays: 5,
    budgetMin: 1000,
    budgetMax: 2500,
    travelerType: 'couple',
    preferences: ['cultural'],
  });

  const togglePref = (pref: AiGenerateInput['preferences'][number]) => {
    setForm((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter((p) => p !== pref)
        : [...prev.preferences, pref],
    }));
  };

  return (
    <form
      className="space-y-3 rounded border bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSubmit(form);
      }}
    >
      <h2 className="text-lg font-semibold">AI Package Generator</h2>
      <input className="w-full rounded border p-2" placeholder="Destination" value={form.destination} onChange={(e) => setForm((s) => ({ ...s, destination: e.target.value }))} required />
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded border p-2" type="number" min={1} max={30} value={form.durationDays} onChange={(e) => setForm((s) => ({ ...s, durationDays: Number(e.target.value) }))} />
        <select className="rounded border p-2" value={form.travelerType} onChange={(e) => setForm((s) => ({ ...s, travelerType: e.target.value as AiGenerateInput['travelerType'] }))}>
          <option value="solo">Solo</option><option value="family">Family</option><option value="couple">Couple</option><option value="business">Business</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input className="rounded border p-2" type="number" value={form.budgetMin} onChange={(e) => setForm((s) => ({ ...s, budgetMin: Number(e.target.value) }))} />
        <input className="rounded border p-2" type="number" value={form.budgetMax} onChange={(e) => setForm((s) => ({ ...s, budgetMax: Number(e.target.value) }))} />
      </div>
      <div className="flex flex-wrap gap-2">
        {prefValues.map((pref) => (
          <button key={pref} type="button" className={`rounded px-2 py-1 text-sm ${form.preferences.includes(pref) ? 'bg-blue-600 text-white' : 'bg-slate-100'}`} onClick={() => togglePref(pref)}>
            {pref}
          </button>
        ))}
      </div>
      <button className="rounded bg-black px-3 py-2 text-white disabled:opacity-50" disabled={loading || !form.destination.trim()}>
        {loading ? 'Generating...' : 'Generate Package'}
      </button>
    </form>
  );
}
