'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { TicketCard } from '@/components/support/TicketCard';
import { SupportTicket } from '@/components/support/types';
import { apiFetch } from '@/lib/api/client';

export default function SupportTicketsPage() {
  const tickets = useQuery({
    queryKey: ['support-my-tickets'],
    queryFn: () => apiFetch<SupportTicket[]>('/support/tickets/me'),
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Support Tickets</h1>
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/support/tickets/new">New ticket</Link>
      </div>

      <div className="space-y-3">
        {tickets.data?.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
        {tickets.data?.length === 0 && <p className="rounded border bg-white p-4 text-sm text-slate-600">No tickets yet.</p>}
      </div>
    </section>
  );
}
