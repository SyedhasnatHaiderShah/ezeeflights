"use client";

import * as React from "react";
import {
  BadgeCheck,
  Smartphone,
  PhoneCall,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
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

export function WhyChooseUs() {
  const [emblaRef] = useEmblaCarousel({ 
    loop: true, 
    align: "start",
    breakpoints: {
      '(min-width: 1024px)': { active: false } 
    }
  }, [Autoplay({ delay: 3000, stopOnInteraction: true })]);

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
        <p className="text-xs font-bold text-muted-foreground leading-tight line-clamp-3">
          {feature.text}
        </p>
      </div>
    </div>
  );

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

        {/* Carousel for Mobile / Grid for Desktop */}
        <div className="relative">
          <div className="lg:hidden overflow-hidden" ref={emblaRef}>
            <div className="flex ml-[-16px]">
              {FEATURES.map((feature, idx) => (
                <div key={idx} className="flex-[0_0_88%] sm:flex-[0_0_48%] min-w-0 pl-4">
                  {renderFeature(feature, idx)}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-4 gap-5 xl:gap-6">
            {FEATURES.map(renderFeature)}
          </div>
        </div>
      </div>
    </section>
  );
}
