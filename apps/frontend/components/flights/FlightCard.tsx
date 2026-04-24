"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plane } from "lucide-react";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
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

const fmtTime = (iso: string) => {
  if (!iso) return "--:--";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const duration = (mins: number) => `${Math.floor(mins / 60)}h ${mins % 60}m`;

export function FlightCard({ flight }: Props) {
  const router = useRouter();
  const setFlights = useBookingFlowStore((state) => state.setFlights);
  const badge = getBadge(flight);
  const [hovered, setHovered] = React.useState(false);

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
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden rounded-xl border border-border bg-card px-4 py-3 shadow-sm transition-all mb-2.5"
    >
      <div className="relative z-10">
        {/* Header: airline + badge */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={`https://www.kayak.com/rimg/provider-logos/airlines/v/${first.airline.code ?? "XX"}.png`}
              alt={first.airline.name ?? "Airline"}
              className="h-6 w-6 object-contain"
            />
            <div className="min-w-0 leading-tight">
              <p className="text-sm font-semibold truncate">
                {first.airline.name ?? "Unknown Airline"}
              </p>
              <p className="text-xs text-foreground">
                {first.flightNo || `EF-${flight.flightId.slice(0, 6)}`}
              </p>
            </div>
          </div>
          {badge && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold shrink-0",
                badge.className,
              )}
            >
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
          isHovered={hovered}
        />

        {/* Inbound Leg */}
        {flight.inbound && flight.inbound.length > 0 && (
          <>
            <div className="my-2 border-t border-dashed border-border" />
            <FlightLeg
              from={flight.inbound[0].fromAirport.code}
              fromTime={fmtTime(flight.inbound[0].departureDate)}
              to={flight.inbound[flight.inbound.length - 1].toAirport.code}
              toTime={fmtTime(
                flight.inbound[flight.inbound.length - 1].arrivalDate,
              )}
              totalTime="Return"
              stops={flight.inbound.length - 1}
              direction="inbound"
              isHovered={hovered}
            />
          </>
        )}

        {/* Footer */}
        <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between gap-2">
          <p className="text-xs text-foreground truncate font-semibold">
            {first.cabinClass} ·{" "}
            {first.baggageAllowance || "Baggage per policy"} ·{" "}
            {first.equipmentType}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <p className="text-xl font-bold text-foreground">
              {symbol}
              {Math.round(flight.totalCost).toLocaleString()}
            </p>
            <Button
              size="sm"
              className="h-8 px-4 text-xs bg-redmix text-white hover:brightness-110 shadow-sm"
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
        <Accordion
          type="single"
          collapsible
          className="mt-1 border-t border-border"
        >
          <AccordionItem value="details" className="border-b-0">
            <AccordionTrigger className="py-2 text-sm text-foreground">
              View details
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-xs text-foreground">
                <div>
                  <p className="font-semibold mb-1.5 text-base">
                    Fare breakdown
                  </p>
                  <div className="grid grid-cols-2 gap-1 text-foreground/90">
                    <span className="text-foreground/90 text-sm">
                      Base fare
                    </span>
                    <span className="text-right text-sm text-foreground">
                      {symbol}{" "}
                      {flight.flightFare.adultFare.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span>Taxes</span>
                    <span className="text-right text-foreground/90 text-sm">
                      {symbol}{" "}
                      {flight.flightFare.adultTax.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                    <span className="font-semibold text-foreground text-sm">
                      Total
                    </span>
                    <span className="text-right font-semibold text-foreground">
                      {symbol}{" "}
                      {flight.flightFare.grandTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    Baggage policy
                  </p>
                  <p className="text-foreground/90 text-xs">
                    {first.baggageAllowance ||
                      "Standard baggage allowance applies"}
                    . Extra bag fees may apply at airport.
                  </p>
                </div>
                <div>
                  {/* <p className="font-semibold text-foreground text-sm">
                    Aircraft
                  </p> */}
                  <p className="text-foreground/90 text-xs">
                    Aircraft: {first.equipmentType}
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </article>
  );
}

/* ── Reusable leg row ─────────────────────────────────────────── */
interface LegProps {
  from: string;
  fromTime: string;
  to: string;
  toTime: string;
  totalTime: string;
  stops: number;
  stopCode?: string;
  overnight?: boolean;
  direction: "outbound" | "inbound";
  isHovered?: boolean;
}

function FlightLeg({
  from,
  fromTime,
  to,
  toTime,
  totalTime,
  stops,
  stopCode,
  overnight,
  direction,
  isHovered,
}: LegProps) {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
      {/* Departure */}
      <div>
        <p className="text-sm font-semibold leading-none mb-2 text-redmix">
          Departure:
        </p>
        <p className="text-lg font-bold leading-none">{from}</p>
        <p className="text-sm text-foreground font-semibold mt-0.5">
          {fromTime}
        </p>
      </div>

      {/* Middle */}
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground">{totalTime}</p>
        <div className="my-1 flex items-center gap-1">
          <div className="h-px flex-1 border-t border-dashed border-border" />
          <AppIcon
            icon={Plane}
            iconClassName={cn(
              "h-5 w-5",
              direction === "outbound" ? "rotate-[45deg]" : "rotate-[180deg]",
            )}
            isActive
            isFill
            animationType={isHovered ? "flying" : "none"}
          />
          <div className="h-px flex-1 border-t border-dashed border-border" />
        </div>
        <span
          className={cn(
            "inline-flex rounded-full px-1.5 py-0.5 text-xs font-bold",
            stops === 0 ? "bg-white text-redmix" : "bg-white text-redmix",
          )}
        >
          {stops === 0
            ? "Non-stop"
            : `${stops} stop${stops > 1 ? "s" : ""}${stopCode ? ` · ${stopCode}` : ""}`}
        </span>
      </div>

      {/* Arrival */}
      <div className="text-right">
        <p className="text-sm font-semibold leading-none mb-2 text-redmix">
          Arrival:
        </p>
        <p className="text-lg font-bold leading-none">{to}</p>
        <p className="text-sm text-foreground font-semibold mt-0.5">{toTime}</p>
        {overnight && <p className="text-xs text-foreground">+1 day</p>}
      </div>
    </div>
  );
}
