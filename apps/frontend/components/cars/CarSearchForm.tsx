'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LocationSelector } from '../ui/LocationSelector';

export function CarSearchForm() {
  const router = useRouter();
  const [pickupLocation, setPickupLocation] = useState('11111111-1111-1111-1111-111111111111');
  const [dropoffLocation, setDropoffLocation] = useState('11111111-1111-1111-1111-111111111111');
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().slice(0, 10));
  const [dropoffDate, setDropoffDate] = useState(new Date(Date.now() + 86400000).toISOString().slice(0, 10));
  const [category, setCategory] = useState('economy');

  return (
    <form
      className="grid gap-3 rounded-xl bg-white p-4 shadow sm:grid-cols-5"
      onSubmit={(e) => {
        e.preventDefault();
        const query = new URLSearchParams({
          pickup_location: pickupLocation,
          dropoff_location: dropoffLocation,
          pickup_date: pickupDate,
          dropoff_date: dropoffDate,
          category,
        });
        router.push(`/cars?${query.toString()}`);
      }}
    >
      <LocationSelector value={pickupLocation} onChange={(id) => setPickupLocation(id)} endpoint="/cars/locations" placeholder="Pickup location" />
      <LocationSelector value={dropoffLocation} onChange={(id) => setDropoffLocation(id)} endpoint="/cars/locations" placeholder="Dropoff location" />
      <input className="rounded border p-2" type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} required />
      <input className="rounded border p-2" type="date" value={dropoffDate} onChange={(e) => setDropoffDate(e.target.value)} required />
      <select className="rounded border p-2" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="economy">Economy</option>
        <option value="compact">Compact</option>
        <option value="suv">SUV</option>
        <option value="luxury">Luxury</option>
        <option value="electric">Electric</option>
        <option value="minivan">Minivan</option>
      </select>
      <button className="rounded bg-slate-900 px-3 py-2 text-white sm:col-span-5" type="submit">
        Search Cars
      </button>
    </form>
  );
}
