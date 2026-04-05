'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';

interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  starRating: number;
  nightlyRate: number;
  currency: string;
}

export default function HotelsPage() {
  const [city, setCity] = useState('Dubai');

  const query = useQuery({
    queryKey: ['hotels', city],
    queryFn: () => apiFetch<Hotel[]>(`/hotel/search?city=${encodeURIComponent(city)}&page=1&limit=20`),
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Hotel Search</h1>
      <input className="rounded border p-2" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />

      {query.isLoading && <p>Loading hotels...</p>}
      {query.data?.map((hotel) => (
        <article className="rounded border bg-white p-4" key={hotel.id}>
          <p className="font-semibold">{hotel.name}</p>
          <p>
            {hotel.city}, {hotel.country}
          </p>
          <p>
            {hotel.starRating}★ · {hotel.currency} {hotel.nightlyRate}
          </p>
        </article>
      ))}
    </section>
  );
}
