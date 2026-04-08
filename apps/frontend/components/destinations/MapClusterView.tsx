'use client';

export function MapClusterView({ clusters }: { clusters: Array<{ latBucket: number; lngBucket: number; count: number }> }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <h3 className="font-semibold">Map Cluster View</h3>
      <p className="mb-3 text-xs text-slate-500">Provider: {process.env.NEXT_PUBLIC_MAP_PROVIDER ?? 'mapbox'} (token-based live map can be plugged in here).</p>
      <ul className="space-y-2 text-sm">
        {clusters.map((cluster, idx) => (
          <li className="rounded-md border p-2" key={`${cluster.latBucket}-${cluster.lngBucket}-${idx}`}>
            Cluster ({cluster.latBucket.toFixed(2)}, {cluster.lngBucket.toFixed(2)}) — {cluster.count} attractions
          </li>
        ))}
      </ul>
    </div>
  );
}
