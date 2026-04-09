import { ResultSearchHeader } from "./ResultSearchHeader";
import { Suspense } from "react";
import { Plane, Filter, Info, ChevronRight, Sparkles } from "lucide-react";
import * as motion from "framer-motion/client";
import { MOCK_FLIGHTS } from "@/lib/mock/mock-flights";
import { AppImage } from "@/components/ui/app-image";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/sections/Header";
import { FlightResultContent } from "./FlightResultContent";
import {
  GeminiRecommendations,
  GeminiSkeleton,
} from "@/components/ai/GeminiRecommendations";

interface SearchProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function FlightResultsPage({ searchParams }: SearchProps) {
  // Await the searchParams to resolve context access warnings in Next 15+
  const unwrappedParams = await searchParams;

  const origin = unwrappedParams.org ?? "LHE";
  const destination = unwrappedParams.des ?? "AUH";
  const departureDate =
    unwrappedParams.dDate ?? new Date().toISOString().slice(0, 10);
  const adt = unwrappedParams.adt ?? "1";

  const query = new URLSearchParams({
    origin,
    destination,
    departureDate,
    page: unwrappedParams.page ?? "1",
    limit: unwrappedParams.limit ?? "20",
  });

  const base = process.env.INTERNAL_API_BASE_URL ?? "http://localhost:4000";
  let apiFlights = [];
  try {
    const response = await fetch(
      `${base}/v1/flights/search?${query.toString()}`,
      { cache: "no-store" },
    );
    apiFlights = response.ok ? await response.json() : [];
  } catch (e) {
    console.error("API Fetch Error:", e);
  }

  // Combine API results with mock data for aesthetic demo
  const flights = apiFlights.length > 0 ? apiFlights : MOCK_FLIGHTS;

  return (
    <>
      <Header />
      <div className="h-20 w-full" /> {/* Spacer for the fixed header height */}
      <div className="min-h-screen bg-slate-50 dark:bg-background relative pb-20 transition-colors duration-300">
        {/* Search Header component which includes BookingSearchForm statefully */}
        <Suspense
          fallback={
            <div className="h-[72px] bg-white dark:bg-background border-b dark:border-border" />
          }
        >
          <ResultSearchHeader
            initialOrigin={origin}
            initialDestination={destination}
            initialDDate={departureDate}
            initialAdt={parseInt(adt)}
          />
        </Suspense>

        <div className="max-w-[1240px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-5">
          {/* Left filters - Kayak layout styling */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-64 flex-shrink-0 space-y-4"
          >
            <div className="bg-white dark:bg-muted/10 rounded-[4px] border border-gray-200 dark:border-border shadow-sm">
              <div className="flex items-center gap-2 p-4 border-b border-gray-100 dark:border-border/50">
                <Filter className="w-4 h-4 text-foreground" />
                <h2 className="font-semibold text-base text-foreground">
                  Stops
                </h2>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="stop-nonstop"
                      defaultChecked
                      className="border-gray-300 dark:border-border data-[state=checked]:bg-[#ff4b2b] data-[state=checked]:border-[#ff4b2b]"
                    />
                    <Label
                      htmlFor="stop-nonstop"
                      className="text-gray-700 dark:text-foreground/90 group-hover:text-foreground cursor-pointer font-medium"
                    >
                      Nonstop
                    </Label>
                  </div>
                  <span className="text-gray-500 dark:text-muted-foreground font-medium">
                    $570
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="stop-1"
                      defaultChecked
                      className="border-gray-300 dark:border-border data-[state=checked]:bg-[#ff4b2b] data-[state=checked]:border-[#ff4b2b]"
                    />
                    <Label
                      htmlFor="stop-1"
                      className="text-gray-700 dark:text-foreground/90 group-hover:text-foreground cursor-pointer font-medium"
                    >
                      1 stop
                    </Label>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="stop-2"
                      defaultChecked
                      className="border-gray-300 dark:border-border data-[state=checked]:bg-[#ff4b2b] data-[state=checked]:border-[#ff4b2b]"
                    />
                    <Label
                      htmlFor="stop-2"
                      className="text-gray-700 dark:text-foreground/90 group-hover:text-foreground cursor-pointer font-medium"
                    >
                      2+ stops
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-muted/10 rounded-[4px] border border-gray-200 dark:border-border shadow-sm">
              <div className="p-4 border-b border-gray-100 dark:border-border/50">
                <h2 className="font-semibold text-base text-foreground">
                  Amenities
                </h2>
                <p className="text-xs text-gray-500 dark:text-muted-foreground mt-0.5 font-medium uppercase tracking-tight">
                  Bags per passenger
                </p>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-foreground/90">
                    Carry-on bag
                  </span>
                  <div className="flex items-center gap-3 text-sm">
                    <button className="w-7 h-7 rounded-sm border border-gray-200 dark:border-border shadow-sm flex justify-center items-center font-bold text-gray-400 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted/20">
                      -
                    </button>
                    <span className="w-4 text-center font-bold text-foreground">
                      0
                    </span>
                    <button className="w-7 h-7 rounded-sm border border-gray-200 dark:border-border shadow-sm flex justify-center items-center font-bold text-gray-400 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted/20">
                      +
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-foreground/90">
                    Checked bag
                  </span>
                  <div className="flex items-center gap-3 text-sm">
                    <button className="w-7 h-7 rounded-sm border border-gray-200 dark:border-border shadow-sm flex justify-center items-center font-bold text-gray-400 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted/20">
                      -
                    </button>
                    <span className="w-4 text-center font-bold text-foreground">
                      0
                    </span>
                    <button className="w-7 h-7 rounded-sm border border-gray-200 dark:border-border shadow-sm flex justify-center items-center font-bold text-gray-400 dark:text-muted-foreground hover:bg-gray-50 dark:hover:bg-muted/20">
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          <main className="flex-1 space-y-4">
            {/* Priceline Ad Banner */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-muted/10 rounded-[4px] border border-gray-200 dark:border-border overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all group border-l-[6px] border-l-[#007aff]"
            >
              <div className="p-4 md:p-6 flex-grow flex items-center gap-6">
                <div className="flex-shrink-0 w-24 h-8 relative">
                  <AppImage
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Priceline.com_logo.svg/1200px-Priceline.com_logo.svg.png"
                    alt="Priceline"
                    fill
                    className="object-contain filter dark:brightness-0 dark:invert"
                  />
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-extrabold text-foreground group-hover:text-redmix transition-colors">
                    Land a great deal for less. Book your flight with
                    confidence.
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground font-medium mt-1">
                    Fly more, spend less. Book now, travel anytime.
                  </p>
                </div>
              </div>
              <div className="flex-none p-4 md:p-6 bg-gray-50 dark:bg-muted/5 flex items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-border/50">
                <span className="text-[10px] font-black text-gray-300 dark:text-muted-foreground/30 uppercase tracking-widest">
                  Sponsored
                </span>
              </div>
            </motion.div>

            {/* Dynamic Results Content with Sorting Tabs */}
            <FlightResultContent initialFlights={flights} />

            {/* AI Travel Intelligence Section */}
            <div className="pt-12 border-t border-gray-200 dark:border-border mt-12 pb-20">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-brand-red/10">
                  <Sparkles className="h-6 w-6 text-brand-red" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">
                    Aero Intelligence
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    AI-powered travel insights for your destination
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
    </>
  );
}
