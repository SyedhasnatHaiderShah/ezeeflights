'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useSearchStore } from '@/lib/store/search-store';
import { FlightCard } from '@/components/presentational/flight-card';
import { BookingSearchForm } from '@/components/search/BookingSearchForm';

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

  const [formOrigin, setFormOrigin] = useState(origin);
  const [formDestination, setFormDestination] = useState(destination);
  const [departDate, setDepartDate] = useState<Date | undefined>(date ? new Date(date) : new Date());
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [cabinClass, setCabinClass] = useState('Economy');
  const [tripType, setTripType] = useState('round-trip');
  const [searchCriteria, setSearchCriteria] = useState({
    origin,
    destination,
    date,
  });

  const handlePassengerChange = (key: string, val: number) => {
    setPassengers((prev) => ({ ...prev, [key]: val }));
  };

  const handleSearch = () => {
    const formattedDate = departDate ? departDate.toISOString().slice(0, 10) : '';
    const formattedOrigin = formOrigin.trim().toUpperCase();
    const formattedDestination = formDestination.trim().toUpperCase();

    setField('origin', formattedOrigin);
    setField('destination', formattedDestination);
    setField('date', formattedDate);

    setSearchCriteria({
      origin: formattedOrigin,
      destination: formattedDestination,
      date: formattedDate,
    });
  };

  const query = useQuery({
    queryKey: ['flights', searchCriteria.origin, searchCriteria.destination, searchCriteria.date],
    queryFn: () =>
      apiFetch<Flight[]>(
        `/flights/search?origin=${searchCriteria.origin}&destination=${searchCriteria.destination}&departureDate=${searchCriteria.date}&page=1&limit=20`,
      ),
    enabled: Boolean(searchCriteria.origin && searchCriteria.destination && searchCriteria.date),
  });

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border/70 bg-card p-3 shadow-sm md:p-4">
        <BookingSearchForm
          variant="flight"
          origin={formOrigin}
          setOrigin={setFormOrigin}
          destination={formDestination}
          setDestination={setFormDestination}
          departDate={departDate}
          setDepartDate={setDepartDate}
          returnDate={returnDate}
          setReturnDate={setReturnDate}
          passengers={passengers}
          handlePassengerChange={handlePassengerChange}
          cabinClass={cabinClass}
          setCabinClass={setCabinClass}
          tripType={tripType}
          setTripType={setTripType}
          handleSearch={handleSearch}
        />
      </div>

      {query.isLoading && <p>Loading flights...</p>}
      {query.isError && <p className="text-red-600">Failed to load flights: {(query.error as Error).message}</p>}
      {!query.isLoading && !query.isError && (query.data?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">No flights found for this route and date. Try nearby airports or another date.</p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {query.data?.map((flight) => (
          <FlightCard key={flight.id} {...flight} />
        ))}
      </div>
    </section>
  );
}
