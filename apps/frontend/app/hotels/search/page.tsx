import { HotelSearchContainer } from '@/components/hotels/HotelSearchContainer';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { SupportFaqAccordion } from '@/components/support/SupportFaqAccordion';

const hotelFaqs = [
  {
    q: 'Can I search by city or by hotel name?',
    a: 'Yes. Enter a city or a specific hotel name in the search field to find matching stays.',
  },
  {
    q: 'What if my check-out date is before check-in?',
    a: 'The search requires a valid date range, so check-out must be after check-in.',
  },
  {
    q: 'Do hotel prices include taxes and fees?',
    a: 'The listed nightly rate is a starting price. Final total with taxes and fees is shown during booking.',
  },
];

export default function HotelSearchPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-20">
        <section className="border-b border-border/60 bg-linear-to-b from-sky-100/20 via-transparent to-transparent">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 md:px-6 md:py-14">
            <div className="mb-6 max-w-2xl space-y-2">
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Find your perfect hotel stay</h1>
              <p className="text-sm text-muted-foreground md:text-base">
                Search hotels by city or property name, choose your dates, and get matched results instantly.
              </p>
            </div>
            <HotelSearchContainer />
          </div>
        </section>

        <section className="mx-auto w-full max-w-screen-2xl px-4 py-10 md:px-6 md:py-14">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border/70 bg-card p-5 md:p-8">
            <h2 className="mb-2 text-xl font-semibold md:text-2xl">Hotel booking FAQs</h2>
            <p className="mb-5 text-sm text-muted-foreground md:text-base">
              Everything you need to know before selecting your stay.
            </p>
            <SupportFaqAccordion faqs={hotelFaqs} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
