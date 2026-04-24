'use client';

import { User, CreditCard, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
        <Card key={index} className="overflow-hidden rounded-2xl border-border bg-card shadow-md transition-all hover:border-redmix/30">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-redmix/10 text-redmix text-[10px] font-black">0{index + 1}</span>
                Traveler Information
              </h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                {passenger.type}
              </span>
            </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  className="w-full h-11 rounded-xl border border-border bg-background/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-redmix/50 focus:ring-1 focus:ring-redmix/10 transition-all"
                  placeholder="As shown on passport"
                  value={passenger.fullName}
                  onChange={(e) => updatePassenger(index, 'fullName', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">Passport Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  className="w-full h-11 rounded-xl border border-border bg-background/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-redmix/50 focus:ring-1 focus:ring-redmix/10 transition-all"
                  placeholder="Passport ID"
                  value={passenger.passportNumber}
                  onChange={(e) => updatePassenger(index, 'passportNumber', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">Category</Label>
              <Select
                value={passenger.type}
                onValueChange={(v) => updatePassenger(index, 'type', v as any)}
              >
                <SelectTrigger className="h-11 bg-background/50 border-border focus:ring-redmix/10 focus:border-redmix/50 rounded-xl">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADULT">Adult (12+)</SelectItem>
                  <SelectItem value="CHILD">Child (2-11)</SelectItem>
                  <SelectItem value="INFANT">Infant (Under 2)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70">Seat Preference</Label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/50" />
                <input
                  className="w-full h-11 rounded-xl border border-border bg-background/50 py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground/30 outline-none focus:border-redmix/50 focus:ring-1 focus:ring-redmix/10 transition-all"
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
