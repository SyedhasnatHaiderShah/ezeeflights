import Link from 'next/link';

export default function HotelConfirmationPage({ searchParams }: { searchParams: { bookingId?: string } }) {
  return (
    <section className="space-y-4 rounded border bg-white p-6">
      <h1 className="text-2xl font-bold">Booking Confirmed</h1>
      <p>Your hotel booking reference: {searchParams.bookingId}</p>
      <Link href="/hotels/search" className="rounded bg-slate-900 px-3 py-2 text-white">
        Book another hotel
      </Link>
    </section>
  );
}
