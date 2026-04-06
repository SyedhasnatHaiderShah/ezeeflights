"use client";

import * as React from "react";
import { ArrowRightLeft, MapPin, Plane, Building, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { LocationInput } from "@/components/ui/location-input";
import { DatePicker } from "@/components/ui/date-picker";
import { PassengerSelector } from "@/components/ui/PassengerSelector";
import { TripTypeSelector } from "./TripTypeSelector";
import { Button } from "../ui/button";

interface BookingSearchFormProps {
  variant?: "flight" | "hotel" | "car" | "package" | "cruise";
  showSwap?: boolean;
  showTripType?: boolean;
  showReturnDate?: boolean;
  showOrigin?: boolean;
  showCabinClass?: boolean;
  showCompare?: boolean;
  labels?: any;
  placeholders?: any;
  origin: string;
  setOrigin: (val: string) => void;
  destination: string;
  setDestination: (val: string) => void;
  departDate: Date | undefined;
  setDepartDate: (val: Date | undefined) => void;
  returnDate: Date | undefined;
  setReturnDate: (val: Date | undefined) => void;
  passengers: any;
  handlePassengerChange: (key: string, val: number) => void;
  cabinClass: string;
  setCabinClass: (val: string) => void;
  handleSearch: () => void;
}

const VARIANT_DEFAULTS = {
  flight: {
    showSwap: true,
    showTripType: true,
    showReturnDate: true,
    showOrigin: true,
    showCabinClass: true,
    showCompare: true,
  },
  hotel: {
    showSwap: false,
    showTripType: false,
    showReturnDate: true,
    showOrigin: false,
    showCabinClass: false,
    showCompare: false,
  },
  car: {
    showSwap: false,
    showTripType: false,
    showReturnDate: true,
    showOrigin: true,
    showCabinClass: false,
    showCompare: false,
  },
  package: {
    showSwap: true,
    showTripType: false,
    showReturnDate: true,
    showOrigin: true,
    showCabinClass: true,
    showCompare: false,
  },
  cruise: {
    showSwap: false,
    showTripType: false,
    showReturnDate: false,
    showOrigin: true,
    showCabinClass: false,
    showCompare: false,
  },
};

const VARIANT_LABELS = {
  flight: {
    origin: "From",
    destination: "To",
    depart: "Depart",
    return: "Return",
    search: "Search",
  },
  hotel: {
    origin: null,
    destination: "Destination",
    depart: "Check-in",
    return: "Check-out",
    search: "Search",
  },
  car: {
    origin: "Pick-up",
    destination: "Drop-off",
    depart: "Pick-up Date",
    return: "Drop-off",
    search: "Search",
  },
  package: {
    origin: "From",
    destination: "To",
    depart: "Depart",
    return: "Return",
    search: "Search",
  },
  cruise: {
    origin: "Departure Port",
    destination: "Destination",
    depart: "Sail Date",
    return: null,
    search: "Search",
  },
};

export function BookingSearchForm({
  variant = "flight",
  showSwap,
  showTripType,
  showReturnDate,
  showOrigin,
  showCabinClass,
  showCompare,
  labels = {},
  placeholders = {},
  origin,
  setOrigin,
  destination,
  setDestination,
  departDate,
  setDepartDate,
  returnDate,
  setReturnDate,
  passengers,
  handlePassengerChange,
  cabinClass,
  setCabinClass,
  handleSearch,
}: BookingSearchFormProps) {
  const [tripType, setTripType] = React.useState("round-trip");

  const defaults = VARIANT_DEFAULTS[variant] ?? VARIANT_DEFAULTS.flight;
  const resolvedFlags = {
    showSwap: showSwap ?? defaults.showSwap,
    showTripType: showTripType ?? defaults.showTripType,
    showReturnDate: showReturnDate ?? defaults.showReturnDate,
    showOrigin: showOrigin ?? defaults.showOrigin,
    showCabinClass: showCabinClass ?? defaults.showCabinClass,
    showCompare: showCompare ?? defaults.showCompare,
  };

  const variantLabels = VARIANT_LABELS[variant] ?? VARIANT_LABELS.flight;
  const resolvedLabels = { ...variantLabels, ...labels };

  const handleSwap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <div className="w-full">
      {resolvedFlags.showTripType && (
        <TripTypeSelector value={tripType} onChange={setTripType} />
      )}

      <div className="flex flex-col lg:flex-row items-center border border-border rounded-sm overflow-hidden shadow-xl bg-background focus-within:ring-2 focus-within:ring-brand-red/10 transition-all">
        <div
          className={cn(
            "w-full flex flex-col sm:flex-row relative border-b lg:border-b-0 lg:border-r border-border h-14",
            resolvedFlags.showOrigin
              ? "flex-[2] min-w-[320px]"
              : "flex-[1.5] min-w-[200px]",
          )}
        >
          {resolvedFlags.showOrigin && (
            <>
              <LocationInput
                id={`${variant}-origin`}
                label={resolvedLabels.origin}
                placeholder={placeholders.origin ?? `${resolvedLabels.origin}?`}
                value={origin}
                onChange={setOrigin}
                className={cn("flex-1 h-14", resolvedFlags.showSwap && "pr-6")}
              />

              {resolvedFlags.showSwap && (
                <button
                  type="button"
                  onClick={handleSwap}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-background border border-border shadow-md flex items-center justify-center hover:border-brand-red hover:text-brand-red transition-all hidden sm:flex active:rotate-180 duration-500"
                  aria-label="Swap origin and destination"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              )}

              <div className="w-[1px] h-6 bg-border self-center hidden sm:block z-10" />
            </>
          )}

          <LocationInput
            id={`${variant}-destination`}
            label={resolvedLabels.destination}
            placeholder={
              placeholders.destination ?? `${resolvedLabels.destination}?`
            }
            value={destination}
            onChange={setDestination}
            className={cn("flex-1 h-14", resolvedFlags.showSwap && "pl-6")}
          />
        </div>

        <div className="flex-[1.5] w-full flex border-b lg:border-b-0 lg:border-r border-border bg-background">
          <DatePicker
            date={departDate}
            setDate={setDepartDate}
            label={resolvedLabels.depart}
            className="h-14 flex-1 border-none bg-transparent rounded-none hover:bg-muted/50 px-3 transition-all"
          />

          {resolvedFlags.showReturnDate && resolvedLabels.return && (
            <>
              <div className="w-[1px] h-8 bg-border self-center" />
              <DatePicker
                date={returnDate}
                setDate={setReturnDate}
                label={resolvedLabels.return}
                className="h-14 flex-1 border-none bg-transparent rounded-none hover:bg-muted/50 px-3 transition-all"
                disabled={resolvedFlags.showTripType && tripType === "one-way"}
              />
            </>
          )}
        </div>

        <div className="flex-1 min-w-[200px] w-full border-b lg:border-b-0 lg:border-r border-border bg-background">
          <PassengerSelector
            passengers={passengers}
            onChange={handlePassengerChange as any}
            cabinClass={resolvedFlags.showCabinClass ? cabinClass : null}
            onCabinChange={
              resolvedFlags.showCabinClass ? setCabinClass : undefined
            }
            className="h-14"
          />
        </div>

        <div className="p-1.5 w-full lg:w-auto self-stretch flex items-center bg-background">
          <Button
            onClick={handleSearch}
            className="bg-redmix transition-all w-full lg:w-auto h-full rounded-sm font-semibold text-sm capitalize text-white px-5 cursor-pointer hover:shadow-lg hover:shadow-brand-red/20"
          >
            {resolvedLabels.search}
          </Button>
        </div>
      </div>

      {resolvedFlags.showCompare && (
        <div className="flex items-center gap-6 mt-4 px-2">
          <label className="flex items-center gap-2 cursor-pointer group select-none">
            <div className="relative flex items-center justify-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="w-4 h-4 border-2 border-brand-gray rounded group-hover:border-brand-red transition-all peer-checked:bg-brand-red peer-checked:border-brand-red" />
              <svg
                className="absolute w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="4"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-semibold capitalize text-foreground group-hover:text-brand-red transition-colors tracking-widest">
              Compare vs. KAYAK{" "}
              <span className="text-foreground ml-1">Expedia, Orbitz</span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
