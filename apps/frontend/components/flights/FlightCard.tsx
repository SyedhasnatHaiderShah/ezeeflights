'use client';

import { useRouter } from 'next/navigation';
import { useBookingFlowStore } from '@/lib/store/booking-flow-store';

interface Props {
  id: string;
  airline: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureAt: string;
  arrivalAt: string;
  baseFare: number;
  currency: string;
}

export function FlightCard(props: Props) {
  const router = useRouter();
  const setFlights = useBookingFlowStore((state) => state.setFlights);

  return (
    <article className="rounded border p-4">
      <h3 className="font-semibold">{props.airline} {props.flightNumber}</h3>
      <p>{props.departureAirport} → {props.arrivalAirport}</p>
      <p>{new Date(props.departureAt).toLocaleString()} - {new Date(props.arrivalAt).toLocaleString()}</p>
      <p className="font-bold">{props.currency} {props.baseFare.toFixed(2)}</p>
      <button
        className="mt-2 rounded bg-blue-600 px-3 py-1 text-white"
        onClick={() => {
          setFlights([props.id]);
          router.push('/flights/booking');
        }}
      >
        Select
      </button>
    </article>
  );
}
