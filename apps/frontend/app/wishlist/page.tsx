import Link from "next/link";
import { getWishlist } from "@/lib/api/destinations-api";

export default async function WishlistPage() {
  const items = await getWishlist();

  return (
    <section className="space-y-6 pb-16">
      <div className="rounded-3xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50">
          My Bucket List
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Saved attractions you want to visit later. This is powered by mock
          data for now and ready for backend sync later.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-red">
              Saved places
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
              {items.length}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-red">
              Cities
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
              {new Set(items.map((item: any) => item.city)).size}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-red">
              Countries
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-50">
              {new Set(items.map((item: any) => item.country)).size}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item: any) => (
          <article
            key={item.id}
            className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <div
              className="h-40 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.15), rgba(15, 23, 42, 0.45)), url(${item.image})`,
              }}
            />
            <div className="space-y-3 p-4">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-50">
                  {item.name}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {item.city}, {item.country}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                  {item.category}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 dark:bg-slate-800">
                  Saved {item.savedAt}
                </span>
              </div>
              <Link
                href={`/attractions/${item.attractionId}` as any}
                className="inline-flex rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
              >
                Open attraction
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
