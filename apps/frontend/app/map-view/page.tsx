import { MapClusterView } from '@/components/destinations/MapClusterView';
import { getMapClusters } from '@/lib/api/destinations-api';

export default async function MapViewPage() {
  const clusters = await getMapClusters('?latitude=25.2048&longitude=55.2708&radiusKm=15&zoom=7');
  return (
    <section className="space-y-4 pb-16">
      <div className="rounded-3xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50">Attractions Map</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">Explore mock attraction clusters around top destinations. Live map providers can be added later without changing the page structure.</p>
      </div>
      <MapClusterView clusters={clusters} />
    </section>
  );
}
