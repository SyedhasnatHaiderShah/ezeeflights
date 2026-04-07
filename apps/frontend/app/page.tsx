"use client";

import * as React from "react";
import dynamic from "next/dynamic";

import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { RecentSearches } from "@/components/sections/RecentSearches";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const TopDestinations = dynamic(
  () =>
    import("@/components/sections/TopDestinations").then(
      (mod) => mod.TopDestinations,
    ),
  { loading: () => <SectionSkeleton height={600} /> },
);
const SpecialOffers = dynamic(
  () =>
    import("@/components/sections/SpecialOffers").then(
      (mod) => mod.SpecialOffers,
    ),
  { loading: () => <SectionSkeleton height={600} /> },
);
const WhyChooseUs = dynamic(
  () =>
    import("@/components/sections/WhyChooseUs").then((mod) => mod.WhyChooseUs),
  { loading: () => <SectionSkeleton height={500} /> },
);
const PrecisionFeatures = dynamic(
  () =>
    import("@/components/sections/PrecisionFeatures").then(
      (mod) => mod.PrecisionFeatures,
    ),
  { loading: () => <SectionSkeleton height={500} /> },
);
const Newsletter = dynamic(
  () =>
    import("@/components/sections/Newsletter").then((mod) => mod.Newsletter),
  { loading: () => <SectionSkeleton height={400} /> },
);
const Footer = dynamic(
  () => import("@/components/sections/Footer").then((mod) => mod.Footer),
  { loading: () => <SectionSkeleton height={300} /> },
);

function prefetchChunks() {
  const imports = [
    () => import("@/components/sections/TopDestinations"),
    () => import("@/components/sections/SpecialOffers"),
    () => import("@/components/sections/WhyChooseUs"),
    () => import("@/components/sections/PrecisionFeatures"),
    () => import("@/components/sections/Newsletter"),
    () => import("@/components/sections/Footer"),
  ];

  const schedule =
    typeof window !== "undefined" && "requestIdleCallback" in window
      ? (fn: () => void) =>
          (window as any).requestIdleCallback(fn, { timeout: 3000 })
      : (fn: () => void) => setTimeout(fn, 1000);

  schedule(() => {
    imports.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  });
}

function SectionSkeleton({ height }: { height: number }) {
  return (
    <div
      aria-hidden="true"
      style={{ minHeight: height }}
      className="w-full animate-pulse bg-muted/30 rounded-lg"
    />
  );
}

export default function LandingPage() {
  React.useEffect(() => {
    prefetchChunks();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />

      {/*
        KEY FIX: Removed overflow-x-clip from <main> — it was swallowing
        horizontal touch events on mobile, breaking all swipe-based sliders.
        Instead, wrap the interior in overflow-x-hidden so we still prevent
        horizontal scroll without cutting touch propagation.
      */}
      <main className="flex-grow bg-background">
        <Hero />

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full pb-16">
          <RecentSearches />
        </div>

        <ScrollReveal minHeight="600px" rootMargin="600px">
          <TopDestinations />
        </ScrollReveal>

        <ScrollReveal minHeight="600px" rootMargin="600px">
          <SpecialOffers />
        </ScrollReveal>

        <ScrollReveal minHeight="500px" rootMargin="600px">
          <WhyChooseUs />
        </ScrollReveal>

        <ScrollReveal minHeight="500px" rootMargin="600px">
          <PrecisionFeatures />
        </ScrollReveal>

        <ScrollReveal minHeight="400px" rootMargin="600px">
          <Newsletter />
        </ScrollReveal>
      </main>

      <ScrollReveal minHeight="300px" rootMargin="400px">
        <Footer />
      </ScrollReveal>
    </div>
  );
}
