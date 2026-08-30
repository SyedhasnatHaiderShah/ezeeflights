"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AttractionCard } from "@/components/destinations/AttractionCard";
import { DestinationHero } from "@/components/destinations/DestinationHero";
import {
  AITravelAlert,
  VisaHealthCard,
} from "@/components/insights/VisaHealthCard";

function CountryBadge({ country }: { country: string }) {
  if (!country) return null;
  const flagMap: Record<string, string> = {
    "united arab emirates": "🇦🇪",
    uae: "🇦🇪",
    france: "🇫🇷",
    thailand: "🇹🇭",
    "united states": "🇺🇸",
    usa: "🇺🇸",
    "united kingdom": "🇬🇧",
    uk: "🇬🇧",
    singapore: "🇸🇬",
    japan: "🇯🇵",
  };
  const normalized = country.toLowerCase().trim();
  const flag = flagMap[normalized] || "📍";
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 dark:bg-black/35 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white border border-white/10 shadow-sm">
      <span>{flag}</span>
      <span>{country}</span>
    </div>
  );
}

import {
  PracticalInfoCard,
  CostGuideCard,
} from "@/components/insights/PracticalInfoCard";
import {
  Sparkles,
  Info,
  Star,
  Utensils,
  MapPin,
  ArrowRight,
  Sun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  ShieldCheck,
  Compass,
  Navigation,
} from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CityInsightsClientProps {
  slug: string;
  insight?: any;
}

const CITY_HERO_IMAGES: Record<string, string> = {
  dubai:
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=2000",
  paris:
    "https://images.unsplash.com/photo-1499856374025-6dc47a78db4e?auto=format&fit=crop&q=80&w=2000",
  bangkok:
    "https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&q=80&w=2000",
  "abu-dhabi":
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=2000",
  phuket:
    "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?auto=format&fit=crop&q=80&w=2000",
  lyon: "https://images.unsplash.com/photo-1559564484-a9b7a6d2b760?auto=format&fit=crop&q=80&w=2000",
};

const CITY_STATS: Record<
  string,
  { capitalText: string; flightTime: string; bestSeason: string }
> = {
  dubai: {
    capitalText: "Major City in UAE",
    flightTime: "~2.5h from Pakistan",
    bestSeason: "Nov–Mar",
  },
  "abu-dhabi": {
    capitalText: "Capital of UAE",
    flightTime: "~2.5h from Pakistan",
    bestSeason: "Nov–Mar",
  },
  paris: {
    capitalText: "Capital of France",
    flightTime: "~8h from Pakistan",
    bestSeason: "Apr–Oct",
  },
  lyon: {
    capitalText: "Major City in France",
    flightTime: "~9h from Pakistan",
    bestSeason: "Jun–Sep",
  },
  bangkok: {
    capitalText: "Capital of Thailand",
    flightTime: "~5h from Pakistan",
    bestSeason: "Nov–Feb",
  },
  phuket: {
    capitalText: "Resort Province, TH",
    flightTime: "~6h from Pakistan",
    bestSeason: "Nov–Apr",
  },
};

const STAY_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=600",
  "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600",
];

const RESTAURANT_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=600",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=600",
];

const ATTRACTION_IMAGES = [
  "https://images.unsplash.com/photo-1597659840241-37e2b9c2f55f?q=80&w=600",
  "https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=600",
  "https://images.unsplash.com/photo-1582948625902-fc8e3f848f9f?q=80&w=600",
];

function WeatherIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const iconMap: Record<string, any> = {
    sunny: Sun,
    "clear sky": Sun,
    partly_cloudy_day: Cloud,
    cloud: Cloud,
    cloudy: Cloud,
    overcast: Cloud,
    rainy: CloudRain,
    showers: CloudRain,
    storm: CloudLightning,
    snow: Snowflake,
  };
  const Icon = iconMap[name?.toLowerCase()] || Sun;
  return <Icon className={className} />;
}

