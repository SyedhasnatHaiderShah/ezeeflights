'use client';

import { User, Baby, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TravelerForm({ 
  counts, 
  onChange 
}: { 
  counts: { adult: number; child: number; infant: number }; 
  onChange: (next: { adult: number; child: number; infant: number }) => void 
}) {
  const config = [
    { type: 'adult', label: 'Adults', sub: '12+ years', icon: UserCircle },
    { type: 'child', label: 'Children', sub: '2-11 years', icon: User },
    { type: 'infant', label: 'Infants', sub: 'Under 2y', icon: Baby },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {config.map(({ type, label, sub, icon: Icon }) => (
        <div 
          key={type} 
          className="relative group p-5 rounded-3xl border border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:border-brand-red/30 hover:shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-brand-red/10 transition-colors">
              <Icon className="w-5 h-5 text-muted-foreground group-hover:text-brand-red transition-colors" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">{label}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{sub}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onChange({ ...counts, [type]: Math.max(type === 'adult' ? 1 : 0, counts[type] - 1) })}
              className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted font-bold text-lg transition-all active:scale-95"
            >
              -
            </button>
            <div className="flex-1 text-center font-black text-lg">
              {counts[type]}
            </div>
            <button
              type="button"
              onClick={() => onChange({ ...counts, [type]: counts[type] + 1 })}
              className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-muted font-bold text-lg transition-all active:scale-95"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
