import Link from 'next/link';
import type { Route } from 'next';
import { AttractionCard } from '@/components/destinations/AttractionCard';
import { AIRecommendationsPanel } from '@/components/destinations/AIRecommendationsPanel';
import { DestinationHero } from '@/components/destinations/DestinationHero';
import { MapClusterView } from '@/components/destinations/MapClusterView';
import { listAttractions, getMapClusters, getAiTopAttractions } from '@/lib/api/destinations-api';
import { DESTINATION_CATEGORIES } from '@/lib/mock/destination-data';

export default async function AttractionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; country?: string; city?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.category) query.set('category', params.category);
  if (params.country) query.set('country', params.country);
  if (params.city) query.set('city', params.city);

  const [{ data: attractions, total }, clusters, ai] = await Promise.all([
    listAttractions(query.toString() ? `?${query.toString()}` : ''),
    getMapClusters(query.toString() ? `?${query.toString()}` : ''),
    getAiTopAttractions({ city: params.city ?? 'dubai', interests: params.category ? [params.category] : ['culture', 'food', 'adventure'] }),
  ]);

  return (
    <section className="space-y-6 pb-16">
      <DestinationHero
        title="Destinations & Attractions"
        subtitle="Browse top attractions, save favorites, explore maps, and discover tours with mock data while backend APIs are still being built."
        image="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1400&q=80"
      />

      <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={'/attractions' as Route} className="rounded-full border px-3 py-1 text-sm font-medium">
            All
          </Link>
          {DESTINATION_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/attractions?category=${encodeURIComponent(category.toLowerCase())}` as Route}
              className="rounded-full border px-3 py-1 text-sm font-medium"
            >
              {category}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{total} attractions found</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {attractions.map((attraction) => (
            <AttractionCard key={attraction.id} attraction={attraction} />
          ))}
        </div>

        <div className="space-y-4">
          <AIRecommendationsPanel
            title="AI-ranked attractions"
            subtitle="Generated from traveler interest tags."
            items={ai.map((item) => ({
              name: item.name,
              category: item.category,
              score: item.score,
              reason: item.reason,
              bestTime: item.bestTime,
            }))}
          />
          <MapClusterView clusters={clusters} />
        </div>
      </div>
    </section>
  );
}
