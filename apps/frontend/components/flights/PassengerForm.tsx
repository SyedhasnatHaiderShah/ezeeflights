'use client';

import { User, CreditCard, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Passenger {
  fullName: string;
  passportNumber: string;
  seatNumber: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
}

export function PassengerForm({ passengers, setPassengers }: { passengers: Passenger[]; setPassengers: (p: Passenger[]) => void }) {
  const updatePassenger = (index: number, field: keyof Passenger, value: string) => {
    setPassengers(passengers.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  return (
    <div className="grid gap-4">
      {passengers.map((passenger, index) => (
        <Card key={index} className="overflow-hidden rounded-2xl border-border bg-card shadow-md transition-all hover:border-brand-red/30">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-red/10 text-brand-red text-[10px] font-black">0{index + 1}</span>
                Traveler Information
              </h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {passenger.type}
              </span>
            </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  className="w-full rounded-lg border border-border bg-background/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/10 transition-all"
                  placeholder="As shown on passport"
                  value={passenger.fullName}
                  onChange={(e) => updatePassenger(index, 'fullName', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Passport Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  className="w-full rounded-lg border border-border bg-background/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/10 transition-all"
                  placeholder="Passport ID"
                  value={passenger.passportNumber}
                  onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
              <select
                className="w-full appearance-none rounded-lg border border-border bg-background/50 py-2 px-3 text-sm text-foreground outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/10 transition-all"
                value={passenger.type}
                onChange={(e) => updatePassenger(index, 'type', e.target.value as any)}
              >
                <option value="ADULT">Adult (12+)</option>
                <option value="CHILD">Child (2-11)</option>
                <option value="INFANT">Infant (Under 2)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Seat Preference</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  className="w-full rounded-lg border border-border bg-background/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-brand-red/50 focus:ring-1 focus:ring-brand-red/10 transition-all"
                  placeholder="e.g. 14A"
                  value={passenger.seatNumber}
                  onChange={(e) => updatePassenger(index, 'seatNumber', e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
