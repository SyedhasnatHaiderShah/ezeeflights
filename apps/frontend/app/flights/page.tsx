import { FlightsSearchContainer } from '@/components/containers/flights-search-container';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { SupportFaqAccordion } from '@/components/support/SupportFaqAccordion';

const flightFaqs = [
  {
    q: 'When is the best time to book flights?',
    a: 'For most routes, booking 3 to 6 weeks ahead gives the best balance between price and availability.',
  },
  {
    q: 'Can I search one-way and round-trip flights?',
    a: 'Yes. Use the trip type selector in the booking form to switch between one-way and round-trip journeys.',
  },
  {
    q: 'Do prices include taxes and fees?',
    a: 'Displayed fares are base prices. Final totals, including taxes and carrier fees, appear before payment.',
  },
];

export default function FlightsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-20">
        <section className="border-b border-border/60 bg-linear-to-b from-brand-yellow/10 via-transparent to-transparent">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 md:px-6 md:py-14">
            <div className="mb-6 max-w-2xl space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Find your next flight</h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Compare routes, schedules, and fares in one place. Start with your route and date to explore live availability.
              </p>
            </div>
            <FlightsSearchContainer />
          </div>
        </section>

        <section className="mx-auto w-full max-w-screen-2xl px-4 py-10 md:px-6 md:py-14">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border/70 bg-card p-5 md:p-8">
            <h2 className="mb-2 text-xl font-semibold md:text-2xl">Flight booking FAQs</h2>
            <p className="mb-5 text-sm text-muted-foreground md:text-base">
              Quick answers to common questions before you confirm your booking.
            </p>
            <SupportFaqAccordion faqs={flightFaqs} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
