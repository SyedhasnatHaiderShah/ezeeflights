"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plane, Wifi, UtensilsCrossed, PlugZap, Tv } from "lucide-react";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { FlightListItem } from "@/lib/types/flight-api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Props { flight: FlightListItem; }

function getBadge(flight: FlightListItem): { label: string; className: string } | null {
  if (flight.totalCost < 400) return { label: "Cheapest", className: "bg-sky-100 text-sky-700" };
  if (flight.totalTime < 420) return { label: "Fastest", className: "bg-brand-red/15 text-brand-red" };
  if (flight.totalCost / Math.max(1, flight.totalTime) < 1.2) return { label: "Best Value", className: "bg-emerald-100 text-emerald-700" };
  return null;
}

const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
const duration = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

export function FlightCard({ flight }: Props) {
  const router = useRouter();
  const setFlights = useBookingFlowStore((state) => state.setFlights);
  const badge = getBadge(flight);
  const first = flight.outbound[0];
  const last = flight.outbound[flight.outbound.length - 1];
  const overnight = new Date(last.arrivalDate).getDate() !== new Date(first.departureDate).getDate();
  const stops = Math.max(0, flight.outbound.length - 1);

  const symbol = ({ USD: "$", GBP: "£", EUR: "€", PKR: "Rs" } as Record<string, string>)[flight.currency] || flight.currency;
  const originalAmount = Math.round(flight.totalCost * 1.1);

  return (
    <article className="rounded-2xl border border-border bg-card p-4 md:p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <img src={`https://www.kayak.com/rimg/provider-logos/airlines/v/${first.airline.code ?? "XX"}.png`} alt={first.airline.name ?? "Airline"} className="h-8 w-8 object-contain" />
          <div className="min-w-0">
            <p className="font-semibold truncate">{first.airline.name ?? "Unknown Airline"}</p>
            <p className="text-sm text-muted-foreground">{first.flightNo || `EF-${flight.flightId.slice(0, 6)}`}</p>
          </div>
        </div>
        {badge && <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", badge.className)}>{badge.label}</span>}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="text-left">
          <p className="text-2xl font-bold">{first.fromAirport.code}</p>
          <p className="text-lg">{fmtTime(first.departureDate)}</p>
        </div>

        <div className="text-center min-w-[170px]">
          <p className="text-sm font-semibold">{duration(flight.totalTime)}</p>
          <div className="my-2 flex items-center gap-1">
            <div className="h-px flex-1 border-t border-dashed border-border" />
            <Plane className="h-4 w-4 text-brand-red" />
            <div className="h-px flex-1 border-t border-dashed border-border" />
          </div>
          <span className={cn("inline-flex rounded-full px-2 py-1 text-xs", stops === 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
            {stops === 0 ? "Non-stop" : `${stops} Stop${stops > 1 ? "s" : ""} - ${first.toAirport.code}`}
          </span>
        </div>

        <div className="text-left md:text-right">
          <p className="text-2xl font-bold">{last.toAirport.code}</p>
          <p className="text-lg">{fmtTime(last.arrivalDate)}</p>
          {overnight && <p className="text-xs text-muted-foreground">+1 day</p>}
        </div>
      </div>

      <div className="mt-4 border-t border-border pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {first.cabinClass} · {first.baggageAllowance || "1 bag"} · Non-refundable · On-time 91%
        </p>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs line-through text-muted-foreground">{symbol}{originalAmount.toLocaleString()}</p>
            <p className="text-2xl font-bold text-brand-red">{symbol}{Math.round(flight.totalCost).toLocaleString()}</p>
          </div>
          <Button
            variant="outline"
            className="border-brand-red text-brand-red hover:bg-brand-red hover:text-white"
            onClick={() => {
              setFlights([flight.flightId]);
              router.push(`/flights/booking?id=${flight.flightId}`);
            }}
          >
            Select →
          </Button>
        </div>
      </div>

      <Accordion type="single" collapsible className="mt-3 border-t border-border">
        <AccordionItem value="details" className="border-b-0">
          <AccordionTrigger className="py-3 text-sm">View details</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Fare breakdown</p>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <span>Base fare</span><span className="text-right">{symbol}{flight.flightFare.adultFare.toFixed(2)}</span>
                  <span>Taxes</span><span className="text-right">{symbol}{flight.flightFare.adultTax.toFixed(2)}</span>
                  <span className="font-semibold text-foreground">Total</span><span className="text-right font-semibold text-foreground">{symbol}{flight.flightFare.grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <div><p className="font-semibold">Full baggage policy</p><p className="text-muted-foreground">{first.baggageAllowance || "1 checked bag included"}. Extra bag fees may apply at airport.</p></div>
              <div><p className="font-semibold">Cancellation policy</p><p className="text-muted-foreground">Non-refundable fare. Date changes subject to airline penalties and fare difference.</p></div>
              <div>
                <p className="font-semibold mb-1">Amenities</p>
                <div className="flex flex-wrap gap-3 text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><UtensilsCrossed className="h-3.5 w-3.5" />Meal</span>
                  <span className="inline-flex items-center gap-1"><Wifi className="h-3.5 w-3.5" />WiFi</span>
                  <span className="inline-flex items-center gap-1"><PlugZap className="h-3.5 w-3.5" />Power</span>
                  <span className="inline-flex items-center gap-1"><Tv className="h-3.5 w-3.5" />Entertainment</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </article>
  );
}
