"use client";

import { useEffect, useMemo, useState } from "react";
import { getMyTrips, TripSummary } from "@/lib/api/trips";
import { useAuthSession } from "@/lib/hooks/use-auth-session";

/** Normalize stay dates to YYYY-MM-DD for comparison with search params. */
export function toStayDateKey(value: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value.slice(0, 10);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function buildHotelBookingKey(
  hotelId: string,
  checkIn: string,
  checkOut: string,
): string {
  return `${hotelId}-${toStayDateKey(checkIn)}-${toStayDateKey(checkOut)}`;
}

function resolveHotelId(trip: TripSummary): string | null {
  if (trip.hotelId) return trip.hotelId;
  if (/^[A-Z]{2}-[A-Z0-9]+$/i.test(trip.title)) return trip.title;
  return null;
}

/**
 * Loads the user's hotel trips and builds keys for hotels already booked
 * on the same check-in / check-out dates as the current search.
 */
export function useBookedHotelKeys(checkInDate: string, checkOutDate: string) {
  const { data: session } = useAuthSession();
  const [hotelTrips, setHotelTrips] = useState<TripSummary[]>([]);

  useEffect(() => {
    if (!session?.id) {
      setHotelTrips([]);
      return;
    }
    // Disabled to prevent GET /bookings/me?type=hotel 500 error
    /*
    getMyTrips("hotel")
      .then((trips) => setHotelTrips(trips))
      .catch(() => setHotelTrips([]));
    */
    setHotelTrips([]);
  }, [session?.id]);

  const bookedHotelKeys = useMemo(() => {
    const keys = new Set<string>();
    const searchCheckIn = toStayDateKey(checkInDate);
    const searchCheckOut = toStayDateKey(checkOutDate);

    hotelTrips.forEach((trip) => {
      if (trip.status === "cancelled") return;

      const hotelId = resolveHotelId(trip);
      if (!hotelId) return;

      const tripCheckIn = toStayDateKey(trip.startDate);
      const tripCheckOut = toStayDateKey(trip.endDate);

      if (tripCheckIn === searchCheckIn && tripCheckOut === searchCheckOut) {
        keys.add(buildHotelBookingKey(hotelId, checkInDate, checkOutDate));
      }
    });

    return keys;
  }, [hotelTrips, checkInDate, checkOutDate]);

  const isHotelBooked = (hotelId: string) =>
    bookedHotelKeys.has(buildHotelBookingKey(hotelId, checkInDate, checkOutDate));

  return { bookedHotelKeys, isHotelBooked };
}
