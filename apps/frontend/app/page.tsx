import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">ezeeFlights</h1>
      <p className="text-slate-600">AI-powered travel booking platform (Flights, Hotels, Cars, Packages, and Trip Planner).</p>
      <nav className="flex flex-wrap gap-3">
        <Link href="/auth" className="rounded bg-slate-900 px-4 py-2 text-white">
          Sign In
        </Link>
        <Link href="/flights" className="rounded bg-blue-600 px-4 py-2 text-white">
          Search Flights
        </Link>
        <Link href="/hotels" className="rounded border px-4 py-2">
          Search Hotels
        </Link>
        <Link href="/ai" className="rounded border px-4 py-2">
          AI Assistant
        </Link>
        <Link href="/destinations" className="rounded border px-4 py-2">
          Destinations
        </Link>
        <Link href="/dashboard" className="rounded border px-4 py-2">
          Dashboard
        </Link>
      </nav>
    </section>
  );
}
