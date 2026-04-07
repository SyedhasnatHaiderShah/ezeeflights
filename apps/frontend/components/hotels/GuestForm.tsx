'use client';

import { useState } from 'react';

interface Props {
  roomIds: string[];
  onSubmit: (guests: Array<{ fullName: string; age: number; type: 'ADULT' | 'CHILD'; roomId: string }>) => void;
}

export function GuestForm({ roomIds, onSubmit }: Props) {
  const [guests, setGuests] = useState([{ fullName: '', age: 30, type: 'ADULT' as const, roomId: roomIds[0] ?? '' }]);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(guests);
      }}
    >
      {guests.map((guest, index) => (
        <div key={index} className="grid gap-2 sm:grid-cols-4">
          <input
            className="rounded border p-2"
            placeholder="Full name"
            value={guest.fullName}
            onChange={(e) => {
              const next = [...guests];
              next[index].fullName = e.target.value;
              setGuests(next);
            }}
          />
          <input
            className="rounded border p-2"
            type="number"
            min={0}
            value={guest.age}
            onChange={(e) => {
              const next = [...guests];
              next[index].age = Number(e.target.value);
              setGuests(next);
            }}
          />
          <select
            className="rounded border p-2"
            value={guest.type}
            onChange={(e) => {
              const next = [...guests];
              next[index].type = e.target.value as 'ADULT' | 'CHILD';
              setGuests(next);
            }}
          >
            <option value="ADULT">Adult</option>
            <option value="CHILD">Child</option>
          </select>
          <select
            className="rounded border p-2"
            value={guest.roomId}
            onChange={(e) => {
              const next = [...guests];
              next[index].roomId = e.target.value;
              setGuests(next);
            }}
          >
            {roomIds.map((roomId) => (
              <option key={roomId} value={roomId}>
                {roomId.slice(0, 8)}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button
        type="button"
        className="rounded border px-2 py-1"
        onClick={() => setGuests((prev) => [...prev, { fullName: '', age: 10, type: 'CHILD', roomId: roomIds[0] ?? '' }])}
      >
        Add guest
      </button>
      <button className="ml-2 rounded bg-slate-900 px-3 py-2 text-white" type="submit">
        Continue
      </button>
    </form>
  );
}
