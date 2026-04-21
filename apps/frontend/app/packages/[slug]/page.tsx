'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ItineraryTimeline } from '@/components/packages/ItineraryTimeline';
import { getPackageBySlug } from '@/lib/api/packages-api';

export default function PackageDetailsPage({ params }: { params: { slug: string } }) {
  const [item, setItem] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getPackageBySlug(params.slug).then(setItem);
  }, [params.slug]);

  if (!item) return <section>Loading...</section>;
  const images = [item.thumbnailUrl || '/logos-banner-new.jpg', '/delta-airline-top-1.webp', '/jetblue-top-1.webp', '/southwest-top-1.webp', '/alaska-top-1.webp'];

  return (
    <section className="space-y-7 pb-10">
      <div>
        <h1 className="text-3xl font-bold">{item.title}</h1>
        <p className="text-slate-600">{item.destination}, {item.country} • {item.durationDays} days</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="space-y-3">
            <button className="block w-full" onClick={() => setOpen(true)}><img src={images[0]} className="h-80 w-full rounded-2xl object-cover" alt={item.title} /></button>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{images.slice(1).map((img) => <button key={img} onClick={() => setOpen(true)}><img src={img} className="h-24 w-full rounded-xl object-cover" alt="thumb" /></button>)}</div>
          </div>

          <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-w-4xl"><img src={images[0]} alt={item.title} className="h-[70vh] w-full rounded-xl object-cover" /></DialogContent></Dialog>

          <p>{item.description}</p>
          <ItineraryTimeline itinerary={item.itinerary} />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border p-4"><h3 className="mb-3 font-bold">Inclusions</h3>{item.inclusions?.map((i: any) => <p key={i.id} className="text-sm">✅ {i.description}</p>)}</div>
            <div className="rounded-xl border p-4"><h3 className="mb-3 font-bold">Exclusions</h3>{item.exclusions?.map((e: any) => <p key={e.id} className="text-sm">❌ {e.description}</p>)}</div>
          </div>

          <div className="space-y-3"><h3 className="text-xl font-bold">Similar Packages</h3><div className="flex gap-3 overflow-x-auto pb-2">{['Desert Escape','City Break','Island Discovery'].map((s) => <div key={s} className="min-w-56 rounded-xl border p-3">{s}</div>)}</div></div>
        </div>

        <aside className="h-fit rounded-2xl border p-5 lg:sticky lg:top-24">
          <p className="text-sm text-slate-500">From</p>
          <p className="text-3xl font-black">{item.currency} {item.basePrice}</p>
          <p className="text-sm text-slate-500">per person</p>
          <div className="mt-4 space-y-1 text-sm">{['Hotels','Airport transfers','Daily breakfast','Activities'].map((x) => <p key={x}>✓ {x}</p>)}</div>
          <Link href={`/packages/book?id=${item.id}`} className="mt-5 block rounded bg-brand-red px-4 py-2 text-center text-white">Book Now</Link>
          <button className="mt-2 w-full rounded border px-4 py-2">Customize</button>
        </aside>
      </div>
    </section>
  );
}
