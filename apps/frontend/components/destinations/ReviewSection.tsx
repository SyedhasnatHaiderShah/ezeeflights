export function ReviewSection({ reviews }: { reviews: Array<{ id: string; rating: number; comment: string }> }) {
  return (
    <section className="rounded-xl border bg-white p-4">
      <h3 className="mb-3 font-semibold">Reviews</h3>
      <div className="space-y-3">
        {reviews.map((review) => (
          <article key={review.id} className="rounded-md border p-3">
            <p className="text-sm">⭐ {review.rating}</p>
            <p className="text-sm text-slate-700">{review.comment}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
