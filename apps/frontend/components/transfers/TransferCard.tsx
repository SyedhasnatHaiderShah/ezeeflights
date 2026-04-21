import Link from 'next/link';
import { Luggage, MapPinned, Timer, Users } from 'lucide-react';
import { FlightTrackingBadge } from '@/components/transfers/FlightTrackingBadge';
import { PriceTag } from '@/components/ui/price-tag';

interface TransferCardProps {
  transfer: {
    id: string;
    vehicleType: string;
    transferType: string;
    maxPassengers: number;
    maxLuggage: number;
    price: number;
    currency: string;
    includesMeetAndGreet: boolean;
    freeWaitingMinutes: number;
  };
  queryString: string;
}

export function TransferCard({ transfer, queryString }: TransferCardProps) {
  const typeLabel = transfer.transferType.toLowerCase().includes('private')
    ? 'Private'
    : transfer.transferType.toLowerCase().includes('luxury')
      ? 'Luxury'
      : 'Shared';

  return (
    <article className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={`https://images.unsplash.com/photo-1556122071-e404eaedb77f?auto=format&fit=crop&w=1000&q=80&sig=${transfer.id}`}
          alt={transfer.vehicleType}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white">{typeLabel}</span>
      </div>

      <div className="space-y-3 p-4">
        <h3 className="font-semibold capitalize">{transfer.vehicleType.replace('_', ' ')}</h3>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <p className="inline-flex items-center gap-1"><Users className="h-4 w-4" /> {transfer.maxPassengers} pax</p>
          <p className="inline-flex items-center gap-1"><Luggage className="h-4 w-4" /> {transfer.maxLuggage} bags</p>
          <p className="inline-flex items-center gap-1"><MapPinned className="h-4 w-4" /> 24 km</p>
          <p className="inline-flex items-center gap-1"><Timer className="h-4 w-4" /> ETA 35 min</p>
        </div>

        <FlightTrackingBadge />

        <div className="flex items-end justify-between border-t border-border/70 pt-3">
          <PriceTag amount={transfer.price} currency={transfer.currency} size="sm" className="gap-0" />
          <Link href={`/transfers/${transfer.id}?${queryString}`} className="rounded-lg bg-brand-red px-3 py-2 text-sm font-semibold text-white">
            Book Transfer
          </Link>
        </div>
      </div>
    </article>
  );
}
