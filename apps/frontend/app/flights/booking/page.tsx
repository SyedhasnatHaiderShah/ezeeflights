'use client';

import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { PassengerForm } from '@/components/flights/PassengerForm';
import { AncillarySelector } from '@/components/flights/SeatMap/AncillarySelector';
import { SeatMap } from '@/components/flights/SeatMap/SeatMap';
import { apiFetch } from '@/lib/api/client';
import { useBookingFlowStore } from '@/lib/store/booking-flow-store';

const steps = ['Passengers', 'Seats', 'Add-ons', 'Review', 'Payment'];

export default function BookingPage() {
  const router = useRouter();
  const selectedFlightIds = useBookingFlowStore((state) => state.selectedFlightIds);
  const setPassengersInStore = useBookingFlowStore((state) => state.setPassengers);
  const setBookingId = useBookingFlowStore((state) => state.setBookingId);
  const setSeat = useBookingFlowStore((state) => state.setSeat);
  const selectedSeats = useBookingFlowStore((state) => state.selectedSeats);
  const ancillaries = useBookingFlowStore((state) => state.ancillaries);
  const setAncillaries = useBookingFlowStore((state) => state.setAncillaries);

  const [passengers, setPassengers] = useState<{ fullName: string; passportNumber: string; seatNumber: string; type: 'ADULT' | 'CHILD' | 'INFANT' }[]>([{ fullName: '', passportNumber: '', seatNumber: '1A', type: 'ADULT' }]);
  const [bookingIdState, setBookingIdState] = useState<string>('');
  const [step, setStep] = useState(0);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const [seatMap, setSeatMap] = useState<any | null>(null);
  const [ancillaryOptions, setAncillaryOptions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [flightDetails, setFlightDetails] = useState<any | null>(null);

  const firstFlight = selectedFlightIds[0];
  const seatTotal = useMemo(() => Object.values(selectedSeats).reduce((sum, v) => sum + v.price, 0), [selectedSeats]);
  const ancillaryTotal = useMemo(() => ancillaries.reduce((sum, a) => sum + a.quantity * a.unitPrice, 0), [ancillaries]);

  useEffect(() => {
    if (selectedFlightIds.length === 0) {
      router.replace('/flights/search');
      return;
    }
    apiFetch(`/flights/${selectedFlightIds[0]}`).then(setFlightDetails).catch(() => setFlightDetails(null));
  }, [router, selectedFlightIds]);

  useEffect(() => {
    const listener = (event: BeforeUnloadEvent) => {
      if (step > 0 && step < 4) {
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
    if (passengers.some((_, idx) => !selectedSeats[idx]?.seatCode)) throw new Error('Select seats for all passengers before continuing.');

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
    <section className="mx-auto max-w-[1240px] px-4 py-6 space-y-6">
      <div className="overflow-x-auto">
        <div className="relative min-w-[520px] flex items-start justify-between">
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-muted" />
          <div className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-brand-red to-red-400" style={{ width: `${(step / (steps.length - 1)) * 100}%` }} />
          {steps.map((label, i) => {
            const complete = i < step;
            const active = i === step;
            return (
              <div key={label} className="relative z-10 flex flex-col items-center gap-2 text-center">
                <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm ${complete ? 'bg-green-500 text-white border-green-500' : active ? 'bg-brand-red text-white border-brand-red shadow-lg shadow-brand-red/30' : 'border-muted text-muted-foreground bg-background'}`}>
                  {complete ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="text-xs hidden min-[480px]:block">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] items-start">
        <div className="space-y-4">
          {step === 0 && <PassengerForm passengers={passengers} setPassengers={setPassengers} />}

          {step === 1 && seatMap && (
            <div className="space-y-3 rounded-2xl border bg-card p-4">
              <div className="flex flex-wrap gap-2">
                {passengers.map((p, i) => (
                  <button key={`${p.fullName}-${i}`} type="button" onClick={() => setActivePassengerIndex(i)} className={`rounded-full border px-3 py-1 text-sm ${activePassengerIndex === i ? 'bg-brand-red text-white border-brand-red' : ''}`}>
                    P{i + 1}: {p.fullName || 'Unnamed'}
                  </button>
                ))}
              </div>
              <SeatMap seatMapData={seatMap.seatMapData} selectedSeat={selectedSeats[activePassengerIndex]?.seatCode} passengerIndex={activePassengerIndex} onSelect={(code, price) => setSeat(activePassengerIndex, code, price)} />
            </div>
          )}

          {step === 2 && <AncillarySelector passengers={passengers.length} options={ancillaryOptions} selected={ancillaries} onChange={setAncillaries} />}

          {step === 3 && (
            <div className="rounded-2xl border bg-card p-5 space-y-2">
              <h3 className="text-lg font-semibold">Review booking</h3>
              <p className="text-sm text-muted-foreground">{passengers.length} passenger(s), {Object.keys(selectedSeats).length} seat(s), {ancillaries.length} add-on(s).</p>
              <p className="text-sm">Booking ID: <span className="font-mono">{bookingIdState}</span></p>
              <button className="rounded-lg bg-brand-red px-4 py-2 text-white" onClick={() => setStep(4)}>Continue to Payment</button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-2 rounded-2xl border bg-card p-5">
              <p>Seats total: ${seatTotal.toFixed(2)}</p>
              <p>Add-ons total: ${ancillaryTotal.toFixed(2)}</p>
              <button className="rounded bg-emerald-600 px-4 py-2 text-white" onClick={() => router.push('/payment/checkout')}>Continue to Payment Gateway</button>
            </div>
          )}

          {error && <p className="text-red-600">{error}</p>}

          <div className="flex gap-2">
            {step === 0 && <button className="rounded bg-brand-red px-4 py-2 text-white" onClick={() => nextFromPassengers().catch((e) => setError((e as Error).message))}>Continue to Seats</button>}
            {step === 1 && <button className="rounded bg-brand-red px-4 py-2 text-white" onClick={() => reserveSeats().catch((e) => setError((e as Error).message))}>Continue to Add-ons</button>}
            {step === 2 && <button className="rounded bg-brand-red px-4 py-2 text-white" onClick={() => saveAncillaries().catch((e) => setError((e as Error).message))}>Review</button>}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 rounded-2xl bg-card border shadow-sm p-4 space-y-3">
          <h3 className="font-semibold">Checkout Summary</h3>
          <div className="text-sm text-muted-foreground">
            <p>{flightDetails?.origin || 'Origin'} → {flightDetails?.destination || 'Destination'}</p>
            <p>{flightDetails?.departureDate || 'Travel date TBD'}</p>
          </div>
          {flightDetails?.airlineCode && <img src={`https://www.kayak.com/rimg/provider-logos/airlines/v/${flightDetails.airlineCode}.png`} alt="airline" className="h-6 w-6" />}
          <div className="space-y-1 text-sm">
            <p className="flex justify-between"><span>Base</span><span>${Number(flightDetails?.baseFare || 0).toFixed(2)}</span></p>
            <p className="flex justify-between"><span>Taxes</span><span>${(Number(flightDetails?.baseFare || 0) * 0.12).toFixed(2)}</span></p>
            <p className="flex justify-between"><span>Ancillaries</span><span>${ancillaryTotal.toFixed(2)}</span></p>
          </div>
          <div className="rounded-lg bg-muted/60 p-2 text-xs">✓ Free cancellation (if eligible) · ✓ Secure payment</div>
          <p className="text-2xl font-bold">Total ${(Number(flightDetails?.baseFare || 0) * 1.12 + ancillaryTotal + seatTotal).toFixed(2)}</p>
        </aside>
      </div>
    </section>
  );
}
