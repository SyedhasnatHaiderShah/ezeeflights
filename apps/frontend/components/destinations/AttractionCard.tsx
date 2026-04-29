import Link from 'next/link';

export function AttractionCard({ attraction }: { attraction: any }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
      <div
        className="h-40 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.45)), url(${attraction.image ?? attraction.imageUrl ?? '/logos-banner-new.jpg'})`,
        }}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-50">{attraction.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{attraction.category}</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            ⭐ {Number(attraction.rating ?? 0).toFixed(1)}
          </span>
        </div>

        <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{attraction.description}</p>

        <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          {attraction.openingHours ? <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">{attraction.openingHours}</span> : null}
          {attraction.bestFor ? <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">{attraction.bestFor}</span> : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t pt-3 dark:border-slate-800">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {Number(attraction.entryFee ?? 0) > 0 ? `From ${attraction.currency ?? '$'} ${Number(attraction.entryFee ?? 0).toFixed(0)}` : 'Free entry'}
          </span>
          <Link href={`/attractions/${attraction.id ?? attraction.slug}`} className="text-sm font-semibold text-brand-red">
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
