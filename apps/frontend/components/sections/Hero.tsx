"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { RecentSearches } from "@/components/sections/RecentSearches";
import { AppImage } from "@/components/ui/app-image";
import { StatCounter } from "@/components/ui/stat-counter";
import { usePublicStats } from "@/lib/api/stats";

type HeroTab = "flights" | "hotels" | "cars" | "packages" | "transfers";

const HERO_MEDIA: Record<
  HeroTab,
  ReadonlyArray<{ name: string; image: string }>
> = {
  flights: [
    {
      name: "Dubai",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1800&auto=format&fit=crop",
    },
    {
      name: "Maldives",
      image:
        "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1800&auto=format&fit=crop",
    },
    {
      name: "Paris",
      image:
        "https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=1800&auto=format&fit=crop",
    },
    {
      name: "New York",
      image:
        "https://images.unsplash.com/photo-1496588152823-86ff7695e68f?q=80&w=1800&auto=format&fit=crop",
    },
    {
      name: "Tokyo",
      image:
        "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1800&auto=format&fit=crop",
    },
  ],
  hotels: [
    {
      name: "Luxury Resort",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "Beach Villa",
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "City Hotel",
      image:
        "https://images.unsplash.com/photo-1455587734955-081b22074882?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "Boutique Stay",
      image:
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "Mountain Lodge",
      image:
        "https://images.unsplash.com/photo-1444201983204-c43cbd584d93?auto=format&fit=crop&w=2000&q=80",
    },
  ],
  cars: [
    {
      name: "Open Road",
      image:
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=80",
    },
    {
      name: "City Drive",
      image:
        "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=2200&q=80",
    },
    {
      name: "SUV Adventure",
      image:
        "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=2200&q=80",
    },
    {
      name: "Luxury Ride",
      image:
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2200&q=80",
    },
    {
      name: "Coastal Route",
      image:
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=2200&q=80",
    },
  ],
  packages: [
    {
      name: "Island Escape",
      image:
        "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "Desert Journey",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "European Tour",
      image:
        "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "Culture Trip",
      image:
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "City Break",
      image:
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=2000&q=80",
    },
  ],
  transfers: [
    {
      name: "Airport Transfer",
      image:
        "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "City Shuttle",
      image:
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "Business Transfer",
      image:
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "Executive Pickup",
      image:
        "https://images.unsplash.com/photo-1597007030739-6d2e8d2b8f79?auto=format&fit=crop&w=2000&q=80",
    },
    {
      name: "Resort Shuttle",
      image:
        "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=2000&q=80",
    },
  ],
};

const HERO_STAT_LABELS: Record<HeroTab, [string, string, string, string]> = {
  flights: ["Happy Travelers", "Airlines", "Countries", "Rating"],
  hotels: ["Happy Guests", "Hotel Partners", "Destinations", "Guest Rating"],
  cars: [
    "Happy Renters",
    "Rental Partners",
    "Service Regions",
    "Driver Rating",
  ],
  packages: ["Happy Travelers", "Package Partners", "Countries", "Trip Rating"],
  transfers: [
    "Happy Riders",
    "Transfer Partners",
    "Service Cities",
    "Service Rating",
  ],
};

interface HeroProps {
  title?: React.ReactNode;
  description?: string;
  defaultTab?: HeroTab;
  badgeText?: string;
}

export function Hero({
  title = (
    <>
      Find Your Perfect{" "}
      <span className="bg-gradient-to-r from-brand-red to-brand-yellow bg-clip-text text-transparent">
        Journey
      </span>
    </>
  ),
  description = "Search 500+ airlines. Compare prices. Book in seconds.",
  defaultTab = "flights",
  badgeText = "✈ #1 Flight Booking Platform",
}: HeroProps) {
  const [index, setIndex] = React.useState(0);
  const { data: stats } = usePublicStats();
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get("tab") as HeroTab | null;
  const activeTab = tabFromQuery ?? defaultTab;
  const activeMedia = HERO_MEDIA[activeTab] ?? HERO_MEDIA.flights;
  const statLabels = HERO_STAT_LABELS[activeTab] ?? HERO_STAT_LABELS.flights;

  React.useEffect(() => {
    setIndex(0);
  }, [activeTab]);

  React.useEffect(() => {
    const id = setInterval(
      () => setIndex((v) => (v + 1) % activeMedia.length),
      5000,
    );
    return () => clearInterval(id);
  }, [activeMedia.length]);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMedia[index].name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <AppImage
            src={activeMedia[index].image}
            alt={activeMedia[index].name}
            fill
            priority
            className="object-cover ken-burns"
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col items-center justify-center px-5 pt-52 pb-10 text-white">
        <span className="mb-4 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">
          {badgeText}
        </span>
        <h1 className="text-hero text-center font-extrabold text-white">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-center text-lg text-white/80">
          {description}
        </p>

        <div id="booking-form" className="mt-5 w-full">
          <BookingForm defaultTab={defaultTab} heroMode />
          {/* <RecentSearches /> */}
        </div>

        <div className="mt-5 grid w-full grid-cols-2 gap-3 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur md:grid-cols-4">
          <div className="text-center">
            <div className="text-xl font-extrabold">
              <StatCounter
                value={stats?.totalTravelers ?? 2000000}
                suffix="+"
              />
            </div>
            <p className="text-xs text-white/80">{statLabels[0]}</p>
          </div>
          <div className="text-center md:border-l md:border-white/30">
            <div className="text-xl font-extrabold">
              <StatCounter value={stats?.airlinesCount ?? 500} suffix="+" />
            </div>
            <p className="text-xs text-white/80">{statLabels[1]}</p>
          </div>
          <div className="text-center md:border-l md:border-white/30">
            <div className="text-xl font-extrabold">
              <StatCounter value={stats?.countriesCount ?? 150} suffix="+" />
            </div>
            <p className="text-xs text-white/80">{statLabels[2]}</p>
          </div>
          <div className="text-center md:border-l md:border-white/30">
            <div className="text-xl font-extrabold">
              <StatCounter value={stats?.avgRating ?? 4.9} suffix="★" />
            </div>
            <p className="text-xs text-white/80">{statLabels[3]}</p>
          </div>
        </div>
      </div>

      {/* <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {DESTINATIONS.map((d, i) => (
          <button
            key={d.name}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-3 bg-white/45"}`}
            aria-label={d.name}
          />
        ))}
      </div> */}

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 text-white/80"
      >
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}
