import type { Metadata } from 'next';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { PackagesContent } from '@/components/packages/PackagesContent';

export const metadata: Metadata = {
  title: 'Travel Packages | Flights, Hotels & More Bundled',
  description:
    'Discover complete travel packages with flights, hotels, transfers and curated experiences bundled into one seamless booking. Save up to 40% compared to booking separately.',
  keywords: [
    'travel packages',
    'vacation packages',
    'holiday deals',
    'flight and hotel bundle',
    'all-inclusive packages',
    'cheap travel packages',
    'ezee flights packages',
  ],
  openGraph: {
    title: 'Travel Packages | EzeeFlights',
    description: 'Complete travel bundles — flights, hotels, transfers & experiences in one click.',
    url: 'https://www.ezeeflights.com/packages',
  },
};

export default function PackagesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 pt-16">
        <section className="mx-auto w-full max-w-screen-2xl px-4 py-8 md:px-6 md:py-12">
          <PackagesContent />
        </section>
      </main>
      <Footer />
    </div>
  );
}
