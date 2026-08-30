'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';

type AlertType = 'flight' | 'hotel' | 'package';
type Channel = 'email' | 'sms' | 'whatsapp';

export function PriceAlertBadge({ type, searchParams }: { type: AlertType; searchParams: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');
  const [channels, setChannels] = useState<Channel[]>(['email']);
  const [status, setStatus] = useState<string | null>(null);

  async function onCreate() {
    setStatus(null);
    try {
      await apiFetch('/notifications/price-alerts', {
        method: 'POST',
        body: JSON.stringify({
          type,
          searchParams,
          targetPrice: Number(targetPrice),
          channels,
        }),
      });
      setStatus('Price alert created.');
      setOpen(false);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create price alert.');
    }
  }

  function toggleChannel(channel: Channel) {
    setChannels((prev) => (prev.includes(channel) ? prev.filter((c) => c !== channel) : [...prev, channel]));
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button type="button" onClick={() => setOpen(true)} className="rounded-full border border-blue-600 px-3 py-1 text-xs font-semibold text-blue-600">
        Set price alert
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md space-y-4 rounded bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold">Create price alert</h3>
            <input
              type="number"
              min="1"
              placeholder="Target price"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full rounded border p-2"
            />
            <div className="space-y-1 text-sm">
              <p className="font-medium">Channels</p>
              {(['email', 'sms', 'whatsapp'] as Channel[]).map((channel) => (
                <label key={channel} className="mr-4 inline-flex items-center gap-1">
                  <input type="checkbox" checked={channels.includes(channel)} onChange={() => toggleChannel(channel)} />
                  <span className="capitalize">{channel}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} className="rounded border px-3 py-1.5 text-sm">
                Cancel
              </button>
              <button type="button" onClick={onCreate} className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
                Save alert
              </button>
            </div>
          </div>
        </div>
      )}

      {status && <span className="text-xs text-slate-600">{status}</span>}
    </div>
  );
}
