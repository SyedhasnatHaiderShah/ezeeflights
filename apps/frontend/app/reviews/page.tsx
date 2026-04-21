'use client';

import { useMemo, useState } from 'react';
import { REVIEWS as seededReviews } from '@/data/reviews';

export default function ReviewsPage() {
  const [star, setStar] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const data = useMemo(() => seededReviews.filter((r: any) => (star ? r.rating === star : true) && (verifiedOnly ? !!r.verified : true)), [star, verifiedOnly]);

  return (
    <main className="space-y-6 pb-10">
      <section className="rounded-2xl border p-6"><h1 className="text-3xl font-bold">★★★★★ 4.8</h1><p>{seededReviews.length} total reviews</p><div className="mt-3 space-y-1">{[5,4,3,2,1].map((s) => <div key={s} className="flex items-center gap-2"><span className="w-6 text-sm">{s}</span><div className="h-2 flex-1 rounded bg-slate-200"><div className="h-full rounded bg-amber-500" style={{ width: `${s*18}%` }} /></div></div>)}</div></section>
      <div className="flex flex-wrap items-center gap-2">{[5,4,3,2,1].map((s) => <button key={s} className={`rounded-full border px-3 py-1 ${star===s?'bg-brand-red text-white':''}`} onClick={() => setStar(star===s?0:s)}>{s}★</button>)}<select className="rounded border px-3 py-1"><option>All categories</option></select><label className="ml-2 text-sm"><input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} /> Verified only</label></div>
      <div className="grid gap-3 md:grid-cols-2">{data.map((review: any, i: number) => <article key={i} className="rounded-xl border p-4"><p className="font-semibold">{review.name || 'Traveler'}</p><p className="text-xs text-slate-500">{'★'.repeat(review.rating || 5)} · {review.date || 'Recent'}</p><p className="mt-2 text-sm">{review.text || review.comment}</p><button className="mt-3 text-sm text-brand-red">Helpful? 👍</button></article>)}</div>
      <div className="flex justify-center gap-2"><button className="rounded border px-3 py-1">Prev</button><button className="rounded border px-3 py-1">Next</button></div>
    </main>
  );
}
