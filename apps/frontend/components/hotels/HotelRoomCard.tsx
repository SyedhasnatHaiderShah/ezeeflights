'use client';

import { BedDouble, CheckCircle2, ShieldCheck, Users, Wifi } from 'lucide-react';
import { useState } from 'react';
import { PriceTag } from '@/components/ui/price-tag';

interface Room {
  id: string;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  currency: string;
  availableRooms: number;
}

interface Props {
  room: Room;
  selectedQuantity: number;
  onChange: (room: Room, quantity: number) => void;
}

export function HotelRoomCard({ room, selectedQuantity, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-border/80 bg-card">
      <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-muted/40 flex flex-col items-center justify-center p-4 text-center gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-200/80 dark:bg-muted flex items-center justify-center text-slate-400 dark:text-muted-foreground text-sm shadow-inner">
          🛏️
        </div>
        <p className="text-xs font-bold text-slate-600 dark:text-muted-foreground leading-tight">
          No images found
        </p>
      </div>

      <div className="space-y-3 p-4">
        <h4 className="text-base font-semibold">{room.roomType}</h4>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {[{ label: 'Free Wi‑Fi', icon: Wifi }, { label: 'Sleeps up to ' + room.capacity, icon: Users }, { label: '1 King Bed', icon: BedDouble }].map((item) => (
            <span key={item.label} className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
              <item.icon className="h-3.5 w-3.5" /> {item.label}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Free cancellation</span>
          <span>{room.availableRooms} left</span>
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-border pt-3">
          <div>
            <PriceTag amount={room.pricePerNight} currency={room.currency} size="sm" className="gap-0" />
            <p className="text-xs text-muted-foreground">per night</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(room, Math.min(Math.max(selectedQuantity + 1, 1), room.availableRooms))}
            className="rounded-lg bg-brand-red px-3 py-2 text-sm font-semibold text-white"
          >
            Select Room
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm">
          Qty:
          <input
            type="number"
            min={0}
            max={room.availableRooms}
            className="w-20 rounded-md border border-border p-1"
            value={selectedQuantity}
            onChange={(e) => onChange(room, Number(e.target.value))}
          />
        </label>

        <button type="button" className="text-sm font-medium text-brand-red" onClick={() => setExpanded((prev) => !prev)}>
          {expanded ? 'Hide details' : 'Show details'}
        </button>

        {expanded && (
          <div className="space-y-2 rounded-lg border border-border/80 bg-muted/30 p-3 text-sm text-muted-foreground">
            <p className="inline-flex items-center gap-1 text-foreground"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Breakfast available on request.</p>
            <p>Room includes complimentary toiletries, daily housekeeping, and 24/7 support.</p>
          </div>
        )}
      </div>
    </article>
  );
}
