import Link from 'next/link';
import { DestinationHero } from '@/components/destinations/DestinationHero';
import { listDestinations } from '@/lib/api/destinations-api';

export const revalidate = 3600;

export default async function DestinationsPage() {
  const countries = await listDestinations();

  return (
    <section className="space-y-6">
      <DestinationHero title="Explore destinations" subtitle="Countries, cities, attractions, and AI-guided travel planning." />
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {countries.map((country: any) => (
          <li className="rounded-xl border bg-white p-4" key={country.id}>
            <p className="font-semibold">{country.name}</p>
            <p className="text-sm text-slate-600">ISO: {country.code}</p>
            <Link href={`/destinations/${country.code.toLowerCase()}`} className="mt-3 inline-block text-sm font-medium text-blue-600">View cities</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
