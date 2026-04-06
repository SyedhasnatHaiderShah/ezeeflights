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

import { AppIcon } from "../ui/app-icon"
 
export function WhyChooseUs() {
  return (
    <section className="py-14 bg-background relative overflow-hidden border-t border-border/40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col items-start mb-8 space-y-1">
          <span className="text-brand-red font-bold uppercase tracking-[0.2em] text-[10px] block">The Modern Choice</span>
          <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
            Why Choose Ezee Flights
          </h2>
        </div>
 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="group flex items-center gap-4 p-3 rounded-xl bg-card border border-border/60 hover:border-brand-red/20 hover:bg-brand-red/[0.02] transition-all duration-300"
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
                <h3 className="text-[15px] font-bold text-foreground group-hover:text-brand-red transition-colors truncate">
                  {feature.title}
                </h3>
                <p className="text-[11px] font-medium text-muted-foreground leading-tight line-clamp-2">
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
