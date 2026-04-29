import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DestinationHero } from '@/components/destinations/DestinationHero';
import { AttractionCard } from '@/components/destinations/AttractionCard';
import { MapClusterView } from '@/components/destinations/MapClusterView';
import { ReviewSection } from '@/components/destinations/ReviewSection';
import { AIRecommendationsPanel } from '@/components/destinations/AIRecommendationsPanel';
import { getCountry } from '@/lib/api/destinations-api';

export default async function CountryLandingPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const data: any = await getCountry(country);

  return (
    <section className="space-y-6 pb-20">
      <div className="relative overflow-hidden rounded-3xl">
        <DestinationHero title={data.name} subtitle={data.description ?? 'Discover top cities and attractions.'} image={data.heroImage} />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute bottom-6 left-6">
          <button className="rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white shadow-lg">
            Book Flights from $199
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-red">Capital</p>
          <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">{data.capital}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-red">Best time</p>
          <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">{data.bestTime}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-red">Currency</p>
          <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">{data.currency}</p>
        </div>
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-red">Visa note</p>
          <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">{data.visaNote}</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cities">Cities</TabsTrigger>
          <TabsTrigger value="attractions">Attractions</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="map">Map</TabsTrigger>
          <TabsTrigger value="tips">AI + Tips</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Why visit {data.name}</h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{data.overview}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.budgetGuide ? Object.entries(data.budgetGuide).map(([tier, cost]: any) => (
                <div key={tier} className="rounded-xl border p-3 dark:border-slate-800">
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-red">{tier}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">{cost}</p>
                </div>
              )) : null}
            </div>
          </div>

          <AIRecommendationsPanel
            title="Top 5 for you"
            subtitle={`AI-ranked attractions for ${data.name}.`}
            items={(data.aiTopFive ?? []).map((item: any) => ({
              name: item.name,
              category: item.category,
              score: item.score,
              reason: item.reason,
              bestTime: item.bestTime,
            }))}
          />
        </TabsContent>

        <TabsContent value="cities" className="grid gap-4 md:grid-cols-3">
          {data.cities?.map((city: any) => <AttractionCard key={city.id} attraction={{ ...city, id: city.slug, entryFee: 0, category: 'City guide', rating: 4.8, image: city.heroImage, bestFor: city.description, openingHours: city.bestTime }} />)}
        </TabsContent>

        <TabsContent value="attractions" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.topAttractions?.map((attraction: any) => <AttractionCard key={attraction.id} attraction={attraction} />)}
        </TabsContent>

        <TabsContent value="events" className="grid gap-4 md:grid-cols-2">
          {data.featuredEvents?.map((event: any) => (
            <div key={event.id} className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">{event.season}</p>
              <h3 className="mt-1 font-semibold text-slate-900 dark:text-slate-50">{event.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{event.location} · {event.date}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{event.description}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="map">
          <MapClusterView clusters={data.clusters ?? []} />
        </TabsContent>

        <TabsContent value="tips" className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <ReviewSection
            title="Traveler tips"
            reviews={[
              { id: 'tip-1', author: 'Visa reminder', title: 'Entry planning', rating: 5, comment: data.visaNote, date: data.bestTime },
              { id: 'tip-2', author: 'Budget tracker', title: 'Typical spend', rating: 4.9, comment: `Use the budget guide above to plan daily spend.`, date: data.currency },
            ]}
          />
          <AIRecommendationsPanel
            title="AI travel picks"
            subtitle="Ranked by traveler interest and seasonality."
            items={(data.aiTopFive ?? []).map((item: any) => ({
              name: item.name,
              category: item.category,
              score: item.score,
              reason: item.reason,
              bestTime: item.bestTime,
            }))}
          />
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-3 md:hidden"><button className="w-full rounded bg-brand-red px-4 py-2 text-white">Book Flights</button></div>
    </section>
  );
}
