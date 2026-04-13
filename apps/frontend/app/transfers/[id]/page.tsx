import { FlightTrackingBadge } from '@/components/transfers/FlightTrackingBadge';
import { TransferBookingForm } from '@/components/transfers/TransferBookingForm';
import { internalV1Url } from '@/lib/bff/config';

interface TransferVehicleDetails {
  id: string;
  vehicleType: string;
  transferType: string;
  maxPassengers: number;
  maxLuggage: number;
  price: number;
  currency: string;
  includesMeetAndGreet: boolean;
  includesFlightTracking: boolean;
  freeWaitingMinutes: number;
  description?: string;
  route?: {
    originIata?: string;
    originName: string;
    destinationName: string;
    destinationCity: string;
    distanceKm?: number;
    durationMinutes?: number;
  };
}

export default async function TransferDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { pickupDatetime?: string; passengerCount?: string; direction?: string };
}) {
  const response = await fetch(internalV1Url(`transfers/${params.id}`), { cache: 'no-store' });
  const vehicle = (await response.json()) as TransferVehicleDetails;

  return (
    <section className="grid gap-4 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-3">
        <h1 className="text-2xl font-bold capitalize">{vehicle.vehicleType.replace('_', ' ')}</h1>
        <p className="text-slate-700">{vehicle.description ?? 'Reliable airport transfer with professional driver.'}</p>
        <p>
          Route: {vehicle.route?.originIata} {vehicle.route?.originName} → {vehicle.route?.destinationName} ({vehicle.route?.destinationCity})
        </p>
        <p>
          Capacity: {vehicle.maxPassengers} passengers · {vehicle.maxLuggage} luggage
        </p>
        <p>
          Estimated: {vehicle.route?.durationMinutes ?? '-'} minutes · {vehicle.route?.distanceKm ?? '-'} km
        </p>
        <p className="text-xl font-bold">
          {vehicle.currency} {vehicle.price}
        </p>
        {vehicle.includesFlightTracking && <FlightTrackingBadge />}
      </div>
      <div className="lg:col-span-2">
        <h2 className="mb-2 text-lg font-semibold">Book this transfer</h2>
        <TransferBookingForm
          vehicleId={vehicle.id}
          pickupDatetime={searchParams.pickupDatetime}
          passengerCount={Number(searchParams.passengerCount ?? 1)}
          direction={searchParams.direction}
        />
      </div>
    </section>
  );
}
