'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { SatisfactionRating } from '@/components/support/SatisfactionRating';
import { TicketReplyBox } from '@/components/support/TicketReplyBox';
import { TicketThread } from '@/components/support/TicketThread';
import { SupportTicket } from '@/components/support/types';
import { apiFetch } from '@/lib/api/client';

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
      <div className="rounded-lg border bg-white p-5">
        <h1 className="text-xl font-bold">{data?.subject ?? 'Ticket'}</h1>
        <p className="mt-1 text-sm text-slate-600">{data?.ticketNumber} · {data?.status.replace('_', ' ')}</p>
        {remainingHours !== null && <p className="mt-2 text-sm text-indigo-700">SLA timer: {remainingHours}h remaining</p>}
      </div>

      {data?.messages && <TicketThread messages={data.messages} />}

      {data?.status !== 'closed' && data?.status !== 'resolved' && <TicketReplyBox onSubmit={(payload) => replyMutation.mutateAsync(payload)} />}

      {data?.status === 'resolved' && (
        <div className="space-y-3">
          <button className="rounded bg-emerald-700 px-4 py-2 text-white" onClick={() => closeMutation.mutate({})} type="button">
            Mark as resolved & close
          </button>
          <SatisfactionRating onSubmit={(rating, comment) => closeMutation.mutateAsync({ rating, comment })} />
        </div>
      )}
    </section>
  );
}
