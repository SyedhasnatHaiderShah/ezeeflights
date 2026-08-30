'use client';

import { useState } from 'react';

export function ItineraryBuilder({ onSave }: { onSave: (rows: Array<{ dayNumber: number; title: string; description: string }>) => void }) {
  const [rows, setRows] = useState<Array<{ dayNumber: number; title: string; description: string }>>([{ dayNumber: 1, title: '', description: '' }]);

  return (
    <div className="space-y-2 rounded border p-4">
      <h3 className="font-semibold">Itinerary Builder (drag/drop-ready list)</h3>
      {rows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-3 gap-2">
          <input className="rounded border px-2 py-1" type="number" value={row.dayNumber} onChange={(e) => setRows(rows.map((r, i) => i === idx ? { ...r, dayNumber: Number(e.target.value || 1) } : r))} />
          <input className="rounded border px-2 py-1" placeholder="Title" value={row.title} onChange={(e) => setRows(rows.map((r, i) => i === idx ? { ...r, title: e.target.value } : r))} />
          <input className="rounded border px-2 py-1" placeholder="Description" value={row.description} onChange={(e) => setRows(rows.map((r, i) => i === idx ? { ...r, description: e.target.value } : r))} />
        </div>
      ))}
      <div className="flex gap-2">
        <button className="rounded border px-3 py-1" onClick={() => setRows([...rows, { dayNumber: rows.length + 1, title: '', description: '' }])}>Add Day</button>
        <button className="rounded bg-blue-600 px-3 py-1 text-white" onClick={() => onSave(rows)}>Save Itinerary</button>
      </div>
    </div>
  );
}
