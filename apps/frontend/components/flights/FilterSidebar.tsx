"use client";

import * as React from "react";
import { CloudSun, Moon, Sun } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useFlightFilterStore } from "@/lib/store/flight-filter-store";
import { FlightListItem } from "@/lib/types/flight-api";

type Props = {
  onClose?: () => void;
  flights?: FlightListItem[];
  resultsCount?: number;
};

const timeBuckets = [
  { key: "dawn", label: "Dawn", range: [0, 6] as [number, number], icon: Moon },
  { key: "morning", label: "Morning", range: [6, 12] as [number, number], icon: Sun },
  { key: "afternoon", label: "Afternoon", range: [12, 18] as [number, number], icon: CloudSun },
  { key: "evening", label: "Evening", range: [18, 24] as [number, number], icon: Moon },
];

const sectionLabel = "text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3";

export function FilterSidebar({ onClose, flights = [], resultsCount = 0 }: Props) {
  const { filters, setFilter, resetFilters } = useFlightFilterStore();
  const [showAllAirlines, setShowAllAirlines] = React.useState(false);

  const stopsMeta = React.useMemo(() => {
    const nonstop = flights.filter((f) => f.stops === 0).length;
    const oneStop = flights.filter((f) => f.stops === 1).length;
    const twoPlus = flights.filter((f) => f.stops >= 2).length;
    return { nonstop, oneStop, twoPlus };
  }, [flights]);

  const airlines = React.useMemo(() => {
    const grouped = new Map<string, { code: string; name: string; count: number; lowest: number }>();
    flights.forEach((flight) => {
      const name = flight.airline.name ?? "Unknown Airline";
      const code = flight.airline.code ?? "XX";
      const key = `${code}-${name}`;
      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, { code, name, count: 1, lowest: flight.totalCost });
      } else {
        existing.count += 1;
        existing.lowest = Math.min(existing.lowest, flight.totalCost);
      }
    });
    return Array.from(grouped.values()).sort((a, b) => a.lowest - b.lowest);
  }, [flights]);

  const visibleAirlines = showAllAirlines ? airlines : airlines.slice(0, 6);

  const toggleAirline = (name: string, checked: boolean) => {
    const next = checked ? [...filters.airlines, name] : filters.airlines.filter((a) => a !== name);
    setFilter("airlines", next);
  };

  const toggleStop = (key: "nonstop" | "oneStop" | "twoStops", checked: boolean) => {
    setFilter("stops", { ...filters.stops, [key]: checked });
  };

  const toggleTime = (field: "takeoffRange" | "landingRange", range: [number, number]) => {
    const current = filters[field];
    const same = current[0] === range[0] * 100 / 24 && current[1] === range[1] * 100 / 24;
    if (same) {
      setFilter(field, [0, 100]);
      return;
    }
    setFilter(field, [Math.round((range[0] / 24) * 100), Math.round((range[1] / 24) * 100)]);
  };

  return (
    <aside className="w-72 bg-card border-r border-border h-full overflow-y-auto p-4">
      <Accordion type="multiple" defaultValue={["price", "stops", "airlines", "departure", "arrival", "cabin", "bags", "duration"]}>
        <AccordionItem value="price">
          <AccordionTrigger>Price range</AccordionTrigger>
          <AccordionContent>
            <p className={sectionLabel}>Price range</p>
            <p className="text-sm font-semibold mb-3">${filters.priceRange[0]} – ${filters.priceRange[1]}</p>
            <Slider value={filters.priceRange} min={0} max={10000} step={10} onValueChange={(v) => setFilter("priceRange", v as [number, number])} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="stops">
          <AccordionTrigger>Stops</AccordionTrigger>
          <AccordionContent>
            <p className={sectionLabel}>Stops</p>
            <div className="space-y-3">
              {[
                { id: "nonstop", label: "Non-stop", count: stopsMeta.nonstop, checked: filters.stops.nonstop },
                { id: "oneStop", label: "1 Stop", count: stopsMeta.oneStop, checked: filters.stops.oneStop },
                { id: "twoStops", label: "2+ Stops", count: stopsMeta.twoPlus, checked: filters.stops.twoStops },
              ].map((item) => (
                <label key={item.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><Checkbox checked={item.checked} onCheckedChange={(checked) => toggleStop(item.id as any, Boolean(checked))} />{item.label}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{item.count}</span>
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="airlines">
          <AccordionTrigger>Airlines</AccordionTrigger>
          <AccordionContent>
            <p className={sectionLabel}>Airlines</p>
            <div className="space-y-3">
              {visibleAirlines.map((airline) => (
                <label key={airline.name} className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 min-w-0">
                    <Checkbox checked={filters.airlines.includes(airline.name)} onCheckedChange={(checked) => toggleAirline(airline.name, Boolean(checked))} />
                    <img src={`https://www.kayak.com/rimg/provider-logos/airlines/v/${airline.code}.png`} alt={airline.name} className="h-5 w-5 object-contain" onError={(e) => ((e.currentTarget.style.display = "none"))} />
                    <span className="truncate">{airline.name}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">from ${Math.round(airline.lowest)}</span>
                </label>
              ))}
            </div>
            {airlines.length > 6 && (
              <button type="button" className="text-xs text-brand-red mt-3" onClick={() => setShowAllAirlines((s) => !s)}>
                {showAllAirlines ? "Show less" : "Show all airlines"}
              </button>
            )}
          </AccordionContent>
        </AccordionItem>

        {(["departure", "arrival"] as const).map((type) => {
          const field = type === "departure" ? "takeoffRange" : "landingRange";
          return (
            <AccordionItem key={type} value={type}>
              <AccordionTrigger>{type === "departure" ? "Departure time" : "Arrival time"}</AccordionTrigger>
              <AccordionContent>
                <p className={sectionLabel}>{type} time</p>
                <div className="grid grid-cols-2 gap-2">
                  {timeBuckets.map((slot) => {
                    const Icon = slot.icon;
                    const active = filters[field][0] === Math.round((slot.range[0] / 24) * 100) && filters[field][1] === Math.round((slot.range[1] / 24) * 100);
                    return (
                      <button key={slot.key} onClick={() => toggleTime(field, slot.range)} className={cn("rounded-lg border px-3 py-2 text-xs flex items-center gap-2", active && "border-brand-red bg-brand-red/10 text-brand-red") }>
                        <Icon className="h-3.5 w-3.5" />
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}

        <AccordionItem value="cabin">
          <AccordionTrigger>Cabin class</AccordionTrigger>
          <AccordionContent>
            <p className={sectionLabel}>Cabin class</p>
            <div className="space-y-2 text-sm">
              {["Economy", "Premium Economy", "Business", "First"].map((cabin) => (
                <label key={cabin} className="flex items-center gap-2">
                  <input type="radio" checked={filters.cabinClass[0] === cabin} onChange={() => setFilter("cabinClass", [cabin])} />
                  {cabin}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bags">
          <AccordionTrigger>Bags</AccordionTrigger>
          <AccordionContent>
            <p className={sectionLabel}>Bags</p>
            <div className="space-y-2 text-sm">
              {["Carry-on only", "1 Checked Bag", "2 Checked Bags"].map((bag) => (
                <label key={bag} className="flex items-center gap-2">
                  <Checkbox
                    checked={filters.amenities.includes(bag)}
                    onCheckedChange={(checked) =>
                      setFilter("amenities", checked ? [...filters.amenities, bag] : filters.amenities.filter((a) => a !== bag))
                    }
                  />
                  {bag}
                </label>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="duration">
          <AccordionTrigger>Duration</AccordionTrigger>
          <AccordionContent>
            <p className={sectionLabel}>Duration</p>
            <p className="text-sm mb-2">Up to {Math.round((filters.durationRange[1] / 100) * 24)} hours</p>
            <Slider value={[filters.durationRange[1]]} min={0} max={100} step={1} onValueChange={(v) => setFilter("durationRange", [0, v[0]])} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="sticky bottom-0 bg-card py-3 mt-4 border-t border-border flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            resetFilters();
            onClose?.();
          }}
          className="text-sm text-brand-red"
        >
          Reset all filters
        </button>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold">{resultsCount} results</span>
      </div>
    </aside>
  );
}
