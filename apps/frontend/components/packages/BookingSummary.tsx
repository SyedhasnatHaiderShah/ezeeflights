import { Users, Info } from 'lucide-react';

export function BookingSummary({
  counts,
  pricing,
}: {
  counts: { adult: number; child: number; infant: number };
  pricing: { adultPrice: number; childPrice: number; infantPrice: number };
}) {
  const items = [
    { label: 'Adults', count: counts.adult, price: pricing.adultPrice },
    { label: 'Children', count: counts.child, price: pricing.childPrice },
    { label: 'Infants', count: counts.infant, price: pricing.infantPrice },
  ].filter(i => i.count > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-red/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-brand-red" />
        </div>
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Traveler Summary</h3>
      </div>
      
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between items-center group">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-foreground group-hover:text-brand-red transition-colors">{item.label}</p>
              <p className="text-[10px] font-medium text-muted-foreground">{item.count} Traveler{item.count > 1 ? 's' : ''}</p>
            </div>
            <p className="text-sm font-black text-foreground">
              <span className="text-[10px] font-bold text-muted-foreground mr-1">USD</span>
              {(item.count * item.price).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-muted/50 rounded-2xl border border-border/50 flex items-start gap-3">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5" />
        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
          Prices include all applicable taxes and mandatory fees. Infant pricing applies to children under 2 years.
        </p>
      </div>
    </div>
  );
}
