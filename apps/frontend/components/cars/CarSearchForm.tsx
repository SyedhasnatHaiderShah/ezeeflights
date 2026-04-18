'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookingSearchForm } from '@/components/search/BookingSearchForm';
import { LocationSelector } from '../ui/LocationSelector';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function CarSearchForm() {
  const router = useRouter();
  const [pickupLabel, setPickupLabel] = useState('Pickup location');
  const [dropoffLabel, setDropoffLabel] = useState('Dropoff location');
  const [pickupLocation, setPickupLocation] = useState('11111111-1111-1111-1111-111111111111');
  const [dropoffLocation, setDropoffLocation] = useState('11111111-1111-1111-1111-111111111111');
  const [pickupDate, setPickupDate] = useState<Date | undefined>(undefined);
  const [dropoffDate, setDropoffDate] = useState<Date | undefined>(undefined);
  const [drivers, setDrivers] = useState({ adults: 1, children: 0, infants: 0 });
  const [category, setCategory] = useState('economy');
  const [tripType, setTripType] = useState('round-trip');

  useEffect(() => {
    const pickup = new Date();
    const dropoff = new Date(pickup);
    dropoff.setDate(dropoff.getDate() + 1);
    setPickupDate(pickup);
    setDropoffDate(dropoff);
  }, []);

  const handleDriverChange = (key: string, val: number) => {
    setDrivers((prev) => ({ ...prev, [key]: val }));
  };

  const handleCabinClassChange = () => undefined;

  const handleSearch = () => {
    if (!pickupDate || !dropoffDate || pickupDate >= dropoffDate) {
      return;
    }

    const query = new URLSearchParams({
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      pickup_date: pickupDate.toISOString().slice(0, 10),
      dropoff_date: dropoffDate.toISOString().slice(0, 10),
      category,
    });

    router.push(`/cars?${query.toString()}`);
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-card">
        <BookingSearchForm
          variant="car"
          labels={{
            origin: 'Pick-up',
            destination: 'Drop-off',
            depart: 'Pick-up Date',
            return: 'Drop-off Date',
            search: 'Search Cars',
          }}
          placeholders={{
            origin: 'Pick-up location',
            destination: 'Drop-off location',
          }}
          origin={pickupLabel}
          setOrigin={setPickupLabel}
          destination={dropoffLabel}
          setDestination={setDropoffLabel}
          departDate={pickupDate}
          setDepartDate={setPickupDate}
          returnDate={dropoffDate}
          setReturnDate={setDropoffDate}
          passengers={drivers}
          handlePassengerChange={handleDriverChange}
          cabinClass="Economy"
          setCabinClass={handleCabinClassChange}
          tripType={tripType}
          setTripType={setTripType}
          handleSearch={handleSearch}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3 transition-all duration-200 hover:border-brand-red/30">
        <LocationSelector
          value={pickupLocation}
          onChange={(id, label) => {
            setPickupLocation(id);
            setPickupLabel(label);
          }}
          endpoint="/cars/locations"
          placeholder="Pick-up location ID"
          className="hover:border-brand-red/40"
        />
        <LocationSelector
          value={dropoffLocation}
          onChange={(id, label) => {
            setDropoffLocation(id);
            setDropoffLabel(label);
          }}
          endpoint="/cars/locations"
          placeholder="Drop-off location ID"
          className="hover:border-brand-red/40"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="hover:border-brand-red/40">
            <SelectValue placeholder="Select car category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="economy">Economy</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="suv">SUV</SelectItem>
            <SelectItem value="luxury">Luxury</SelectItem>
            <SelectItem value="electric">Electric</SelectItem>
            <SelectItem value="minivan">Minivan</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pickupDate && dropoffDate && pickupDate >= dropoffDate && (
        <p className="text-sm text-red-600">Drop-off date must be after pick-up date.</p>
      )}
    </section>
  );
}
