import { TransferCard } from '@/components/transfers/TransferCard';
import { TransferSearchForm } from '@/components/transfers/TransferSearchForm';
import { internalV1Url } from '@/lib/bff/config';

interface TransferVehicle {
  id: string;
  vehicleType: string;
  transferType: string;
  maxPassengers: number;
  maxLuggage: number;
  price: number;
  currency: string;
  includesMeetAndGreet: boolean;
  freeWaitingMinutes: number;
}

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: { originIata?: string; destinationCity?: string; pickupDatetime?: string; passengerCount?: string; direction?: string };
}) {
  const query = new URLSearchParams({
    originIata: searchParams.originIata ?? 'DXB',
    destinationCity: searchParams.destinationCity ?? 'Dubai',
    pickupDatetime: searchParams.pickupDatetime ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    passengerCount: searchParams.passengerCount ?? '2',
    direction: searchParams.direction ?? 'airport_to_hotel',
  });

  const response = await fetch(internalV1Url(`transfers/search?${query.toString()}`), { cache: 'no-store' });
  const transfers = (await response.json()) as TransferVehicle[];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Airport Transfers</h1>
      <TransferSearchForm />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {transfers.map((transfer) => (
          <TransferCard key={transfer.id} transfer={transfer} queryString={query.toString()} />
        ))}
      </div>
    </section>
  );
}
