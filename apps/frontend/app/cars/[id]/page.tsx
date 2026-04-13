'use client';

import { CarBookingConfirmation } from '@/components/cars/CarBookingConfirmation';
import { CarExtrasSelector } from '@/components/cars/CarExtrasSelector';
import { createCarBooking, getCarById } from '@/lib/api/cars';
import { useEffect, useMemo, useState } from 'react';

const EXTRA_OPTIONS = [
  { name: 'GPS', price: 5 },
  { name: 'Child seat', price: 7 },
  { name: 'Additional driver', price: 9 },
];

export default function CarDetailsPage({ params }: { params: { id: string } }) {
  const [car, setCar] = useState<any>(null);
  const [extras, setExtras] = useState<Array<{ name: string; price: number }>>([]);
  const [confirmationCode, setConfirmationCode] = useState('');

  useEffect(() => {
    getCarById(params.id).then(setCar);
  }, [params.id]);

  const extrasTotal = useMemo(() => extras.reduce((sum, item) => sum + item.price, 0), [extras]);

  if (!car) return <p>Loading...</p>;

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{car.make + ' ' + car.model}</h1>
        <div className="grid grid-cols-2 gap-2">
          {(car.images?.length ? car.images : ['/placeholder-car.jpg']).map((image: string, index: number) => (
            <img key={image + index} src={image} alt="Car" className="h-40 w-full rounded-lg object-cover" />
          ))}
        </div>
        <div className="rounded-xl border p-4 text-sm">
          <p>
            {car.seats} seats · {car.doors} doors · {car.transmission} · {car.fuelType} · AC {car.airConditioning ? 'Yes' : 'No'}
          </p>
          <p className="mt-2">Included: Basic insurance. Excluded: Fuel, tolls, traffic fines.</p>
        </div>
        <CarExtrasSelector extras={EXTRA_OPTIONS} selected={extras} onChange={setExtras} />
      </div>
      <aside className="space-y-3 rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Booking summary</h2>
        <p>
          {car.currency} {car.pricePerDay}/day + extras ${extrasTotal.toFixed(2)}/day
        </p>
        <button
          className="w-full rounded bg-slate-900 px-3 py-2 text-white"
          onClick={async () => {
            const now = new Date();
            const nextDay = new Date(now.getTime() + 86400000);
            const booking = await createCarBooking({
              carId: car.id,
              pickupLocationId: car.locationId,
              dropoffLocationId: car.locationId,
              pickupDatetime: now.toISOString(),
              dropoffDatetime: nextDay.toISOString(),
              insuranceType: 'basic',
              extras,
              driverName: 'John Doe',
              driverLicenseNumber: 'DL-12345',
              driverNationality: 'US',
            });
            setConfirmationCode(booking.confirmationCode ?? 'CAR-PENDING');
          }}
        >
          Book now
        </button>
        {confirmationCode ? <CarBookingConfirmation confirmationCode={confirmationCode} /> : null}
      </aside>
    </section>
  );
}
