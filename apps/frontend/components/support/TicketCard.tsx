import Link from 'next/link';
import { SupportTicket } from './types';

const statusColor: Record<SupportTicket['status'], string> = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  waiting_customer: 'bg-amber-100 text-amber-800',
  resolved: 'bg-emerald-100 text-emerald-800',
  closed: 'bg-slate-100 text-slate-700',
};

export function TicketCard({ ticket }: { ticket: SupportTicket }) {
  return (
    <Link href={`/support/tickets/${ticket.id}`} className="block rounded-lg border bg-white p-4 transition hover:border-slate-400">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="font-semibold">{ticket.subject}</p>
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor[ticket.status]}`}>{ticket.status.replace('_', ' ')}</span>
      </div>
      <p className="text-sm text-slate-600">{ticket.ticketNumber} · {ticket.category.replace('_', ' ')}</p>
      <p className="mt-2 text-xs text-slate-500">Last updated: {new Date(ticket.updatedAt).toLocaleString()}</p>
    </Link>
  );
}
