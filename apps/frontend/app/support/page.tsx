import Link from 'next/link';

export default function SupportHomePage() {
  return (
    <section className="space-y-6">
      <div className="rounded-2xl bg-slate-900 p-8 text-white">
        <h1 className="text-3xl font-bold">Support Center</h1>
        <input placeholder="How can we help?" className="mt-4 w-full rounded-lg border border-white/30 bg-white/10 px-4 py-3" />
      </div>
      <div className="grid gap-3 md:grid-cols-3">{['Booking changes', 'Refunds', 'Payments', 'Baggage', 'Loyalty', 'Account'].map((x) => <div key={x} className="rounded-xl border p-4">{x}</div>)}</div>
      <div className="grid gap-3 md:grid-cols-3">{['Live Chat', 'Email', 'Call'].map((x) => <div key={x} className="rounded-xl border p-4 font-semibold">{x}</div>)}</div>
      <Link href="/support/tickets" className="inline-block rounded bg-brand-red px-4 py-2 text-white">View Tickets</Link>
    </section>
  );
}
