'use client';

interface Room {
  id: string;
  roomType: string;
  capacity: number;
  pricePerNight: number;
  currency: string;
  availableRooms: number;
}

interface Props {
  room: Room;
  selectedQuantity: number;
  onChange: (room: Room, quantity: number) => void;
}

export function RoomCard({ room, selectedQuantity, onChange }: Props) {
  return (
    <article className="rounded border p-3">
      <h4 className="font-medium">{room.roomType}</h4>
      <p>Capacity: {room.capacity}</p>
      <p>
        {room.currency} {room.pricePerNight} / night
      </p>
      <p>Available: {room.availableRooms}</p>
      <input
        type="number"
        min={0}
        max={room.availableRooms}
        className="mt-2 w-24 rounded border p-1"
        value={selectedQuantity}
        onChange={(e) => onChange(room, Number(e.target.value))}
      />
    </article>
  );
}
