import Link from 'next/link';

const vehicleIcons: Record<string, string> = {
  sedan: '🚘',
  suv: '🚙',
  minivan: '🚐',
  bus: '🚌',
  luxury_sedan: '🏎️',
  luxury_suv: '🚙',
};

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
  return (
    <article className="rounded border bg-white p-4">
      <h3 className="font-semibold">
        {vehicleIcons[transfer.vehicleType] ?? '🚗'} {transfer.vehicleType.replace('_', ' ')} · {transfer.transferType}
      </h3>
      <p>Up to {transfer.maxPassengers} passengers</p>
      <p>Up to {transfer.maxLuggage} luggage</p>
      <p>{transfer.freeWaitingMinutes} min free waiting</p>
      {transfer.includesMeetAndGreet && (
        <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">Meet & greet included</span>
      )}
      <p className="mt-2 text-lg font-bold">
        {transfer.currency} {transfer.price}
      </p>
      <Link href={`/transfers/${transfer.id}?${queryString}`} className="mt-3 inline-block rounded bg-blue-600 px-3 py-2 text-sm text-white">
        View details
      </Link>
    </article>
  );
}
