'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState('DXB');
  const [destination, setDestination] = useState('LHR');
  const [departureDate, setDepartureDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <form
      className="grid gap-3 rounded-xl bg-white p-4 shadow sm:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(
          `/flights/results?origin=${origin}&destination=${destination}&departureDate=${departureDate}&page=1&limit=20`,
        );
      }}
    >
      <input className="rounded border p-2" value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} />
      <input
        className="rounded border p-2"
        value={destination}
        onChange={(e) => setDestination(e.target.value.toUpperCase())}
      />
      <input className="rounded border p-2" type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
      <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">
        Search Flights
      </button>
    </form>
  );
}
