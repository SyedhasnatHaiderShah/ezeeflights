"use client";

import { InfiniteMarquee } from "@/components/ui/infinite-marquee";
import { SectionHeader } from "@/components/ui/section-header";
import { useAirlines } from "@/lib/api/airlines";

function AirlineChip({ name, logoUrl }: { name: string; logoUrl?: string }) {
  return (
    <div className="flex h-12 min-w-[180px] items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-muted-foreground grayscale transition hover:text-foreground hover:grayscale-0">
      {logoUrl ? <img src={logoUrl} alt={name} className="h-10 w-auto grayscale transition hover:grayscale-0" /> : name}
    </div>
  );
}

export function AirlinePartners() {
  const { data: airlines = [] } = useAirlines();
  const first = airlines.slice(0, Math.ceil(airlines.length / 2));
  const second = airlines.slice(Math.ceil(airlines.length / 2));

  const firstItems = first.map((airline) => <AirlineChip key={airline.id || airline.name} name={airline.name} logoUrl={airline.logoUrl} />);
  const secondItems = second.map((airline) => <AirlineChip key={airline.id || airline.name} name={airline.name} logoUrl={airline.logoUrl} />);

  return (
    <section className="bg-muted/30 py-12 dark:bg-muted/10">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader title="Our Airline Partners" align="center" />
        <div className="mt-8 space-y-3">
          <InfiniteMarquee items={firstItems} reverse={false} speed={50} pauseOnHover />
          <InfiniteMarquee items={secondItems} reverse speed={60} pauseOnHover />
        </div>
      </div>
    </section>
  );
}
