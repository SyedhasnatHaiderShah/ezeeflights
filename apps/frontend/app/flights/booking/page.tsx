'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PassengerForm } from '@/components/flights/PassengerForm';
import { apiFetch } from '@/lib/api/client';
import { useBookingFlowStore } from '@/lib/store/booking-flow-store';

export default function BookingPage() {
  const router = useRouter();
  const selectedFlightIds = useBookingFlowStore((state) => state.selectedFlightIds);
  const setPassengersInStore = useBookingFlowStore((state) => state.setPassengers);
  const [passengers, setPassengers] = useState([{ fullName: '', passportNumber: '', seatNumber: '1A', type: 'ADULT' as const }]);
  const [error, setError] = useState('');

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Passenger Details</h1>
      <PassengerForm passengers={passengers} setPassengers={setPassengers} />
      {error && <p className="text-red-600">{error}</p>}
      <button
        className="rounded bg-emerald-600 px-4 py-2 text-white"
        onClick={async () => {
          try {
            setPassengersInStore(passengers);
            const booking = await apiFetch<{ id: string }>('/bookings', {
              method: 'POST',
              body: JSON.stringify({ flightIds: selectedFlightIds, passengers, paymentStatus: 'PAID' }),
            });
            router.push(`/flights/confirmation?bookingId=${booking.id}`);
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        Confirm Booking
      </button>
    </section>
  );
}
