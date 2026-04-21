"use client";

import { Badge } from "@/components/ui/badge";
import { PriceTag } from "@/components/ui/price-tag";
import { RatingStars } from "@/components/ui/rating-stars";
import { SectionHeader } from "@/components/ui/section-header";
import { AppImage } from "@/components/ui/app-image";
import { WishlistButton } from "@/components/destinations/WishlistButton";

const PACKAGES = [
  { name: "Dubai Luxury Escape", desc: "Skyline views, desert safari, and city highlights in one trip.", price: 899, image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=900&auto=format&fit=crop" },
  { name: "Maldives Relax Retreat", desc: "Crystal lagoons and overwater villas with curated island dining.", price: 1299, image: "https://images.unsplash.com/photo-1578922746465-3a80a228f223?q=80&w=900&auto=format&fit=crop" },
  { name: "Paris Culture Week", desc: "Museums, river cruise, and boutique stay in the heart of Paris.", price: 999, image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=900&auto=format&fit=crop" },
  { name: "Tokyo Discovery", desc: "A fast-paced city adventure mixing food, shrines, and nightlife.", price: 1099, image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=900&auto=format&fit=crop" },
  { name: "Rome Heritage Tour", desc: "Walk through timeless architecture with local culinary experiences.", price: 940, image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=900&auto=format&fit=crop" },
  { name: "Bali Wellness Escape", desc: "Jungle stays and beach time designed for total reset.", price: 850, image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=900&auto=format&fit=crop" },
] as const;

export function PopularPackages() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader eyebrow="CURATED FOR YOU" title="Popular Packages" ctaLabel="View all packages" ctaHref="/packages" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {PACKAGES.map((item) => (
            <article key={item.name} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md">
              <div className="relative aspect-[4/3] overflow-hidden">
                <AppImage src={item.image} alt={item.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute right-3 top-3"><WishlistButton attractionId={item.name.toLowerCase().replace(/\s+/g, "-")} /></div>
              </div>
              <div className="space-y-3 p-4">
                <div className="flex flex-wrap gap-2"><Badge>7 Days</Badge><Badge>4★ Hotel</Badge><Badge>Breakfast</Badge></div>
                <h3 className="text-lg font-bold">{item.name}</h3>
                <RatingStars rating={5} />
                <p className="line-clamp-2 text-sm text-muted-foreground">{item.desc}</p>
                <div className="flex items-center justify-between"><PriceTag amount={item.price} /><button className="rounded-xl border border-brand-red px-3 py-2 text-sm font-semibold text-brand-red">Book Package →</button></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
