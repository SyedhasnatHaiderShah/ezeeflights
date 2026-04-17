"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { RecentSearches } from "@/components/sections/RecentSearches";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const TopDestinations = dynamic(() => import("@/components/sections/TopDestinations").then((m) => m.TopDestinations), { loading: () => <SectionSkeleton height={620} /> });
const DealsSection = dynamic(() => import("@/components/sections/DealsSection").then((m) => m.DealsSection), { loading: () => <SectionSkeleton height={520} /> });
const PopularPackages = dynamic(() => import("@/components/sections/PopularPackages").then((m) => m.PopularPackages), { loading: () => <SectionSkeleton height={560} /> });
const ExploreByTheme = dynamic(() => import("@/components/sections/ExploreByTheme").then((m) => m.ExploreByTheme), { loading: () => <SectionSkeleton height={450} /> });
const WhyChooseUs = dynamic(() => import("@/components/sections/WhyChooseUs").then((m) => m.WhyChooseUs), { loading: () => <SectionSkeleton height={420} /> });
const AirlinePartners = dynamic(() => import("@/components/sections/AirlinePartners").then((m) => m.AirlinePartners), { loading: () => <SectionSkeleton height={360} /> });
const Reviews = dynamic(() => import("@/components/sections/Reviews").then((m) => m.Reviews), { loading: () => <SectionSkeleton height={500} /> });
const Newsletter = dynamic(() => import("@/components/sections/Newsletter").then((m) => m.Newsletter), { loading: () => <SectionSkeleton height={420} /> });
const TrustStrip = dynamic(() => import("@/components/sections/TrustStrip").then((m) => m.TrustStrip), { loading: () => <SectionSkeleton height={120} /> });
const Footer = dynamic(() => import("@/components/sections/Footer").then((m) => m.Footer), { loading: () => <SectionSkeleton height={300} /> });

function prefetchChunks() {
  const imports = [
    () => import("@/components/sections/TopDestinations"),
    () => import("@/components/sections/DealsSection"),
    () => import("@/components/sections/PopularPackages"),
    () => import("@/components/sections/ExploreByTheme"),
    () => import("@/components/sections/AirlinePartners"),
    () => import("@/components/sections/Newsletter"),
    () => import("@/components/sections/Footer"),
  ];

  const schedule = typeof window !== "undefined" && "requestIdleCallback" in window
    ? (fn: () => void) => (window as any).requestIdleCallback(fn, { timeout: 3000 })
    : (fn: () => void) => setTimeout(fn, 1000);

  schedule(() => imports.forEach((fn) => fn().catch(() => null)));
}

function SectionSkeleton({ height }: { height: number }) {
  return <div aria-hidden style={{ minHeight: height }} className="w-full animate-pulse rounded-lg bg-muted/30" />;
}

export default function LandingPage() {
  React.useEffect(() => {
    prefetchChunks();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-grow">
        <Hero />
        <TrustStrip />
        <div className="mx-auto w-full max-w-[1400px] px-6 md:px-12">
          <RecentSearches />
        </div>
        <ScrollReveal><TopDestinations /></ScrollReveal>
        <ScrollReveal><DealsSection /></ScrollReveal>
        <ScrollReveal><PopularPackages /></ScrollReveal>
        <ScrollReveal><ExploreByTheme /></ScrollReveal>
        <ScrollReveal><WhyChooseUs /></ScrollReveal>
        <ScrollReveal><AirlinePartners /></ScrollReveal>
        <ScrollReveal><Reviews /></ScrollReveal>
        <ScrollReveal><Newsletter /></ScrollReveal>
      </main>
      <ScrollReveal><Footer /></ScrollReveal>
    </div>
  );
}
