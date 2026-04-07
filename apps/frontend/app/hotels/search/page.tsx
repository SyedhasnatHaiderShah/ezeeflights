import { SearchForm } from '@/components/hotels/SearchForm';

export default function HotelSearchPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Search Hotels</h1>
      <SearchForm />
    </section>
  );
}