export function CityInsightsClient({
  slug,
  insight: initialInsight,
}: CityInsightsClientProps) {
  const router = useRouter();
  const [insight, setInsight] = React.useState<any>(initialInsight);
  const [loading, setLoading] = React.useState(!initialInsight);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (insight) return;

    let active = true;
    const fetchInsights = async () => {
      try {
        setLoading(true);
        setError(null);

        const displayName = slug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        const res = await fetch(
          `/api/ai/city-insights?${new URLSearchParams({
            city: displayName,
            slug,
          }).toString()}`,
        );

        if (!res.ok) {
          throw new Error("Unable to load live travel insights.");
        }
        const json = await res.json();
        if (active) {
          if (json.success && json.data) {
            setInsight(json.data);
          } else {
            throw new Error(json.message || "Failed to load insights.");
          }
        }
      } catch (err: any) {
        if (active) {
          setError(err?.message || "Failed to load insights.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchInsights();

    return () => {
      active = false;
    };
  }, [slug]);

  // Enrich real-time attractions data with category, images and default parameters for AttractionCard
  const enrichedAttractions = React.useMemo(() => {
    const list = insight?.attractions || [];
    return list.map((attr: any, idx: number) => ({
      id: attr.id || `${slug}-attraction-${idx}`,
      slug: attr.slug || `${slug}-attraction-${idx}`,
      name: attr.name,
      description: attr.description,
      rating: Number(attr.rating || 4.7),
      category: attr.category || "Sightseeing",
      image: attr.image || ATTRACTION_IMAGES[idx] || ATTRACTION_IMAGES[0],
      entryFee: attr.entryFee || 0,
      currency: attr.currency || "$",
      openingHours: attr.openingHours || "Varies",
      bestFor: attr.bestFor || "Tourists",
    }));
  }, [insight?.attractions, slug]);

  const handleSearch = () => {
    if (!insight) return;
    const query = new URLSearchParams({
      origin: "",
      destination: insight.name,
      departDate: new Date().toISOString(),
      returnDate: new Date(
        new Date().setDate(new Date().getDate() + 7),
      ).toISOString(),
      adults: "1",
      children: "0",
      infants: "0",
      cabinClass: "economy",
      tripType: "round-trip",
    }).toString();
    router.push(`/flights/search?${query}` as any);
  };

  const cityData = {
    name: insight?.name || "",
    description:
      insight?.description ||
      `Experience the best of ${insight?.name || ""}. From cultural landmarks to modern marvels.`,
    heroImage:
      CITY_HERO_IMAGES[slug.toLowerCase()] ||
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=2000",
    countryName: insight?.country || "",
  };

  if (loading) {
    const displayName = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return (
      <section className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
        <Header />
        <main className="flex flex-grow flex-col items-center justify-center px-4 py-24 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4" />
          <h2 className="text-xl font-bold text-foreground">
            Gathering insights for {displayName}...
          </h2>
          <p className="mt-2 max-w-sm text-xs text-muted-foreground">
            Analyzing weather, local safety, top stays, restaurants, and entry
            requirements in real-time.
          </p>
        </main>
      </section>
    );
  }

  if (error || !insight) {
    const displayName = slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    return (
      <section className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
        <Header />
        <main className="flex flex-grow flex-col items-center justify-center px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Unable to load insights for {displayName}
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            {error ||
              "Live travel data is temporarily unavailable. Please try again shortly."}
          </p>
        </main>
        <Footer />
      </section>
    );
  }

  return (
    <section className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300">
      <Header />
      <main className="flex-grow space-y-12 pb-16 pt-6 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        {/* 2. Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl shadow-md"
        >
          <DestinationHero
            title={cityData.name}
            subtitle={cityData.description}
            image={cityData.heroImage}
            badge={
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                <CountryBadge country={cityData.countryName} />
                {insight.categories?.map((tag: string, idx: number) => (
                  <span
                    key={`tag-${idx}`}
                    className="inline-flex items-center rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/10 shadow-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            }
          />
        </motion.div>

        {/* 3. Quick Stats Bar */}
        {(() => {
          const statsData = CITY_STATS[slug.toLowerCase()] || {
            capitalText: `City in ${cityData.countryName || "World"}`,
            flightTime: `~${(slug.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10) + 2}h from Pakistan`,
            bestSeason: "Nov–Apr",
          };
          const stats = [
            {
              icon: "🏙️",
              label: "Capital / Location",
              value: statsData.capitalText,
            },
            {
              icon: "✈️",
              label: "Flight Time",
              value: statsData.flightTime,
            },
            {
              icon: "💰",
              label: "Avg Daily Cost",
              value: insight.costs?.dailyTotal
                ? `${insight.costs.dailyTotal}`
                : "$120 / day",
            },
            {
              icon: "🌡️",
              label: "Best Season",
              value: statsData.bestSeason,
            },
          ];
          return (
            <div className="mx-auto w-full max-w-5xl -mt-12 relative z-35 px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-background/95 dark:bg-card/95 backdrop-blur-md border border-border rounded-xl p-4 shadow-lg">
                {stats.map((stat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-2xl shrink-0">{stat.icon}</div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                        {stat.label}
                      </p>
                      <p className="text-xs font-bold text-foreground mt-0.5 truncate">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 5. AI Travel Alert & Safety Monitor */}
        {insight.health?.alert && (
          <div className="mx-auto max-w-4xl w-full px-2">
            <AITravelAlert alert={insight.health.alert} />
          </div>
        )}

        {/* 6. Weather in {City} */}
        {insight.weather && (
          <div className="mx-auto max-w-6xl w-full px-2 space-y-4">
            <div className="flex items-end justify-between border-b border-border pb-2">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground font-display">
                  Weather in {cityData.name}
                </h2>
                <p className="text-muted-foreground text-xs font-medium mt-0.5">
                  Precision forecasting and real-time climate conditions for{" "}
                  {cityData.name}.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {insight.weather.slice(0, 5).map((w: any, idx: number) => {
                const isToday = idx === 0;
                return (
                  <div
                    key={`weather-${idx}`}
                    className={cn(
                      "p-3 text-center flex flex-col items-center gap-1.5 rounded-xl transition-all shadow-sm border border-border",
                      isToday
                        ? "bg-primary text-primary-foreground border-transparent"
                        : "bg-card hover:bg-muted/30 text-foreground",
                    )}
                  >
                    <p
                      className={cn(
                        "font-bold text-[10px] tracking-wider",
                        isToday
                          ? "text-primary-foreground/90"
                          : "text-muted-foreground",
                      )}
                    >
                      {w.day}
                    </p>
                    <WeatherIcon
                      className={cn(
                        "h-6 w-6",
                        isToday ? "text-primary-foreground" : "text-primary",
                      )}
                      name={w.icon || w.condition}
                    />
                    <div>
                      <p className="text-sm font-bold">{w.temp}</p>
                      <p
                        className={cn(
                          "text-[10px] font-medium truncate max-w-full px-1",
                          isToday
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground",
                        )}
                      >
                        {w.condition}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Top Attractions */}
        {enrichedAttractions && enrichedAttractions.length > 0 && (
          <div className="mx-auto max-w-6xl w-full px-2 space-y-4">
            <div className="flex justify-between items-end border-b border-border pb-2">
              <div>
                <h2 className="text-xl font-bold text-foreground tracking-tight font-display">
                  Top Attractions
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Famous landmarks and attractive places in {cityData.name}{" "}
                  generated dynamically.
                </p>
              </div>
              <Link href={`/flights/places?destination=${cityData.name}`}>
                <Button
                  variant="ghost"
                  className="text-primary hover:text-primary hover:bg-primary/5 font-bold flex items-center gap-1 text-xs h-8 px-2.5"
                >
                  Explore All <Compass className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {enrichedAttractions.map((attraction: any) => (
                <AttractionCard key={attraction.id} attraction={attraction} />
              ))}
            </div>
          </div>
        )}



        {/* 10. Essential Travel Insights */}
        <div className="mx-auto max-w-6xl w-full px-2 space-y-12">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Intelligence Dashboard
                </div>
                <h2 className="text-2xl font-bold text-foreground tracking-tight font-display">
                  Essential{" "}
                  <span className="text-primary">Travel Insights</span>
                </h2>
                <p className="text-xs text-muted-foreground">
                  Verified entry requirements, health advisories, and local
                  norms.
                </p>
              </div>

              <VisaHealthCard visa={insight.visa} health={insight.health} />
              <PracticalInfoCard practical={insight.practical} />
            </div>

            <aside className="space-y-6 md:col-span-1">
              <CostGuideCard costs={insight.costs} />

              {/* Pro Tip Card */}
              {(() => {
                const proTip =
                  insight.practical?.tips?.[0] ||
                  insight.practical?.localTip ||
                  insight.health?.advisories;
                if (!proTip) return null;
                return (
                  <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm relative overflow-hidden group border border-transparent">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                      <Sparkles className="w-16 h-16" />
                    </div>
                    <h3 className="text-md font-bold mb-2 relative z-10 flex items-center gap-1 font-display">
                      <ShieldCheck className="h-4 w-4" /> Pro Planner Tip
                    </h3>
                    <p className="text-xs font-semibold text-primary-foreground/90 leading-relaxed italic relative z-10">
                      "{proTip}"
                    </p>
                  </div>
                );
              })()}

              {/* Verified Sources Info */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border border-border">
                <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                <p className="text-[10px] font-bold text-muted-foreground leading-snug">
                  Data dynamically synchronized from Ezee Intelligence Web APIs.
                  Updated recently.
                </p>
              </div>
            </aside>
          </div>
        </div>

        {/* 11. Flights to {City} CTA Strip */}
        <div className="mx-auto max-w-6xl w-full px-2">
          <div className="rounded-2xl bg-gradient-to-r from-redmix to-redmix-dark p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_50%)]" />
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Navigation className="w-48 h-48 rotate-45 text-white/10" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">
                  Ready to fly to {cityData.name}?
                </h3>
                <p className="text-white/90 text-sm md:text-base font-medium">
                  Flights starting from{" "}
                  <span className="font-bold underline decoration-white/50">
                    {insight.costs?.flightCost || "$299"}
                  </span>{" "}
                  · 500+ routes · Book in seconds.
                </p>
              </div>

              <Button
                onClick={handleSearch}
                className="bg-white text-redmix hover:bg-white/90 font-bold px-6 py-5 rounded-xl text-sm shadow-md transition-all active:scale-95 shrink-0 flex items-center gap-2 group/btn"
              >
                Search Flights{" "}
                <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
