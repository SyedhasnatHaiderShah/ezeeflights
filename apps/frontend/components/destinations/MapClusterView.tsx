'use client';

export function MapClusterView({ clusters }: { clusters: Array<{ latBucket: number; lngBucket: number; count: number }> }) {
  return (
    <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-3 space-y-1">
        <h3 className="font-semibold text-slate-900 dark:text-slate-50">Nearby attractions map</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Provider: {process.env.NEXT_PUBLIC_MAP_PROVIDER ?? 'mapbox'} — token-based live map can be plugged in later.
        </p>
      </div>
      <ul className="space-y-2 text-sm">
        {clusters.map((cluster, idx) => (
          <li className="rounded-xl border p-3 dark:border-slate-800" key={`${cluster.latBucket}-${cluster.lngBucket}-${idx}`}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                Cluster ({cluster.latBucket.toFixed(2)}, {cluster.lngBucket.toFixed(2)})
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {cluster.count} attractions
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
