'use client';

import { useMemo } from 'react';

type AncillaryOption = {
  id: string;
  ancillaryType: 'baggage' | 'meal' | 'insurance' | 'fast_track' | 'lounge' | 'upgrade';
  name: string;
  price: number;
};

type SelectedAncillary = { ancillaryId: string; passengerIndex: number; quantity: number; unitPrice: number };

export function AncillarySelector({ passengers, options, selected, onChange }: {
  passengers: number;
  options: AncillaryOption[];
  selected: SelectedAncillary[];
  onChange: (items: SelectedAncillary[]) => void;
}) {
  const grouped = useMemo(() => ({
    Baggage: options.filter((o) => o.ancillaryType === 'baggage'),
    Meals: options.filter((o) => o.ancillaryType === 'meal'),
    Comfort: options.filter((o) => ['fast_track', 'lounge', 'upgrade'].includes(o.ancillaryType)),
    Insurance: options.filter((o) => o.ancillaryType === 'insurance'),
  }), [options]);

  const setItem = (ancillaryId: string, passengerIndex: number, quantity: number) => {
    const option = options.find((x) => x.id === ancillaryId);
    if (!option) return;
    const rest = selected.filter((x) => !(x.ancillaryId === ancillaryId && x.passengerIndex === passengerIndex));
    if (quantity <= 0) return onChange(rest);
    onChange([...rest, { ancillaryId, passengerIndex, quantity, unitPrice: option.price }]);
  };

  const total = selected.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([label, list]) => (
        <div key={label} className="rounded border p-3">
          <h3 className="font-semibold">{label}</h3>
          <div className="mt-2 space-y-2">
            {list.map((opt) => (
              <div key={opt.id} className="flex items-center justify-between gap-2">
                <span>{opt.name} (${opt.price})</span>
                <div className="flex gap-2">
                  {Array.from({ length: passengers }).map((_, idx) => (
                    <select key={`${opt.id}-${idx}`} className="rounded border p-1 text-sm" onChange={(e) => setItem(opt.id, idx, Number(e.target.value))}>
                      <option value={0}>P{idx + 1}: none</option>
                      <option value={1}>P{idx + 1}: x1</option>
                      <option value={2}>P{idx + 1}: x2</option>
                    </select>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="rounded bg-slate-50 p-3 text-right font-semibold">Add-ons total: ${total.toFixed(2)}</div>
    </div>
  );
}
