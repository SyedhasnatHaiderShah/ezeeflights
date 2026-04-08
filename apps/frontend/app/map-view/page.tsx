import { MapClusterView } from '@/components/destinations/MapClusterView';
import { getMapClusters } from '@/lib/api/destinations-api';

export default async function MapViewPage() {
  const clusters = await getMapClusters('?latitude=25.2048&longitude=55.2708&radiusKm=15&zoom=7');
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Attractions Map</h1>
      <MapClusterView clusters={clusters} />
    </section>
  );
}
