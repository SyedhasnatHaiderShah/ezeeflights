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
import { Button } from "@/components/ui/button";

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

const renderInfoCard = (card: InfoCard) => (
  <div
    key={card.id}
    className="bg-card/80 backdrop-blur-md border border-border/60 rounded-2xl p-3.5 flex items-center gap-4 shadow-sm group w-full min-h-[100px]"
  >
    <div className="w-10 h-10 shrink-0 bg-brand-red/10 rounded-xl flex items-center justify-center text-brand-red group-hover:scale-105 transition-transform">
      <card.icon className="w-5 h-5" strokeWidth={2.5} />
    </div>
    <div className="flex flex-col min-w-0">
      <h4 className="text-[13px] font-black text-foreground font-display leading-tight mb-1">
        {card.title}
      </h4>
      <div className="text-[11px] text-muted-foreground font-bold leading-normal whitespace-normal">
        {card.text}
      </div>
    </div>
  </div>
);

const renderOfferCard = (offer: Offer) => (
  <div
    key={offer.id}
    className="group flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-card border border-border/60 shadow-sm hover:shadow-md transition-all duration-500 h-full w-full"
  >
    <div className="w-full sm:w-32 h-32 lg:h-32 shrink-0 relative overflow-hidden rounded-xl">
      <AppImage
        src={offer.image}
        alt={offer.title}
        fill
        isCompact={true}
        className="group-hover:scale-105 transition-transform duration-700 object-cover"
      />
    </div>
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
        <ChevronsRight className="w-3 h-3 ml-1 transition-transform group-hover/btn:translate-x-1" />
      </Button>
    </div>
  </div>
);

export function SpecialOffers() {
  return (
    <section className="md:py-14 py-8 bg-muted/30 dark:bg-background transition-colors duration-300 relative overflow-hidden">
      {/* Information Contact Cards */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-12 mb-8">
        {/* Mobile: Native CSS Scroll */}
        <div className="md:hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 -mx-4 px-4 pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {INFO_CARDS.map((card) => (
              <div
                key={card.id}
                className="w-[85vw] max-w-[320px] shrink-0 snap-start"
              >
                {renderInfoCard(card)}
              </div>
            ))}
          </div>
        </div>
        {/* Desktop: static grid */}
        <div className="hidden md:grid grid-cols-3 gap-3.5">
          {INFO_CARDS.map(renderInfoCard)}
        </div>
      </div>

      {/* Header Banner */}
      <div className="w-full max-w-md mx-auto px-6 md:px-12 mb-8">
        <div className="w-full bg-gradient-to-r from-redmix-dark via-redmix to-redmix-dark py-4 rounded-full shadow-lg border border-blue-800/30 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer pointer-events-none" />
          <h2 className="relative z-10 text-xl md:text-2xl font-bold text-white tracking-tight uppercase">
            Special Flight Offers
          </h2>
        </div>
      </div>

      {/* Offer Cards */}
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Mobile: Native CSS Scroll */}
        <div className="lg:hidden">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-6 px-6 pb-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {OFFERS.map((offer) => (
              <div
                key={offer.id}
                className="w-[82vw] max-w-[340px] shrink-0 snap-start"
              >
                {renderOfferCard(offer)}
              </div>
            ))}
          </div>
        </div>
        {/* Desktop: static grid */}
        <div className="hidden lg:grid grid-cols-3 gap-4 md:gap-5">
          {OFFERS.map(renderOfferCard)}
        </div>
      </div>
    </section>
  );
}
