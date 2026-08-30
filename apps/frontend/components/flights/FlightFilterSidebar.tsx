"use client";

import * as React from "react";
import { CloudSun, ChevronRight, Check, Moon, Sun } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlightFilterStore } from "@/lib/store/flight-filter-store";
import { resolveAirlineName } from "@/lib/utils/airline-names";
import { AirlineLogo } from "./AirlineLogo";
import { FlightListItem } from "@/lib/types/flight-api";
import type { FlightSearchAirlineSummary } from "@/lib/api/flights";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";
import { useTranslation } from "react-i18next";

type Props = {
  onClose?: () => void;
  flights?: FlightListItem[];
  airlineSummary?: FlightSearchAirlineSummary[];
  resultsCount?: number;
  sortMode?: string;
  onSortChange?: (mode: any) => void;
  sourceCurrency?: string;
};

const timeBuckets = [
  { key: "dawn", label: "Dawn", range: [0, 6] as [number, number], icon: Moon },
  {
    key: "morning",
    label: "Morning",
    range: [6, 12] as [number, number],
    icon: Sun,
  },
  {
    key: "afternoon",
    label: "Afternoon",
    range: [12, 18] as [number, number],
    icon: CloudSun,
  },
  {
    key: "evening",
    label: "Evening",
    range: [18, 24] as [number, number],
    icon: Moon,
  },
];

const GROUP_SURFACE_CLASS =
  "overflow-hidden rounded-[12px] bg-white dark:bg-card border border-border/50";

const sectionLabel = "px-1 text-[13px] font-semibold text-foreground/80 mb-1.5";

const accordionItemClass =
  "border-0 mb-2.5 last:mb-0 hover:border-transparent data-[state=open]:bg-transparent data-[state=open]:border-transparent";

const accordionTriggerClass =
  "!py-2 min-h-[38px] px-1 text-[15px] font-medium text-foreground tracking-normal hover:no-underline [&[data-state=open]]:text-foreground [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:justify-between [&>span]:gap-2 [&>div]:hidden";

const accordionContentClass =
  "!pb-0 !pt-1.5 px-0 text-foreground [&_.accordion-content-inner]:!p-0 [&_.accordion-content-inner]:!pb-0";

function FilterGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(GROUP_SURFACE_CLASS, "divide-y divide-border/50")}>
      {children}
    </div>
  );
}

function FilterRow({
  label,
  meta,
  checked,
  onToggle,
  leading,
}: {
  label: React.ReactNode;
  meta?: React.ReactNode;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  leading?: React.ReactNode;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onToggle(!checked)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(!checked);
        }
      }}
      className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left active:bg-foreground/5 transition-colors"
    >
      <span className="flex min-w-0 items-center gap-2">
        {leading}
        <span className="truncate text-[14px] font-normal text-foreground leading-tight">
          {label}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span
          aria-hidden
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            checked
              ? "border-redmix bg-redmix text-white"
              : "border-foreground/25 bg-white dark:bg-card",
          )}
        >
          {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
        </span>
      </span>
    </div>
  );
}

function PanelCard({ children }: { children: React.ReactNode }) {
  return <div className={cn(GROUP_SURFACE_CLASS, "px-3 py-2")}>{children}</div>;
}

