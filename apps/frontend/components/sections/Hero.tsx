"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { BookingForm } from "@/components/booking-form";
import { AppImage } from "@/components/ui/app-image";
import { StatCounter } from "@/components/ui/stat-counter";

const DESTINATIONS = [
  { name: "Dubai", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1800&auto=format&fit=crop" },
  { name: "Maldives", image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1800&auto=format&fit=crop" },
  { name: "Paris", image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=1800&auto=format&fit=crop" },
  { name: "New York", image: "https://images.unsplash.com/photo-1496588152823-e6bde2ede9f7?q=80&w=1800&auto=format&fit=crop" },
  { name: "Tokyo", image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1800&auto=format&fit=crop" },
] as const;

interface HeroProps {
  title?: React.ReactNode;
  description?: string;
}

export function Hero({
  title = (<>Find Your Perfect <span className="bg-gradient-to-r from-brand-red to-brand-yellow bg-clip-text text-transparent">Journey</span></>),
  description = "Search 500+ airlines. Compare prices. Book in seconds.",
}: HeroProps) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setIndex((v) => (v + 1) % DESTINATIONS.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={DESTINATIONS[index].name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <AppImage src={DESTINATIONS[index].image} alt={DESTINATIONS[index].name} fill priority className="object-cover ken-burns" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1400px] flex-col items-center justify-center px-5 py-28 text-white">
        <span className="mb-4 rounded-full bg-white/20 px-3 py-1 text-xs backdrop-blur">✈ #1 Flight Booking Platform</span>
        <h1 className="text-hero text-center font-extrabold text-white">{title}</h1>
        <p className="mt-4 max-w-xl text-center text-lg text-white/80">{description}</p>

        <div className="mt-8 w-full">
          <BookingForm defaultTab="flights" heroMode />
        </div>

        <div className="mt-6 grid w-full grid-cols-2 gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur md:grid-cols-4">
          <div className="text-center"><p className="text-2xl font-extrabold"><StatCounter value={2} suffix="M+" /></p><p className="text-xs text-white/80">Happy Travelers</p></div>
          <div className="text-center md:border-l md:border-white/30"><p className="text-2xl font-extrabold"><StatCounter value={500} suffix="+" /></p><p className="text-xs text-white/80">Airlines</p></div>
          <div className="text-center md:border-l md:border-white/30"><p className="text-2xl font-extrabold"><StatCounter value={150} suffix="+" /></p><p className="text-xs text-white/80">Countries</p></div>
          <div className="text-center md:border-l md:border-white/30"><p className="text-2xl font-extrabold"><StatCounter value={49} suffix="/10★" /></p><p className="text-xs text-white/80">Rating</p></div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
        {DESTINATIONS.map((d, i) => (
          <button key={d.name} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? "w-8 bg-white" : "w-3 bg-white/45"}`} aria-label={d.name} />
        ))}
      </div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 text-white/80">
        <ChevronDown className="h-6 w-6" />
      </motion.div>
    </section>
  );
}
