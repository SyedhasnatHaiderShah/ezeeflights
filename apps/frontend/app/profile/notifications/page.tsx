'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';

type Channel = 'email' | 'sms' | 'whatsapp';
type EventType = 'booking' | 'priceAlerts' | 'checkInReminders' | 'deals';

export default function NotificationPreferencesPage() {
  const [channels, setChannels] = useState<Record<Channel, boolean>>({ email: true, sms: false, whatsapp: false });
  const [events, setEvents] = useState<Record<EventType, boolean>>({
    booking: true,
    priceAlerts: true,
    checkInReminders: true,
    deals: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSave() {
    setSaving(true);
    setMessage(null);
    try {
      await apiFetch('/users/me/notification-preferences', {
        method: 'PATCH',
        body: JSON.stringify({ channels, events }),
      });
      setMessage('Preferences saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6 rounded border bg-white p-6">
      <h1 className="text-2xl font-bold">Notification preferences</h1>

      <div className="space-y-2">
        <h2 className="font-semibold">Channels</h2>
        {(['email', 'sms', 'whatsapp'] as Channel[]).map((channel) => (
          <label key={channel} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={channels[channel]}
              onChange={(e) => setChannels((prev) => ({ ...prev, [channel]: e.target.checked }))}
            />
            <span className="capitalize">{channel}</span>
          </label>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Event types</h2>
        {([
          ['booking', 'Booking updates'],
          ['priceAlerts', 'Price alerts'],
          ['checkInReminders', 'Check-in reminders'],
          ['deals', 'Deals & promotions'],
        ] as [EventType, string][]).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={events[key]}
              onChange={(e) => setEvents((prev) => ({ ...prev, [key]: e.target.checked }))}
            />
            {label}
          </label>
        ))}
      </div>

      <button type="button" onClick={onSave} disabled={saving} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
        {saving ? 'Saving...' : 'Save preferences'}
      </button>

      {message && <p className="text-sm text-slate-700">{message}</p>}
    </section>
  );
}
