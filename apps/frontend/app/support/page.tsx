import Link from 'next/link';

const faqs = [
  { q: 'How do I request a refund?', a: 'Create a support ticket with the Refund category and include your booking ID.' },
  { q: 'How long does support take?', a: 'Our SLA depends on priority, from 1 hour first response for urgent cases.' },
  { q: 'Can I attach documents?', a: 'Yes, include references while creating or replying to a ticket.' },
];

export default function SupportHomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border bg-white p-6">
        <h1 className="text-2xl font-bold">Help Center</h1>
        <p className="mt-2 text-sm text-slate-600">Search common questions or open a support request for personalized help.</p>
        <input className="mt-4 w-full rounded border p-3" placeholder="Search FAQs..." />
        <div className="mt-4 flex gap-3">
          <Link className="rounded bg-slate-900 px-4 py-2 text-white" href="/support/tickets/new">Create Ticket</Link>
          <Link className="rounded border px-4 py-2" href="/support/tickets">My Tickets</Link>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <article className="rounded border p-4" key={faq.q}>
              <h3 className="font-medium">{faq.q}</h3>
              <p className="mt-1 text-sm text-slate-600">{faq.a}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
