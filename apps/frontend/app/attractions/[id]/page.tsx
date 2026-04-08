import { ReviewSection } from '@/components/destinations/ReviewSection';
import { WishlistButton } from '@/components/destinations/WishlistButton';
import { getAttraction, getAttractionReviews, getAttractionTours } from '@/lib/api/destinations-api';

export default async function AttractionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [attraction, reviews, tours] = await Promise.all([getAttraction(id), getAttractionReviews(id), getAttractionTours(id)]);

  return (
    <section className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <h1 className="text-2xl font-bold">{attraction.name}</h1>
        <p className="mt-2 text-slate-600">{attraction.description}</p>
        <div className="mt-4">
          <WishlistButton attractionId={id} />
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4">
        <h3 className="mb-3 font-semibold">Book Tours</h3>
        <ul className="space-y-2 text-sm">
          {tours.map((tour: any, idx: number) => (
            <li key={`${tour.provider}-${idx}`} className="rounded-md border p-3">
              <p className="font-medium">{tour.title}</p>
              <p>{tour.provider} · {tour.duration} · {tour.currency} {tour.price}</p>
              <a className="text-blue-600" href={tour.bookingLink} target="_blank">Book now</a>
            </li>
          ))}
        </ul>
      </div>

      <ReviewSection reviews={reviews} />
    </section>
  );
}
