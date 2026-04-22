import Link from 'next/link';
import { AppImage } from '@/components/ui/app-image';
import { PackageSummary } from '@/lib/api/packages-api';

export function PackageCard({ item }: { item: PackageSummary }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:shadow-md">
      <div className="relative aspect-[16/10]">
        <AppImage
          src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=1200'}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.country}</p>
        <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
        <p className="text-sm text-muted-foreground">{item.destination} • {item.durationDays} days</p>
        <p className="mt-3 font-medium text-foreground">From {item.currency} {item.basePrice}</p>
        <Link href={`/packages/${item.slug}`} className="inline-block text-sm font-semibold text-brand-red hover:underline">View package</Link>
      </div>
    </article>
  );
}
