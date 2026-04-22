"use client";

import { InfiniteMarquee } from "@/components/ui/infinite-marquee";

import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAirlines, type Airline } from "@/lib/api/airlines";

function AirlineChip({
  name,
  logoUrl,
  code,
}: {
  name: string;
  logoUrl?: string;
  code?: string;
}) {
  const fallbackLabel = (code || name.slice(0, 2)).toUpperCase();

  return (
    <div className="relative flex h-16 min-w-[240px] items-center justify-center overflow-hidden rounded-xl border border-border bg-card px-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-sm">
      {logoUrl ? (
        <>
          <div className="absolute inset-0 bg-white" />
          <img
            src={logoUrl}
            alt={name}
            className="absolute inset-0 h-full w-full aspect-video object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/20 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-linear-to-r from-brand-red/80 via-brand-red/65 to-brand-red/50" />
      )}

      <div className="relative z-10 flex w-full items-center gap-3">
        {!logoUrl ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
            {fallbackLabel}
          </div>
        ) : null}
        <span className="truncate">{name}</span>
      </div>
    </div>
  );
}

export function AirlinePartners() {
  const { data: airlines = [], isLoading } = useAirlines();
  const first = airlines.slice(0, Math.ceil(airlines.length / 2));

  const second = airlines.slice(Math.ceil(airlines.length / 2));

  const firstItems = first.map((airline: Airline) => (
    <AirlineChip
      key={airline.id || airline.name}
      name={airline.name}
      logoUrl={airline.logoUrl}
      code={airline.code}
    />
  ));
  const secondItems = second.map((airline: Airline) => (
    <AirlineChip
      key={airline.id || airline.name}
      name={airline.name}
      logoUrl={airline.logoUrl}
      code={airline.code}
    />
  ));

  return (
    <section className="bg-muted/30 py-12 dark:bg-muted/10">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader title="Our Airline Partners" align="center" />
        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Skeleton key={idx} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : airlines.length > 0 ? (
          <div className="mt-8 space-y-3">
            <InfiniteMarquee
              items={firstItems}
              reverse={false}
              speed={50}
              pauseOnHover
            />
            <InfiniteMarquee
              items={secondItems}
              reverse
              speed={60}
              pauseOnHover
            />
          </div>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No airline partners found yet. Seed backend mock data to populate
            this section.
          </p>
        )}
      </div>
    </section>
  );
}
