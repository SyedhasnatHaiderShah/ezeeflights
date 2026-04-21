import { InfiniteMarquee } from "@/components/ui/infinite-marquee";
import { SectionHeader } from "@/components/ui/section-header";
import { AIRLINE_DATA } from "@/constants/airline-data";

const airlines = Object.keys(AIRLINE_DATA).map((k) => k.replace(/-/g, " "));

function AirlineChip({ name }: { name: string }) {
  return (
    <div className="flex h-12 min-w-[180px] items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-muted-foreground grayscale transition hover:text-foreground hover:grayscale-0">
      {name}
    </div>
  );
}

export function AirlinePartners() {
  const first = airlines.slice(0, Math.ceil(airlines.length / 2));
  const second = airlines.slice(Math.ceil(airlines.length / 2));

  const firstItems = first.map((name) => <AirlineChip key={name} name={name} />);
  const secondItems = second.map((name) => <AirlineChip key={name} name={name} />);

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
