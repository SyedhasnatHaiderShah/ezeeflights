"use client";

import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/ui/price-tag";
import { RatingStars } from "@/components/ui/rating-stars";
import { SectionHeader } from "@/components/ui/section-header";
import { AppImage } from "@/components/ui/app-image";
import { WishlistButton } from "@/components/destinations/WishlistButton";
import { useQuery } from "@tanstack/react-query";
import { listPackages } from "@/lib/api/packages-api";
import { Skeleton } from "@/components/ui/skeleton";

export function PopularPackages() {
  const { data, isLoading } = useQuery({ queryKey: ["packages", "featured", 6], queryFn: () => listPackages("?limit=6") });
  const packages = data?.data ?? [];

  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader eyebrow="CURATED FOR YOU" title="Popular Packages" ctaLabel="View all packages" ctaHref="/packages" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[420px] rounded-2xl" />) : packages.map((item) => (
            <article key={item.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md">
              <div className="relative aspect-[4/3] overflow-hidden"><AppImage src={item.thumbnailUrl || "/logos-banner-new.jpg"} alt={item.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" /><div className="absolute right-3 top-3"><WishlistButton attractionId={item.id} /></div></div>
              <div className="space-y-3 p-4"><div className="flex flex-wrap gap-2"><Badge>{item.durationDays} Days</Badge><Badge>{item.country}</Badge><Badge>{item.destination}</Badge></div><h3 className="text-lg font-bold">{item.title}</h3><RatingStars rating={5} /><p className="line-clamp-2 text-sm text-muted-foreground">{item.slug}</p><div className="flex items-center justify-between"><PriceTag amount={item.basePrice} currency={item.currency} /><button className="rounded-xl border border-brand-red px-3 py-2 text-sm font-semibold text-brand-red">Book Package →</button></div></div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
