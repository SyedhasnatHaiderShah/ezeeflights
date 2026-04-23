'use client';

import { User, CreditCard, ShieldCheck } from 'lucide-react';

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
    <div className="space-y-6">
      {passengers.map((passenger, index) => (
        <div key={index} className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/5 p-6 backdrop-blur-xl shadow-xl transition-all hover:border-brand-red/30">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-brand-red to-brand-yellow opacity-70" />
          
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-red text-xs">P{index + 1}</span>
              Passenger Details
            </h3>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-wider text-white/60 backdrop-blur">
              {passenger.type}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Full Name (As per passport)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-brand-red/50 focus:bg-white/10 transition-all"
                  placeholder="e.g. John Doe"
                  value={passenger.fullName}
                  onChange={(e) => updatePassenger(index, 'fullName', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Passport Number</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-brand-red/50 focus:bg-white/10 transition-all"
                  placeholder="e.g. A1234567"
                  value={passenger.passportNumber}
                  onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Passenger Type</label>
              <select
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 px-4 text-sm text-white outline-none focus:border-brand-red/50 focus:bg-white/10 transition-all"
                value={passenger.type}
                onChange={(e) => updatePassenger(index, 'type', e.target.value)}
              >
                <option value="ADULT" className="bg-slate-900 text-white">ADULT</option>
                <option value="CHILD" className="bg-slate-900 text-white">CHILD</option>
                <option value="INFANT" className="bg-slate-900 text-white">INFANT</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">Preferred Seat (Optional)</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-brand-red/50 focus:bg-white/10 transition-all"
                  placeholder="e.g. 12A"
                  value={passenger.seatNumber}
                  onChange={(e) => updatePassenger(index, 'seatNumber', e.target.value.toUpperCase())}
                />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
