'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function HotelSearchForm() {
  const router = useRouter();
  const [city, setCity] = useState('Dubai');
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().slice(0, 10));
  const [checkOutDate, setCheckOutDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);

  return (
    <form
      className="grid gap-3 rounded-xl bg-white p-4 shadow sm:grid-cols-6"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(
          `/hotels/results?city=${encodeURIComponent(city)}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&adults=${adults}&rooms=${rooms}&page=1&limit=12`,
        );
      }}
    >
      <input className="rounded border p-2" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" required />
      <input className="rounded border p-2" type="date" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} required />
      <input className="rounded border p-2" type="date" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} required />
      <div className="flex flex-col">
        <label className="text-[10px] font-bold uppercase text-slate-400">Adults</label>
        <input className="rounded border p-2" type="number" min={1} value={adults} onChange={(e) => setAdults(parseInt(e.target.value))} required />
      </div>
      <div className="flex flex-col">
        <label className="text-[10px] font-bold uppercase text-slate-400">Rooms</label>
        <input className="rounded border p-2" type="number" min={1} value={rooms} onChange={(e) => setRooms(parseInt(e.target.value))} required />
      </div>
      <button className="rounded bg-slate-900 px-3 py-2 text-white font-bold uppercase text-xs" type="submit">
        Update
      </button>
    </form>
  );
}
