"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2, Luggage, ArrowRight } from "lucide-react";
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
  isReturn = false,
}: {
  segments: FlightSegment[];
  isReturn?: boolean;
}) {
  if (!segments || segments.length === 0) return null;

  const firstSeg = segments[0];
  const lastSeg = segments[segments.length - 1];
  const stops = segments.length - 1;

  const departureDate = new Date(firstSeg.departureDate);
  const arrivalDate = new Date(lastSeg.arrivalDate);

  const durationMinutes = segments.reduce(
    (acc, seg) => acc + parseInt(seg.elapsedTime || "0"),
    0,
  );
  let totalMinutes = durationMinutes;
  for (let i = 0; i < segments.length - 1; i++) {
    const arr = new Date(segments[i].arrivalDate).getTime();
    const dep = new Date(segments[i + 1].departureDate).getTime();
    totalMinutes += Math.round((dep - arr) / 60000);
  }

  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const durationText = `${h}h ${m > 0 ? `${m}m` : ""}`;

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="flex items-center gap-4 md:gap-6 py-3">
      {/* Airline Logo */}
      <div className="w-24 h-8 relative bg-white dark:bg-brand-dark overflow-hidden">
        <AppImage
          src={
            firstSeg.airline.code
              ? `https://www.kayak.com/rimg/provider-logos/airlines/v/${firstSeg.airline.code}.png`
              : ""
          }
          alt={firstSeg.airline.name ?? "Airline"}
          fill
          className="object-contain  px-0"
        />
      </div>

      {/* Flight Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          {/* Departure */}
          <div className="text-center min-w-14">
            <span
              suppressHydrationWarning
              className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100"
            >
              {formatTime(departureDate)}
            </span>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              {firstSeg.fromAirport.code}
            </p>
          </div>

          {/* Flight Path */}
          <div className="flex-1 flex flex-col items-center min-w-16">
            <span
              className={cn(
                "text-[10px] md:text-xs font-semibold uppercase tracking-wide",
                stops === 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-amber-600 dark:text-amber-400",
              )}
            >
              {stops === 0 ? "Nonstop" : `${stops} stop${stops > 1 ? "s" : ""}`}
            </span>
            <div className="w-full flex items-center gap-1 my-1">
              <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
              <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
              <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
            </div>
            <span className="text-[10px] md:text-xs text-gray-500 font-medium">
              {durationText}
            </span>
          </div>

          {/* Arrival */}
          <div className="text-center min-w-14">
            <span
              suppressHydrationWarning
              className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100"
            >
              {formatTime(arrivalDate)}
            </span>
            <p className="text-xs font-semibold text-gray-500 mt-0.5">
              {lastSeg.toAirport.code}
            </p>
          </div>
        </div>

        {/* Airline Name */}
        <p className="text-xs text-gray-500 mt-2 font-medium">
          {firstSeg.airline.name ?? "Other"} • {firstSeg.cabinClass}
        </p>
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
    <article className="group bg-white dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-blue-500 transition-colors">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <Luggage className="w-4 h-4 text-gray-400" />
              <span>{flight.outbound[0].baggageAllowance}</span>
            </div>
          </div>

          {/* Flight Legs */}
          <div className="flex flex-col">
            <FlightLeg segments={flight.outbound} />
            {flight.inbound && flight.inbound.length > 0 && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-800" />
                <FlightLeg segments={flight.inbound} isReturn />
              </>
            )}
          </div>
        </div>

        {/* Price & CTA Section */}
        <div className="lg:w-56 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 p-5 md:p-6 flex flex-col justify-center">
          <div className="flex lg:flex-col items-center lg:items-stretch gap-4 lg:gap-0 justify-between">
            <div className="text-left lg:text-center lg:mb-4">
              <p className="text-xs text-gray-500 font-medium mb-1">
                Total price
              </p>    
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {currencySymbol}
                {flight.totalCost.toLocaleString()}
              </p>
              <p className="text-[10px] text-gray-400 mt-1">
                Ref: {flight.flightId.slice(0, 8)}
              </p>
            </div>

            <Button
              onClick={() => {
                setFlights([flight.flightId]);
                router.push(`/flights/booking?id=${flight.flightId}`);
              }}
              className="w-auto lg:w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold px-6 lg:px-4 py-2.5 lg:py-3 rounded-xl shadow-md hover:shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all duration-200 text-sm"
            >
              View Deal
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
