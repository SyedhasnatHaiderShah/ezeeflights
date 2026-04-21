'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { TicketCard } from '@/components/support/TicketCard';
import { SupportTicket } from '@/components/support/types';
import { apiFetch } from '@/lib/api/client';

export default function SupportTicketsPage() {
  const [filter, setFilter] = useState('open');
  const tickets = useQuery({ queryKey: ['support-my-tickets'], queryFn: () => apiFetch<SupportTicket[]>('/support/tickets/me') });
  const filtered = (tickets.data ?? []).filter((t) => filter === 'all' || t.status === filter || (filter === 'in_progress' && t.status === 'in_progress'));

  return (
    <section className="space-y-4 pb-20">
      <h1 className="text-2xl font-bold">My Support Tickets</h1>
      <div className="flex gap-2">{[['open','Open'],['in_progress','In Progress'],['resolved','Resolved'],['all','All']].map(([k,l]) => <button key={k} onClick={() => setFilter(k)} className={`rounded-full border px-3 py-1 text-sm ${filter===k?'bg-brand-red text-white':''}`}>{l}</button>)}</div>
      <div className="space-y-3">{filtered.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}</div>
      <Link href="/support/tickets/new" className="fixed bottom-6 right-6 rounded-full bg-brand-red px-5 py-3 text-white shadow-lg">+ New Ticket</Link>
    </section>
  );
}
