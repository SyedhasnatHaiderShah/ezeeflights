import { TransferCard } from '@/components/transfers/TransferCard';
import { TransferSearchForm } from '@/components/transfers/TransferSearchForm';
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
      <Header />
      <main className="flex-1 pt-20">
        <section className="relative overflow-hidden border-b border-border/60">
          <div className="absolute inset-0 opacity-25">
            <img src="https://images.unsplash.com/photo-1483450388369-9ed95738483c?auto=format&fit=crop&w=2200&q=80" alt="Airport transfer" className="h-full w-full object-cover" />
          </div>
          <div className="relative mx-auto w-full max-w-screen-2xl px-4 py-10 md:px-6 md:py-14">
            <div className="mb-6 max-w-2xl space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Seamless Airport Transfers</h1>
              <p className="text-sm text-muted-foreground md:text-base">Reliable pickup, live flight tracking, and professional drivers in every city.</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/95 p-4 backdrop-blur">
              <TransferSearchForm />
            </div>
          </div>
        </section>

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
