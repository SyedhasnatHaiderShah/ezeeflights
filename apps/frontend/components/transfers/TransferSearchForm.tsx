'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function TransferSearchForm() {
  const router = useRouter();
  const [originIata, setOriginIata] = useState('DXB');
  const [destinationCity, setDestinationCity] = useState('Dubai');
  const [pickupDatetime, setPickupDatetime] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16));
  const [passengerCount, setPassengerCount] = useState(2);

  return (
    <form
      className="grid gap-3 rounded-xl bg-white p-4 shadow sm:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams({
          originIata: originIata.toUpperCase(),
          destinationCity,
          pickupDatetime,
          passengerCount: String(passengerCount),
          direction: 'airport_to_hotel',
        });
        router.push(`/transfers?${params.toString()}`);
      }}
    >
      <input className="rounded border p-2 uppercase" value={originIata} onChange={(e) => setOriginIata(e.target.value)} maxLength={3} required />
      <input className="rounded border p-2" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} placeholder="Destination city" required />
      <input className="rounded border p-2" type="datetime-local" value={pickupDatetime} onChange={(e) => setPickupDatetime(e.target.value)} required />
      <input
        className="rounded border p-2"
        type="number"
        min={1}
        max={20}
        value={passengerCount}
        onChange={(e) => setPassengerCount(Number(e.target.value))}
        required
      />
      <button className="rounded bg-slate-900 px-3 py-2 text-white" type="submit">
        Search Transfers
      </button>
    </form>
  );
}
