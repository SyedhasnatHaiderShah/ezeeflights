"use client"

import * as React from "react"
import { BadgeCheck, Smartphone, PhoneCall, ShieldCheck, LucideIcon } from "lucide-react"

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
]

export function WhyChooseUs() {
  return (
    <section className="py-16 bg-background relative overflow-hidden border-t border-border/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-4xl md:text-5xl font-semibold text-foreground opacity-90 font-display">
            Why Choose Ezee Flights
          </h2>
          <p className="text-muted-foreground text-lg mt-2">Best deals on international flights in just a few clicks</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="group flex flex-col items-center text-center lg:items-start lg:text-left gap-4 p-4 md:p-6 rounded-2xl bg-card backdrop-blur-sm border border-border/80 hover:shadow-xl hover:shadow-brand-red/5 transition-all duration-300 hover:-translate-y-1 relative"
            >
              {/* Icon Container - Smaller and Square */}
              <div className="w-12 h-12 shrink-0 rounded-xl bg-muted flex items-center justify-center text-brand-red border border-border group-hover:scale-105 group-hover:bg-brand-red group-hover:text-white transition-all duration-300">
                <feature.icon className="w-6 h-6" strokeWidth={2} />
              </div>

              {/* Text Content - Focused and Compact */}
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-foreground font-display mb-1 group-hover:text-brand-red transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs font-medium text-muted-foreground leading-snug">
                  {feature.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
