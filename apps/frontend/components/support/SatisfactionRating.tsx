'use client';

import { useState } from 'react';

export function SatisfactionRating({ onSubmit }: { onSubmit: (rating: number, comment?: string) => Promise<void> }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="font-medium">Rate your support experience</p>
      <div className="my-3 flex gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button key={value} className={`text-2xl ${value <= rating ? 'text-amber-500' : 'text-slate-300'}`} onClick={() => setRating(value)} type="button">
            ★
          </button>
        ))}
      </div>
      <textarea className="min-h-20 w-full rounded border p-2 text-sm" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment" />
      <button className="mt-3 rounded bg-emerald-700 px-4 py-2 text-white" onClick={() => onSubmit(rating, comment || undefined)} type="button">
        Submit rating
      </button>
    </div>
  );
}
