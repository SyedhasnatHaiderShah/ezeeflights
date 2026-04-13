'use client';

import { useMemo } from 'react';

type Extra = { name: string; price: number };

export function CarExtrasSelector({ extras, selected, onChange }: { extras: Extra[]; selected: Extra[]; onChange: (next: Extra[]) => void }) {
  const total = useMemo(() => selected.reduce((sum, item) => sum + item.price, 0), [selected]);

  return (
    <div className="space-y-2 rounded-lg border p-3">
      {extras.map((extra) => {
        const checked = selected.some((item) => item.name === extra.name);
        return (
          <label key={extra.name} className="flex items-center justify-between gap-2 text-sm">
            <span>
              <input
                className="mr-2"
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  if (e.target.checked) onChange([...selected, extra]);
                  else onChange(selected.filter((item) => item.name !== extra.name));
                }}
              />
              {extra.name}
            </span>
            <strong>+${extra.price}/day</strong>
          </label>
        );
      })}
      <p className="text-sm font-semibold">Extras total/day: ${total.toFixed(2)}</p>
    </div>
  );
}
