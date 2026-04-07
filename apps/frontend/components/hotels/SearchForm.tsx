'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchForm() {
  const router = useRouter();
  const [city, setCity] = useState('Dubai');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().slice(0, 10));
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));

  return (
    <form
      className="grid gap-3 rounded-xl bg-white p-4 shadow sm:grid-cols-4"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(
          `/hotels/results?city=${encodeURIComponent(city)}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&page=1&limit=12`,
        );
      }}
    >
      <input className="rounded border p-2" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
      <input className="rounded border p-2" type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} required />
      <input className="rounded border p-2" type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} required />
      <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">
        Search Hotels
      </button>
    </form>
  );
}
