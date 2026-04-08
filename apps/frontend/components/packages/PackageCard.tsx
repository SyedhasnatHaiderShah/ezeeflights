import Link from 'next/link';
import { PackageSummary } from '@/lib/api/packages-api';

export function PackageCard({ item }: { item: PackageSummary }) {
  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase text-slate-500">{item.country}</p>
      <h3 className="text-lg font-semibold">{item.title}</h3>
      <p className="text-sm text-slate-600">{item.destination} • {item.durationDays} days</p>
      <p className="mt-3 font-medium">From {item.currency} {item.basePrice}</p>
      <Link href={`/packages/${item.slug}`} className="mt-3 inline-block text-sm font-medium text-blue-600">View package</Link>
    </article>
  );
}
