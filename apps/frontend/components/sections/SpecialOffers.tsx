"use client";

import * as React from "react";
import {
  ChevronsRight,
  Ticket,
  Headset,
  CircleDollarSign,
  LucideIcon,
} from "lucide-react";
import { AppImage } from "@/components/ui/app-image";

interface InfoCard {
  id: number;
  icon: LucideIcon;
  title: string;
  text: React.ReactNode;
}

const INFO_CARDS: InfoCard[] = [
  {
    id: 1,
    icon: Ticket,
    title: "We are now available",
    text: (
      <span>
        Call <span className="text-brand-red font-bold">+1-888-604-0198</span>{" "}
        for contact with us
      </span>
    ),
  },
  {
    id: 2,
    icon: Headset,
    title: "Call Now for Exclusive Fare Deals",
    text: (
      <span>
        Call <span className="text-brand-red font-bold">+1-888-604-0198</span>{" "}
        for contact with us
      </span>
    ),
  },
  {
    id: 3,
    icon: CircleDollarSign,
    title: "Check Refund",
    text: (
      <span>
        Call <span className="text-brand-red font-bold">+1-888-604-0198</span>{" "}
        for contact with us
      </span>
    ),
  },
];

interface Offer {
  id: number;
  title: string;
  description: string;
  image: string;
}

const OFFERS: Offer[] = [
  {
    id: 1,
    title: "International Flight Offers",
    description:
      "Fly Global, Save Big: Your Gateway to Affordable Adventures Internationally",
    image:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Domestic Flight Offers",
    description:
      "Sky-High Savings: Your Ticket to Affordable Domestic Flights!",
    image:
      "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Earn Discounts",
    description: "Ezee Flights: Where Earning Discounts is a Breeze!",
    image:
      "https://images.unsplash.com/photo-1627843563095-f6e94676cfe0?q=80&w=1000&auto=format&fit=crop",
  },
];

import { Button } from "@/components/ui/button";

export function SpecialOffers() {
  return (
    <section className="py-14 bg-muted/30 dark:bg-background transition-colors duration-300 relative overflow-hidden">
      {/* Information Contact Cards - More Compact Row */}
      <div className="w-full max-w-7xl mx-auto px-5 md:px-12 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {INFO_CARDS.map((card) => (
            <div
              key={card.id}
              className="bg-card border border-border/60 rounded-xl p-3 flex items-center gap-3.5 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              <div className="w-10 h-10 shrink-0 bg-brand-red/5 dark:bg-brand-red/10 rounded-lg flex items-center justify-center text-brand-red group-hover:scale-105 transition-transform">
                <card.icon className="w-5 h-5" strokeWidth={2} />
              </div>
              <div className="flex flex-col min-w-0">
                <h4 className="text-sm font-bold text-foreground font-display leading-tight truncate">
                  {card.title}
                </h4>
                <div className="text-xs text-muted-foreground font-medium mt-0.5 whitespace-nowrap">
                  {card.text}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Header Banner - Sleeker Height */}
      <div className="w-full max-w-md mx-auto px-6 md:px-12 mb-8">
        <div className="w-full bg-gradient-to-r from-redmix-dark via-redmix to-redmix-dark py-4 rounded-full shadow-lg border border-blue-800/30 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer pointer-events-none" />
          <h2 className="relative z-10 text-xl md:text-2xl font-bold text-white tracking-tight uppercase">
            Special Flight Offers
          </h2>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className="group flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all duration-500"
            >
              {/* Image Container - Compact Editorial Square */}
              <div className="w-full sm:w-32 h-32 shrink-0 relative overflow-hidden rounded-lg">
                <AppImage
                  src={offer.image}
                  alt={offer.title}
                  fill
                  isCompact={true}
                  className="group-hover:scale-105 transition-transform duration-700 object-cover"
                />
              </div>

              {/* Content - Compact Typography */}
              <div className="flex flex-col flex-grow min-w-0 py-1">
                <h3 className="text-sm font-bold text-brand-red mb-1 font-display group-hover:text-brand-blue dark:group-hover:text-brand-red-light transition-colors truncate">
                  {offer.title}
                </h3>
                <p className="text-xs font-medium text-muted-foreground leading-snug mb-3.5 flex-grow line-clamp-2 opacity-90">
                  {offer.description}
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  shimmer={true}
                  className="inline-flex items-center gap-1 text-brand-blue dark:text-muted-foreground font-bold text-xs tracking-wider hover:opacity-80 transition-colors w-fit border border-border px-3.5 py-1.5 rounded-md hover:bg-muted group/btn shadow-sm active:scale-95 cursor-pointer"
                >
                  View Offer
                  <ChevronsRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
