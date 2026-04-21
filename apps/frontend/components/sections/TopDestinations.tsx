"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GradientCard } from "@/components/ui/gradient-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";

const FILTERS = ["ALL", "ASIA", "EUROPE", "AMERICAS", "MIDDLE EAST", "AFRICA"] as const;

const DESTINATIONS = [
  { name: "Dubai", region: "MIDDLE EAST", price: 499, flag: "🇦🇪", slug: "dubai", image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop" },
  { name: "Maldives", region: "ASIA", price: 699, flag: "🇲🇻", slug: "maldives", image: "https://images.unsplash.com/photo-1578922746465-3a80a228f223?q=80&w=1200&auto=format&fit=crop" },
  { name: "Paris", region: "EUROPE", price: 459, flag: "🇫🇷", slug: "paris", image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1200&auto=format&fit=crop" },
  { name: "London", region: "EUROPE", price: 430, flag: "🇬🇧", slug: "london", image: "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1200&auto=format&fit=crop" },
  { name: "Tokyo", region: "ASIA", price: 580, flag: "🇯🇵", slug: "tokyo", image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1200&auto=format&fit=crop" },
  { name: "New York", region: "AMERICAS", price: 310, flag: "🇺🇸", slug: "new-york", image: "https://images.unsplash.com/photo-1485871981521-5b1fd3805eee?q=80&w=1200&auto=format&fit=crop" },
  { name: "Bali", region: "ASIA", price: 520, flag: "🇮🇩", slug: "bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop" },
  { name: "Istanbul", region: "EUROPE", price: 470, flag: "🇹🇷", slug: "istanbul", image: "https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=1200&auto=format&fit=crop" },
  { name: "Singapore", region: "ASIA", price: 540, flag: "🇸🇬", slug: "singapore", image: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1200&auto=format&fit=crop" },
  { name: "Rome", region: "EUROPE", price: 480, flag: "🇮🇹", slug: "rome", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=1200&auto=format&fit=crop" },
];

export function TopDestinations() {
  const [active, setActive] = React.useState<(typeof FILTERS)[number]>("ALL");
  const filtered = active === "ALL" ? DESTINATIONS : DESTINATIONS.filter((d) => d.region === active);

  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader eyebrow="EXPLORE THE WORLD" title="Top Destinations" ctaLabel="View all" ctaHref="/destinations" />

        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActive(filter)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${active === filter ? "bg-brand-red text-white" : "bg-muted text-muted-foreground"}`}
            >
              {filter}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((dest, idx) => (
              <motion.div key={dest.slug} layout initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={idx === 0 ? "lg:row-span-2" : ""}>
                <GradientCard href={`/cities/${dest.slug}`} image={dest.image} title={dest.name} className={idx === 0 ? "h-[560px]" : "h-[260px]"}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-white">{dest.flag} {dest.name}</p>
                      <Badge variant="gold" className="mt-2">From ${dest.price}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                    <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur">Explore →</span>
                  </div>
                </GradientCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
