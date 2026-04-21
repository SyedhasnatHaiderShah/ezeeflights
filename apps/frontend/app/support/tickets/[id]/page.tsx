'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { SatisfactionRating } from '@/components/support/SatisfactionRating';
import { TicketReplyBox } from '@/components/support/TicketReplyBox';
import { TicketThread } from '@/components/support/TicketThread';
import { SupportTicket } from '@/components/support/types';
import { apiFetch } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [ratingOpen, setRatingOpen] = useState(false);

  const ticket = useQuery({ queryKey: ['support-ticket', params.id], queryFn: () => apiFetch<SupportTicket & { messages: Array<any> }>(`/support/tickets/${params.id}`), enabled: !!params.id });
  const replyMutation = useMutation({ mutationFn: (payload: { body: string; attachments: Array<{ name: string }> }) => apiFetch(`/support/tickets/${params.id}/messages`, { method: 'POST', body: JSON.stringify(payload) }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['support-ticket', params.id] }); } });
  const closeMutation = useMutation({ mutationFn: (payload: { rating?: number; comment?: string }) => apiFetch(`/support/tickets/${params.id}/close`, { method: 'POST', body: JSON.stringify(payload) }), onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['support-ticket', params.id] }); } });

  const data = ticket.data;
  return (
    <section className="space-y-4 pb-28">
      <Card><CardHeader><CardTitle>{data?.subject ?? 'Ticket'}</CardTitle><p className="text-sm text-muted-foreground">{data?.ticketNumber} · {data?.status.replace('_', ' ')}</p></CardHeader></Card>
      {data?.messages && <TicketThread messages={data.messages} />}

      {data?.status === 'resolved' && (
        <Button variant="brand-red" type="button" onClick={() => setRatingOpen(true)}>Rate & close ticket</Button>
      )}

      <Dialog open={ratingOpen} onOpenChange={setRatingOpen}><DialogContent><DialogHeader><DialogTitle>Satisfaction Rating</DialogTitle></DialogHeader><SatisfactionRating onSubmit={async (rating, comment) => { await closeMutation.mutateAsync({ rating, comment }); }} /></DialogContent></Dialog>

      {data?.status !== 'closed' && data?.status !== 'resolved' && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-3"><div className="mx-auto max-w-4xl"><TicketReplyBox onSubmit={async (payload) => { await replyMutation.mutateAsync(payload); }} /></div></div>
      )}
    </section>
  );
}
