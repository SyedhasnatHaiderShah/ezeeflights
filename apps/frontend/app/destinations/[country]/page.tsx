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
        <div className="absolute bottom-6 left-6"><button className="rounded bg-brand-red px-4 py-2 text-white">Book Flights from $199</button></div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto"><TabsTrigger value="overview">Overview</TabsTrigger><TabsTrigger value="attractions">Attractions</TabsTrigger><TabsTrigger value="hotels">Hotels</TabsTrigger><TabsTrigger value="packages">Packages</TabsTrigger><TabsTrigger value="tips">Tips</TabsTrigger></TabsList>
        <TabsContent value="overview" className="grid gap-4 md:grid-cols-3">{data.cities?.map((city: any) => <AttractionCard key={city.id} attraction={{ title: city.name, description: city.description || 'Explore', imageUrl: city.imageUrl }} />)}</TabsContent>
        <TabsContent value="attractions"><MapClusterView clusters={[]} /></TabsContent>
        <TabsContent value="hotels"><AIRecommendationsPanel items={[]} /></TabsContent>
        <TabsContent value="packages"><p className="rounded-xl border p-4">Package recommendations coming soon.</p></TabsContent>
        <TabsContent value="tips"><ReviewSection reviews={[]} /></TabsContent>
      </Tabs>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-3 md:hidden"><button className="w-full rounded bg-brand-red px-4 py-2 text-white">Book Flights</button></div>
    </section>
  );
}
