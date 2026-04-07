import { FlightCard } from '@/components/flights/FlightCard';

interface SearchProps {
  searchParams: Record<string, string | undefined>;
}

export default async function FlightResultsPage({ searchParams }: SearchProps) {
  const query = new URLSearchParams({
    origin: searchParams.origin ?? 'DXB',
    destination: searchParams.destination ?? 'LHR',
    departureDate: searchParams.departureDate ?? new Date().toISOString().slice(0, 10),
    page: searchParams.page ?? '1',
    limit: searchParams.limit ?? '20',
  });

  const base = process.env.INTERNAL_API_BASE_URL ?? 'http://localhost:4000';
  const response = await fetch(`${base}/v1/flights/search?${query.toString()}`, { cache: 'no-store' });
  const flights = response.ok ? await response.json() : [];

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Results</h1>
      <div className="grid gap-3 md:grid-cols-2">{flights.map((flight: any) => <FlightCard key={flight.id} {...flight} />)}</div>
    </section>
  );
}
