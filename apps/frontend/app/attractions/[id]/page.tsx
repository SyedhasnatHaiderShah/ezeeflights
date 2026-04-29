import { ReviewSection } from '@/components/destinations/ReviewSection';
import { WishlistButton } from '@/components/destinations/WishlistButton';
import { getAttraction, getAttractionReviews, getAttractionTours } from '@/lib/api/destinations-api';
import Link from 'next/link';

export default async function AttractionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [attraction, reviews, tours] = await Promise.all([getAttraction(id), getAttractionReviews(id), getAttractionTours(id)]);

  return (
    <section className="space-y-6 pb-16">
      <div className="overflow-hidden rounded-3xl border bg-white dark:border-slate-800 dark:bg-slate-950">
        <div
          className="h-72 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.2), rgba(15, 23, 42, 0.7)), url(${attraction.image ?? attraction.photos?.[0] ?? '/logos-banner-new.jpg'})`,
          }}
        />
        <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-red">{attraction.category}</p>
              <h1 className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-50">{attraction.name}</h1>
              <p className="mt-3 max-w-3xl text-slate-600 dark:text-slate-300">{attraction.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                ⭐ {Number(attraction.rating ?? 0).toFixed(1)} · {attraction.reviewCount ?? reviews.length} reviews
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {attraction.openingHours}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {attraction.duration}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-2xl border p-4 dark:border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-red">Entry fee</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
                  {Number(attraction.entryFee ?? 0) > 0 ? `${attraction.currency ?? '$'} ${Number(attraction.entryFee).toFixed(0)}` : 'Free'}
                </p>
              </div>
              <div className="rounded-2xl border p-4 dark:border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-red">Best for</p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">{attraction.bestFor}</p>
              </div>
              <div className="rounded-2xl border p-4 dark:border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-brand-red">Book with</p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">{attraction.bookingSource}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <WishlistButton attractionId={id} />
              <Link href="/wishlist" className="rounded-full border px-4 py-2 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-slate-100">
                View wishlist
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border p-4 dark:border-slate-800">
            <h2 className="font-semibold text-slate-900 dark:text-slate-50">Quick tips</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {attraction.tips?.map((tip: string) => (
                <li key={tip} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-50">Photo gallery</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {(attraction.photos ?? [attraction.image]).filter(Boolean).map((photo: string, index: number) => (
              <img key={`${attraction.id}-photo-${index}`} src={photo} alt={attraction.name} className="h-48 w-full rounded-2xl object-cover" />
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
          <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-50">Nearby attractions</h3>
          <ul className="space-y-2 text-sm">
            {attraction.nearbyAttractions?.map((nearby: string) => (
              <li key={nearby} className="rounded-xl border px-3 py-2 dark:border-slate-800">
                {nearby}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-50">Book tours</h3>
        <ul className="space-y-3 text-sm">
          {tours.map((tour: any, idx: number) => (
            <li key={`${tour.provider}-${idx}`} className="rounded-2xl border p-4 dark:border-slate-800">
              <p className="font-medium text-slate-900 dark:text-slate-100">{tour.title}</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                {tour.provider} · {tour.duration} · {tour.currency} {tour.price}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tour.highlights?.map((highlight: string) => (
                  <span key={highlight} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {highlight}
                  </span>
                ))}
              </div>
              <a className="mt-3 inline-block font-semibold text-brand-red" href={tour.bookingLink} target="_blank" rel="noreferrer">
                Book now
              </a>
            </li>
          ))}
        </ul>
      </div>

      <ReviewSection reviews={reviews} />
    </section>
  );
}
