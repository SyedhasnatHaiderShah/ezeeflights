'use client';

import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { GuestForm } from '@/components/hotels/GuestForm';
import { CheckoutSummary } from '@/components/payment/CheckoutSummary';
import { apiFetchAuth } from '@/lib/api/client';
import { useHotelBookingFlowStore } from '@/lib/store/hotel-booking-flow-store';

const steps = ['Guest Details', 'Add-ons', 'Payment'];

export default function HotelBookingPage() {
  const router = useRouter();
  const store = useHotelBookingFlowStore();
  const [step, setStep] = useState(0);
  const [useWallet, setUseWallet] = useState(false);
  const [guests, setGuests] = useState<Array<{ fullName: string; age: number; type: 'ADULT' | 'CHILD'; roomId: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roomIds = store.selectedRooms.map((room) => room.roomId);

  const nights = Math.max(
    1,
    Math.ceil((new Date(store.checkOutDate).getTime() - new Date(store.checkInDate).getTime()) / (24 * 60 * 60 * 1000)),
  );
  const total = useMemo(() => store.selectedRooms.reduce((acc, room) => acc + room.pricePerNight * room.quantity * nights, 0), [nights, store.selectedRooms]);

  return (
    <section className="mx-auto max-w-[1240px] space-y-6 px-4 py-6">
      <div className="overflow-x-auto">
        <div className="relative flex min-w-[420px] items-start justify-between">
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-muted" />
          <div className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-brand-red to-red-400" style={{ width: `${(step / (steps.length - 1)) * 100}%` }} />
          {steps.map((label, i) => {
            const complete = i < step;
            const active = i === step;
            return (
              <div key={label} className="relative z-10 flex flex-col items-center gap-2 text-center">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm ${complete ? 'border-green-500 bg-green-500 text-white' : active ? 'border-brand-red bg-brand-red text-white shadow-lg shadow-brand-red/30' : 'border-muted bg-background text-muted-foreground'}`}>
                  {complete ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className="text-xs">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-4 rounded-2xl border border-border/70 bg-card p-4 md:p-5">
          {step === 0 && (
            <>
              <h1 className="text-xl font-bold">Guest Details</h1>
              <GuestForm
                roomIds={roomIds}
                onSubmit={async (guestList) => {
                  setGuests(guestList);
                  setStep(1);
                }}
              />
            </>
          )}

          {step === 1 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Add-ons</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {['Breakfast included', 'Airport shuttle', 'Late checkout', 'Room upgrade alert'].map((addon) => (
                  <label key={addon} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm">
                    <input type="checkbox" /> {addon}
                  </label>
                ))}
              </div>
              <button className="rounded-lg bg-brand-red px-4 py-2 text-white" onClick={() => setStep(2)}>
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Payment</h2>
              <p className="text-sm text-muted-foreground">You will complete payment on the secure checkout page.</p>
              <button
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    const booking = await apiFetchAuth<{ id: string }>('/hotel-bookings', {
                      method: 'POST',
                      body: JSON.stringify({
                        hotelId: store.hotelId,
                        checkInDate: store.checkInDate,
                        checkOutDate: store.checkOutDate,
                        rooms: store.selectedRooms.map((room) => ({ roomId: room.roomId, quantity: room.quantity })),
                        guests,
                        paymentProvider: 'mock-gateway',
                      }),
                    });
                    store.reset();
                    router.push(`/hotels/confirmation?bookingId=${booking.id}`);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {isSubmitting ? 'Processing...' : 'Confirm & Continue'}
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-4 rounded-2xl border border-border/70 bg-card p-4 lg:sticky lg:top-24">
          <img src="https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80" alt="Hotel room" className="aspect-[4/3] w-full rounded-xl object-cover" />
          <div className="text-sm">
            <p className="font-semibold">Room summary</p>
            <p className="text-muted-foreground">{store.selectedRooms.length || 1} room(s) · {nights} night(s)</p>
          </div>
          <CheckoutSummary total={total} walletBalance={0} useWallet={useWallet} onToggleWallet={setUseWallet} />
        </aside>
      </div>
    </section>
  );
}
