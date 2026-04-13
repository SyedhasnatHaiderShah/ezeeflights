'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthSession } from '@/lib/hooks/use-auth-session';

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

import React from 'react';

export default function FlightDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = useAuthSession();
  const unwrappedParams = React.use(params);

  const flightQuery = useQuery({
    queryKey: ['flight-detail', unwrappedParams.id, session.data?.id],
    queryFn: () => apiFetch<FlightDetail>(`/flights/${unwrappedParams.id}`),
    enabled: Boolean(session.data),
  });

  if (session.isLoading) {
    return <p className="rounded border bg-slate-50 p-4">Checking session…</p>;
  }

  if (!session.data) {
    return <p className="rounded border bg-amber-50 p-4">Sign in required to view full flight details.</p>;
  }

  if (flightQuery.isLoading) {
    return <p>Loading flight details...</p>;
  }

  if (flightQuery.isError || !flightQuery.data) {
    return <p className="text-red-600">Failed to load flight details.</p>;
  }

  const flight = flightQuery.data;

  return (
    <article className="space-y-2 rounded-xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">
        {flight.airlineCode} {flight.flightNumber}
      </h1>
      <p>
        {flight.departureAirport} → {flight.arrivalAirport}
      </p>
      <p>
        {new Date(flight.departureAt).toLocaleString()} - {new Date(flight.arrivalAt).toLocaleString()}
      </p>
      <p className="text-xl font-semibold">
        {flight.currency} {flight.baseFare.toFixed(2)}
      </p>
    </article>
  );
}
