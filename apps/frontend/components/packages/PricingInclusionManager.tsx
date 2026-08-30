'use client';

import { useState } from 'react';

export function PricingInclusionManager({ onSave }: { onSave: (payload: unknown) => void }) {
  const [adultPrice, setAdultPrice] = useState(0);
  const [childPrice, setChildPrice] = useState(0);
  const [infantPrice, setInfantPrice] = useState(0);
  const [inclusion, setInclusion] = useState('Airport transfer');

  return (
    <div className="space-y-2 rounded border p-4">
      <h3 className="font-semibold">Pricing & Inclusion Manager</h3>
      <div className="grid grid-cols-3 gap-2">
        <input className="rounded border px-2 py-1" type="number" value={adultPrice} onChange={(e) => setAdultPrice(Number(e.target.value || 0))} placeholder="Adult price" />
        <input className="rounded border px-2 py-1" type="number" value={childPrice} onChange={(e) => setChildPrice(Number(e.target.value || 0))} placeholder="Child price" />
        <input className="rounded border px-2 py-1" type="number" value={infantPrice} onChange={(e) => setInfantPrice(Number(e.target.value || 0))} placeholder="Infant price" />
      </div>
      <input className="w-full rounded border px-2 py-1" value={inclusion} onChange={(e) => setInclusion(e.target.value)} />
      <button className="rounded bg-blue-600 px-3 py-1 text-white" onClick={() => onSave({ pricing: { adultPrice, childPrice, infantPrice }, inclusions: [{ type: 'transfer', description: inclusion }] })}>Save Pricing</button>
    </div>
  );
}
