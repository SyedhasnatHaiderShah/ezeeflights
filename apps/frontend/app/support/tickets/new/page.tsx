import { CreateTicketForm } from '@/components/support/CreateTicketForm';

export default function NewSupportTicketPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Create Support Ticket</h1>
      <p className="text-sm text-slate-600">Share all relevant details so our agents can resolve your issue faster.</p>
      <CreateTicketForm />
    </section>
  );
}
