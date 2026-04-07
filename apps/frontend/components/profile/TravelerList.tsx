'use client';

export interface Traveler {
  id: string;
  fullName: string;
  passportNumber: string;
  dob: string;
  nationality: string;
}

export function TravelerList({ travelers, onDelete }: { travelers: Traveler[]; onDelete: (id: string) => Promise<void> }) {
  return (
    <ul className="space-y-2">
      {travelers.map((traveler) => (
        <li key={traveler.id} className="flex items-center justify-between rounded border bg-white p-3">
          <div>
            <p className="font-medium">{traveler.fullName}</p>
            <p className="text-sm text-slate-600">{traveler.passportNumber} · {traveler.nationality}</p>
          </div>
          <button className="rounded border px-3 py-1" onClick={() => onDelete(traveler.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
