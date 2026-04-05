export const revalidate = 3600;

const destinations = [
  { city: 'Dubai', country: 'UAE' },
  { city: 'London', country: 'UK' },
  { city: 'Paris', country: 'France' },
];

export default function DestinationsPage() {
  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Popular Destinations</h1>
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {destinations.map((destination) => (
          <li className="rounded-xl border bg-white p-4" key={destination.city}>
            <p className="font-semibold">{destination.city}</p>
            <p className="text-sm text-slate-600">{destination.country}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
