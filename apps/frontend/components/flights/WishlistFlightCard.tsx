"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Heart, Briefcase, Luggage } from "lucide-react";
import { useBookingFlowStore } from "@/lib/store/booking-flow-store";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { cn } from "@/lib/utils";
import { getAirportByCode } from "@/lib/utils/airport-search";
import { FlightListItem } from "@/lib/types/flight-api";
import { CurrencyDisplay } from "../shared/CurrencyDisplay";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
} from "@/lib/store/currency-store";
import { AirlineLogo } from "./AirlineLogo";
import { calculateLegDuration } from "@/components/flights/FlightCard";

interface Props {
  flight: FlightListItem;
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

const getTimeEmoji = (iso: string): string => {
  const h = new Date(iso).getHours();
  if (h >= 5 && h < 12) return "🌅";
  if (h >= 12 && h < 17) return "☀️";
  if (h >= 17 && h < 21) return "🌇";
  return "🌙";
};

const getDurationEmoji = (mins: number): string => {
  if (mins < 180) return "🚀";
  if (mins < 480) return "✈️";
  return "🌍";
};

export function WishlistFlightCard({ flight }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setFlights = useBookingFlowStore((state) => state.setFlights);
  const setSelectedFlight = useBookingFlowStore(
    (state) => state.setSelectedFlight,
  );
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const currencyMeta =
    SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES["USD"];
  const symbol = currencyMeta.symbol;

  const isWishlisted = wishlistItems.some(
    (item) =>
      item.entityId === flight.flightId && item.entityType === "flights",
  );

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      entityId: flight.flightId,
      entityType: "flights",
      data: flight,
    });
  };

  const first = flight.outbound[0];
  const last = flight.outbound[flight.outbound.length - 1];
  const stops = Math.max(0, flight.outbound.length - 1);
  const isOvernight =
    new Date(last.arrivalDate).getDate() !==
    new Date(first.departureDate).getDate();

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border bg-white dark:bg-card shadow-sm transition-all group h-full flex flex-col">
      {/* Wishlist Heart */}
      <button
        onClick={handleToggleWishlist}
        className="absolute right-4 top-4 z-20 rounded-full bg-white/80 p-2 backdrop-blur-md shadow-sm transition-all hover:scale-110 active:scale-95 border border-border/50"
      >
        <Heart
          className={cn(
            "h-4 w-4 transition-colors",
            isWishlisted ? "fill-redmix text-redmix" : "text-foreground",
          )}
        />
      </button>

      <div className="flex flex-col flex-1">
        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-slate-50 dark:bg-muted/50 p-1 border border-border/50 flex items-center justify-center shrink-0">
              <AirlineLogo
                code={first.airline.code}
                name={first.airline.name}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">
                {first.airline.name}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {first.airline.code}{" "}
                {first.flightNo || `EF-${flight.flightId.slice(0, 4)}`}
              </p>
            </div>
          </div>

          <FlightLeg
            from={first.fromAirport.code}
            fromTime={fmtTime(first.departureDate)}
            fromIso={first.departureDate}
            to={last.toAirport.code}
            toTime={fmtTime(last.arrivalDate)}
            durationMins={calculateLegDuration(flight.outbound)}
            stops={stops}
            stopCode={first.toAirport.code}
            overnight={isOvernight}
          />

          <div className="mt-4 pt-4 border-t border-border/40">
            <div className="grid grid-cols-1 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50/50 dark:bg-muted/10 border border-border/50">
                <p className="text-[10px] font-bold text-foreground tracking-widest mb-2 border-b border-border/50 pb-1 uppercase">
                  Fare Breakdown
                </p>
                <div className="grid grid-cols-2 gap-y-1">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span className="text-right font-semibold">
                    {symbol}
                    {Math.round(
                      getConvertedAmount(
                        flight.flightFare.adultFare,
                        flight.currency as any,
                        baseCurrency,
                      ),
                    ).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">Taxes & Fees</span>
                  <span className="text-right font-semibold">
                    {symbol}
                    {Math.round(
                      getConvertedAmount(
                        flight.flightFare.adultTax,
                        flight.currency as any,
                        baseCurrency,
                      ),
                    ).toLocaleString()}
                  </span>
                  <div className="col-span-2 border-t border-dashed border-border/50 my-1" />
                  <span className="font-bold">Total</span>
                  <span className="text-right font-bold text-redmix">
                    {symbol}
                    {Math.round(
                      getConvertedAmount(
                        flight.flightFare.grandTotal,
                        flight.currency as any,
                        baseCurrency,
                      ),
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="w-full border-t border-border p-3 bg-slate-50/30 dark:bg-muted/5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
              Total Price
            </p>
            <CurrencyDisplay
              amount={flight.totalCost}
              currency={flight.currency}
              className="text-lg font-black"
              showComparison={false}
            />
          </div>
          <button
            onClick={() => {
              setFlights([flight.flightId]);
              setSelectedFlight(flight);
              const params = new URLSearchParams();
              params.set("id", flight.flightId);
              
              // Add search parameters from flight data
              const firstLeg = flight.outbound[0];
              const lastLeg = flight.outbound[flight.outbound.length - 1];
              
              if (firstLeg) {
                params.set("org", firstLeg.fromAirport.code);
                params.set("dDate", firstLeg.departureDate.split("T")[0]);
                params.set("class", firstLeg.cabinClass || "Economy");
              }
              
              if (lastLeg) {
                params.set("des", lastLeg.toAirport.code);
              }
              
              params.set("trip", flight.inbound?.length > 0 ? "round-trip" : "one-way");
              
              if (flight.inbound && flight.inbound.length > 0) {
                params.set("rDate", flight.inbound[0].departureDate.split("T")[0]);
              }

              params.set("adt", "1");
              params.set("chd", "0");
              params.set("inf", "0");

              router.push(`/flights/booking?${params.toString()}`);
            }}
            className="flex-1 max-w-[140px] h-10 rounded-xl bg-redmix text-white font-bold text-sm shadow-lg shadow-redmix/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Select
          </button>
        </div>
      </div>
    </article>
  );
}

/* ── Leg Row ─────────────────────────────────────────── */
interface LegProps {
  from: string;
  fromTime: string;
  fromIso: string;
  to: string;
  toTime: string;
  durationMins: number;
  stops: number;
  stopCode?: string;
  overnight?: boolean;
}

function FlightLeg({
  from,
  to,
  fromTime,
  toTime,
  fromIso,
  durationMins,
  stops,
  stopCode,
  overnight,
}: LegProps) {
  const [fromCity, setFromCity] = React.useState("");
  const [toCity, setToCity] = React.useState("");
  const [stopCity, setStopCity] = React.useState("");

  React.useEffect(() => {
    const resolveNames = async () => {
      const f = await getAirportByCode(from);
      if (f) setFromCity(f.municipality || f.name.split(" ")[0]);
      const t = await getAirportByCode(to);
      if (t) setToCity(t.municipality || t.name.split(" ")[0]);
      if (stops > 0 && stopCode) {
        const s = await getAirportByCode(stopCode);
        if (s) setStopCity(s.municipality || s.name.split(" ")[0]);
      }
    };
    resolveNames();
  }, [from, to, stopCode, stops]);

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="min-w-[50px]">
        <p className="text-base font-bold leading-none">
          {fromTime} {getTimeEmoji(fromIso)}
        </p>
        <p className="text-[10px] font-bold text-foreground mt-1 truncate max-w-[80px]">
          {from}{" "}
          {fromCity && (
            <span className="text-muted-foreground font-medium ml-1">
              ({fromCity})
            </span>
          )}
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center px-2">
        <div className="text-[10px] font-bold text-muted-foreground mb-1 flex items-center gap-1">
          <span>{durationFmt(durationMins)}</span>
          <span>{getDurationEmoji(durationMins)}</span>
        </div>
        <div className="w-full flex items-center gap-1">
          <div className="h-px flex-1 bg-border" />
          {stops > 0 && <div className="w-1.5 h-1.5 rounded-full bg-redmix" />}
          <div className="h-px flex-1 bg-border" />
        </div>
        <div className="mt-1 flex flex-col items-center">
          <span
            className={cn(
              "text-[10px] font-bold uppercase",
              stops === 0 ? "text-emerald-600" : "text-foreground",
            )}
          >
            {stops === 0 ? "Direct" : `${stops} Stop (${stopCode})`}
          </span>
          {stopCity && (
            <span className="text-[9px] text-muted-foreground font-medium uppercase">
              ({stopCity})
            </span>
          )}
        </div>
      </div>

      <div className="min-w-[50px] text-right">
        <p className="text-base font-bold leading-none">{toTime}</p>
        <div className="flex items-center justify-end gap-1 mt-1">
          <p className="text-[10px] font-bold text-foreground truncate max-w-[80px]">
            {toCity && (
              <span className="text-muted-foreground font-medium mr-1">
                ({toCity})
              </span>
            )}{" "}
            {to}
          </p>
          {overnight && (
            <span className="text-[10px] font-bold text-redmix">+1d</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 pl-2 border-l border-border ml-1">
        <Briefcase className="h-3.5 w-3.5 text-muted-foreground/40" />
        <Luggage className="h-3.5 w-3.5 text-muted-foreground/40" />
      </div>
    </div>
  );
}