export function FlightFilterSidebar({
  onClose,
  flights = [],
  airlineSummary = [],
  resultsCount = 0,
  sortMode,
  onSortChange,
  sourceCurrency = "USD",
}: Props) {
  const { t } = useTranslation();
  const { filters, setFilter, resetFilters } = useFlightFilterStore();
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const currencyMeta =
    SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES["USD"];
  const [showAllAirlines, setShowAllAirlines] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const availableCabinClasses = React.useMemo(() => {
    const set = new Set<string>();
    flights.forEach((flight) => {
      if (flight.cabinClass) {
        set.add(flight.cabinClass.toUpperCase().replace(/[\s-_]+/g, ""));
      }
      if (Array.isArray(flight.availableCabinClasses)) {
        flight.availableCabinClasses.forEach((c) => {
          if (c) {
            set.add(c.toUpperCase().replace(/[\s-_]+/g, ""));
          }
        });
      }
    });
    return set;
  }, [flights]);

  const stopsMeta = React.useMemo(() => {
    const nonstop = flights.filter((f) => f.stops === 0).length;
    const oneStop = flights.filter((f) => f.stops === 1).length;
    const twoPlus = flights.filter((f) => f.stops >= 2).length;
    return { nonstop, oneStop, twoPlus };
  }, [flights]);

  const hasBids = React.useMemo(() => {
    return flights.some((f) => f.cheapBidApplied);
  }, [flights]);

  const priceBounds = React.useMemo(() => {
    if (flights.length === 0) return { min: 0, max: 10000 };
    const prices = flights.map((f) => f.totalCost);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [flights]);

  const airlines = React.useMemo(() => {
    if (airlineSummary.length > 0) {
      return airlineSummary.map((airline) => ({
        code: airline.code,
        name: resolveAirlineName(airline.code, airline.name),
        count: airline.count,
        lowest: airline.lowestFare,
      }));
    }

    const grouped = new Map<
      string,
      { code: string; name: string; count: number; lowest: number }
    >();
    flights.forEach((flight) => {
      const code = flight.airline.code ?? "XX";
      const name = resolveAirlineName(code, flight.airline.name);
      const key = code;
      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, { code, name, count: 1, lowest: flight.totalCost });
      } else {
        existing.count += 1;
        existing.lowest = Math.min(existing.lowest, flight.totalCost);
      }
    });
    return Array.from(grouped.values()).sort((a, b) => a.lowest - b.lowest);
  }, [airlineSummary, flights]);

  const visibleAirlines = showAllAirlines ? airlines : airlines.slice(0, 6);

  const toggleAirline = (code: string, checked: boolean) => {
    const next = checked
      ? [...filters.airlines, code]
      : filters.airlines.filter((a) => a !== code);
    setFilter("airlines", next);
  };

  const toggleStop = (
    key: "nonstop" | "oneStop" | "twoStops",
    checked: boolean,
  ) => {
    setFilter("stops", { ...filters.stops, [key]: checked });
  };

  const toggleTime = (
    field: "takeoffRange" | "landingRange",
    range: [number, number],
  ) => {
    const current = filters[field];
    const same =
      current[0] === (range[0] * 100) / 24 &&
      current[1] === (range[1] * 100) / 24;
    if (same) {
      setFilter(field, [0, 100]);
      return;
    }
    setFilter(field, [
      Math.round((range[0] / 24) * 100),
      Math.round((range[1] / 24) * 100),
    ]);
  };

  return (
    <aside className="w-full bg-transparent px-2 pb-4">
      {!isMounted ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24 bg-foreground/10 rounded" />
              <Skeleton className="h-28 w-full bg-foreground/5 rounded-[12px]" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {onSortChange && (
            <div className="mb-3 lg:hidden">
              <p className={sectionLabel}>{t("Sort Results")}</p>
              <div className="flex rounded-[10px] bg-muted/60 p-0.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
                {["best", "cheapest", "fastest", "duration", "bid"]
                  .filter((mode) => mode !== "bid" || hasBids)
                  .map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onSortChange(mode)}
                      className={cn(
                        "flex-1 rounded-[8px] px-1.5 py-1.5 text-[11px] font-semibold capitalize transition-all duration-150",
                        sortMode === mode
                          ? "bg-white dark:bg-redmix text-redmix dark:text-white shadow-sm"
                          : "text-foreground/80 active:bg-white/70",
                        mode === "bid" &&
                          sortMode !== "bid" &&
                          "text-redmix font-bold",
                      )}
                    >
                      {t(mode)}
                    </button>
                  ))}
              </div>
            </div>
          )}

          <Accordion
            type="multiple"
            defaultValue={[
              "price",
              "stops",
              "airlines",
              "flightNumber",
              "departure",
              "arrival",
              "cabin",
              "bags",
              "duration",
            ]}
            className="space-y-0.5"
          >
            <AccordionItem value="price" className={accordionItemClass}>
              <AccordionTrigger className={accordionTriggerClass}>
                {t("Price range")}
                <ChevronRight className="h-4 w-4 shrink-0 text-foreground/35 transition-transform group-data-[state=open]:rotate-90" />
              </AccordionTrigger>
              <AccordionContent className={accordionContentClass}>
                <PanelCard>
                  <p className="text-sm font-semibold text-foreground mb-1.5 leading-tight">
                    {currencyMeta.symbol}
                    {Math.round(
                      getConvertedAmount(
                        filters.priceRange[0],
                        sourceCurrency as any,
                        baseCurrency,
                      ),
                    ).toLocaleString("en-US")}{" "}
                    – {currencyMeta.symbol}
                    {Math.round(
                      getConvertedAmount(
                        filters.priceRange[1],
                        sourceCurrency as any,
                        baseCurrency,
                      ),
                    ).toLocaleString("en-US")}
                  </p>
                  <Slider
                    variant="ios"
                    value={[
                      Math.max(priceBounds.min, filters.priceRange[0]),
                      Math.min(priceBounds.max, filters.priceRange[1]),
                    ]}
                    min={priceBounds.min}
                    max={priceBounds.max}
                    step={Math.max(
                      1,
                      Math.round((priceBounds.max - priceBounds.min) / 100),
                    )}
                    onValueChange={(v) =>
                      setFilter("priceRange", v as [number, number])
                    }
                  />
                </PanelCard>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="stops" className={accordionItemClass}>
              <AccordionTrigger className={accordionTriggerClass}>
                {t("Stops")}
                <ChevronRight className="h-4 w-4 shrink-0 text-foreground/35 transition-transform group-data-[state=open]:rotate-90" />
              </AccordionTrigger>
              <AccordionContent className={accordionContentClass}>
                <FilterGroup>
                  {[
                    {
                      id: "nonstop" as const,
                      label: t("Direct"),
                      count: stopsMeta.nonstop,
                      checked: filters.stops.nonstop,
                    },
                    {
                      id: "oneStop" as const,
                      label: t("1 Stop"),
                      count: stopsMeta.oneStop,
                      checked: filters.stops.oneStop,
                    },
                    {
                      id: "twoStops" as const,
                      label: t("2+ Stops"),
                      count: stopsMeta.twoPlus,
                      checked: filters.stops.twoStops,
                    },
                  ].map((item) => (
                    <FilterRow
                      key={item.id}
                      label={item.label}
                      checked={item.checked}
                      onToggle={(checked) => toggleStop(item.id, checked)}
                      meta={
                        <span className="text-[11px] font-medium text-foreground/80">
                          {item.count}
                        </span>
                      }
                    />
                  ))}
                </FilterGroup>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="airlines" className={accordionItemClass}>
              <AccordionTrigger className={accordionTriggerClass}>
                {t("Airlines")}
                <ChevronRight className="h-4 w-4 shrink-0 text-foreground/35 transition-transform group-data-[state=open]:rotate-90" />
              </AccordionTrigger>
              <AccordionContent className={accordionContentClass}>
                <FilterGroup>
                  {visibleAirlines.map((airline) => (
                    <FilterRow
                      key={airline.name}
                      label={airline.name}
                      checked={filters.airlines.includes(airline.code)}
                      onToggle={(checked) =>
                        toggleAirline(airline.code, checked)
                      }
                      leading={
                        <AirlineLogo
                          code={airline.code}
                          name={airline.name}
                          className="h-4 w-4 object-contain shrink-0"
                        />
                      }
                      meta={
                        <span className="text-[11px] font-medium text-foreground/80 whitespace-nowrap">
                          {t("from ")}
                          {currencyMeta.symbol}
                          {Math.round(
                            getConvertedAmount(
                              airline.lowest,
                              sourceCurrency as any,
                              baseCurrency,
                            ),
                          ).toLocaleString("en-US")}
                        </span>
                      }
                    />
                  ))}
                </FilterGroup>
                {airlines.length > 6 && (
                  <button
                    type="button"
                    className="mt-1.5 px-0.5 text-[13px] text-redmix font-medium active:opacity-60"
                    onClick={() => setShowAllAirlines((s) => !s)}
                  >
                    {showAllAirlines ? t("Show less") : t("Show all airlines")}
                  </button>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="flightNumber" className={accordionItemClass}>
              <AccordionTrigger className={accordionTriggerClass}>
                {t("Flight number")}
                <ChevronRight className="h-4 w-4 shrink-0 text-foreground/35 transition-transform group-data-[state=open]:rotate-90" />
              </AccordionTrigger>
              <AccordionContent className={accordionContentClass}>
                <PanelCard>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder={t("e.g. EK201, AA100...")}
                      value={filters.flightNumber || ""}
                      onChange={(e) =>
                        setFilter("flightNumber", e.target.value)
                      }
                      className="h-10 bg-white dark:bg-card border border-border/50 text-[14px]"
                    />
                  </div>
                </PanelCard>
              </AccordionContent>
            </AccordionItem>

            {(["departure", "arrival"] as const).map((type) => {
              const field =
                type === "departure" ? "takeoffRange" : "landingRange";
              return (
                <AccordionItem
                  key={type}
                  value={type}
                  className={accordionItemClass}
                >
                  <AccordionTrigger className={accordionTriggerClass}>
                    {type === "departure"
                      ? t("Departure time")
                      : t("Arrival time")}
                    <ChevronRight className="h-4 w-4 shrink-0 text-foreground/35 transition-transform group-data-[state=open]:rotate-90" />
                  </AccordionTrigger>
                  <AccordionContent className={accordionContentClass}>
                    <div className="grid grid-cols-2 gap-2">
                      {timeBuckets.map((slot) => {
                        const Icon = slot.icon;
                        const active =
                          filters[field][0] ===
                            Math.round((slot.range[0] / 24) * 100) &&
                          filters[field][1] ===
                            Math.round((slot.range[1] / 24) * 100);
                        return (
                          <button
                            key={slot.key}
                            onClick={() => toggleTime(field, slot.range)}
                            className={cn(
                              "rounded-[10px] border px-2 py-1.5 text-[12px] flex items-center gap-1.5 transition-all active:scale-[0.98]",
                              active
                                ? "border-redmix bg-redmix/10 text-redmix font-semibold"
                                : "border-border/50 bg-white dark:bg-card text-foreground active:bg-foreground/5",
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            {t(slot.label)}
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}

            {availableCabinClasses.size !== 1 && (
              <AccordionItem value="cabin" className={accordionItemClass}>
                <AccordionTrigger className={accordionTriggerClass}>
                  {t("Cabin class")}
                  <ChevronRight className="h-4 w-4 shrink-0 text-foreground/35 transition-transform group-data-[state=open]:rotate-90" />
                </AccordionTrigger>
                <AccordionContent className={accordionContentClass}>
                  <FilterGroup>
                    {["Economy", "Premium Economy", "Business", "First"]
                      .filter((cabin) => {
                        if (availableCabinClasses.size === 0) return true;
                        const normalizedValue = cabin
                          .toUpperCase()
                          .replace(/\s+/g, "");
                        return availableCabinClasses.has(normalizedValue);
                      })
                      .map((cabin) => {
                        const normalizedValue = cabin
                          .toUpperCase()
                          .replace(/\s+/g, "");
                        return (
                          <FilterRow
                            key={cabin}
                            label={t(cabin)}
                            checked={
                              filters.cabinClass[0]?.toUpperCase() ===
                              normalizedValue
                            }
                            onToggle={(checked) =>
                              setFilter(
                                "cabinClass",
                                checked ? [normalizedValue] : [],
                              )
                            }
                          />
                        );
                      })}
                  </FilterGroup>
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="bags" className={accordionItemClass}>
              <AccordionTrigger className={accordionTriggerClass}>
                {t("Bags")}
                <ChevronRight className="h-4 w-4 shrink-0 text-foreground/35 transition-transform group-data-[state=open]:rotate-90" />
              </AccordionTrigger>
              <AccordionContent className={accordionContentClass}>
                <FilterGroup>
                  {["Carry-on only", "1 Checked Bag", "2 Checked Bags"].map(
                    (bag) => (
                      <FilterRow
                        key={bag}
                        label={t(bag)}
                        checked={filters.amenities.includes(bag)}
                        onToggle={(checked) =>
                          setFilter(
                            "amenities",
                            checked
                              ? [...filters.amenities, bag]
                              : filters.amenities.filter((a) => a !== bag),
                          )
                        }
                      />
                    ),
                  )}
                </FilterGroup>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="duration" className={accordionItemClass}>
              <AccordionTrigger className={accordionTriggerClass}>
                {t("Duration")}
                <ChevronRight className="h-4 w-4 shrink-0 text-foreground/35 transition-transform group-data-[state=open]:rotate-90" />
              </AccordionTrigger>
              <AccordionContent className={accordionContentClass}>
                <PanelCard>
                  <p className="text-sm font-semibold text-foreground mb-1.5 leading-tight">
                    {t("Up to")}{" "}
                    {Math.round((filters.durationRange[1] / 100) * 72)}{" "}
                    {t("hours")}
                  </p>
                  <Slider
                    variant="ios"
                    value={[filters.durationRange[1]]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(v) => setFilter("durationRange", [0, v[0]])}
                  />
                </PanelCard>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="mt-2.5 pt-3 border-t border-border/50 flex flex-col items-center gap-2">
            {/* <span className="rounded-full border border-border/50 bg-white dark:bg-card px-3 py-1 text-[12px] font-medium text-foreground/80">
              {resultsCount} {t("results")}
            </span> */}
            <button
              type="button"
              onClick={() => {
                resetFilters();
                onClose?.();
              }}
              className="text-[14px] text-redmix font-medium active:opacity-60"
            >
              {t("Reset all filters")}
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
