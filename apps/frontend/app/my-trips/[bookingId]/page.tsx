import Link from 'next/link';
import { getTripById } from '@/lib/api/trips';
import { DocumentDownloadButton } from '@/components/trips/DocumentDownloadButton';
import { TripTimeline } from '@/components/trips/TripTimeline';
import { CancellationModal } from '@/components/trips/CancellationModal';

export default async function TripDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const trip = await getTripById(bookingId);

  const shareText = encodeURIComponent(
    `Booking ${trip.confirmationCode}\n${trip.title}\nStatus: ${trip.status}\nTotal: ${trip.currency} ${trip.total.toFixed(2)}`,
  );

  return (
    <section className="space-y-6">
      <header className="rounded-xl border bg-white p-4">
        <p className="text-sm text-slate-500">Confirmation #{trip.confirmationCode}</p>
        <h1 className="text-2xl font-bold">{trip.title}</h1>
        <div className="mt-2 flex items-center gap-3 text-sm">
          <span className="rounded-full bg-slate-100 px-2 py-1 capitalize">{trip.status}</span>
          <span className="font-semibold">
            {trip.currency} {trip.total.toFixed(2)}
          </span>
        </div>
      </header>

      {trip.flight && (
        <section className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Flight</h2>
          <p>
            {trip.flight.origin} → {trip.flight.destination}
          </p>
          <p className="text-sm text-slate-600">PNR: {trip.flight.pnr}</p>
          <TripTimeline items={trip.flight.timeline} />
          <div className="mt-3">
            <h3 className="font-medium">Passengers</h3>
            {trip.passengers.map((passenger) => (
              <p key={`${passenger.fullName}-${passenger.type}`} className="text-sm text-slate-600">
                {passenger.fullName} · {passenger.type} {passenger.seatNumber ? `· Seat ${passenger.seatNumber}` : ''}
              </p>
            ))}
          </div>
        </section>
      )}

      {trip.hotel && (
        <section className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-lg font-semibold">Hotel</h2>
          <p className="font-medium">{trip.hotel.propertyName}</p>
          <p className="text-sm text-slate-600">
            {trip.hotel.checkInDate} → {trip.hotel.checkOutDate}
          </p>
          <p className="text-sm text-slate-600">Room: {trip.hotel.roomType}</p>
          <a href={trip.hotel.mapUrl} target="_blank" className="text-sm text-blue-600 underline">
            {trip.hotel.address}
          </a>
        </section>
      )}

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-lg font-semibold">Documents</h2>
        <div className="flex flex-wrap gap-2">
          {trip.availableDocuments.includes('ticket') && <DocumentDownloadButton bookingId={trip.id} docType="ticket" label="Download e-Ticket" />}
          {trip.availableDocuments.includes('voucher') && <DocumentDownloadButton bookingId={trip.id} docType="voucher" label="Download hotel voucher" />}
          {trip.availableDocuments.includes('insurance') && (
            <DocumentDownloadButton bookingId={trip.id} docType="insurance" label="Download insurance policy" />
          )}
          <a href={`https://wa.me/?text=${shareText}`} target="_blank" className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            Share via WhatsApp
          </a>
          <a href={`mailto:?subject=My trip ${trip.confirmationCode}&body=${shareText}`} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            Share via Email
          </a>
        </div>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Support</h2>
        <p className="text-sm text-slate-600">Have an issue with this booking?</p>
        <Link href={`/support/tickets/new?bookingId=${trip.id}`} className="text-sm text-blue-600 underline">
          Contact support
        </Link>
      </section>

      <section className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 text-lg font-semibold">Modification & cancellation</h2>
        <p className="text-sm text-slate-600">{trip.policy.cancellationWindow}</p>
        <div className="mt-3 flex gap-2">
          <CancellationModal bookingId={trip.id} canCancel={trip.policy.canCancel} refundEstimate={trip.policy.refundEstimate} />
          {trip.policy.isModifiable && (
            <Link href={`/support/tickets/new?bookingId=${trip.id}&intent=modification`} className="rounded-lg border px-3 py-2 text-sm">
              Request modification
            </Link>
          )}
        </div>
      </section>
    </section>
  );
}
