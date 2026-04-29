import Link from 'next/link';
import type { Route } from 'next';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { GradientCard } from '@/components/ui/gradient-card';
import { listDestinations } from '@/lib/api/destinations-api';
import { AIRecommendationsPanel } from '@/components/destinations/AIRecommendationsPanel';
import { AttractionCard } from '@/components/destinations/AttractionCard';
import { MapClusterView } from '@/components/destinations/MapClusterView';
import { getMapClusters } from '@/lib/api/destinations-api';

export const revalidate = 3600;

export default async function DestinationsPage() {
  let countries: Array<{ id: string; name: string; code: string; heroImage?: string }> = [];
  let clusters: Array<{ latBucket: number; lngBucket: number; count: number }> = [];
  try {
    countries = await listDestinations();
    clusters = await getMapClusters('');
  } catch {}

  const featuredCountry = countries[0] as any;
  const featuredCities = countries.flatMap((country: any) => country.cities ?? []).slice(0, 6);
  const topAttractions = countries.flatMap((country: any) => country.topAttractions ?? []).slice(0, 6);
  const aiPicks = countries.flatMap((country: any) => country.aiTopFive ?? []).slice(0, 5);
  const seasonalEvents = countries.flatMap((country: any) => country.seasonalEvents ?? []).slice(0, 4);

  return (
    <section className="space-y-8 pb-16">
      <Header />
      <div className="pt-24" />
      <div className="mx-auto max-w-6xl space-y-6 px-4">
        <div className="rounded-3xl bg-linear-to-br from-sky-50 via-white to-indigo-100 p-8 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-red">Destinations & Attractions</p>
              <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50 md:text-5xl">
                Explore countries, attractions, and AI-picked experiences.
              </h1>
              <p className="max-w-2xl text-slate-600 dark:text-slate-300">
                Browse rich country landing pages, save bucket-list spots, compare attractions, and preview tours, reviews, maps, and seasonal events.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={'/attractions' as Route} className="rounded-full bg-brand-red px-5 py-3 text-sm font-semibold text-white">
                  Browse attractions
                </Link>
                <Link href="/wishlist" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                  Open wishlist
                </Link>
              </div>
            </div>
            <div className="rounded-3xl border bg-white/80 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Search a destination</label>
              <input className="mt-2 w-full rounded-2xl border bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900" placeholder="Search a country, city, or attraction..." />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Countries</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{countries.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Featured cities</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{featuredCities.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400">AI picks</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{aiPicks.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Events</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">{seasonalEvents.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">{['All','Africa','Americas','Asia','Europe','Middle East','Oceania'].map((r) => <button key={r} className="rounded-full border px-4 py-2 text-sm transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">{r}</button>)}</div>

        <div className="grid gap-4 md:grid-cols-3">{countries.slice(0, 6).map((c: any) => <GradientCard key={c.id} imageSrc={c.heroImage || '/logos-banner-new.jpg'} imageAlt={c.name} href={`/destinations/${c.code.toLowerCase()}`}><p className='font-semibold'>{c.name}</p><p className='text-xs opacity-90'>{c.code} • {c.bestTime}</p></GradientCard>)}</div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Top attractions</h2>
              <Link href={'/attractions' as Route} className="text-sm font-semibold text-brand-red">View all</Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {topAttractions.map((attraction: any) => <AttractionCard key={attraction.id} attraction={attraction} />)}
            </div>
          </div>

          <AIRecommendationsPanel
            title="Top 5 for you"
            subtitle={featuredCountry ? `Personalized from ${featuredCountry.name} and similar destinations.` : 'Personalized picks based on traveler interests.'}
            items={aiPicks.map((item: any) => ({
              name: item.name,
              category: item.category,
              score: item.score,
              reason: item.reason,
              bestTime: item.bestTime,
            }))}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Seasonal events</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">Plan around festivals and peak months</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {seasonalEvents.map((event: any) => (
                <div key={event.id} className="rounded-xl border p-4 dark:border-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">{event.season}</p>
                  <h3 className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{event.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{event.location} · {event.date}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          <MapClusterView clusters={clusters} />
        </div>

        <div className="space-y-3 rounded-2xl border p-4">
          <h2 className="text-xl font-bold">Countries A–Z</h2>
          {countries.map((country) => (
            <Link key={country.id} href={`/destinations/${country.code.toLowerCase()}`} className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-50">
              <p>🏳️ {country.name}</p>
              <p className="text-sm text-slate-500">{(country as any).cities?.length ?? 0} cities</p>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </section>
  );
}
