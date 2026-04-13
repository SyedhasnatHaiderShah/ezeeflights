'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';

const categories = [
  'flight_delay',
  'refund',
  'hotel_issue',
  'car_issue',
  'payment_problem',
  'booking_modification',
  'account_issue',
  'complaint',
  'general',
] as const;

export function CreateTicketForm() {
  const router = useRouter();
  const [category, setCategory] = useState<(typeof categories)[number]>('general');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [attachment, setAttachment] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-3 rounded-lg border bg-white p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await apiFetch('/support/tickets', {
            method: 'POST',
            body: JSON.stringify({
              category,
              subject,
              description,
              bookingId: bookingId || undefined,
              attachments: attachment ? [{ name: attachment }] : [],
            }),
          });
          router.push('/support/tickets');
        } finally {
          setLoading(false);
        }
      }}
    >
      <label className="block text-sm font-medium">Category</label>
      <select className="w-full rounded border p-2" value={category} onChange={(e) => setCategory(e.target.value as (typeof categories)[number])}>
        {categories.map((item) => (
          <option key={item} value={item}>{item.replace('_', ' ')}</option>
        ))}
      </select>
      <label className="block text-sm font-medium">Subject</label>
      <input className="w-full rounded border p-2" value={subject} onChange={(e) => setSubject(e.target.value)} required />
      <label className="block text-sm font-medium">Description</label>
      <textarea className="min-h-32 w-full rounded border p-2" value={description} onChange={(e) => setDescription(e.target.value)} required />
      <label className="block text-sm font-medium">Booking ID (optional)</label>
      <input className="w-full rounded border p-2" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
      <label className="block text-sm font-medium">Attachment filename (optional)</label>
      <input className="w-full rounded border p-2" value={attachment} onChange={(e) => setAttachment(e.target.value)} />
      <button className="rounded bg-slate-900 px-4 py-2 text-white" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create ticket'}</button>
    </form>
  );
}
