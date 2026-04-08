import { AIRecommendationsPanel } from '@/components/destinations/AIRecommendationsPanel';
import { AttractionCard } from '@/components/destinations/AttractionCard';
import { CategoryFilter } from '@/components/destinations/CategoryFilter';
import { DestinationHero } from '@/components/destinations/DestinationHero';
import { getAiRecommendations, getCity } from '@/lib/api/destinations-api';

export default async function CityLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [cityData, aiData] = await Promise.all([getCity(slug), getAiRecommendations(slug)]);

  return (
    <section className="space-y-6">
      <DestinationHero title={cityData.city.name} subtitle={cityData.city.description} image={cityData.city.heroImage} />
      <CategoryFilter />
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {cityData.topAttractions.map((attraction: any) => <AttractionCard key={attraction.id} attraction={attraction} />)}
        </div>
        <AIRecommendationsPanel items={aiData.slice(0, 5)} />
      </div>
    </section>
  );
}
