import { BookingForm } from '@/components/booking-form';
import { PackageCard } from '@/components/packages/PackageCard';
import { listPackages } from '@/lib/api/packages-api';

export default async function PackagesPage() {
  const res = await listPackages();

  return (
    <section className="space-y-8 pb-10">
      <div className="relative overflow-hidden rounded-3xl bg-[url('/logos-banner-new.jpg')] bg-cover bg-center p-8 text-white">
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 space-y-5">
          <h1 className="text-4xl font-black">Complete Travel Packages</h1>
          <p className="max-w-2xl text-white/85">Flights, stays, transfers and curated experiences in one booking.</p>
          <BookingForm />
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2"><p className="text-xs font-semibold uppercase text-slate-500">Duration</p><div className="flex flex-wrap gap-2">{['3–5 Days', '7–10 Days', '14+ Days'].map((d) => <button key={d} className="rounded-full border px-3 py-1 text-sm">{d}</button>)}</div></div>
          <div><p className="mb-2 text-xs font-semibold uppercase text-slate-500">Budget</p><input type="range" min={500} max={10000} defaultValue={4000} className="w-full" /></div>
          <div><p className="mb-2 text-xs font-semibold uppercase text-slate-500">Theme</p><select className="w-full rounded-lg border px-3 py-2 text-sm"><option>All themes</option><option>Adventure</option><option>Family</option><option>Luxury</option></select></div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {res.data.map((item) => <PackageCard key={item.id} item={item} />)}
      </div>

      <div className="text-center"><button className="rounded-full border px-6 py-2 font-medium">Load more packages</button></div>
    </section>
  );
}
