'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useSearchStore } from '@/lib/store/search-store';
import { FlightCard } from '@/components/presentational/flight-card';

interface Flight {
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

export function FlightsSearchContainer() {
  const { origin, destination, date, setField } = useSearchStore();

  const query = useQuery({
    queryKey: ['flights', origin, destination, date],
    queryFn: () =>
      apiFetch<Flight[]>(
        `/flights/search?origin=${origin}&destination=${destination}&departureDate=${date}&page=1&limit=20`,
      ),
  });

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow sm:grid-cols-3">
        <input
          className="rounded border p-2"
          value={origin}
          onChange={(e) => setField('origin', e.target.value.toUpperCase())}
          placeholder="Origin (IATA)"
        />
        <input
          className="rounded border p-2"
          value={destination}
          onChange={(e) => setField('destination', e.target.value.toUpperCase())}
          placeholder="Destination (IATA)"
        />
        <input className="rounded border p-2" type="date" value={date} onChange={(e) => setField('date', e.target.value)} />
      </div>

      {query.isLoading && <p>Loading flights...</p>}
      {query.isError && <p className="text-red-600">Failed to load flights: {(query.error as Error).message}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {query.data?.map((flight) => (
          <FlightCard key={flight.id} {...flight} />
        ))}
      </div>
    </section>
  );
}
