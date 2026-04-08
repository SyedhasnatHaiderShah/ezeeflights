import Link from 'next/link';

export function AttractionCard({ attraction }: { attraction: any }) {
  return (
    <article className="rounded-xl border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{attraction.name}</h3>
          <p className="text-xs text-slate-500">{attraction.category}</p>
        </div>
        <span className="text-sm">⭐ {Number(attraction.rating ?? 0).toFixed(1)}</span>
      </div>
      <p className="mt-2 line-clamp-3 text-sm text-slate-600">{attraction.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium">From ${Number(attraction.entryFee ?? 0).toFixed(0)}</span>
        <Link href={`/attractions/${attraction.id}`} className="text-sm font-medium text-blue-600">View</Link>
      </div>
    </article>
  );
}
