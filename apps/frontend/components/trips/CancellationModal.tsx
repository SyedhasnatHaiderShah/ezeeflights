'use client';

import { useState } from 'react';
import { cancelTrip } from '@/lib/api/trips';

export function CancellationModal({ bookingId, canCancel, refundEstimate }: { bookingId: string; canCancel: boolean; refundEstimate: number }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!canCancel) return null;

  const submit = async () => {
    setLoading(true);
    await cancelTrip(bookingId, reason || 'User requested cancellation');
    setLoading(false);
    setOpen(false);
    window.location.reload();
  };

  return (
    <>
      <button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700" onClick={() => setOpen(true)}>
        Cancel booking
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5">
            <h3 className="text-lg font-semibold">Confirm cancellation</h3>
            <p className="mt-2 text-sm text-slate-600">Estimated refund: {refundEstimate.toFixed(2)}</p>
            <textarea
              className="mt-3 w-full rounded border border-slate-300 p-2 text-sm"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Cancellation reason"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded border px-3 py-2 text-sm" onClick={() => setOpen(false)}>
                Close
              </button>
              <button type="button" className="rounded bg-red-600 px-3 py-2 text-sm text-white" onClick={submit} disabled={loading}>
                {loading ? 'Cancelling...' : 'Confirm cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
