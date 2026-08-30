'use client';

import { Baby, Navigation, Shield, UserPlus, type LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

type Extra = { name: string; price: number };

const iconMap: Record<string, LucideIcon> = {
  GPS: Navigation,
  'Child Seat': Baby,
  Insurance: Shield,
  'Additional Driver': UserPlus,
};

export function CarExtrasSelector({ extras, selected, onChange }: { extras: Extra[]; selected: Extra[]; onChange: (next: Extra[]) => void }) {
  const total = useMemo(() => selected.reduce((sum, item) => sum + item.price, 0), [selected]);

  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-card p-4">
      <h3 className="font-semibold">Choose extras</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {extras.map((extra) => {
          const checked = selected.some((item) => item.name === extra.name);
          const Icon = iconMap[extra.name] ?? Navigation;
          return (
            <label key={extra.name} className={`rounded-lg border p-3 text-sm transition-colors ${checked ? 'border-brand-red bg-brand-red/5' : 'border-border'}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="inline-flex items-center gap-2 font-medium"><Icon className="h-4 w-4" /> {extra.name}</p>
                  <p className="text-xs text-muted-foreground">+${extra.price}/day</p>
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) onChange([...selected, extra]);
                    else onChange(selected.filter((item) => item.name !== extra.name));
                  }}
                />
              </div>
            </label>
          );
        })}
      </div>
      <p className="text-sm font-semibold">Extras total/day: ${total.toFixed(2)}</p>
    </div>
  );
}
