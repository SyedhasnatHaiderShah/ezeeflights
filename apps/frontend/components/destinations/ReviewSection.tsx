export function ReviewSection({
  reviews,
  title = 'Reviews',
}: {
  reviews: Array<{ id: string; rating: number; comment: string; author?: string; title?: string; date?: string; avatar?: string; photos?: string[] }>;
  title?: string;
}) {
  return (
    <section className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
      <div className="space-y-3">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-xl border p-3 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{review.title ?? review.author ?? 'Traveler review'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{review.author ?? 'Anonymous'}{review.date ? ` · ${review.date}` : ''}</p>
              </div>
              <p className="text-sm font-semibold text-brand-red">⭐ {review.rating.toFixed(1)}</p>
            </div>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{review.comment}</p>
            {review.photos?.length ? (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {review.photos.map((photo, index) => (
                  <img key={`${review.id}-${index}`} src={photo} alt="Review photo" className="h-20 w-28 rounded-lg object-cover" />
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
