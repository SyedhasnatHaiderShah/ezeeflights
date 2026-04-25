import { TransferCard } from '@/components/transfers/TransferCard';
import { Hero } from '@/components/sections/Hero';
import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/sections/Header';
import { internalV1Url } from '@/lib/bff/config';

interface TransferVehicle {
  id: string;
  vehicleType: string;
  transferType: string;
  maxPassengers: number;
  maxLuggage: number;
  price: number;
  currency: string;
  includesMeetAndGreet: boolean;
  freeWaitingMinutes: number;
}

export default async function TransfersPage({
  searchParams,
}: {
  searchParams: { originIata?: string; destinationCity?: string; pickupDatetime?: string; passengerCount?: string; direction?: string };
}) {
  const query = new URLSearchParams({
    originIata: searchParams.originIata ?? 'DXB',
    destinationCity: searchParams.destinationCity ?? 'Dubai',
    pickupDatetime: searchParams.pickupDatetime ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    passengerCount: searchParams.passengerCount ?? '2',
    direction: searchParams.direction ?? 'airport_to_hotel',
  });

  const response = await fetch(internalV1Url(`transfers/search?${query.toString()}`), { cache: 'no-store' });
  const transfers = (await response.json()) as TransferVehicle[];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header transparent />
      <main className="flex-1">
        <Hero
          defaultTab="transfers"
          badgeText="🚌 #1 Transfers Booking Platform"
          title={
            <>
              Reliable Airport{' '}
              <span className="bg-linear-to-r from-brand-red to-brand-yellow bg-clip-text text-transparent font-black">
                Transfers
              </span>
            </>
          }
          description="Reliable pickup, live flight tracking, and professional drivers in every city."
        />

        <section className="mx-auto w-full max-w-screen-2xl space-y-8 px-4 py-8 md:px-6 md:py-12">
          <div>
            <h2 className="mb-4 text-xl font-semibold">Transfer types</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ['Private Car', '🚘'],
                ['Shared Shuttle', '🚐'],
                ['Luxury', '🏎️'],
                ['Bus', '🚌'],
                ['Train', '🚆'],
              ].map(([label, icon]) => (
                <article key={label} className="rounded-xl border border-border/70 bg-card p-4">
                  <p className="text-2xl">{icon}</p>
                  <p className="mt-2 font-medium">{label}</p>
                </article>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Why book transfers</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {['Always-on support', 'Real-time driver tracking', 'Free waiting time', 'Secure pricing, no surprises'].map((item) => (
                <div key={item} className="rounded-xl border border-border/70 bg-card p-4 text-sm">
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-xl font-semibold">Available transfers</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {transfers.map((transfer) => (
                <TransferCard key={transfer.id} transfer={transfer} queryString={query.toString()} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
