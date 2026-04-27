"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plane } from "lucide-react";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  getAirportByCode,
  Airport as AirportData,
} from "@/lib/utils/airport-search";
import { FlightListItem } from "@/lib/types/flight-api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AppIcon } from "../ui/app-icon";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  flight: FlightListItem;
}

function getBadge(
  flight: FlightListItem,
): { label: string; className: string } | null {
  if (flight.totalCost < 400)
    return { label: "Cheapest", className: "bg-sky-500/10 text-sky-500" };
  if (flight.totalTime < 420)
    return { label: "Fastest", className: "bg-redmix/10 text-redmix" };
  if (flight.totalCost / Math.max(1, flight.totalTime) < 1.2)
    return {
      label: "Best Value",
      className: "bg-emerald-500/10 text-emerald-500",
    };
  return null;
}

function getTimeEmoji(iso: string): string {
  if (!iso) return "✈️";
  const h = new Date(iso).getHours();
  if (h >= 0 && h < 5) return "🌙";
  if (h >= 5 && h < 10) return "🌅";
  if (h >= 10 && h < 16) return "☀️";
  if (h >= 16 && h < 20) return "🌆";
  if (h >= 20 && h < 22) return "🌙";
  return "🕛";
}

function getDurationEmoji(mins: number): string {
  if (mins < 120) return "⚡";
  if (mins < 360) return "✈️";
  return "🌍";
}

const fmtTime = (iso: string) => {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};
const durationFmt = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

