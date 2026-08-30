"use client";

import { InfiniteMarquee } from "@/components/ui/infinite-marquee";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useAirlines, type Airline } from "@/lib/api/airlines";
import { cn } from "@/lib/utils";

function AirlineChip({
  name,
  logoUrl,
  code,
}: {
  name: string;
  logoUrl?: string;
  code?: string;
}) {
  const { t } = useTranslation();
  const codeKey = code?.toUpperCase() || "";

  // Get the logo from the standard Aviasales/Travelpayouts API if code is available,
  // otherwise fallback to logoUrl or custom fallback
  const logoSrc = codeKey
    ? `https://pics.avs.io/200/80/${codeKey}.png`
    : logoUrl || "";

  return (
    <div className="group relative flex flex-col items-center justify-between h-auto min-w-[160px] overflow-hidden rounded-xl border border-border/80 bg-white dark:bg-zinc-950 p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary/20">
      <div className="flex h-12 w-full items-center justify-center rounded-lg bg-white p-1.5 border border-zinc-200/80">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={t("{{name}} logo", { name: t(name) })}
            className="h-full w-auto max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // fallback placeholder if logo fails to load
              e.currentTarget.src = `https://placehold.co/100x50/eaeaea/333333?text=${codeKey || name.substring(0, 2)}`;
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">
            {codeKey || name.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-col items-center text-center mt-2 w-full min-w-0">
        <span className="truncate w-full text-xs font-bold tracking-tight text-foreground">
          {t(name)}
        </span>
        {/* {codeKey && (
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            {codeKey}
          </span>
        )} */}
      </div>
    </div>
  );
}

export function AirlinePartners() {
  const { t } = useTranslation();
  const { data: airlines = [], isLoading } = useAirlines();
  const items = airlines.map((airline: Airline) => (
    <AirlineChip
      key={airline.id || airline.name}
      name={airline.name}
      logoUrl={airline.logoUrl}
      code={airline.code}
    />
  ));

  return (
    <section className="overflow-x-hidden bg-background py-10 md:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-full border border-border/50 px-0 py-4 shadow-sm">
          <SectionHeader title={t("Our Airline Partners")} align="center" />
        </div>

        {isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <Skeleton key={idx} className="h-[72px] rounded-2xl" />
            ))}
          </div>
        ) : airlines.length > 0 ? (
          <div
            className={cn(
              "mt-6 overflow-hidden py-2 border border-border/60 shadow-sm",
            )}
          >
            <InfiniteMarquee
              items={items}
              reverse={false}
              speed={50}
              pauseOnHover
            />
          </div>
        ) : (
          <p className="mt-6 rounded-[28px] border border-dashed border-border p-0 text-center text-sm text-muted-foreground">
            {t(
              "No airline partners found yet. Seed backend mock data to populate this section.",
            )}
          </p>
        )}
      </div>
    </section>
  );
}
