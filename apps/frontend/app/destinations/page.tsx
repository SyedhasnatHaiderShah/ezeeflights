import Link from 'next/link';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { GradientCard } from '@/components/ui/gradient-card';
import { listDestinations } from '@/lib/api/destinations-api';

export const revalidate = 3600;

export default async function DestinationsPage() {
  let countries: Array<{ id: string; name: string; code: string; heroImage?: string }> = [];
  try { countries = await listDestinations(); } catch {}

  return (
    <section className="space-y-8">
      <Header />
      <div className="pt-24" />
      <div className="mx-auto max-w-6xl space-y-6 px-4">
        <div className="rounded-3xl bg-gradient-to-br from-sky-50 to-indigo-100 p-8">
          <h1 className="text-4xl font-black">Explore the World</h1>
          <p className="mt-2 text-slate-600">Discover and book your next destination.</p>
          <input className="mt-4 w-full rounded-full border bg-white px-5 py-3" placeholder="Search a destination..." />
        </div>

        <div className="flex flex-wrap gap-2">{['All','Africa','Americas','Asia','Europe','Middle East','Oceania'].map((r) => <button key={r} className="rounded-full border px-4 py-2 text-sm">{r}</button>)}</div>

        <div className="grid gap-4 md:grid-cols-3">{countries.slice(0, 6).map((c) => <GradientCard key={c.id} imageSrc={c.heroImage || '/logos-banner-new.jpg'} imageAlt={c.name} href={`/destinations/${c.code.toLowerCase()}`}><p className='font-semibold'>{c.name}</p><p className='text-xs opacity-90'>{c.code} • Featured</p></GradientCard>)}</div>

        <div className="space-y-3 rounded-2xl border p-4">
          <h2 className="text-xl font-bold">Countries A–Z</h2>
          {countries.map((country) => (
            <Link key={country.id} href={`/destinations/${country.code.toLowerCase()}`} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-50">
              <p>🏳️ {country.name}</p>
              <p className="text-sm text-slate-500">{Math.floor(Math.random() * 12) + 1} destinations</p>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </section>
  );
}
