"use client";

import { useState } from "react";
import { cancelTrip } from "@/lib/api/trips";
import { ShieldAlert, X, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CancellationModal({
  bookingId,
  canCancel,
  refundEstimate,
}: {
  bookingId: string;
  canCancel: boolean;
  refundEstimate: number;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!canCancel) return null;

  const submit = async () => {
    setLoading(true);
    try {
      await cancelTrip(bookingId, reason || "User requested cancellation");
      setOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Cancellation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full border-2 border-redmix/20 text-redmix px-6 py-3 rounded-2xl font-bold hover:bg-redmix hover:text-white transition-all"
        onClick={() => setOpen(true)}
      >
        <ShieldAlert className="h-4 w-4" />
        Cancel Booking
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark-blue/60 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-8 shadow-2xl relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black tracking-tight">
                Confirm Cancellation
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 mb-6 flex gap-4">
              <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-black text-amber-800">
                  Refund Estimate
                </p>
                <p className="text-xs text-amber-700/80 mt-1">
                  You are eligible for a refund of approximately:
                </p>
                <p className="text-2xl font-black text-amber-900 mt-2">
                  ${refundEstimate.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Reason for cancellation
              </label>
              <textarea
                className="w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-redmix/20 transition-all"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please tell us why you're cancelling..."
              />
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <button
                type="button"
                className="px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                onClick={() => setOpen(false)}
              >
                Go Back
              </button>
              <button
                type="button"
                className="px-6 py-4 rounded-2xl font-bold bg-redmix text-white shadow-lg shadow-redmix/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                onClick={submit}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Confirm Cancel"
                )}
              </button>
            </div>

            {/* Decorative Background Glow */}
            <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-redmix/5 blur-3xl" />
          </div>
        </div>
      )}
    </>
  );
}
