'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiFetch } from '@/lib/api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const categories = [
  { value: 'flight_delay',         label: 'Flight Delay' },
  { value: 'refund',               label: 'Refund' },
  { value: 'hotel_issue',          label: 'Hotel Issue' },
  { value: 'car_issue',            label: 'Car Issue' },
  { value: 'payment_problem',      label: 'Payment Problem' },
  { value: 'booking_modification', label: 'Booking Modification' },
  { value: 'account_issue',        label: 'Account Issue' },
  { value: 'complaint',            label: 'Complaint' },
  { value: 'general',              label: 'General' },
] as const;

type CategoryValue = (typeof categories)[number]['value'];

export function CreateTicketForm({ onCreated }: { onCreated?: () => void | Promise<void> } = {}) {
  const router = useRouter();
  const [category, setCategory] = useState<CategoryValue>('general');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [attachment, setAttachment] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-5"
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
          if (onCreated) {
            await onCreated();
          } else {
            router.push('/support/tickets');
          }
        } finally {
          setLoading(false);
        }
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select value={category} onValueChange={(val) => setCategory(val as CategoryValue)}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="Brief description of your issue"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className={cn(
            "flex min-h-32 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 hover:border-primary/50 resize-none",
          )}
          placeholder="Describe your issue in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bookingId">Booking ID <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input
          id="bookingId"
          placeholder="e.g. BK-20240001"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="attachment">Attachment filename <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Input
          id="attachment"
          placeholder="e.g. invoice.pdf"
          value={attachment}
          onChange={(e) => setAttachment(e.target.value)}
        />
      </div>

      <Button variant="brand-red" type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating...' : 'Create Ticket'}
      </Button>
    </form>
  );
}
