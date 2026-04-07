"use client";

import * as React from "react";
import { Shield, ArrowRight, Cpu, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { AppIcon } from "../ui/app-icon";

export function PrecisionFeatures() {
  return (
    <section
      id="experiences"
      className="py-14 bg-background overflow-hidden relative transition-colors duration-300"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-brand-blue/5 dark:bg-brand-red-light/5 -skew-x-12 translate-x-1/2 z-0" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="relative order-2 lg:order-1 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-brand-blue/5 dark:bg-brand-red-light/5 rounded-full blur-[80px] animate-pulse" />
          <Card
            variant="lowest"
            className="p-4 md:p-6 bg-card/60 backdrop-blur-md shadow-sm rounded-xl border border-border/80"
          >
            <div className="space-y-6">
              {[
                {
                  icon: Cpu,
                  title: "Aerospace Accuracy",
                  desc: "Algorithms process millions of flight paths to ensure zero-lag scheduling and optimal trajectories.",
                },
                {
                  icon: Activity,
                  title: "Predictive Preference",
                  desc: "AI that learns your travel rhythm—from seat pitch preferences to in-flight meal timing.",
                },
                {
                  icon: Shield,
                  title: "Immutable Safety",
                  desc: "Advanced diagnostic monitoring on every fleet, ensuring standards that exceed the norm.",
                },
              ].map((feat, i) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="shrink-0 transition-transform duration-500 group-hover:scale-105">
                    <AppIcon
                      icon={feat.icon}
                      isFill={true}
                      isActive={true}
                      className="w-11 h-11 pointer-events-none"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-1 tracking-tight text-foreground group-hover:text-brand-red transition-colors">
                      {feat.title}
                    </h4>
                    <p className="text-muted-foreground leading-snug text-xs font-medium font-sans opacity-90">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4 order-1 lg:order-2 animate-in fade-in slide-in-from-right-8 duration-1000 lg:sticky lg:top-32">
          <span className="text-brand-red font-bold tracking-[0.2em] uppercase text-xs block">
            Technology & Safety
          </span>
          <h2 className="text-3xl font-bold tracking-tight leading-tight text-foreground">
            The Precision <br /> of Flight.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
            We don't just book flights; we engineer experiences. By applying
            aerospace-grade data modeling to global travel, Ezee Flights
            eliminates the friction of modern movement.
          </p>
          <div className="pt-2">
            <Button className="group rounded-xl h-11 px-6 shadow-sm bg-brand-red hover:bg-brand-red/90 text-white transition-all active:scale-95 text-xs font-bold uppercase tracking-wider">
              <span>Our Tech Stack</span>
              <ArrowRight className="ml-2.5 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
