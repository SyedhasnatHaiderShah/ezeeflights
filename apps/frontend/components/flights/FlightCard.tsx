"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  Share2,
  Briefcase,
  Info,
  Plane,
  Clock,
  Luggage,
} from "lucide-react";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import { cn } from "@/lib/utils";
import { AppImage } from "../ui/app-image";
import { Button } from "../ui/button";
import { FlightListItem, FlightSegment } from "@/lib/types/flight-api";

interface Props {
  flight: FlightListItem;
}

function FlightLeg({
  segments,
  title,
}: {
  segments: FlightSegment[];
  title: string;
}) {
  if (!segments || segments.length === 0) return null;

  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];
  const stops = segments.length - 1;

  const departureDate = new Date(firstSeg.departureDate);
  const arrivalDate = new Date(lastSeg.arrivalDate);

  // Calculate total duration in minutes if not provided
  const durationMinutes = segments.reduce(
    (acc, seg) => acc + parseInt(seg.elapsedTime || "0"),
    0,
  );
  // Add layover times
  let totalMinutes = durationMinutes;
  for (let i = 0; i < segments.length - 1; i++) {
    const arr = new Date(segments[i].arrivalDate).getTime();
    const dep = new Date(segments[i + 1].departureDate).getTime();
    totalMinutes += Math.round((dep - arr) / 60000);
  }

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const durationText = `${h}h ${m}m`;

  const layovers = segments
    .slice(0, -1)
    .map((seg) => seg.toAirport.code)
    .join(", ");

  return (
    <div className="flex flex-col gap-1 py-1.5 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        {/* Airline Logo & Time */}
        <div className="flex items-center gap-4 min-w-0 flex-[1.5]">
          <div className="w-8 h-8 relative flex-shrink-0 bg-white p-1 rounded-sm border border-gray-100 shadow-sm">
            <AppImage
              src={
                firstSeg.airline.code
                  ? `https://www.kayak.com/rimg/provider-logos/airlines/v/${firstSeg.airline.code}.png`
                  : ""
              }
              alt={firstSeg.airline.name ?? "Airline"}
              fill
              className="object-contain w-full"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm md:text-base font-bold text-brand-dark leading-tight">
              {departureDate.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              –{" "}
              {arrivalDate.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <span className="text-[10px] md:text-xs text-brand-dark-light font-medium truncate">
              {firstSeg.airline.name ?? "Other"}
            </span>
          </div>
        </div>

        {/* Stops */}
        <div className="flex flex-col items-center flex-1 text-center">
          <span
            className={cn(
              "text-xs font-bold leading-tight",
              stops === 0 ? "text-green-600" : "text-[#ff9c00]",
            )}
          >
            {stops === 0 ? "nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`}
          </span>
          {stops > 0 && (
            <span className="text-xs text-brand-dark-light/80 font-bold">
              {layovers}
            </span>
          )}
          <span className="text-xs text-brand-dark-light/80 font-bold mt-0.5">
            {firstSeg.fromAirport.code}–{lastSeg.toAirport.code}
          </span>
        </div>

        {/* Duration */}
        <div className="flex flex-col items-end flex-1 text-right">
          <span className="text-xs font-bold text-brand-dark">
            {durationText}
          </span>
          <span className="text-xs text-brand-dark-light/80 font-semibold">
            {firstSeg.cabinClass}
          </span>
        </div>
      </div>
    </div>
  );
}

export function FlightCard({ flight }: Props) {
  const router = useRouter();
  const setFlights = useBookingFlowStore((state) => state.setFlights);

  const currencyMap: Record<string, string> = {
    USD: "$",
    GBP: "£",
    EUR: "€",
    PKR: "Rs",
  };
  const currencySymbol = currencyMap[flight.currency] || flight.currency;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row relative group"
    >
      <div className="flex-grow p-4 md:p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-brand-dark-light mb-0.5">
          <button className="flex items-center gap-1.5 hover:text-brand-red transition-colors">
            <Heart className="w-3 h-3" /> Save
          </button>
          <button className="flex items-center gap-1.5 hover:text-brand-red transition-colors">
            <Share2 className="w-3 h-3" /> Share
          </button>
          <div className="flex items-center gap-1 ml-auto">
            <Luggage className="w-3 h-3" />
            <span>{flight.outbound[0].baggageAllowance}</span>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-gray-50 dark:divide-border/30 gap-1.5">
          <FlightLeg segments={flight.outbound} title="Departure" />
          {flight.inbound && flight.inbound.length > 0 && (
            <div className="pt-1.5">
              <FlightLeg segments={flight.inbound} title="Return" />
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-[200px] flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-border/50 bg-gray-50/20 dark:bg-muted/5 p-4 md:p-5 flex flex-col justify-center items-center md:items-end gap-1">
        <div className="text-right w-full">
          <div className="flex flex-col items-center md:items-end">
            <span className="text-2xl font-black text-brand-dark tracking-tight">
              {currencySymbol}
              {flight.totalCost.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-brand-dark-light/80 mt-0.5">
              Total price
            </span>
          </div>
        </div>

        <div className="hidden md:block">
          <span className="text-xs font-bold text-brand-dark-light/80">
            {flight.flightId.slice(0, 8)}
          </span>
        </div>
        <Button
          onClick={() => {
            setFlights([flight.flightId]);
            router.push(`/flights/booking?id=${flight.flightId}`);
          }}
          className="mt-4 w-full bg-redmix dark:bg-brand-yellow hover:bg-brand-dark/90 text-white dark:text-white dark:border-redmix border-2 font-bold py-2.5 md:py-5 rounded-lg shadow-sm hover:shadow-md transition-all text-xs"
        >
          View Deal
        </Button>
      </div>
    </motion.article>
  );
}
