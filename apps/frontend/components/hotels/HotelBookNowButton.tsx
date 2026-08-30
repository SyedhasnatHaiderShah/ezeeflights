"use client";

import { useHotelBookingFlowStore } from "@/lib/store/hotel-booking-flow-store";
import { useRouter, usePathname } from "next/navigation";

interface BookNowButtonProps {
  hotelId: string;
  roomId: string;
  roomType: string;
  pricePerNight: number;
  checkIn: string;
  checkOut: string;
  label?: string;
}

export function HotelBookNowButton({
  hotelId,
  roomId,
  roomType,
  pricePerNight,
  checkIn,
  checkOut,
  label = "Select & Continue",
}: BookNowButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const setTrip = useHotelBookingFlowStore((state) => state.setTrip);
  const setRooms = useHotelBookingFlowStore((state) => state.setRooms);

  const handleBookNow = () => {
    setTrip(hotelId, checkIn, checkOut);
    setRooms([
      {
        roomId,
        roomType,
        quantity: 1,
        pricePerNight,
      },
    ]);

    const params = new URLSearchParams({
      checkInDate: checkIn,
      checkOutDate: checkOut,
      roomId,
    });
    router.replace(`${pathname}?${params.toString()}` as any, {
      scroll: false,
    });

    requestAnimationFrame(() => {
      document
        .getElementById("guest-booking")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <button
      type="button"
      onClick={handleBookNow}
      className="w-full bg-redmix text-white font-bold h-11 rounded-xl shadow-lg shadow-redmix/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center text-sm px-8"
    >
      {label}
    </button>
  );
}
