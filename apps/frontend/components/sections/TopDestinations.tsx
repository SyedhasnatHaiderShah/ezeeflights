"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GradientCard } from "@/components/ui/gradient-card";
import { SectionHeader } from "@/components/ui/section-header";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeaturedDestinations } from "@/lib/api/destinations";

export function TopDestinations() {
  const { data, isLoading } = useFeaturedDestinations(10);
  const destinations = React.useMemo(
    () => (Array.isArray(data) ? data : []),
    [data],
  );
  const regions = React.useMemo(
    () => ["ALL", ...new Set(destinations.map((d) => d.region || "OTHER"))],
    [destinations],
  );

  const [active, setActive] = React.useState("ALL");
  const filtered =
    active === "ALL"
      ? destinations
      : destinations.filter((d) => (d.region || "OTHER") === active);

  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader
          eyebrow={
            <Badge
              variant="default"
              className="bg-redmix/10 text-redmix border-none px-3 py-1"
            >
              EXPLORE THE WORLD
            </Badge>
          }
          title="Top Destinations"
          ctaLabel="View all"
          ctaHref="/destinations"
        />
        <div className="mb-6 mt-8">
          <Tabs value={active} onValueChange={setActive}>
            <TabsList className="h-auto inline-flex items-center justify-start gap-1 bg-muted/40 p-1 rounded-full no-scrollbar overflow-x-auto max-w-full">
              {regions.map((filter) => (
                <TabsTrigger
                  key={filter}
                  value={filter}
                  className="rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-100 ease-in-out data-[state=active]:bg-redmix cursor-pointer data-[state=active]:text-white data-[state=active]:shadow-md text-foreground/70 hover:text-foreground outline-none select-none"
                >
                  {filter}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Skeleton
                key={idx}
                className={`w-full rounded-2xl ${idx === 0 ? "h-[400px] md:h-[560px]" : "h-[200px] md:h-[260px]"}`}
              />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((dest, idx) => (
                <motion.div
                  key={dest.slug}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={idx === 0 ? "lg:row-span-2" : ""}
                >
                  <GradientCard
                    href={`/cities/${dest.slug}`}
                    imageSrc={
                      dest.heroImage ||
                      dest.imageUrl ||
                      "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=1200"
                    }
                    imageAlt={dest.name}
                    className={
                      idx === 0
                        ? "h-[400px] md:h-[560px]"
                        : "h-[200px] md:h-[260px]"
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-white">
                          {dest.code
                            ? String.fromCodePoint(
                                ...[...dest.code.toUpperCase()].map(
                                  (c) => 127397 + c.charCodeAt(0),
                                ),
                              )
                            : "📍"}{" "}
                          {dest.name}
                        </p>
                        {dest.fromPrice && (
                          <Badge variant="gold" className="mt-2">
                            From {dest.currency || "USD"} {dest.fromPrice}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                      <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-sm text-white backdrop-blur">
                        Explore →
                      </span>
                    </div>
                  </GradientCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No featured destinations yet. Run backend mock seed to load
            destination data.
          </p>
        )}
      </div>
    </section>
  );
}
