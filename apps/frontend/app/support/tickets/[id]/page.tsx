'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { SatisfactionRating } from '@/components/support/SatisfactionRating';
import { TicketReplyBox } from '@/components/support/TicketReplyBox';
import { TicketThread } from '@/components/support/TicketThread';
import { SupportTicket } from '@/components/support/types';
import { apiFetch } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const ticket = useQuery({
    queryKey: ['support-ticket', params.id],
    queryFn: () => apiFetch<SupportTicket & { messages: Array<any> }>(`/support/tickets/${params.id}`),
    enabled: !!params.id,
  });

  const replyMutation = useMutation({
    mutationFn: (payload: { body: string; attachments: Array<{ name: string }> }) => apiFetch(`/support/tickets/${params.id}/messages`, { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['support-ticket', params.id] });
      await queryClient.invalidateQueries({ queryKey: ['support-my-tickets'] });
    },
  });

  const closeMutation = useMutation({
    mutationFn: (payload: { rating?: number; comment?: string }) => apiFetch(`/support/tickets/${params.id}/close`, { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['support-ticket', params.id] });
      await queryClient.invalidateQueries({ queryKey: ['support-my-tickets'] });
    },
  });

  const data = ticket.data;
  const deadline = data?.slaDeadline ? new Date(data.slaDeadline) : null;
  const remainingHours = deadline ? Math.max(0, Math.floor((deadline.getTime() - Date.now()) / (1000 * 60 * 60))) : null;

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{data?.subject ?? 'Ticket'}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {data?.ticketNumber} · {data?.status.replace('_', ' ')}
          </p>
          {remainingHours !== null && (
            <p className="text-sm font-medium text-primary">SLA timer: {remainingHours}h remaining</p>
          )}
        </CardHeader>
      </Card>

      {data?.messages && <TicketThread messages={data.messages} />}

      {data?.status !== 'closed' && data?.status !== 'resolved' && (
        <TicketReplyBox onSubmit={(payload) => replyMutation.mutateAsync(payload)} />
      )}

      {data?.status === 'resolved' && (
        <Card>
          <CardContent className="pt-6 space-y-3">
            <Button
              variant="brand-red"
              onClick={() => closeMutation.mutate({})}
              type="button"
            >
              Mark as resolved &amp; close
            </Button>
            <SatisfactionRating onSubmit={(rating, comment) => closeMutation.mutateAsync({ rating, comment })} />
          </CardContent>
        </Card>
      )}
    </section>
  );
}
