"use client";

import * as React from "react";
import dynamic from "next/dynamic";

// Critical Path (Above the Fold) - Immediate LCP
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { RecentSearches } from "@/components/sections/RecentSearches";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

// ─── Lazy Loaded Sections ────────────────────────────────────────────────────
// KEY FIX: `loading` prop provides an instant placeholder so the page doesn't
// "jump" while the JS chunk arrives. `ssr: false` is kept only where truly
// needed (client-only APIs). Chunks are still code-split but preloading is
// triggered via `prefetchChunks()` below so the network request starts
// immediately — not only after the user scrolls to the section.

const TopDestinations = dynamic(
  () =>
    import("@/components/sections/TopDestinations").then(
      (mod) => mod.TopDestinations,
    ),
  { ssr: false, loading: () => <SectionSkeleton height={600} /> },
);
const DealsSection = dynamic(
  () =>
    import("@/components/sections/DealsSection").then((mod) => mod.DealsSection),
  { ssr: false, loading: () => <SectionSkeleton height={500} /> },
);
const SpecialOffers = dynamic(
  () =>
    import("@/components/sections/SpecialOffers").then(
      (mod) => mod.SpecialOffers,
    ),
  { ssr: false, loading: () => <SectionSkeleton height={600} /> },
);
const TravelExperience = dynamic(
  () =>
    import("@/components/sections/TravelExperience").then(
      (mod) => mod.TravelExperience,
    ),
  { ssr: false, loading: () => <SectionSkeleton height={600} /> },
);
const CuratedJourneys = dynamic(
  () =>
    import("@/components/sections/CuratedJourneys").then(
      (mod) => mod.CuratedJourneys,
    ),
  { ssr: false, loading: () => <SectionSkeleton height={600} /> },
);
const WhyChooseUs = dynamic(
  () =>
    import("@/components/sections/WhyChooseUs").then((mod) => mod.WhyChooseUs),
  { ssr: false, loading: () => <SectionSkeleton height={500} /> },
);
const PrecisionFeatures = dynamic(
  () =>
    import("@/components/sections/PrecisionFeatures").then(
      (mod) => mod.PrecisionFeatures,
    ),
  { ssr: false, loading: () => <SectionSkeleton height={500} /> },
);
const Reviews = dynamic(
  () => import("@/components/sections/Reviews").then((mod) => mod.Reviews),
  { ssr: false, loading: () => <SectionSkeleton height={600} /> },
);
const Newsletter = dynamic(
  () =>
    import("@/components/sections/Newsletter").then((mod) => mod.Newsletter),
  { ssr: false, loading: () => <SectionSkeleton height={400} /> },
);
const Footer = dynamic(
  () => import("@/components/sections/Footer").then((mod) => mod.Footer),
  { ssr: false, loading: () => <SectionSkeleton height={300} /> },
);

// ─── Prefetch all chunks immediately after first paint ───────────────────────
// This decouples "download" from "render": JS arrives in the background while
// the user is reading the hero, so by the time they scroll down the chunks are
// already cached — eliminating the network-induced stall.
function prefetchChunks() {
  const imports = [
    () => import("@/components/sections/TopDestinations"),
    () => import("@/components/sections/DealsSection"),
    () => import("@/components/sections/SpecialOffers"),
    () => import("@/components/sections/TravelExperience"),
    () => import("@/components/sections/CuratedJourneys"),
    () => import("@/components/sections/WhyChooseUs"),
    () => import("@/components/sections/PrecisionFeatures"),
    () => import("@/components/sections/Reviews"),
    () => import("@/components/sections/Newsletter"),
    () => import("@/components/sections/Footer"),
  ];

  // Use requestIdleCallback so prefetching never competes with LCP rendering
  const schedule =
    typeof window !== "undefined" && "requestIdleCallback" in window
      ? (fn: () => void) => (window as any).requestIdleCallback(fn, { timeout: 3000 })
      : (fn: () => void) => setTimeout(fn, 1000);

  schedule(() => {
    imports.forEach((fn) => {
      try {
        fn();
      } catch {
        // silently ignore prefetch errors
      }
    });
  });
}

// ─── Minimal skeleton placeholder ────────────────────────────────────────────
// Gives the section a reserved height immediately, preventing layout shift
// (CLS) and the visual "stuck / snap" effect during chunk load.
function SectionSkeleton({ height }: { height: number }) {
  return (
    <div
      aria-hidden="true"
      style={{ minHeight: height }}
      className="w-full animate-pulse bg-muted/30 rounded-lg"
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  // Kick off prefetching once — after hydration, during idle time
  React.useEffect(() => {
    prefetchChunks();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. Header — static, no lazy load */}
      <Header />

      <main className="flex-grow overflow-x-hidden bg-background">
        {/* 2. Hero — static, crucial for LCP */}
        <Hero />

        {/* 3. Recent Searches — critical context, static */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 w-full pb-16">
          <RecentSearches />
        </div>

        {/* 4. Below-the-fold sections
            rootMargin="600px" means ScrollReveal fires when the section is
            still 600 px *below* the viewport — giving the dynamic() component
            a head-start on rendering before the user actually arrives.        */}
        <ScrollReveal minHeight="600px" rootMargin="600px">
          <TopDestinations />
        </ScrollReveal>

        <ScrollReveal minHeight="500px" rootMargin="600px">
          <DealsSection />
        </ScrollReveal>

        <ScrollReveal minHeight="600px" rootMargin="600px">
          <SpecialOffers />
        </ScrollReveal>

        <ScrollReveal minHeight="600px" rootMargin="600px">
          <TravelExperience />
        </ScrollReveal>

        <ScrollReveal minHeight="600px" rootMargin="600px">
          <CuratedJourneys />
        </ScrollReveal>

        <ScrollReveal minHeight="500px" rootMargin="600px">
          <WhyChooseUs />
        </ScrollReveal>

        <ScrollReveal minHeight="500px" rootMargin="600px">
          <PrecisionFeatures />
        </ScrollReveal>

        <ScrollReveal minHeight="600px" rootMargin="600px">
          <Reviews />
        </ScrollReveal>

        <ScrollReveal minHeight="400px" rootMargin="600px">
          <Newsletter />
        </ScrollReveal>
      </main>

      {/* 5. Footer */}
      <ScrollReveal minHeight="300px" rootMargin="400px">
        <Footer />
      </ScrollReveal>
    </div>
  );
}