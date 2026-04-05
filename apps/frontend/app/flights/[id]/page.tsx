import { apiFetch } from '@/lib/api/client';

interface FlightDetail {
  id: string;
  airlineCode: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureAt: string;
  arrivalAt: string;
  baseFare: number;
  currency: string;
}

export default async function FlightDetailPage({ params }: { params: { id: string } }) {
  const flight = await apiFetch<FlightDetail>(`/flights/${params.id}`, {
    headers: {
      Authorization: `Bearer demo-token`,
    },
    cache: 'no-store',
  });

  return (
    <article className="space-y-2 rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">{flight.airlineCode} {flight.flightNumber}</h1>
      <p>{flight.departureAirport} → {flight.arrivalAirport}</p>
      <p>{new Date(flight.departureAt).toLocaleString()} - {new Date(flight.arrivalAt).toLocaleString()}</p>
      <p className="text-xl font-semibold">{flight.currency} {flight.baseFare.toFixed(2)}</p>
    </article>
  );
}
