'use client';

export function TravelerForm({ counts, onChange }: { counts: { adult: number; child: number; infant: number }; onChange: (next: { adult: number; child: number; infant: number }) => void }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {(['adult', 'child', 'infant'] as const).map((type) => (
        <label key={type} className="rounded border p-3 text-sm">
          <span className="mb-1 block capitalize">{type}</span>
          <input
            type="number"
            min={type === 'adult' ? 1 : 0}
            className="w-full rounded border px-2 py-1"
            value={counts[type]}
            onChange={(e) => onChange({ ...counts, [type]: Number(e.target.value || 0) })}
          />
        </label>
      ))}
    </div>
  );
}
