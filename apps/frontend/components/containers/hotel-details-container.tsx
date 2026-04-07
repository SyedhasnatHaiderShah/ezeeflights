'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { RoomCard } from '@/components/hotels/RoomCard';
import { useHotelBookingFlowStore } from '@/lib/store/hotel-booking-flow-store';

interface Room {
  id: string;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  currency: string;
  availableRooms: number;
}

interface Props {
  hotelId: string;
  rooms: Room[];
}

export function HotelDetailsContainer({ hotelId, rooms }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const checkInDate = params.get('checkInDate') ?? '';
  const checkOutDate = params.get('checkOutDate') ?? '';
  const setTrip = useHotelBookingFlowStore((s) => s.setTrip);
  const setRooms = useHotelBookingFlowStore((s) => s.setRooms);
  const [selected, setSelected] = useState<Record<string, number>>({});

  const pricePreview = useMemo(
    () =>
      rooms.reduce((acc, room) => {
        return acc + room.pricePerNight * (selected[room.id] ?? 0);
      }, 0),
    [rooms, selected],
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Select rooms</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            selectedQuantity={selected[room.id] ?? 0}
            onChange={(targetRoom, quantity) => setSelected((prev) => ({ ...prev, [targetRoom.id]: quantity }))}
          />
        ))}
      </div>
      <p className="font-medium">Per night total: {pricePreview.toFixed(2)}</p>
      <button
        className="rounded bg-blue-600 px-3 py-2 text-white"
        onClick={() => {
          const selectedRooms = rooms
            .filter((room) => (selected[room.id] ?? 0) > 0)
            .map((room) => ({
              roomId: room.id,
              roomType: room.roomType,
              quantity: selected[room.id],
              pricePerNight: room.pricePerNight,
            }));

          setTrip(hotelId, checkInDate, checkOutDate);
          setRooms(selectedRooms);
          router.push('/hotels/booking');
        }}
      >
        Continue booking
      </button>
    </div>
  );
}
