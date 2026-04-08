import Link from 'next/link';
import { ItineraryTimeline } from '@/components/packages/ItineraryTimeline';
import { getPackageBySlug } from '@/lib/api/packages-api';

export default async function PackageDetailsPage({ params }: { params: { slug: string } }) {
  const item = await getPackageBySlug(params.slug);
  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">{item.title}</h1>
        <p className="text-slate-600">{item.destination}, {item.country} • {item.durationDays} days</p>
      </div>
      <p>{item.description}</p>
      <ItineraryTimeline itinerary={item.itinerary} />
      <Link href={`/packages/book?id=${item.id}`} className="inline-block rounded bg-blue-600 px-4 py-2 text-white">Book now</Link>
    </section>
  );
}
