import Link from 'next/link';
import { SupportTicket } from './types';

const statusColor: Record<SupportTicket['status'], string> = {
  open:             'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  in_progress:      'bg-primary/10 text-primary',
  waiting_customer: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  resolved:         'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  closed:           'bg-muted text-muted-foreground',
};

export function TicketCard({ ticket }: { ticket: SupportTicket }) {
  return (
    <Link
      href={`/support/tickets/${ticket.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand-red/40 hover:bg-accent/40"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-semibold text-foreground">{ticket.subject}</p>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColor[ticket.status]}`}>
          {ticket.status.replace('_', ' ')}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{ticket.ticketNumber} · {ticket.category.replace('_', ' ')}</p>
      <p className="mt-2 text-xs text-muted-foreground/70">Last updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
    </Link>
  );
}
