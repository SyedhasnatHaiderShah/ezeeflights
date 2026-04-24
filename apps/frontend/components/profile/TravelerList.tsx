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
    <ul className="space-y-3">
      {travelers.map((traveler) => (
        <li key={traveler.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10 text-brand-red">
              <span className="text-sm font-bold">{traveler.fullName.charAt(0)}</span>
            </div>
            <div>
              <p className="font-bold text-foreground">{traveler.fullName}</p>
              <p className="text-xs text-muted-foreground">{traveler.passportNumber} • {traveler.nationality}</p>
            </div>
          </div>
          <button className="rounded-lg border border-border px-4 py-1.5 text-xs font-semibold transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30" onClick={() => onDelete(traveler.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
