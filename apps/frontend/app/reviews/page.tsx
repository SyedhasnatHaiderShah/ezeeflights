"use client";

import { useEffect, useState } from "react";
import { useReviewStats, useReviews } from "@/lib/api/reviews";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReviewsPage() {
  const [star, setStar] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [allReviews, setAllReviews] = useState<any[]>([]);

  const { data: stats } = useReviewStats();
  const q = useReviews({ rating: star || undefined, verified: verifiedOnly || undefined, page, limit: 6 });

  useEffect(() => {
    if (q.data?.data?.length) {
      setAllReviews((prev) => (page === 1 ? q.data!.data : [...prev, ...q.data!.data]));
    }
  }, [q.data, page]);

  return (
    <main className="space-y-6 pb-10">
      <section className="rounded-2xl border p-6"><h1 className="text-3xl font-bold">★★★★★ {stats?.average?.toFixed(1) ?? "4.8"}</h1><p>{stats?.total ?? 0} total reviews</p><div className="mt-3 space-y-1">{[5,4,3,2,1].map((s) => <div key={s} className="flex items-center gap-2"><span className="w-6 text-sm">{s}</span><div className="h-2 flex-1 rounded bg-slate-200"><div className="h-full rounded bg-amber-500" style={{ width: `${Math.min(100, ((stats?.distribution?.[s] ?? 0) / Math.max(1, stats?.total ?? 1)) * 100)}%` }} /></div></div>)}</div></section>
      <div className="flex flex-wrap items-center gap-2">{[5,4,3,2,1].map((s) => <button key={s} className={`rounded-full border px-3 py-1 ${star===s?'bg-brand-red text-white':''}`} onClick={() => {setStar(star===s?0:s);setPage(1);setAllReviews([]);}}>{s}★</button>)}<label className="ml-2 text-sm"><input type="checkbox" checked={verifiedOnly} onChange={(e) => {setVerifiedOnly(e.target.checked);setPage(1);setAllReviews([]);}} /> Verified only</label></div>
      <div className="grid gap-3 md:grid-cols-2">{q.isLoading && page===1 ? Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-40 rounded-xl" />) : allReviews.map((review: any) => <article key={review.id} className="rounded-xl border p-4"><p className="font-semibold">{review.authorName || "Traveler"}</p><p className="text-xs text-slate-500">{"★".repeat(review.rating || 5)} · {new Date(review.createdAt).toLocaleDateString()}</p><p className="mt-2 text-sm">{review.text}</p><button className="mt-3 text-sm text-brand-red">Helpful? 👍</button></article>)}</div>
      <div className="flex justify-center gap-2"><button className="rounded border px-3 py-1" onClick={() => setPage((p) => p + 1)}>Load more</button></div>
    </main>
  );
}
