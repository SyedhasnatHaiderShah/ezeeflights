"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import EzeeFlightsLogo from "@/components/ezee-flights-logo";
import { AuthImageGrid } from "@/components/auth/auth-image-grid";

const quotes = [
  "Travel isn’t always about the destination — it’s about who you become on the journey.",
  "Collect moments in cities, not just stamps in passports.",
  "Every takeoff is a chance to reset your story.",
  "Great journeys begin with a single booking.",
  "The world feels smaller when your dreams are bigger.",
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const [activeQuote, setActiveQuote] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % quotes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <section className="relative hidden md:block md:w-[55%] bg-[#0d2353] overflow-hidden">
          <div className="absolute inset-0">
            <AuthImageGrid />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark-blue/80 to-brand-dark-blue/60" />

          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-10 text-center">
            <EzeeFlightsLogo isDarkMode className="w-72 h-auto" />
            <div className="mt-10 min-h-[100px] max-w-xl">
              <AnimatePresence mode="wait">
                <motion.p
                  key={activeQuote}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.5 }}
                  className="text-xl font-light italic text-white/90"
                >
                  <span className="text-brand-yellow">“</span>
                  {quotes[activeQuote]}
                  <span className="text-brand-yellow">”</span>
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {quotes.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === activeQuote ? "w-7 bg-brand-yellow" : "w-2 bg-white/45"
                }`}
              />
            ))}
          </div>
        </section>

        <section className="w-full md:w-[45%] bg-background flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex justify-center md:hidden">
              <EzeeFlightsLogo isDarkMode={false} className="w-44 h-auto" />
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
