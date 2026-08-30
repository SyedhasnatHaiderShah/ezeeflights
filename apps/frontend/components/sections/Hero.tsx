"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  animate,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { RecentSearches } from "@/components/sections/RecentSearches";
import { AppImage } from "@/components/ui/app-image";
import { StatCounter } from "@/components/ui/stat-counter";
import { usePublicStats } from "@/lib/api/stats";
import { useTranslation } from "react-i18next";
import { HeroReadyNotifier } from "@/components/shared/HeroReadyNotifier";
import { FlightRadarCanvas } from "@/components/ui/flight-radar-canvas";

const MemoizedBookingForm = dynamic(
  () => import("@/components/booking-form").then((m) => m.BookingForm),
  { ssr: false }
);
const MemoizedStatCounter = React.memo(StatCounter);

type HeroTab = "flights" | "hotels" | "cars" | "packages" | "transfers";

const HERO_MEDIA: Record<
  HeroTab,
  ReadonlyArray<{ name: string; image: string }>
> = {
  flights: [
    {
      name: "Dubai",
      image: "/images/hero/flights_0.webp",
    },
    {
      name: "Dubai",
      image: "/images/hero/flights_1.webp",
    },
    // {
    //   name: "Maldives",
    //   image: "/images/hero/flights_2.webp",
    // },
    {
      name: "Maldives",
      image: "/images/hero/flights_2.webp",
    },
    {
      name: "Paris",
      image: "/images/hero/flights_3.webp",
    },
    {
      name: "New York",
      image: "/images/hero/flights_4.webp",
    },
    {
      name: "Tokyo",
      image: "/images/hero/flights_5.webp",
    },
    {
      name: "Tokyo",
      image: "/images/hero/flights_6.webp",
    },
    {
      name: "Singapore",
      image: "/images/hero/flights_7.webp",
    },
  ],
  hotels: [
    {
      name: "Luxury Resort",
      image: "/images/hero/hotels_0.webp",
    },
    {
      name: "Beach Villa",
      image: "/images/hero/hotels_1.webp",
    },
    {
      name: "City Hotel",
      image: "/images/hero/hotels_2.webp",
    },
    {
      name: "Boutique Stay",
      image: "/images/hero/hotels_3.webp",
    },
    {
      name: "Mountain Lodge",
      image: "/images/hero/hotels_4.webp",
    },
    // {
    //   name: "Mountain Lodge",
    //   image: "/images/hero/hotels_5.webp",
    // },
  ],
  cars: [
    {
      name: "Open Road",
      image: "/images/hero/cars_0.webp",
    },
    {
      name: "City Drive",
      image: "/images/hero/cars_1.webp",
    },
    {
      name: "SUV Adventure",
      image: "/images/hero/cars_2.webp",
    },
    {
      name: "Luxury Ride",
      image: "/images/hero/cars_3.webp",
    },
    {
      name: "Coastal Route",
      image: "/images/hero/cars_4.webp",
    },
  ],
  packages: [
    {
      name: "Island Escape",
      image: "/images/hero/packages_0.webp",
    },
    {
      name: "Desert Journey",
      image: "/images/hero/packages_1.webp",
    },
    {
      name: "European Tour",
      image: "/images/hero/packages_2.webp",
    },
    {
      name: "Culture Trip",
      image: "/images/hero/packages_3.webp",
    },
    {
      name: "City Break",
      image: "/images/hero/packages_4.webp",
    },
  ],
  transfers: [
    {
      name: "Airport Transfer",
      image: "/images/hero/transfers_0.webp",
    },
    {
      name: "City Shuttle",
      image: "/images/hero/transfers_1.webp",
    },
    {
      name: "Business Transfer",
      image: "/images/hero/transfers_2.webp",
    },
    {
      name: "Executive Pickup",
      image: "/images/hero/transfers_3.webp",
    },
    {
      name: "Resort Shuttle",
      image: "/images/hero/transfers_4.webp",
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
  onSubmit?: (params: URLSearchParams) => void;
}

function TickerTitle() {
  const { t } = useTranslation();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const phrases = React.useMemo(
    () => [
      mounted ? t("Find Your Perfect Journey") : "Find Your Perfect Journey",
      mounted ? t("Book Flights World Wide") : "Book Flights World Wide",
      mounted ? t("Explore Dream Destinations") : "Explore Dream Destinations",
    ],
    [t, mounted],
  );

  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [phrases.length]);

  const renderTextWithGradient = (text: string) => {
    const journeyText = t("Journey");
    const flightsText = t("Flights");
    const destinationsText = t("Destinations");

    const journeyIdx = text.indexOf(journeyText);
    const flightsIdx = text.indexOf(flightsText);
    const destinationsIdx = text.indexOf(destinationsText);

    if (journeyIdx !== -1 && journeyText) {
      return (
        <>
          {text.substring(0, journeyIdx)}
          <span className="bg-gradient-to-r from-redmix to-yellow bg-clip-text text-transparent font-medium">
            {journeyText}
          </span>
          {text.substring(journeyIdx + journeyText.length)}
        </>
      );
    }
    if (flightsIdx !== -1 && flightsText) {
      return (
        <>
          {text.substring(0, flightsIdx)}
          <span className="bg-gradient-to-r from-redmix to-yellow bg-clip-text text-transparent font-black">
            {flightsText}
          </span>
          {text.substring(flightsIdx + flightsText.length)}
        </>
      );
    }
    if (destinationsIdx !== -1 && destinationsText) {
      return (
        <>
          {text.substring(0, destinationsIdx)}
          <span className="bg-gradient-to-r from-redmix to-yellow bg-clip-text text-transparent font-black">
            {destinationsText}
          </span>
          {text.substring(destinationsIdx + destinationsText.length)}
        </>
      );
    }
    return text;
  };

  return (
    <span className="inline-block w-full">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="block w-full text-center truncate"
        >
          {renderTextWithGradient(phrases[index])}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function HeroContent({
  title,
  description,
  defaultTab = "flights",
  badgeText,
  onSubmit,
}: HeroProps) {
  const { t } = useTranslation();
  const [index, setIndex] = React.useState(0);
  const [heroVisible, setHeroVisible] = React.useState(false);

  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") as HeroTab) || defaultTab;

  React.useEffect(() => {
    setHeroVisible(true);
  }, []);
  const { data: stats, isLoading: isStatsLoading } = usePublicStats();
  const activeMedia = HERO_MEDIA[activeTab] ?? HERO_MEDIA.flights;
  const statLabels = HERO_STAT_LABELS[activeTab] ?? HERO_STAT_LABELS.flights;

  const actualTitle = title || <TickerTitle />;
  const actualDescription =
    description || (heroVisible ? t("Search 500+ airlines. Compare prices. Book in Seconds.") : "Search 500+ airlines. Compare prices. Book in Seconds.");

  const actualBadgeText = badgeText || (heroVisible ? t("#1 Flight Booking Platform") : "#1 Flight Booking Platform");

  React.useEffect(() => {
    setIndex(Math.floor(Math.random() * activeMedia.length));
  }, [activeTab, activeMedia.length]);

  const currentMedia = activeMedia[index] || activeMedia[0];

  return (
    <section className="relative min-h-[100dvh] w-full bg-[#0e0e0e]">
      <HeroReadyNotifier isReady={!isStatsLoading} />
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <AnimatePresence>
          <motion.div
            key={currentMedia?.name || index}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {currentMedia && (
              <AppImage
                src={currentMedia.image}
                alt={currentMedia.name}
                fill
                priority
                className="object-cover ken-burns"
              />
            )}
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <FlightRadarCanvas nodeCount={8} className="h-[42vh] md:h-[420px]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center pointer-events-none md:px-5 px-3 md:pt-48 pt-16 pb-10 text-white">
        <motion.span
          initial={{ opacity: 0, y: -12 }}
          animate={heroVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
          className="md:mb-4 mt-2 sm:mt-4 relative overflow-hidden rounded-full p-[2px] backdrop-blur block cursor-pointer group pointer-events-auto"
        >
          {/* Animated Gradient Border Layer */}
          <motion.span
            className="absolute inset-0 rounded-full bg-gradient-to-r from-redmix via-yellow to-[#0d2353]"
            animate={{
              rotate: [0, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ originX: "50%", originY: "50%" }}
          />

          {/* Pulsing Outer Blur Glow */}
          <motion.span
            className="absolute -inset-1 rounded-full bg-gradient-to-r from-redmix via-yellow to-[#0d2353] blur-sm opacity-50 group-hover:opacity-85 transition-opacity"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.05, 1],
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
            }}
            style={{ originX: "50%", originY: "50%" }}
          />

          {/* Inner Content Container */}
          <div className="relative z-10 rounded-full bg-[#0e0e0e]/95 px-3.5 py-1 text-xs font-semibold text-white/95 flex items-center gap-2 transition-colors group-hover:bg-[#0e0e0e]/85">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-redmix opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-redmix"></span>
            </span>
            <span>{actualBadgeText}</span>
          </div>
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={heroVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
          className="text-lg sm:text-3xl md:text-5xl lg:text-6xl text-center font-extrabold text-white w-full max-w-3xl md:max-w-none px-4 mt-1 sm:mt-4 md:mt-0 md:whitespace-nowrap"
        >
          {actualTitle}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={heroVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.65, ease: "easeOut" }}
          className="md:mt-3 mt-0 max-w-xl text-center md:text-lg text-xs text-white/80 px-4"
        >
          {actualDescription}
        </motion.p>

        <motion.div
          id="booking-form"
          className="pointer-events-auto mt-4 md:mt-5 w-full"
          initial={{ opacity: 0, y: 32 }}
          animate={heroVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
        >
          <MemoizedBookingForm
            defaultTab={
              activeTab === "flights" ||
              activeTab === "hotels" ||
              activeTab === "cars"
                ? activeTab
                : undefined
            }
            heroMode
            animateIn={heroVisible}
            onSubmit={onSubmit}
          />
        </motion.div>

        <motion.div
          className="mt- grid w-full grid-cols-2 gap-3 mt-2 rounded-2xl border border-white/20 bg-[#0e0e0e]/60 p-2 backdrop-blur-md md:grid-cols-4 text-white xl:max-w-6xl xl:mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={heroVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1.7, ease: "easeOut" }}
        >
          <div className="text-center">
            <div className="md:text-xl text-sm font-extrabold">
              <MemoizedStatCounter
                value={
                  activeTab === "hotels"
                    ? stats?.totalGuests ?? 1500000
                    : activeTab === "cars"
                      ? stats?.totalRenters ?? 500000
                      : activeTab === "transfers"
                        ? 100000
                        : stats?.totalTravelers ?? 2000000
                }
                suffix="+"
              />
            </div>
            <p className="text-xs text-white/90">{heroVisible ? t(statLabels[0]) : statLabels[0]}</p>
          </div>
          <div className="text-center md:border-l md:border-white/30">
            <div className="md:text-xl text-sm font-extrabold">
              <MemoizedStatCounter
                value={
                  activeTab === "hotels"
                    ? stats?.hotelsCount ?? 8000
                    : activeTab === "cars"
                      ? stats?.rentalsCount ?? 120
                      : activeTab === "transfers"
                        ? 50
                        : stats?.airlinesCount ?? 500
                }
                suffix="+"
              />
            </div>
            <p className="text-xs text-white/90">{heroVisible ? t(statLabels[1]) : statLabels[1]}</p>
          </div>
          <div className="text-center md:border-l md:border-white/30">
            <div className="md:text-xl text-sm font-extrabold">
              <MemoizedStatCounter
                value={
                  activeTab === "hotels"
                    ? stats?.destinationsCount ?? 250
                    : activeTab === "cars"
                      ? stats?.regionsCount ?? 85
                      : activeTab === "transfers"
                        ? 30
                        : stats?.countriesCount ?? 150
                }
                suffix="+"
              />
            </div>
            <p className="text-xs text-white/90">{heroVisible ? t(statLabels[2]) : statLabels[2]}</p>
          </div>
          <div className="text-center md:border-l md:border-white/30">
            <div className="md:text-xl text-sm font-extrabold">
              <MemoizedStatCounter
                value={
                  activeTab === "hotels"
                    ? stats?.hotelRating ?? 4.8
                    : activeTab === "cars"
                      ? stats?.carRating ?? 4.7
                      : activeTab === "transfers"
                        ? 4.8
                        : stats?.avgRating ?? 4.9
                }
                suffix="★"
              />
            </div>
            <p className="text-xs text-white/90">{heroVisible ? t(statLabels[3]) : statLabels[3]}</p>
          </div>
        </motion.div>
      </div>

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

export function Hero(props: HeroProps) {
  return <HeroContent {...props} />;
}
