"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingSearchForm } from "@/components/search/BookingSearchForm";

interface Props {
  initialOrigin: string;
  initialDestination: string;
  initialDDate: string;
  initialAdt: number;
}

export function ResultSearchHeader({ initialOrigin, initialDestination, initialDDate, initialAdt }: Props) {
  const router = useRouter();

  const [origin, setOrigin] = useState(initialOrigin);
  const [destination, setDestination] = useState(initialDestination);
  const [departDate, setDepartDate] = useState<Date | undefined>(initialDDate ? new Date(initialDDate) : new Date());
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [passengers, setPassengers] = useState({ adults: initialAdt, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState("Economy");

  const handlePassengerChange = (key: string, val: number) => setPassengers(prev => ({ ...prev, [key]: val }));

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("org", origin);
    params.set("des", destination);
    if (departDate) params.set("dDate", departDate.toISOString().slice(0, 10));
    params.set("adt", passengers.adults.toString());
    router.push(`/flights/result?${params.toString()}`);
  };

  return (
    <div className="bg-white/95 dark:bg-background/95 backdrop-blur-sm border-b border-gray-200 dark:border-border shadow-sm sticky top-[80px] z-40 py-4 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto px-4 w-full">
        <BookingSearchForm
          variant="flight"
          showReturnDate={true}
          showTripType={true}
          showCabinClass={true}
          origin={origin} setOrigin={setOrigin}
          destination={destination} setDestination={setDestination}
          departDate={departDate} setDepartDate={setDepartDate}
          returnDate={returnDate} setReturnDate={setReturnDate}
          passengers={passengers} handlePassengerChange={handlePassengerChange}
          cabinClass={cabinClass} setCabinClass={setCabinClass}
          handleSearch={handleSearch}
        />
      </div>
    </div>
  );
}
