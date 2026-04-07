'use client';

import { useRouter } from 'next/navigation';
import { GuestForm } from '@/components/hotels/GuestForm';
import { apiFetchAuth } from '@/lib/api/client';
import { useHotelBookingFlowStore } from '@/lib/store/hotel-booking-flow-store';

export default function HotelBookingPage() {
  const router = useRouter();
  const store = useHotelBookingFlowStore();
  const roomIds = store.selectedRooms.map((room) => room.roomId);

  const nights = Math.max(
    1,
    Math.ceil((new Date(store.checkOutDate).getTime() - new Date(store.checkInDate).getTime()) / (24 * 60 * 60 * 1000)),
  );
  const total = store.selectedRooms.reduce((acc, room) => acc + room.pricePerNight * room.quantity * nights, 0);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Guest Details</h1>
      <p>Estimated total: {total.toFixed(2)}</p>
      <GuestForm
        roomIds={roomIds}
        onSubmit={async (guests) => {
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
        }}
      />
    </section>
  );
}
