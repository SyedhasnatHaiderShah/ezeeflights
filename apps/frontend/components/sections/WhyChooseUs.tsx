"use client";

import * as React from "react";
import {
  BadgeCheck,
  Smartphone,
  PhoneCall,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";
import { AppIcon } from "../ui/app-icon";

interface Feature {
  icon: LucideIcon;
  title: string;
  text: string;
}

const FEATURES: Feature[] = [
  {
    icon: BadgeCheck,
    title: "Best Price Guarantee",
    text: "Discover unbeatable prices on international flights with our exclusive deals",
  },
  {
    icon: Smartphone,
    title: "Easy Booking",
    text: "Best deals on international flights in just a few clicks",
  },
  {
    icon: PhoneCall,
    title: "24X7 Support",
    text: "Get award-winning service and special deals by calling +1-888-604-0198",
  },
  {
    icon: ShieldCheck,
    title: "Trust pay",
    text: "100% Payment Protection. Easy Return Policy.",
  },
];

const renderFeature = (feature: Feature, idx: number) => (
  <div
    key={idx}
    className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/60 hover:border-brand-red/20 hover:bg-brand-red/[0.02] transition-all duration-300 w-full h-full"
  >
    <div className="shrink-0">
      <AppIcon
        icon={feature.icon}
        isFill={true}
        isActive={true}
        className="w-11 h-11 pointer-events-none"
      />
    </div>

    <div className="flex flex-col min-w-0 pr-1">
      <h3 className="text-base font-black text-foreground group-hover:text-brand-red transition-colors truncate">
        {feature.title}
      </h3>
      <p className="text-xs font-semibold text-muted-foreground leading-tight line-clamp-3">
        {feature.text}
      </p>
    </div>
  </div>
);

export function WhyChooseUs() {
  return (
    <section className="py-14 bg-background relative overflow-hidden border-t border-border/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col items-start mb-8 space-y-1">
          <span className="text-brand-red font-bold uppercase tracking-[0.2em] text-xs block">
            The Modern Choice
          </span>
          <h2 className="text-2xl font-black lg:text-3xl tracking-tight text-foreground leading-tight">
            Why Choose Ezee Flights
          </h2>
        </div>

        {/* Native CSS Scroll for Mobile */}
        <div className="lg:hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-6 px-6 pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {FEATURES.map((feature, idx) => (
              <div
                key={idx}
                className="flex-[0_0_88%] sm:flex-[0_0_48%] min-w-0 shrink-0 snap-start"
              >
                {renderFeature(feature, idx)}
              </div>
            ))}
          </div>
        </div>

        {/* Static Grid — Desktop screens */}
        <div className="hidden lg:grid grid-cols-4 gap-5 xl:gap-6">
          {FEATURES.map(renderFeature)}
        </div>
      </div>
    </section>
  );
}
