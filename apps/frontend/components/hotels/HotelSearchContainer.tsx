"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GuestRoomSelector } from "@/components/hotels/GuestRoomSelector";
import { differenceInDays } from "date-fns";
import { BookingSearchForm } from "@/components/search/BookingSearchForm";

export function HotelSearchContainer() {
  const router = useRouter();
  const [city, setCity] = useState("Dubai");
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
    rooms: 1,
  });
  const [tripType, setTripType] = useState("one-way");

  useEffect(() => {
    const checkIn = new Date();
    checkIn.setHours(0, 0, 0, 0);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 1);
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  }, []);

  const handleGuestChange = (key: string, val: number) => {
    setGuests((prev) => ({ ...prev, [key]: val }));
  };

  const handleCabinClassChange = () => undefined;

  const handleSearch = () => {
    const normalizedCity = city.trim();

    if (!normalizedCity || !checkInDate || !checkOutDate) return;

    const stayDays = differenceInDays(checkOutDate, checkInDate);
    if (stayDays < 1) return;

    const params = new URLSearchParams({
      location: normalizedCity,
      checkIn: checkInDate.toISOString().slice(0, 10),
      checkOut: checkOutDate.toISOString().slice(0, 10),
      adults: guests.adults.toString(),
      children: guests.children.toString(),
      rooms: guests.rooms.toString(),
    });

    router.push(`/hotels/search?${params.toString()}`);
  };

  const minStayValid =
    checkInDate &&
    checkOutDate &&
    differenceInDays(checkOutDate, checkInDate) >= 1;

  return (
    <section className="space-y-4">
      <div className="bg-background/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-border/50">
        <BookingSearchForm
          variant="hotel"
          labels={{
            destination: "City, Landmark or Area",
            search: "Search Hotels",
          }}
          placeholders={{
            destination: "Where are you staying?",
          }}
          origin={city}
          setOrigin={setCity}
          destination={city}
          setDestination={setCity}
          departDate={checkInDate}
          setDepartDate={setCheckInDate}
          returnDate={checkOutDate}
          setReturnDate={setCheckOutDate}
          passengers={guests}
          handlePassengerChange={handleGuestChange}
          cabinClass="Economy"
          setCabinClass={handleCabinClassChange}
          tripType={tripType}
          setTripType={setTripType}
          handleSearch={handleSearch}
          guestSelector={
            <GuestRoomSelector
              guests={guests}
              onChange={handleGuestChange as any}
              className="h-16"
            />
          }
        />
        {checkInDate && checkOutDate && !minStayValid && (
          <p className="mt-4 text-xs font-medium text-destructive animate-pulse bg-destructive/10 py-2 px-4 rounded-full inline-block">
            Minimum 1 night stay required.
          </p>
        )}
      </div>
    </section>
  );
}
