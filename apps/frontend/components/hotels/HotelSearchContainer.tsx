'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookingSearchForm } from '@/components/search/BookingSearchForm';

export function HotelSearchContainer() {
  const router = useRouter();
  const [city, setCity] = useState('Dubai');
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    infants: 0,
  });
  const [tripType, setTripType] = useState('round-trip');

  useEffect(() => {
    const checkIn = new Date();
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 1);
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  }, []);

  const handleGuestChange = (key: string, val: number) => {
    setGuests((prev) => ({ ...prev, [key]: val }));
  };

  const handleCabinClassChange = () => undefined;

  const handleSearch = () => {
    const normalizedCity = city.trim();

    if (!normalizedCity || !checkInDate || !checkOutDate || checkInDate >= checkOutDate) {
      return;
    }

    const params = new URLSearchParams({
      city: normalizedCity,
      checkInDate: checkInDate.toISOString().slice(0, 10),
      checkOutDate: checkOutDate.toISOString().slice(0, 10),
      page: '1',
      limit: '12',
    });

    router.push(`/hotels/results?${params.toString()}`);
  };

  return (
    <section className="space-y-3">
      <BookingSearchForm
        variant="hotel"
        labels={{
          destination: 'City or Hotel',
          search: 'Search Hotels',
        }}
        placeholders={{
          destination: 'Where are you staying?',
        }}
        origin={city}
        setOrigin={setCity}
        destination={city}
        setDestination={setCity}
        departDate={checkInDate}
        setDepartDate={setCheckInDate}
        returnDate={checkOutDate}
        setReturnDate={setCheckOutDate}
        passengers={guests}
        handlePassengerChange={handleGuestChange}
        cabinClass="Economy"
        setCabinClass={handleCabinClassChange}
        tripType={tripType}
        setTripType={setTripType}
        handleSearch={handleSearch}
      />
      {checkInDate && checkOutDate && checkInDate >= checkOutDate && (
        <p className="text-sm text-red-600">Check-out date must be after check-in date.</p>
      )}
    </section>
  );
}
