import { FlightsSearchContainer } from '@/components/containers/flights-search-container';

export default function FlightsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Flight Search</h1>
      <FlightsSearchContainer />
    </section>
  );
}
