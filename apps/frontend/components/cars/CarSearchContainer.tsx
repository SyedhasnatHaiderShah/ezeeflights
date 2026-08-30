"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { differenceInDays } from "date-fns";
import { BookingSearchForm } from "@/components/search/BookingSearchForm";
import { PassengerSelector } from "@/components/ui/PassengerSelector";
import { useLoadingStore } from "@/lib/store/use-loading-store";
import { parseCarSearchParams } from "@/lib/utils/car-search-params";

export function CarSearchContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startLoading } = useLoadingStore();

  const urlSearch = parseCarSearchParams(searchParams);
  const paramPickup = urlSearch.pickup;
  const paramDropoff = urlSearch.dropoff;
  const paramPickupDate = urlSearch.pickupDate;
  const paramDropoffDate = urlSearch.dropoffDate;

  const [pickUpLocation, setPickUpLocation] = useState(paramPickup || "LHE");
  const [dropOffLocation, setDropOffLocation] = useState(paramDropoff || "DXB");
  const [pickUpDate, setPickUpDate] = useState<Date | undefined>(() => {
    if (paramPickupDate) {
      try {
        return new Date(paramPickupDate);
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  });
  const [dropOffDate, setDropOffDate] = useState<Date | undefined>(() => {
    if (paramDropoffDate) {
      try {
        return new Date(paramDropoffDate);
      } catch (e) {
        return undefined;
      }
    }
    return undefined;
  });
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });

  useEffect(() => {
    if (!paramPickupDate) {
      const start = new Date();
      start.setDate(start.getDate() + 7);
      start.setHours(10, 0, 0, 0);
      setPickUpDate(start);
    }
    if (!paramDropoffDate) {
      const base = paramPickupDate ? new Date(paramPickupDate) : new Date();
      const end = new Date(base);
      end.setDate(end.getDate() + 7);
      setDropOffDate(end);
    }
  }, [paramPickupDate, paramDropoffDate]);

  useEffect(() => {
    if (paramPickup) setPickUpLocation(paramPickup);
    if (paramDropoff) setDropOffLocation(paramDropoff);
  }, [paramPickup, paramDropoff]);

  const handlePassengerChange = setPassengers;

  const handleSearch = () => {
    if (!pickUpLocation || !dropOffLocation || !pickUpDate || !dropOffDate)
      return;

    const rentalDays = differenceInDays(dropOffDate, pickUpDate);
    if (rentalDays < 1) return;

    // Use snake_case param names matching cars.controller.ts @Query decorators
    const params = new URLSearchParams({
      pickup: pickUpLocation,
      dropoff: dropOffLocation,
      pickupDate: pickUpDate.toISOString(),
      dropoffDate: dropOffDate.toISOString(),
    });

    startLoading("Searching Cars...");
    router.push(`/cars/result?${params.toString()}`);
  };

  const minRentalValid =
    pickUpDate && dropOffDate && differenceInDays(dropOffDate, pickUpDate) >= 1;

  return (
    <section className="space-y-3 relative z-20 mb-6">
      <div className="bg-background/80 backdrop-blur-md px-3">
        <BookingSearchForm
          variant="car"
          labels={{
            origin: "Pick-up",
            destination: "Drop-off",
            depart: "Pick-up Date",
            return: "Drop-off Date",
            search: "Search Cars",
          }}
          placeholders={{
            origin: "City or Airport",
            destination: "City or Airport",
          }}
          origin={pickUpLocation}
          setOrigin={setPickUpLocation}
          destination={dropOffLocation}
          setDestination={setDropOffLocation}
          departDate={pickUpDate}
          setDepartDate={setPickUpDate}
          returnDate={dropOffDate}
          setReturnDate={setDropOffDate}
          passengers={passengers}
          handlePassengerChange={handlePassengerChange}
          cabinClass="Economy"
          setCabinClass={() => {}}
          tripType="round-trip"
          setTripType={() => {}}
          handleSearch={handleSearch}
          guestSelector={
            <div className="flex flex-col justify-center px-4 h-full">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                Driver Age
              </span>
              <span className="text-sm font-semibold">25+</span>
            </div>
          }
        />
        {pickUpDate && dropOffDate && !minRentalValid && (
          <p className="mt-4 text-xs font-medium text-destructive animate-pulse bg-destructive/10 py-2 px-4 rounded-full inline-block">
            Minimum 1 day rental required.
          </p>
        )}
      </div>
    </section>
  );
}
