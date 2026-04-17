'use client';

import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SupportFaqAccordion } from '@/components/support/SupportFaqAccordion';
import { CreateTicketForm } from '@/components/support/CreateTicketForm';
import { TicketCard } from '@/components/support/TicketCard';
import { SupportTicket } from '@/components/support/types';
import { apiFetch } from '@/lib/api/client';

const faqs = [
  { q: 'How do I request a refund?', a: 'Create a support ticket with the Refund category and include your booking ID.' },
  { q: 'How long does support take?', a: 'Our SLA depends on priority, from 1 hour first response for urgent cases.' },
  { q: 'Can I attach documents?', a: 'Yes, include references while creating or replying to a ticket.' },
];

const TABS = ['faq', 'tickets'] as const;
type Tab = (typeof TABS)[number];

function SupportTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get('tab') as Tab) ?? 'faq';
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const setTab = useCallback(
    (tab: Tab) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', tab);
      router.replace(`/support?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const tickets = useQuery({
    queryKey: ['support-my-tickets'],
    queryFn: () => apiFetch<SupportTicket[]>('/support/tickets/me'),
    enabled: activeTab === 'tickets',
  });

  const hasNoTickets = !tickets.isLoading && !tickets.isError && (tickets.data?.length ?? 0) === 0;

  return (
    <Tabs value={activeTab} onValueChange={(v) => setTab(v as Tab)}>
      <TabsList className="w-full h-12">
        <TabsTrigger value="faq" className="flex-1 h-10 p-1 hover:bg-redmix hover:text-white transition-all ease-in-out duration-300">FAQ</TabsTrigger>
        <TabsTrigger value="tickets" className="flex-1 h-10 p-1 hover:bg-redmix hover:text-white transition-all ease-in-out duration-300">My Tickets</TabsTrigger>
      </TabsList>

      {/* FAQ Tab */}
      <TabsContent value="faq">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <SupportFaqAccordion faqs={faqs} />
          </CardContent>
        </Card>
      </TabsContent>

      {/* My Tickets Tab */}
      <TabsContent value="tickets">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">My Tickets</CardTitle>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button variant="brand-red" size="sm">
                  New Ticket
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Ticket</DialogTitle>
                  <DialogDescription>
                    Fill in your issue details and submit. We&apos;ll create a ticket right away.
                  </DialogDescription>
                </DialogHeader>
                <CreateTicketForm
                  onCreated={async () => {
                    setIsCreateModalOpen(false);
                    await tickets.refetch();
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {tickets.isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            )}
            {tickets.data?.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
            {/* {tickets.isError && (
              <p className="py-6 text-sm text-destructive text-center">
                Unable to load tickets right now. Please try again.
              </p>
            )} */}
            {hasNoTickets && (
              <p className="py-6 text-sm text-muted-foreground text-center">
                No tickets yet. Create one above.
              </p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default function SupportHomePage() {
  return (
    <section className="space-y-6">
      {/* Hero Card */}
      <Card>
        <CardHeader>
          <CardTitle>Help Center</CardTitle>
          <CardDescription>Search common questions or open a support request for personalized help.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search FAQs..." />
          <Button variant="brand-red" asChild>
            <Link href="/support/tickets/new">Create Ticket</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Suspense required for useSearchParams in Next.js App Router */}
      <Suspense fallback={
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      }>
        <SupportTabs />
      </Suspense>
    </section>
  );
}
