import Link from 'next/link';
import { DestinationHero } from '@/components/destinations/DestinationHero';
import { getCountry } from '@/lib/api/destinations-api';

export default async function CountryLandingPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const data: any = await getCountry(country);

  return (
    <section className="space-y-6">
      <DestinationHero title={data.name} subtitle={data.description ?? 'Discover top cities and attractions.'} image={data.heroImage} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {data.cities.map((city: any) => (
          <Link key={city.id} href={`/cities/${city.slug}`} className="rounded-xl border bg-white p-4">
            <p className="font-semibold">{city.name}</p>
            <p className="text-sm text-slate-600">{city.description ?? 'Explore attractions and events.'}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
