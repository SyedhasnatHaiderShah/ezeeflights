"use client";

import { useHotelBookingFlowStore } from "@/lib/store/hotel-booking-flow-store";
import { useRouter } from "next/navigation";

interface BookNowButtonProps {
  hotelId: string;
  roomId: string;
  roomType: string;
  pricePerNight: number;
  checkIn: string;
  checkOut: string;
}

export function BookNowButton({
  hotelId,
  roomId,
  roomType,
  pricePerNight,
  checkIn,
  checkOut,
}: BookNowButtonProps) {
  const router = useRouter();
  const setTrip = useHotelBookingFlowStore((state) => state.setTrip);
  const setRooms = useHotelBookingFlowStore((state) => state.setRooms);

  const handleBookNow = () => {
    // Initialize the store with real data
    setTrip(hotelId, checkIn, checkOut);
    setRooms([
      {
        roomId,
        roomType,
        quantity: 1,
        pricePerNight,
      },
    ]);

    // Navigate to the booking page
    router.push("/hotels/booking");
  };

  return (
    <button
      onClick={handleBookNow}
      className="w-full sm:w-auto bg-brand-red text-white px-10 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-brand-red/30 transition-all text-center text-xs active:scale-95"
    >
      Book Now
    </button>
  );
}
