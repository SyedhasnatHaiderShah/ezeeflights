import Link from 'next/link';
import { getTripById } from '@/lib/api/trips';
import { DocumentDownloadButton } from '@/components/trips/DocumentDownloadButton';
import { TripTimeline } from '@/components/trips/TripTimeline';
import { CancellationModal } from '@/components/trips/CancellationModal';

export default async function TripDetailPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const trip = await getTripById(bookingId);

  const shareText = encodeURIComponent(`Booking ${trip.confirmationCode}\n${trip.title}\nStatus: ${trip.status}\nTotal: ${trip.currency} ${trip.total.toFixed(2)}`);

  return (
    <section className="space-y-6">
      <Link href="/my-trips" className="text-sm text-muted-foreground">← Back to My Trips</Link>

      <header className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize">{trip.status}</span>
            <h1 className="mt-2 text-2xl font-bold">{trip.title}</h1>
            <p className="text-sm text-slate-500">Booking ref: <span className="font-medium text-slate-900">{trip.confirmationCode}</span></p>
          </div>
          <div className="flex gap-2 text-sm">
            <button onClick={() => navigator.clipboard.writeText(trip.confirmationCode)} className="rounded-lg border px-3 py-2">Copy ref</button>
            <a href={`https://wa.me/?text=${shareText}`} target="_blank" className="rounded-lg border px-3 py-2">Share</a>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div className="flex gap-2 border-b pb-2 text-sm">
            {['Details','Passengers','Documents','Support'].map((t) => <span key={t} className="rounded-full bg-muted px-3 py-1">{t}</span>)}
          </div>

          {trip.flight && (
            <section className="rounded-xl border bg-white p-4">
              <h2 className="mb-3 text-lg font-semibold">Details</h2>
              <p>{trip.flight.origin} → {trip.flight.destination}</p>
              <p className="text-sm text-slate-600">PNR: {trip.flight.pnr}</p>
              <TripTimeline items={trip.flight.timeline} />
            </section>
          )}

          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Passengers</h2>
            {trip.passengers.map((passenger) => <p key={`${passenger.fullName}-${passenger.type}`} className="text-sm text-slate-600">{passenger.fullName} · {passenger.type}</p>)}
          </section>

          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-lg font-semibold">Documents</h2>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border p-3"><DocumentDownloadButton bookingId={trip.id} docType="ticket" label="E-ticket" /></div>
              <div className="rounded-lg border p-3"><DocumentDownloadButton bookingId={trip.id} docType="voucher" label="Invoice" /></div>
              <div className="rounded-lg border p-3"><DocumentDownloadButton bookingId={trip.id} docType="insurance" label="Voucher" /></div>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-2 text-lg font-semibold">Need help?</h2>
            <p className="text-sm text-slate-600">Have an issue with this booking?</p>
            <Link href="/support/tickets/new" className="text-sm text-redmix underline">Open support ticket</Link>
          </section>
          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-2 text-lg font-semibold">Modification & cancellation</h2>
            <p className="text-sm text-slate-600">{trip.policy.cancellationWindow}</p>
            <div className="mt-3"><CancellationModal bookingId={trip.id} canCancel={trip.policy.canCancel} refundEstimate={trip.policy.refundEstimate} /></div>
          </section>
        </aside>
      </div>
    </section>
  );
}
