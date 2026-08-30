"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { differenceInDays, parseISO } from "date-fns";
import { HotelGuestRoomSelector } from "@/components/hotels/HotelGuestRoomSelector";
import { BookingSearchForm } from "@/components/search/BookingSearchForm";
import { useTranslation } from "react-i18next";

export interface HotelInlineSearchFormProps {
  initialCity?: string;
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: string;
  initialRooms?: string;
  onSearch?: () => void;
  /** Stacked layout for sticky panel / narrow widths */
  stacked?: boolean;
}

export function HotelInlineSearchForm({
  initialCity = "",
  initialCheckIn = "",
  initialCheckOut = "",
  initialAdults = "2",
  initialRooms = "1",
  onSearch,
  stacked = false,
}: HotelInlineSearchFormProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [city, setCity] = useState(initialCity || "Dubai");
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState({
    adults: Math.max(1, parseInt(initialAdults, 10) || 2),
    children: 0,
    rooms: Math.max(1, parseInt(initialRooms, 10) || 1),
  });
  const [tripType, setTripType] = useState("one-way");

  useEffect(() => {
    setCity(initialCity || "Dubai");
    setGuests({
      adults: Math.max(1, parseInt(initialAdults, 10) || 2),
      children: 0,
      rooms: Math.max(1, parseInt(initialRooms, 10) || 1),
    });

    if (initialCheckIn) {
      try {
        setCheckInDate(parseISO(initialCheckIn));
      } catch {
        setCheckInDate(undefined);
      }
    }
    if (initialCheckOut) {
      try {
        setCheckOutDate(parseISO(initialCheckOut));
      } catch {
        setCheckOutDate(undefined);
      }
    }
  }, [initialCity, initialCheckIn, initialCheckOut, initialAdults, initialRooms]);

  useEffect(() => {
    if (checkInDate && checkOutDate) return;
    const checkIn = new Date();
    checkIn.setHours(0, 0, 0, 0);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 1);
    if (!checkInDate) setCheckInDate(checkIn);
    if (!checkOutDate) setCheckOutDate(checkOut);
  }, [checkInDate, checkOutDate]);

  const handleGuestChange = (passengers: {
    adults: number;
    children: number;
    infants: number;
  }) => {
    setGuests((prev) => ({
      ...prev,
      adults: passengers.adults,
      children: passengers.children,
    }));
  };

  const handleGuestRoomChange = (key: "adults" | "children" | "rooms", val: number) => {
    setGuests((prev) => ({ ...prev, [key]: val }));
  };

  const handleSearch = () => {
    const normalizedCity = city.trim();
    if (!normalizedCity || !checkInDate || !checkOutDate) return;
    if (differenceInDays(checkOutDate, checkInDate) < 1) return;

    const params = new URLSearchParams({
      city: normalizedCity,
      checkInDate: checkInDate.toISOString().slice(0, 10),
      checkOutDate: checkOutDate.toISOString().slice(0, 10),
      adults: guests.adults.toString(),
      rooms: guests.rooms.toString(),
      page: "1",
      limit: "10",
    });

    router.push(`/hotels/results?${params.toString()}`);
    onSearch?.();
  };

  const minStayValid =
    checkInDate &&
    checkOutDate &&
    differenceInDays(checkOutDate, checkInDate) >= 1;

  return (
    <div className="space-y-3">
      <BookingSearchForm
        variant="hotel"
        layout={stacked ? "stacked" : "horizontal"}
        labels={{
          destination: t("City, Landmark or Area"),
          search: t("Search Hotels"),
        }}
        placeholders={{
          destination: t("Where are you staying?"),
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
        setCabinClass={() => undefined}
        tripType={tripType}
        setTripType={setTripType}
        handleSearch={handleSearch}
        guestSelector={
          <HotelGuestRoomSelector
            guests={guests}
            onChange={handleGuestRoomChange}
            className="h-16"
          />
        }
      />
      {checkInDate && checkOutDate && !minStayValid && (
        <p className="text-xs font-medium text-destructive bg-destructive/10 py-2 px-4 rounded-full inline-block">
          {t("Minimum 1 night stay required.")}
        </p>
      )}
    </div>
  );
}
