'use client';

export function MapClusterView({ clusters }: { clusters: Array<{ latBucket: number; lngBucket: number; count: number }> }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-3 space-y-1">
        <h3 className="font-semibold text-foreground">Nearby attractions map</h3>
        <p className="text-xs text-muted-foreground">
          Provider: {process.env.NEXT_PUBLIC_MAP_PROVIDER ?? 'mapbox'} — token-based live map can be plugged in later.
        </p>
      </div>
      <ul className="space-y-2 text-sm">
        {clusters.map((cluster, idx) => (
          <li className="rounded-xl border border-border p-3" key={`${cluster.latBucket}-${cluster.lngBucket}-${idx}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-foreground">
                Cluster ({cluster.latBucket.toFixed(2)}, {cluster.lngBucket.toFixed(2)})
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                {cluster.count} attractions
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
