"use client";

import * as React from "react";
import nextDynamic from "next/dynamic";
import { motion } from "framer-motion";
import { getPageScrollTop } from "@/lib/hooks/use-page-scroll";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";

import { TopDestinations } from "@/components/sections/TopDestinations";
const DealsSection = nextDynamic(
  () =>
    import("@/components/sections/DealsSection").then((m) => m.DealsSection),
  { loading: () => <SectionSkeleton height={520} /> },
);
const PopularPackages = nextDynamic(
  () =>
    import("@/components/sections/PopularPackages").then(
      (m) => m.PopularPackages,
    ),
  { loading: () => <SectionSkeleton height={560} /> },
);
const ExploreByTheme = nextDynamic(
  () =>
    import("@/components/sections/ExploreByTheme").then(
      (m) => m.ExploreByTheme,
    ),
  { loading: () => <SectionSkeleton height={450} /> },
);
const WhyChooseUs = nextDynamic(
  () => import("@/components/sections/WhyChooseUs").then((m) => m.WhyChooseUs),
  { loading: () => <SectionSkeleton height={420} /> },
);
const AirlinePartners = nextDynamic(
  () =>
    import("@/components/sections/AirlinePartners").then(
      (m) => m.AirlinePartners,
    ),
  { loading: () => <SectionSkeleton height={360} /> },
);
const Reviews = nextDynamic(
  () => import("@/components/sections/Reviews").then((m) => m.Reviews),
  { loading: () => <SectionSkeleton height={500} /> },
);
const Newsletter = nextDynamic(
  () => import("@/components/sections/Newsletter").then((m) => m.Newsletter),
  { loading: () => <SectionSkeleton height={420} /> },
);
const Footer = nextDynamic(
  () => import("@/components/sections/Footer").then((m) => m.Footer),
  { loading: () => <SectionSkeleton height={300} /> },
);

function SectionSkeleton({ height }: { height: number }) {
  return (
    <div
      aria-hidden
      style={{ minHeight: height }}
      className="w-full animate-pulse rounded-lg bg-muted/30"
    />
  );
}

function AnimatedSection({
  children,
  minHeight = "400px",
  className,
  delay = 0,
  eager = false,
}: {
  children: React.ReactNode;
  minHeight?: string;
  className?: string;
  delay?: number;
  eager?: boolean;
}) {
  const [hasMounted, setHasMounted] = React.useState(eager);
  const [isInView, setIsInView] = React.useState(eager);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (eager) return;

    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    if (rect.top < window.innerHeight + 100) {
      setIsInView(true);
      setHasMounted(true);
      return;
    }

    setHasMounted(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px 150px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  return (
    <div
      ref={ref}
      style={!hasMounted ? { minHeight } : undefined}
      className={`w-full max-w-full min-w-0${className ? ` ${className}` : ""}`}
    >
      {hasMounted ? (
        <motion.div
          className="w-full max-w-full min-w-0"
          initial={{ opacity: 0, y: 28 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{
            duration: 0.65,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94] as const,
          }}
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  );
}

export function LandingPageClient() {
  const [loadMore, setLoadMore] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (getPageScrollTop() > 50) {
        setLoadMore(true);
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("scroll", handleScroll);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.body.addEventListener("scroll", handleScroll, { passive: true });

    // Fallback to load when idle (3 seconds)
    const timeout = setTimeout(() => {
      setLoadMore(true);
    }, 3000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.removeEventListener("scroll", handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex min-h-screen w-full max-w-full min-w-0 flex-col bg-background text-foreground">
      <Header transparent />
      <main className="w-full max-w-full min-w-0 flex-grow">
        <Hero />
        {/* <AnimatedSection minHeight="620px" eager>
          <TopDestinations />
        </AnimatedSection> */}

        {loadMore && (
          <>
            {/* <AnimatedSection minHeight="520px">
              <DealsSection />
            </AnimatedSection>
            <AnimatedSection minHeight="560px">
              <PopularPackages />
            </AnimatedSection> */}
            {/* <AnimatedSection minHeight="450px">
              <ExploreByTheme />
            </AnimatedSection> */}
            <AnimatedSection minHeight="420px">
              <WhyChooseUs />
            </AnimatedSection>
            <AnimatedSection minHeight="360px">
              <AirlinePartners />
            </AnimatedSection>
            <AnimatedSection minHeight="500px">
              <Reviews />
            </AnimatedSection>
            <AnimatedSection minHeight="420px">
              <Newsletter />
            </AnimatedSection>
          </>
        )}
      </main>
      {loadMore && (
        <AnimatedSection minHeight="300px">
          <Footer />
        </AnimatedSection>
      )}
    </div>
  );
}
