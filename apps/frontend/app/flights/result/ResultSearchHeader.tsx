"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookingSearchForm } from "@/components/search/BookingSearchForm";
import { cn } from "@/lib/utils";

interface Props {
  initialOrigin: string;
  initialDestination: string;
  initialDDate: string;
  initialRDate?: string;
  initialAdt: number;
  initialChd: number;
  initialInf: number;
  initialClass: string;
  initialTripType: string;
}

export function ResultSearchHeader({
  initialOrigin,
  initialDestination,
  initialDDate,
  initialRDate,
  initialAdt,
  initialChd,
  initialInf,
  initialClass,
  initialTripType,
}: Props) {
  const router = useRouter();

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [departDate, setDepartDate] = useState<Date | undefined>(
    initialDDate ? new Date(initialDDate) : new Date(),
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    initialRDate ? new Date(initialRDate) : undefined,
  );
  const [passengers, setPassengers] = useState({
    adults: initialAdt,
    children: initialChd || 0,
    infants: initialInf || 0,
  });
  const [cabinClass, setCabinClass] = useState(initialClass || "Economy");
  const [tripType, setTripType] = useState(initialTripType || "round-trip");
  const [isHighlighted, setIsHighlighted] = useState(false);

  useEffect(() => {
    const handleHighlight = () => {
      // Small delay to coordinate with smooth scroll
      setTimeout(() => {
        setIsHighlighted(true);
        setTimeout(() => setIsHighlighted(false), 3000);
      }, 100);
    };

    window.addEventListener("ezee-highlight-search", handleHighlight);
    return () =>
      window.removeEventListener("ezee-highlight-search", handleHighlight);
  }, []);

  const handlePassengerChange = (key: string, val: number) =>
    setPassengers((prev) => ({ ...prev, [key]: val }));

  const handleSearch = () => {
    const searchData = {
      origin,
      destination,
      departDate,
      returnDate,
      passengers,
      cabinClass,
      tripType,
    };
    const params = new URLSearchParams();
    params.set("org", origin);
    params.set("des", destination);
    if (departDate) params.set("dDate", departDate.toISOString().slice(0, 10));
    if (returnDate) params.set("rDate", returnDate.toISOString().slice(0, 10));
    params.set("adt", passengers.adults.toString());
    params.set("chd", passengers.children.toString());
    params.set("inf", passengers.infants.toString());
    params.set("class", cabinClass);
    params.set("trip", tripType);

    router.push(`/flights/result?${params.toString()}`);
  };

  return (
    <div
      className={cn(
        "bg-white/95 dark:bg-background/95 backdrop-blur-sm border-b border-gray-200 dark:border-border shadow-sm py-4 transition-all duration-700 ease-in-out relative",
        isHighlighted &&
          "ring-2 ring-redmix/30 shadow-[0_0_50px_rgba(255,75,43,0.4)] border-redmix/50 z-50 ring-offset-2 ring-offset-background",
      )}
    >
      <div className="max-w-6xl mx-auto px-4 w-full">
        <BookingSearchForm
          variant="flight"
          showReturnDate={true}
          showTripType={true}
          showCabinClass={true}
          origin={origin}
          setOrigin={setOrigin}
          destination={destination}
          setDestination={setDestination}
          departDate={departDate}
          setDepartDate={setDepartDate}
          returnDate={returnDate}
          setReturnDate={setReturnDate}
          passengers={passengers}
          handlePassengerChange={handlePassengerChange}
          cabinClass={cabinClass}
          setCabinClass={setCabinClass}
          tripType={tripType}
          setTripType={setTripType}
          handleSearch={handleSearch}
        />
      </div>
    </div>
  );
}
