"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plane } from "lucide-react";
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

const fmtTime = (iso: string) => {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};
const duration = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

export function FlightCard({ flight }: Props) {
  const router = useRouter();
  const setFlights = useBookingFlowStore((state) => state.setFlights);
  const badge = getBadge(flight);

  if (!flight.outbound || flight.outbound.length === 0) return null;

  const first = flight.outbound[0];
  const last = flight.outbound[flight.outbound.length - 1];
  const overnight = last?.arrivalDate && first?.departureDate ?
    new Date(last.arrivalDate).getDate() !== new Date(first.departureDate).getDate() : false;
  const stops = Math.max(0, flight.outbound.length - 1);

  const symbol = ({ USD: "$", GBP: "£", EUR: "€", PKR: "Rs" } as Record<string, string>)[flight.currency] || flight.currency;

  return (
    <article className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm hover:shadow-md transition-all mb-2.5">

      {/* Header: airline + badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={`https://www.kayak.com/rimg/provider-logos/airlines/v/${first.airline.code ?? "XX"}.png`}
            alt={first.airline.name ?? "Airline"}
            className="h-6 w-6 object-contain"
          />
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-semibold truncate">{first.airline.name ?? "Unknown Airline"}</p>
            <p className="text-xs text-muted-foreground">{first.flightNo || `EF-${flight.flightId.slice(0, 6)}`}</p>
          </div>
        </div>
        {badge && (
          <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold shrink-0", badge.className)}>
            {badge.label}
          </span>
        )}
      </div>

      {/* Outbound Leg */}
      <FlightLeg
        from={first.fromAirport.code}
        fromTime={fmtTime(first.departureDate)}
        to={last.toAirport.code}
        toTime={fmtTime(last.arrivalDate)}
        totalTime={duration(flight.totalTime)}
        stops={stops}
        stopCode={first.toAirport.code}
        overnight={overnight}
        direction="outbound"
      />

      {/* Inbound Leg */}
      {flight.inbound && flight.inbound.length > 0 && (
        <>
          <div className="my-2 border-t border-dashed border-border" />
          <FlightLeg
            from={flight.inbound[0].fromAirport.code}
            fromTime={fmtTime(flight.inbound[0].departureDate)}
            to={flight.inbound[flight.inbound.length - 1].toAirport.code}
            toTime={fmtTime(flight.inbound[flight.inbound.length - 1].arrivalDate)}
            totalTime="Return"
            stops={flight.inbound.length - 1}
            direction="inbound"
          />
        </>
      )}

      {/* Footer */}
      <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground truncate">
          {first.cabinClass} · {first.baggageAllowance || "Baggage per policy"} · {first.equipmentType}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <p className="text-lg font-bold text-brand-red">{symbol}{Math.round(flight.totalCost).toLocaleString()}</p>
          <Button
            size="sm"
            variant="outline"
            className="h-7 px-3 text-xs border-brand-red text-brand-red hover:bg-brand-red hover:text-white"
            onClick={() => {
              setFlights([flight.flightId]);
              router.push(`/flights/booking?id=${flight.flightId}`);
            }}
          >
            Select →
          </Button>
        </div>
      </div>

      {/* Accordion */}
      <Accordion type="single" collapsible className="mt-1 border-t border-border">
        <AccordionItem value="details" className="border-b-0">
          <AccordionTrigger className="py-2 text-xs text-muted-foreground">View details</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-semibold mb-1.5 text-sm">Fare breakdown</p>
                <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                  <span>Base fare</span><span className="text-right">{symbol}{flight.flightFare.adultFare.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span>Taxes</span><span className="text-right">{symbol}{flight.flightFare.adultTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span className="font-semibold text-foreground">Total</span><span className="text-right font-semibold text-foreground">{symbol}{flight.flightFare.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              <div>
                <p className="font-semibold">Baggage policy</p>
                <p className="text-muted-foreground">{first.baggageAllowance || "Standard baggage allowance applies"}. Extra bag fees may apply at airport.</p>
              </div>
              <div>
                <p className="font-semibold">Aircraft</p>
                <p className="text-muted-foreground">{first.equipmentType}</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </article>
  );
}

/* ── Reusable leg row ─────────────────────────────────────────── */
interface LegProps {
  from: string; fromTime: string;
  to: string;   toTime: string;
  totalTime: string;
  stops: number; stopCode?: string;
  overnight?: boolean;
  direction: "outbound" | "inbound";
}

function FlightLeg({ from, fromTime, to, toTime, totalTime, stops, stopCode, overnight, direction }: LegProps) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      {/* Departure */}
      <div>
        <p className="text-lg font-bold leading-none">{from}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{fromTime}</p>
      </div>

      {/* Middle */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">{totalTime}</p>
        <div className="my-1 flex items-center gap-1">
          <div className="h-px flex-1 border-t border-dashed border-border" />
          <Plane className={cn("h-3 w-3 text-brand-red", direction === "inbound" && "rotate-180")} />
          <div className="h-px flex-1 border-t border-dashed border-border" />
        </div>
        <span className={cn(
          "inline-flex rounded-full px-1.5 py-0.5 text-xs leading-tight",
          stops === 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
        )}>
          {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}${stopCode ? ` · ${stopCode}` : ""}`}
        </span>
      </div>

      {/* Arrival */}
      <div className="text-right">
        <p className="text-lg font-bold leading-none">{to}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{toTime}</p>
        {overnight && <p className="text-xs text-muted-foreground">+1 day</p>}
      </div>
    </div>
  );
}