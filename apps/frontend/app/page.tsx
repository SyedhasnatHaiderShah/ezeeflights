"use client";

import * as React from "react";
import dynamic from "next/dynamic";

// Critical Path (Above the Fold) - Immediate LCP
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { RecentSearches } from "@/components/sections/RecentSearches";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

// Lazy Loaded (Below the Fold) - High Performance Chunks
const Reviews = dynamic(
  () => import("@/components/sections/Reviews").then((mod) => mod.Reviews),
  { ssr: false },
);
const SpecialOffers = dynamic(
  () =>
    import("@/components/sections/SpecialOffers").then(
      (mod) => mod.SpecialOffers,
    ),
  { ssr: false },
);
const TopDestinations = dynamic(
  () =>
    import("@/components/sections/TopDestinations").then(
      (mod) => mod.TopDestinations,
    ),
  { ssr: false },
);
const TravelExperience = dynamic(
  () =>
    import("@/components/sections/TravelExperience").then(
      (mod) => mod.TravelExperience,
    ),
  { ssr: false },
);
const CuratedJourneys = dynamic(
  () =>
    import("@/components/sections/CuratedJourneys").then(
      (mod) => mod.CuratedJourneys,
    ),
  { ssr: false },
);
const WhyChooseUs = dynamic(
  () =>
    import("@/components/sections/WhyChooseUs").then((mod) => mod.WhyChooseUs),
  { ssr: false },
);
const PrecisionFeatures = dynamic(
  () =>
    import("@/components/sections/PrecisionFeatures").then(
      (mod) => mod.PrecisionFeatures,
    ),
  { ssr: false },
);
const DealsSection = dynamic(
  () =>
    import("@/components/sections/DealsSection").then(
      (mod) => mod.DealsSection,
    ),
  { ssr: false },
);
const Newsletter = dynamic(
  () =>
    import("@/components/sections/Newsletter").then((mod) => mod.Newsletter),
  { ssr: false },
);
const Footer = dynamic(
  () => import("@/components/sections/Footer").then((mod) => mod.Footer),
  { ssr: false },
);

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. Header (Static/Immediate) */}
      <Header />

      <main className="flex-grow overflow-x-hidden bg-background">
        {/* 2. Hero (Static/Immediate) - Crucial for UX & LCP */}
        <Hero />

        {/* 2.1 Recent Searches (Critical Context) */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full pb-16">
          <RecentSearches />
        </div>

        {/* 3. Lazy Loaded Sections - Progressive Enhancement */}
        <ScrollReveal minHeight="600px">
          <TopDestinations />
        </ScrollReveal>

        <ScrollReveal minHeight="500px">
          <DealsSection />
        </ScrollReveal>

        <ScrollReveal minHeight="600px">
          <SpecialOffers />
        </ScrollReveal>

        <ScrollReveal minHeight="600px">
          <TravelExperience />
        </ScrollReveal>

        <ScrollReveal minHeight="600px">
          <CuratedJourneys />
        </ScrollReveal>

        <ScrollReveal minHeight="500px">
          <WhyChooseUs />
        </ScrollReveal>

        <ScrollReveal minHeight="500px">
          <PrecisionFeatures />
        </ScrollReveal>

        <ScrollReveal minHeight="600px">
          <Reviews />
        </ScrollReveal>

        <ScrollReveal minHeight="400px">
          <Newsletter />
        </ScrollReveal>
      </main>

      {/* 4. Footer (Lazy/Bottom) */}
      <ScrollReveal minHeight="300px">
        <Footer />
      </ScrollReveal>
    </div>
  );
}
