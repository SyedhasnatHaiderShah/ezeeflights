import Link from 'next/link';
import { getWishlist } from '@/lib/api/destinations-api';

export default async function WishlistPage() {
  const items = await getWishlist();

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">My Bucket List</h1>
      <ul className="space-y-3">
        {items.map((item: any) => (
          <li key={item.id} className="rounded-xl border bg-white p-4">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-slate-600">{item.city}, {item.country}</p>
            <Link href={`/attractions/${item.attractionId}`} className="text-sm text-blue-600">Open attraction</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
