'use client';

import { cn } from '@/lib/utils';

export type TripTab = 'all' | 'flight' | 'hotel' | 'package' | 'car' | 'transfer';

interface Props {
  active: TripTab;
  onChange: (tab: TripTab) => void;
  counts: Record<TripTab, number>;
}

const tabs: Array<{ key: TripTab; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'flight', label: 'Flights' },
  { key: 'hotel', label: 'Hotels' },
  { key: 'package', label: 'Packages' },
  { key: 'car', label: 'Cars' },
  { key: 'transfer', label: 'Transfers' },
];

export function TripTabs({ active, onChange, counts }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={cn(
            'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm whitespace-nowrap',
            active === tab.key ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600',
          )}
        >
          {tab.label}
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{counts[tab.key] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}
