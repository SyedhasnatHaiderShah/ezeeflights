"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GradientCard } from "@/components/ui/gradient-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useFeaturedDestinations } from "@/lib/api/destinations";

export function TopDestinations() {
  const { data: destinations = [], isLoading } = useFeaturedDestinations(10);
  const regions = React.useMemo(() => ["ALL", ...new Set(destinations.map((d) => d.region))], [destinations]);
  const [active, setActive] = React.useState("ALL");
  const filtered = active === "ALL" ? destinations : destinations.filter((d) => d.region === active);

  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader eyebrow="EXPLORE THE WORLD" title="Top Destinations" ctaLabel="View all" ctaHref="/destinations" />
        <div className="mb-6 flex flex-wrap gap-2">
          {regions.map((filter) => (
            <button key={filter} onClick={() => setActive(filter)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active === filter ? "bg-brand-red text-white" : "bg-muted text-muted-foreground"}`}>{filter}</button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 8 }).map((_, idx) => <Skeleton key={idx} className={`w-full rounded-2xl ${idx === 0 ? "h-[560px]" : "h-[260px]"}`} />)}</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((dest, idx) => (
                <motion.div key={dest.slug} layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={idx === 0 ? "lg:row-span-2" : ""}>
                  <GradientCard href={`/cities/${dest.slug}`} imageSrc={dest.imageUrl} imageAlt={dest.name} className={idx === 0 ? "h-[560px]" : "h-[260px]"}>
                    <div className="flex items-center justify-between"><div><p className="text-xl font-bold text-white">{dest.flag} {dest.name}</p><Badge variant="gold" className="mt-2">From {dest.currency} {dest.fromPrice}</Badge></div></div>
                    <div className="mt-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0"><span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur">Explore →</span></div>
                  </GradientCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}
