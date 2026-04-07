"use client";

import * as React from "react";
import { Mail, ShieldCheck, Zap, HandCoins } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "../ui/button";

const STEPS = [
  {
    icon: Zap,
    title: "Instant Fare Alerts",
    desc: "Be the first to book price drops on your favorite routes."
  },
  {
    icon: ShieldCheck,
    title: "Exclusive Promos",
    desc: "Unlock secret member-only codes for up to 30% extra savings."
  },
  {
    icon: HandCoins,
    title: "Refund Priority",
    desc: "Subscribers get priority processing for changes and refunds."
  }
];

export function Newsletter() {
  const [emblaRef] = useEmblaCarousel({ 
    loop: true, 
    align: "start",
    breakpoints: {
      '(min-width: 1024px)': { active: false } 
    }
  }, [Autoplay({ delay: 3500, stopOnInteraction: true })]);

  const renderStep = (step: any, i: number) => (
    <div key={i} className="bg-card border border-border/60 rounded-2xl p-4 flex flex-col items-center text-center gap-3 h-full w-full shadow-sm">
      <div className="w-10 h-10 rounded-xl bg-brand-red/10 flex items-center justify-center text-brand-red shrink-0">
        <step.icon className="w-5 h-5" />
      </div>
      <div>
        <h4 className="font-black text-sm text-foreground mb-1">{step.title}</h4>
        <p className="text-[11px] font-medium text-muted-foreground leading-snug line-clamp-2">{step.desc}</p>
      </div>
    </div>
  );

  return (
    <section className="w-full bg-muted dark:bg-background border-y border-border py-14 transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        {/* Carousel for Benefits on Mobile / Grid for Desktop */}
         <div className="mb-10 text-center space-y-1">
          <h2 className="text-2xl font-black text-foreground lg:text-3xl tracking-tight">
            Stay Updated
          </h2>
          <p className="text-xs text-muted-foreground font-black tracking-[0.2em] uppercase">
             Join 100k+ Travelers
          </p>
        </div>

        <div className="relative mb-12 max-w-5xl mx-auto">
          <div className="lg:hidden overflow-hidden" ref={emblaRef}>
            <div className="flex ml-[-16px]">
              {STEPS.map((step, i) => (
                <div key={i} className="flex-[0_0_80%] sm:flex-[0_0_45%] min-w-0 pl-4">
                  {renderStep(step, i)}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-3 gap-6">
            {STEPS.map(renderStep)}
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          <form
            className="flex flex-col sm:flex-row w-full shadow-2xl rounded-2xl sm:rounded-full overflow-hidden border border-border bg-background"
            onSubmit={(e) => e.preventDefault()}
          >
            {/* Input Area */}
            <div className="flex-grow relative h-12 md:h-14">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="email"
                placeholder="Enter Your Email Address"
                required
                className="w-full h-full pl-12 pr-4 bg-transparent text-foreground placeholder:text-muted-foreground font-bold text-sm outline-none focus:bg-muted/10 transition-colors shimmer"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="h-12 md:h-14 px-10 rounded-none bg-brand-red hover:bg-brand-red/90 text-white text-xs font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center shrink-0 active:scale-95 cursor-pointer"
            >
              Get Secret Deals
            </Button>
          </form>
          <p className="text-[10px] text-center text-muted-foreground mt-4 font-medium opacity-70">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </section>
  );
}
