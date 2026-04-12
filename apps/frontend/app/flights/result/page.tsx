import { ResultSearchHeader } from "./ResultSearchHeader";
import { Suspense } from "react";
import { Filter, Sparkles } from "lucide-react";
import * as motion from "framer-motion/client";
import { Header } from "@/components/sections/Header";
import { FlightResultContent } from "./FlightResultContent";
import { FlightResultSkeleton } from "@/components/flights/FlightCardSkeleton";
import {
  GeminiRecommendations,
  GeminiSkeleton,
} from "@/components/ai/GeminiRecommendations";
import { FloatingSearchButton } from "@/components/search/FloatingSearchButton";
import { FlightFilters } from "./FlightFilters";
import { SmartFilters } from "./SmartFilters";
import { QuickFilters } from "./QuickFilters";
import { TimeFilter } from "./TimeFilter";
import { AirlinesFilter } from "./AirlinesFilter";
import { LocationFilters } from "./LocationFilters";
import { DurationFilter } from "./DurationFilter";
import { AccordionFilters } from "./AccordionFilters";
import flightData from "@/flight-data.json";
import { FlightSearchResponse } from "@/lib/types/flight-api";

interface SearchProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

// Simulated async fetch function to show off the skeleton
async function FlightResultsSection({ flightsList }: { flightsList: any[] }) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return <FlightResultContent initialFlights={flightsList} />;
}

export default async function FlightResultsPage({ searchParams }: SearchProps) {
  const unwrappedParams = await searchParams;
  console.log("📥 FlightResultsPage Received Params:", unwrappedParams);

  // Use data from flight-data.json as the primary source as requested
  const typedFlightData = flightData as unknown as FlightSearchResponse;
  const { flightsSearchRQ, flightsList } = typedFlightData;

  const origin = unwrappedParams.org || flightsSearchRQ.from || "LHE";
  const destination = unwrappedParams.des || flightsSearchRQ.to || "DXB";
  const departureDate =
    unwrappedParams.dDate ||
    flightsSearchRQ.depDate ||
    new Date().toISOString().slice(0, 10);
  const returnDate = unwrappedParams.rDate;
  const adt = unwrappedParams.adt || flightsSearchRQ.adult.toString() || "1";
  const chd = unwrappedParams.chd || "0";
  const inf = unwrappedParams.inf || "0";
  const cabinClass = unwrappedParams.class || "Economy";
  const tripType = unwrappedParams.trip || "round-trip";

  const query = new URLSearchParams({
    origin,
    destination,
    departureDate,
    ...(returnDate && { returnDate }),
    adt,
    chd,
    inf,
    class: cabinClass,
    trip: tripType,
    page: unwrappedParams.page ?? "1",
    limit: unwrappedParams.limit ?? "20",
  });

  const searchHeaderBlock = (
    <Suspense
      fallback={
        <div className="h-[72px] bg-white dark:bg-background border-b dark:border-border" />
      }
    >
      <ResultSearchHeader
        initialOrigin={origin}
        initialDestination={destination}
        initialDDate={departureDate}
        initialRDate={returnDate}
        initialAdt={parseInt(adt)}
        initialChd={parseInt(chd)}
        initialInf={parseInt(inf)}
        initialClass={cabinClass}
        initialTripType={tripType}
      />
    </Suspense>
  );

  return (
    <>
      <Header />
      <div className="h-20 w-full" /> {/* Spacer for the fixed header height */}
      <div className="min-h-screen bg-slate-50 dark:bg-background relative pb-20 transition-colors duration-300">
        {/* Static search header visible at the top of the page */}
        <div className="relative z-10">{searchHeaderBlock}</div>

        <div className="max-w-[1240px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-5">
          {/* Left Sidebar: Smart & Standard Filters */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-64 flex-shrink-0 space-y-3"
          >
            <SmartFilters />
            <QuickFilters />
            <TimeFilter />
            <AirlinesFilter />
            <LocationFilters />
            <DurationFilter />
            <AccordionFilters />
            <FlightFilters />
          </motion.aside>

          <main className="flex-1 space-y-4">
            {/* Priceline Ad Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-muted/10 rounded-xl border border-gray-200 dark:border-border overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all group"
            >
              <div className="p-4 md:p-6 flex-grow flex items-center gap-6">
                <div className="flex-shrink-0 w-20 h-6 relative opacity-80 group-hover:opacity-100 transition-opacity">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Priceline.com_logo.svg/1200px-Priceline.com_logo.svg.png"
                    alt="Priceline"
                    className="object-contain filter dark:brightness-0 dark:invert"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base font-black text-brand-dark group-hover:text-brand-dark transition-colors tracking-tight">
                    Land a great deal for less.
                  </h3>
                  <p className="text-sm text-brand-dark-light/80 font-bold mt-0.5">
                    Sponsored • Book your flight with confidence
                  </p>
                </div>
              </div>
              <div className="flex-none w-52 p-5 flex items-center justify-center">
                <button className="mt-4 w-full bg-redmix dark:bg-brand-yellow hover:bg-brand-dark/90 text-white dark:text-white dark:border-redmix border-2 font-bold py-2.5 rounded-md cursor-pointer shadow-sm hover:shadow-md transition-all text-xs">
                  Book Now
                </button>
              </div>
            </motion.div>

            {/* Dynamic Results Content with Sorting Tabs */}
            <Suspense fallback={<FlightResultSkeleton />}>
              <FlightResultsSection flightsList={flightsList} />
            </Suspense>

            {/* AI Travel Intelligence Section */}
            <div className="pt-12 border-t border-gray-200 dark:border-border mt-12 pb-20">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-2.5 rounded-xl bg-brand-dark text-white shadow-lg shadow-brand-dark/10">
                  <Sparkles className="h-5 w-5 fill-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-brand-dark tracking-tight">
                    Aero Intelligence
                  </h2>
                  <p className="text-xs font-bold text-brand-dark-light/40 uppercase tracking-widest mt-1">
                    AI-powered travel insights for tactical discovery
                  </p>
                </div>
              </div>

              <Suspense fallback={<GeminiSkeleton />}>
                <GeminiRecommendations
                  destinationCode={destination}
                  searchParamsString={query.toString()}
                />
              </Suspense>
            </div>
          </main>
        </div>
      </div>
      <FloatingSearchButton />
    </>
  );
}
