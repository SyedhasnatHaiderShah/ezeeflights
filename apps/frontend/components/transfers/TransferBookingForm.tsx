'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetchAuth } from '@/lib/api/client';

interface Props {
  vehicleId: string;
  pickupDatetime?: string;
  passengerCount?: number;
  direction?: string;
}

export function TransferBookingForm({ vehicleId, pickupDatetime = '', passengerCount = 1, direction = 'airport_to_hotel' }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    direction,
    flightNumber: '',
    flightArrivalDatetime: pickupDatetime,
    pickupDatetime,
    pickupAddress: '',
    dropoffAddress: '',
    passengerCount,
    luggageCount: 1,
    passengerName: '',
    passengerPhone: '',
    passengerEmail: '',
    meetAndGreet: false,
    specialRequests: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <form
      className="space-y-3 rounded border bg-white p-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
          await apiFetchAuth('/transfers/bookings', {
            method: 'POST',
            body: JSON.stringify({ vehicleId, ...form }),
          });
          router.push('/transfers/bookings');
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="rounded border p-2" placeholder="Passenger full name" value={form.passengerName} onChange={(e) => setForm({ ...form, passengerName: e.target.value })} required />
        <input className="rounded border p-2" placeholder="Passenger phone" value={form.passengerPhone} onChange={(e) => setForm({ ...form, passengerPhone: e.target.value })} required />
        <input className="rounded border p-2" placeholder="Passenger email" type="email" value={form.passengerEmail} onChange={(e) => setForm({ ...form, passengerEmail: e.target.value })} />
        <input className="rounded border p-2" placeholder="Flight number (optional)" value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} />
        <input className="rounded border p-2" type="datetime-local" value={form.pickupDatetime.slice(0, 16)} onChange={(e) => setForm({ ...form, pickupDatetime: e.target.value })} required />
        <input className="rounded border p-2" type="datetime-local" value={form.flightArrivalDatetime.slice(0, 16)} onChange={(e) => setForm({ ...form, flightArrivalDatetime: e.target.value })} />
        <input className="rounded border p-2" placeholder="Pickup address" value={form.pickupAddress} onChange={(e) => setForm({ ...form, pickupAddress: e.target.value })} required />
        <input className="rounded border p-2" placeholder="Drop-off address" value={form.dropoffAddress} onChange={(e) => setForm({ ...form, dropoffAddress: e.target.value })} required />
        <input
          className="rounded border p-2"
          type="number"
          min={1}
          max={20}
          value={form.passengerCount}
          onChange={(e) => setForm({ ...form, passengerCount: Number(e.target.value) })}
          required
        />
        <input
          className="rounded border p-2"
          type="number"
          min={0}
          max={20}
          value={form.luggageCount}
          onChange={(e) => setForm({ ...form, luggageCount: Number(e.target.value) })}
          required
        />
      </div>
      <textarea
        className="w-full rounded border p-2"
        placeholder="Special requests"
        value={form.specialRequests}
        onChange={(e) => setForm({ ...form, specialRequests: e.target.value })}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.meetAndGreet} onChange={(e) => setForm({ ...form, meetAndGreet: e.target.checked })} />
        Meet and greet required
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={isSubmitting} className="rounded bg-emerald-600 px-4 py-2 text-white disabled:opacity-60">
        {isSubmitting ? 'Booking...' : 'Book Transfer'}
      </button>
    </form>
  );
}
