import Link from "next/link";

export function AttractionCard({ attraction }: { attraction: any }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div
        className="h-40 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.45)), url(${attraction.image ?? attraction.imageUrl ?? "/logos-banner-new.jpg"})`,
        }}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground">{attraction.name}</h3>
            <p className="text-xs text-muted-foreground">
              {attraction.category}
            </p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            ⭐ {Number(attraction.rating ?? 0).toFixed(1)}
          </span>
        </div>

        <p className="line-clamp-3 text-sm text-muted-foreground">
          {attraction.description}
        </p>

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {attraction.openingHours ? (
            <span className="rounded-full bg-muted px-2 py-1">
              {attraction.openingHours}
            </span>
          ) : null}
          {attraction.bestFor ? (
            <span className="rounded-full bg-muted px-2 py-1">
              {attraction.bestFor}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <span className="text-sm font-medium text-foreground">
            {Number(attraction.entryFee ?? 0) > 0
              ? `From ${attraction.currency ?? "$"} ${Number(attraction.entryFee ?? 0).toFixed(0)}`
              : "Free entry"}
          </span>
          <Link
            href={`/attractions/${attraction.id ?? attraction.slug}` as any}
            className="text-sm font-semibold text-redmix"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
