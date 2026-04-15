'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PassengerForm } from '@/components/flights/PassengerForm';
import { AncillarySelector } from '@/components/flights/SeatMap/AncillarySelector';
import { SeatMap } from '@/components/flights/SeatMap/SeatMap';
import { apiFetch } from '@/lib/api/client';
import { useBookingFlowStore } from '@/lib/store/booking-flow-store';

const steps = ['Passenger details', 'Seats', 'Add-ons', 'Payment'];

export default function BookingPage() {
  const router = useRouter();
  const selectedFlightIds = useBookingFlowStore((state) => state.selectedFlightIds);
  const setPassengersInStore = useBookingFlowStore((state) => state.setPassengers);
  const setBookingId = useBookingFlowStore((state) => state.setBookingId);
  const setSeat = useBookingFlowStore((state) => state.setSeat);
  const selectedSeats = useBookingFlowStore((state) => state.selectedSeats);
  const ancillaries = useBookingFlowStore((state) => state.ancillaries);
  const setAncillaries = useBookingFlowStore((state) => state.setAncillaries);

  const [passengers, setPassengers] = useState([{ fullName: '', passportNumber: '', seatNumber: '1A', type: 'ADULT' as const }]);
  const [bookingIdState, setBookingIdState] = useState<string>('');
  const [step, setStep] = useState(0);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const [seatMap, setSeatMap] = useState<any | null>(null);
  const [ancillaryOptions, setAncillaryOptions] = useState<any[]>([]);
  const [error, setError] = useState('');

  const firstFlight = selectedFlightIds[0];
  const seatTotal = useMemo(() => Object.values(selectedSeats).reduce((sum, v) => sum + v.price, 0), [selectedSeats]);

  useEffect(() => {
    if (selectedFlightIds.length === 0) {
      router.replace('/flights/search');
    }
  }, [router, selectedFlightIds.length]);

  useEffect(() => {
    const listener = (event: BeforeUnloadEvent) => {
      if (step > 0 && step < 3) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', listener);
    return () => window.removeEventListener('beforeunload', listener);
  }, [step]);

  const nextFromPassengers = async () => {
    setPassengersInStore(passengers);
    const booking = await apiFetch<{ id: string }>('/bookings', {
      method: 'POST',
      body: JSON.stringify({ flightIds: selectedFlightIds, passengers, paymentStatus: 'PENDING' }),
    });

    setBookingId(booking.id);
    setBookingIdState(booking.id);
    const map = await apiFetch<any>(`/flights/${firstFlight}/seat-map`);
    setSeatMap(map);
    setStep(1);
  };

  const reserveSeats = async () => {
    if (passengers.some((_, idx) => !selectedSeats[idx]?.seatCode)) {
      throw new Error('Select seats for all passengers before continuing.');
    }
    for (const [passengerIndex, seat] of Object.entries(selectedSeats)) {
      const m = /^([0-9]+)([A-Z])$/.exec(seat.seatCode);
      if (!m) continue;
      await apiFetch(`/bookings/${bookingIdState}/seats`, {
        method: 'POST',
        body: JSON.stringify({ flightId: firstFlight, row: Number(m[1]), col: m[2], passengerIndex: Number(passengerIndex) }),
      });
    }

    const options = await apiFetch<any[]>(`/flights/${firstFlight}/ancillaries`);
    setAncillaryOptions(options);
    setStep(2);
  };

  const saveAncillaries = async () => {
    await apiFetch(`/bookings/${bookingIdState}/ancillaries`, {
      method: 'POST',
      body: JSON.stringify({ items: ancillaries.map((x) => ({ ancillaryId: x.ancillaryId, passengerIndex: x.passengerIndex, quantity: x.quantity })) }),
    });
    setStep(3);
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Flight booking</h1>
      <div className="flex gap-2 text-xs md:text-sm">
        {steps.map((s, i) => <div key={s} className={`rounded px-2 py-1 ${step === i ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>Step {i + 2}: {s}</div>)}
      </div>

      {step === 0 && <PassengerForm passengers={passengers} setPassengers={setPassengers} />}
      {step === 1 && seatMap && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {passengers.map((p, i) => (
              <button
                key={`${p.fullName}-${i}`}
                type="button"
                onClick={() => setActivePassengerIndex(i)}
                className={`rounded border px-3 py-1 text-sm ${activePassengerIndex === i ? 'bg-slate-900 text-white' : ''}`}
              >
                Passenger {i + 1}: {p.fullName || 'Unnamed'}
              </button>
            ))}
          </div>
          <SeatMap
            seatMapData={seatMap.seatMapData}
            selectedSeat={selectedSeats[activePassengerIndex]?.seatCode}
            passengerIndex={activePassengerIndex}
            onSelect={(code, price) => setSeat(activePassengerIndex, code, price)}
          />
        </div>
      )}
      {step === 2 && (
        <AncillarySelector
          passengers={passengers.length}
          options={ancillaryOptions}
          selected={ancillaries}
          onChange={setAncillaries}
        />
      )}
      {step === 3 && (
        <div className="space-y-2 rounded border p-4">
          <p>Seats total: ${seatTotal.toFixed(2)}</p>
          <p>Add-ons selected: {ancillaries.length}</p>
          <button className="rounded bg-emerald-600 px-4 py-2 text-white" onClick={() => router.push('/payment/checkout')}>Continue to Payment</button>
        </div>
      )}

      {error && <p className="text-red-600">{error}</p>}

      {step === 0 && <button className="rounded bg-emerald-600 px-4 py-2 text-white" onClick={() => nextFromPassengers().catch((e) => setError((e as Error).message))}>Continue to Seats</button>}
      {step === 1 && <button className="rounded bg-emerald-600 px-4 py-2 text-white" onClick={() => reserveSeats().catch((e) => setError((e as Error).message))}>Continue to Add-ons</button>}
      {step === 2 && <button className="rounded bg-emerald-600 px-4 py-2 text-white" onClick={() => saveAncillaries().catch((e) => setError((e as Error).message))}>Review & Payment</button>}
    </section>
  );
}
