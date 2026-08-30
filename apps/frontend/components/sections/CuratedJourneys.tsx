"use client";

import * as React from "react";
import { ArrowRight, Star } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { WhyChooseUs } from "./WhyChooseUs";
import { FAQSection } from "./FAQSection";

interface Journey {
  city: string;
  desc: string;
  price: string;
  img: string;
  tag: string;
  tagColor: string;
}

const JOURNEYS: Journey[] = [
  {
    city: "London",
    desc: "The Royal Standard",
    price: "$1,250",
    img: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1070&auto=format&fit=crop",
    tag: "LIMITED",
    tagColor: "bg-red-50 text-red-600 border-red-200",
  },
  {
    city: "Dubai",
    desc: "Mirage in the Sands",
    price: "$2,400",
    img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1070&auto=format&fit=crop",
    tag: "POPULAR",
    tagColor: "bg-blue-50 text-blue-600 border-blue-200",
  },
  {
    city: "Tokyo",
    desc: "Precision Culture",
    price: "$3,100",
    img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1070&auto=format&fit=crop",
    tag: "CURATED",
    tagColor: "bg-amber-50 text-amber-600 border-amber-200",
  },
];

const JourneyCard = React.memo(function JourneyCard({
  dest,
}: {
  dest: Journey;
}) {
  return (
    <div className="group flex flex-row items-center gap-4 bg-card border border-border/60 hover:border-brand-red/20 rounded-2xl p-3 cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 w-full h-full">
      {/* Square Image Thumbnail */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 overflow-hidden rounded-xl">
        <AppImage
          src={dest.img}
          alt={dest.city}
          fill
          isCompact={true}
          sizes="(max-width: 640px) 96px, 112px"
          className="group-hover:scale-110 transition-transform duration-700 ease-out object-cover"
        />
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-grow min-w-0 pr-1">
        <span className="text-[8px] ms-auto font-black px-2 py-0.5 bg-brand-red rounded-lg shadow-sm tracking-widest uppercase text-white mb-2">
          {dest.tag}
        </span>

        <div className="flex text-brand-red scale-75 origin-left -ml-1 mb-1">
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-4 w-4 fill-current" />
        </div>

        <h3 className="font-bold text-base sm:text-lg text-foreground tracking-tight truncate group-hover:text-brand-red transition-colors mb-0.5">
          {dest.city}
        </h3>
        <p className="text-muted-foreground font-medium text-xs truncate mb-3">
          {dest.desc}
        </p>

        <div className="flex justify-between items-end mt-auto">
          <div className="flex flex-col">
            <span className="text-muted-foreground font-bold text-[9px] tracking-wider mb-0.5 uppercase">
              Starting from
            </span>
            <span className="font-black text-[16px] text-brand-red leading-none">
              {dest.price}
            </span>
          </div>

          <div className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center group-hover:bg-brand-red group-hover:text-white transition-all shadow-sm">
            <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </div>
  );
});

export function CuratedJourneys() {
  return (
    <>
      <section
        id="destinations"
        className="py-14 bg-muted/30 dark:bg-background relative overflow-hidden transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-baseline justify-between mb-8 px-1">
            <div className="space-y-0.5">
              <span className="text-brand-red font-bold uppercase tracking-[0.2em] text-[10px] block mb-1">
                Exclusive Collections
              </span>
              <h2 className="font-black text-2xl lg:text-3xl tracking-tight text-foreground leading-tight">
                Curated Journeys
              </h2>
            </div>
            <button className="flex items-center space-x-1 text-brand-red font-bold hover:text-brand-red/80 transition-all active:scale-95 group">
              <span className="text-xs uppercase tracking-widest border-b border-brand-red/20 pb-0.5">
                Explore All
              </span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Mobile: Native CSS Scroll */}
          <div className="lg:hidden">
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-6 px-6 pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {JOURNEYS.map((dest, i) => (
                <div
                  key={i}
                  className="w-[88vw] max-w-[360px] shrink-0 snap-start"
                >
                  <JourneyCard dest={dest} />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: static grid */}
          <div className="hidden lg:grid grid-cols-3 gap-5 xl:gap-6">
            {JOURNEYS.map((dest, i) => (
              <JourneyCard key={i} dest={dest} />
            ))}
          </div>
        </div>
      </section>
      <FAQSection />
      <WhyChooseUs />
    </>
  );
}
