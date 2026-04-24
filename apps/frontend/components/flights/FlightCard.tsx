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
      className="relative overflow-hidden rounded-2xl border border-border bg-white dark:bg-card p-4 shadow-sm hover:shadow-md transition-all mb-4 group"
    >
      <div className="relative z-10">
        {/* Header: airline + badge */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-muted/50 p-1.5 border border-border/50 flex items-center justify-center shrink-0">
              <img
                src={`https://www.kayak.com/rimg/provider-logos/airlines/v/${first.airline.code ?? "XX"}.png`}
                alt={first.airline.name ?? "Airline"}
                className="h-full w-full object-contain grayscale-[0.2] group-hover:grayscale-0 transition-all"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-brand-dark dark:text-foreground truncate leading-tight">
                {first.airline.name ?? "Unknown Airline"}
              </p>
              <p className="text-[10px] font-black text-foreground uppercase tracking-widest mt-0.5">
                {first.flightNo || `EF-${flight.flightId.slice(0, 6)}`}
              </p>
            </div>
          </div>
          {badge && (
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter shrink-0",
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
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black text-foreground uppercase tracking-widest mb-0.5">
              Class & Bags
            </p>
            <p className="text-[11px] text-foreground font-bold truncate">
              {first.cabinClass} · {first.baggageAllowance || "Standard"}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="text-[9px] font-black text-foreground uppercase tracking-widest mb-0.5">
                Price
              </p>
              <p className="text-lg font-black text-redmix leading-none">
                {symbol}{Math.round(flight.totalCost).toLocaleString()}
              </p>
            </div>
            <Button
              size="sm"
              className="h-9 px-4 text-[11px] font-bold bg-redmix text-white hover:brightness-110 shadow-md shadow-redmix/10 rounded-xl"
              onClick={() => {
                setFlights([flight.flightId]);
                router.push(`/flights/booking?id=${flight.flightId}`);
              }}
            >
              Select
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
    <div className="flex items-center justify-between gap-4 py-2">
      {/* Departure */}
      <div className="flex-1 min-w-0">
        <p className="text-xl font-black text-brand-dark dark:text-foreground leading-none tracking-tighter">
          {fromTime}
        </p>
        <p className="text-sm font-bold text-foreground mt-1.5">{from}</p>
      </div>

      {/* Path Visual */}
      <div className="flex-[2] flex flex-col items-center justify-center px-2">
        <div className="text-[10px] font-black text-foreground uppercase tracking-widest mb-2">
          {totalTime}
        </div>
        <div className="relative w-full flex items-center justify-center gap-1.5">
          <div className="h-px flex-1 bg-linear-to-r from-transparent via-border to-border" />
          <motion.div
            animate={
              isHovered
                ? {
                    x: direction === "outbound" ? [0, 5, 0] : [0, -5, 0],
                    y: direction === "outbound" ? [0, -2, 0] : [0, 2, 0],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-xl shrink-0"
            style={{
              transform: direction === "outbound" ? "none" : "scaleX(-1)",
            }}
          >
            🛫
          </motion.div>
          <div className="h-px flex-1 bg-linear-to-r from-border via-border to-transparent" />
        </div>
        <div className="mt-2">
          <span className="text-[10px] font-black text-redmix uppercase tracking-tighter bg-redmix/5 px-2 py-0.5 rounded-full border border-redmix/10">
            {stops === 0
              ? "Non-stop"
              : `${stops} stop${stops > 1 ? "s" : ""}${stopCode ? ` · ${stopCode}` : ""}`}
          </span>
        </div>
      </div>

      {/* Arrival */}
      <div className="flex-1 text-right min-w-0">
        <p className="text-xl font-black text-brand-dark dark:text-foreground leading-none tracking-tighter">
          {toTime}
        </p>
        <div className="flex items-center justify-end gap-1 mt-1.5">
          <p className="text-sm font-bold text-foreground">{to}</p>
          {overnight && (
            <span className="text-[10px] font-black text-redmix">+1d</span>
          )}
        </div>
      </div>
    </div>
  );
}
