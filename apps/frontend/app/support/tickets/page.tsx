'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { TicketCard } from '@/components/support/TicketCard';
import { SupportTicket } from '@/components/support/types';
import { apiFetch } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SupportTicketsPage() {
  const tickets = useQuery({
    queryKey: ['support-my-tickets'],
    queryFn: () => apiFetch<SupportTicket[]>('/support/tickets/me'),
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground font-display">My Support Tickets</h1>
        <Button variant="brand-red" asChild>
          <Link href="/support/tickets/new">New Ticket</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {tickets.data?.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
        {tickets.data?.length === 0 && (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground text-center">
              No tickets yet.
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