export function FlightCard({ flight }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setFlights = useBookingFlowStore((state) => state.setFlights);
  const badge = getBadge(flight);

  if (!flight.outbound || flight.outbound.length === 0) return null;

  const first = flight.outbound[0];
  const last = flight.outbound[flight.outbound.length - 1];
  const overnight =
    last?.arrivalDate && first?.departureDate
      ? new Date(last.arrivalDate).getDate() !==
        new Date(first.departureDate).getDate()
      : false;
  const stops = Math.max(0, flight.outbound.length - 1);

  const symbol =
    ({ USD: "$", GBP: "£", EUR: "€", PKR: "Rs" } as Record<string, string>)[
      flight.currency
    ] || flight.currency;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border bg-white dark:bg-card shadow-sm hover:shadow-md transition-all mb-3 group">
      <div className="flex flex-col xl:flex-row">
        {/* Left: Content */}
        <div className="flex-1 p-3 lg:p-5">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-muted/50 p-1 border border-border/50 flex items-center justify-center shrink-0">
                <img
                  src={`https://www.kayak.com/rimg/provider-logos/airlines/v/${first.airline.code ?? "XX"}.png`}
                  alt={first.airline.name ?? "Airline"}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">
                  {first.airline.name}
                </p>
                <p className="text-[10px] text-foreground font-bold tracking-widest">
                  {first.flightNo || `EF-${flight.flightId.slice(0, 4)}`}
                </p>
              </div>
            </div>
            {badge && (
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                  badge.className,
                )}
              >
                {badge.label}
              </span>
            )}
          </div>

          <FlightLeg
            from={first.fromAirport.code}
            fromName={first.fromAirport.name}
            fromTime={fmtTime(first.departureDate)}
            fromIso={first.departureDate}
            to={last.toAirport.code}
            toName={last.toAirport.name}
            toTime={fmtTime(last.arrivalDate)}
            durationMins={flight.totalTime}
            stops={stops}
            stopCode={first.toAirport.code}
            overnight={overnight}
          />

          {flight.inbound && flight.inbound.length > 0 && (
            <div className="mt-4 pt-4 border-t border-dashed border-border">
              <FlightLeg
                from={flight.inbound[0].fromAirport.code}
                fromName={flight.inbound[0].fromAirport.name}
                fromTime={fmtTime(flight.inbound[0].departureDate)}
                fromIso={flight.inbound[0].departureDate}
                to={flight.inbound[flight.inbound.length - 1].toAirport.code}
                toName={
                  flight.inbound[flight.inbound.length - 1].toAirport.name
                }
                toTime={fmtTime(
                  flight.inbound[flight.inbound.length - 1].arrivalDate,
                )}
                durationMins={flight.totalTime}
                stops={flight.inbound.length - 1}
              />
            </div>
          )}

          {/* <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-foreground tracking-wider">
            <span>{first.cabinClass}</span>
            <span>•</span>
            <span>{first.baggageAllowance || "15kg Bag"}</span>
          </div> */}

          <Accordion
            type="single"
            collapsible
            className="mt-4 border-t border-border/40 hidden xl:block"
          >
            <AccordionItem value="details" className="border-b-0">
              <AccordionTrigger className="text-xs font-medium text-foreground tracking-wider hover:no-underline flex justify-center gap-2">
                View Flight Details
              </AccordionTrigger>
              <AccordionContent className="">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs normal-case tracking-normal">
                  <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/50 dark:bg-muted/10 border border-border/50">
                    <p className="text-xs font-bold text-foreground tracking-wider mb-2 border-b border-border/50 pb-1">
                      Fare Breakdown
                    </p>
                    <div className="grid grid-cols-2 gap-y-1">
                      <span className="text-foreground">Base Fare</span>
                      <span className="text-right font-semibold">
                        {symbol}
                        {flight.flightFare.adultFare.toLocaleString()}
                      </span>
                      <span className="text-foreground">Taxes & Fees</span>
                      <span className="text-right font-semibold">
                        {symbol}
                        {flight.flightFare.adultTax.toLocaleString()}
                      </span>
                      <div className="col-span-2 border-t border-dashed border-border/50 my-1" />
                      <span className="text-foreground font-bold">Total</span>
                      <span className="text-right font-bold text-redmix">
                        {symbol}
                        {flight.flightFare.grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-muted/10 border border-border/50">
                      <p className="text-xs font-bold text-foreground tracking-wider mb-2 border-b border-border/50 pb-1">
                        Flight Info
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-foreground">Aircraft</span>
                          <span className="font-bold">
                            {first.equipmentType || "Boeing 737-800"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground">Baggage</span>
                          <span className="font-bold text-emerald-600">
                            {first.baggageAllowance || "15kg included"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Right: Booking */}
        <div className="w-full xl:w-48 dark:bg-muted/20 border-t md:border-t-0 md:border-l border-border p-3 lg:p-3 flex flex-row lg:flex-col justify-between lg:justify-center items-center gap-3">
          <div className="text-left md:text-center">
            <p className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-1">
              Total Price
            </p>
            <p className="text-2xl font-bold text-foreground leading-none">
              <span className="text-sm font-bold mr-1">{symbol}</span>
              {Math.round(flight.totalCost).toLocaleString()}
            </p>
          </div>
          <Button
            className="w-auto md:w-full bg-redmix text-white font-bold h-11 rounded-xl shadow-lg shadow-redmix/20 hover:brightness-110 active:scale-[0.98] transition-all"
            onClick={() => {
              setFlights([flight.flightId]);
              const params = new URLSearchParams(searchParams.toString());
              params.set("id", flight.flightId);
              router.push(`/flights/booking?${params.toString()}`);
            }}
          >
            Select
          </Button>
        </div>

        <Accordion
          type="single"
          collapsible
          className="mt-0 border-t border-border/40 xl:hidden block"
        >
          <AccordionItem value="details" className="border-b-0">
            <AccordionTrigger className="text-xs font-medium text-foreground tracking-wider hover:no-underline flex justify-center gap-2">
              View Flight Details
            </AccordionTrigger>
            <AccordionContent className="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs normal-case tracking-normal">
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/50 dark:bg-muted/10 border border-border/50">
                  <p className="text-xs font-bold text-foreground tracking-wider mb-2 border-b border-border/50 pb-1">
                    Fare Breakdown
                  </p>
                  <div className="grid grid-cols-2 gap-y-1">
                    <span className="text-foreground">Base Fare</span>
                    <span className="text-right font-semibold">
                      {symbol}
                      {flight.flightFare.adultFare.toLocaleString()}
                    </span>
                    <span className="text-foreground">Taxes & Fees</span>
                    <span className="text-right font-semibold">
                      {symbol}
                      {flight.flightFare.adultTax.toLocaleString()}
                    </span>
                    <div className="col-span-2 border-t border-dashed border-border/50 my-1" />
                    <span className="text-foreground font-bold">Total</span>
                    <span className="text-right font-bold text-redmix">
                      {symbol}
                      {flight.flightFare.grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-muted/10 border border-border/50">
                    <p className="text-xs font-bold text-foreground tracking-wider mb-2 border-b border-border/50 pb-1">
                      Flight Info
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-foreground">Aircraft</span>
                        <span className="font-bold">
                          {first.equipmentType || "Boeing 737-800"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground">Baggage</span>
                        <span className="font-bold text-emerald-600">
                          {first.baggageAllowance || "15kg included"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </article>
  );
}

/* ── Leg Row ─────────────────────────────────────────── */
interface LegProps {
  from: string;
  fromName: string;
  fromTime: string;
  fromIso: string;
  to: string;
  toName: string;
  toTime: string;
  durationMins: number;
  stops: number;
  stopCode?: string;
  overnight?: boolean;
}

function FlightLeg({
  from,
  fromName,
  fromTime,
  fromIso,
  to,
  toName,
  toTime,
  durationMins,
  stops,
  stopCode,
  overnight,
}: LegProps) {
  const [fromCity, setFromCity] = React.useState("");
  const [toCity, setToCity] = React.useState("");

  React.useEffect(() => {
    const resolveNames = async () => {
      const f = await getAirportByCode(from);
      if (f) setFromCity(f.municipality || f.name.split(" ")[0]);
      const t = await getAirportByCode(to);
      if (t) setToCity(t.municipality || t.name.split(" ")[0]);
    };
    resolveNames();
  }, [from, to]);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="min-w-[60px]">
          <p className="text-lg font-bold leading-none">
            {fromTime} {getTimeEmoji(fromIso)}
          </p>
          <p className="text-xs font-bold text-foreground mt-1 truncate max-w-[120px]">
            {from}{" "}
            {fromCity && (
              <span className="text-muted-foreground font-medium ml-1">
                {fromCity}
              </span>
            )}
          </p>
        </div>

        <div className="flex-1 flex flex-col items-center px-4 relative group/path">
          <div className="text-xs font-bold text-foreground mb-1 flex items-center gap-1">
            <span>{durationFmt(durationMins)}</span>
            <span>{getDurationEmoji(durationMins)}</span>
          </div>

          <div className="w-full flex items-center gap-1.5">
            <div className="h-0.5 flex-1 bg-border rounded-full" />
            {stops > 0 ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-redmix shrink-0 shadow-[0_0_8px_rgba(197,42,40,0.5)]" />
                <div className="h-0.5 flex-1 bg-border rounded-full" />
              </>
            ) : null}
          </div>

          <div className="mt-1">
            <span
              className={cn(
                "text-xs font-semibold uppercase tracking-wider",
                stops === 0 ? "text-emerald-600" : "text-foreground",
              )}
            >
              {stops === 0
                ? "Direct"
                : `${stops} Stop${stops > 1 ? "s" : ""} (${stopCode})`}
            </span>
          </div>
        </div>

        <div className="min-w-[60px] text-right">
          <p className="text-lg font-bold leading-none">{toTime}</p>
          <div className="flex items-center justify-end gap-1 mt-1">
            <p className="text-xs font-bold text-foreground truncate max-w-[120px]">
              {toCity && (
                <span className="text-muted-foreground font-medium mr-1">
                  {toCity}
                </span>
              )}{" "}
              {to}
            </p>
            {overnight && (
              <span className="text-[10px] font-bold text-redmix">+1d</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
