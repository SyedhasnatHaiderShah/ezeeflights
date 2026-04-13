import { getMyCarBookings } from '@/lib/api/cars';

export default async function CarBookingsPage() {
  const bookings = await getMyCarBookings();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">My Car Bookings</h1>
      <div className="space-y-3">
        {bookings.map((booking) => (
          <article key={booking.id} className="rounded-xl border bg-white p-4">
            <p className="font-semibold">{booking.confirmationCode ?? booking.id}</p>
            <p className="text-sm text-slate-600">
              {new Date(booking.pickupDatetime).toLocaleString()} → {new Date(booking.dropoffDatetime).toLocaleString()}
            </p>
            <p className="text-sm">
              {booking.currency} {booking.totalPrice} · {booking.status}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
