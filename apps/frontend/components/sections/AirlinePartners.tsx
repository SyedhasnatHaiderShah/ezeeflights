import { InfiniteMarquee } from "@/components/ui/infinite-marquee";
import { SectionHeader } from "@/components/ui/section-header";
import { AIRLINE_DATA } from "@/constants/airline-data";

const airlines = Object.keys(AIRLINE_DATA).map((k) => k.replace(/-/g, " "));

export function AirlinePartners() {
  const first = airlines.slice(0, Math.ceil(airlines.length / 2));
  const second = airlines.slice(Math.ceil(airlines.length / 2));

  return (
    <section className="bg-muted/30 py-12 dark:bg-muted/10">
      <div className="mx-auto max-w-[1200px] px-6">
        <SectionHeader title="Our Airline Partners" align="center" />
        <InfiniteMarquee reverse={false} speed="50s" pauseOnHover>
          {first.map((name) => (
            <div key={name} className="flex h-12 min-w-[180px] items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-muted-foreground grayscale transition hover:text-foreground hover:grayscale-0">{name}</div>
          ))}
        </InfiniteMarquee>
        <InfiniteMarquee reverse speed="60s" pauseOnHover className="mt-3">
          {second.map((name) => (
            <div key={name} className="flex h-12 min-w-[180px] items-center justify-center rounded-xl border border-border bg-card px-5 text-sm font-semibold text-muted-foreground grayscale transition hover:text-foreground hover:grayscale-0">{name}</div>
          ))}
        </InfiniteMarquee>
      </div>
    </section>
  );
}
