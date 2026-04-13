import Link from "next/link";
import { DestinationHero } from "@/components/destinations/DestinationHero";
import { listDestinations } from "@/lib/api/destinations-api";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

export const revalidate = 3600;

export default async function DestinationsPage() {
  let countries: Array<{
    id: string;
    name: string;
    code: string;
    heroImage?: string;
  }> = [];

  try {
    countries = await listDestinations();
  } catch {
    // destinations will render empty — non-fatal
  }

  return (
    <section className="space-y-5">
      <Header />
      <div className="pt-24">
        <DestinationHero
          title="Explore destinations"
          subtitle="Countries, cities, attractions, and AI-guided travel planning."
        />
      </div>

      {countries.length > 0 ? (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {countries.map((country) => (
            <li className="rounded-xl border bg-white p-4" key={country.id}>
              <p className="font-semibold">{country.name}</p>
              <p className="text-sm text-slate-600">ISO: {country.code}</p>
              <Link
                href={`/destinations/${country.code.toLowerCase()}`}
                className="mt-3 inline-block text-sm font-medium text-blue-600"
              >
                View cities
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <p className="text-slate-500">
            No destinations found or failed to load.
          </p>
        </div>
      )}
      <Footer />
    </section>
  );
}
