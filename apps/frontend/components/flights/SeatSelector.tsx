'use client';

export function SeatSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <input className="rounded border p-2" placeholder="Seat e.g. 12A" value={value} onChange={(e) => onChange(e.target.value.toUpperCase())} />;
}
