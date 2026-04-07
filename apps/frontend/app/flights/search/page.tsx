import { SearchForm } from '@/components/flights/SearchForm';

export default function FlightSearchPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Search Flights</h1>
      <SearchForm />
    </section>
  );
}
