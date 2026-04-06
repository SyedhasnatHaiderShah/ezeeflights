"use client";

import * as React from "react";
import { Shield, ArrowRight, Cpu, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PrecisionFeatures() {
  return (
    <section
      id="experiences"
      className="py-20 bg-background overflow-hidden relative transition-colors duration-300"
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/4 h-full bg-brand-blue/5 dark:bg-brand-red-light/5 -skew-x-12 translate-x-1/2 z-0" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div className="relative order-2 lg:order-1 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="absolute -top-16 -left-16 w-64 h-64 bg-brand-blue/5 dark:bg-brand-red-light/5 rounded-full blur-[80px] animate-pulse" />
          <Card
            variant="lowest"
            className="relative z-10 p-5 md:p-8 bg-card/80 backdrop-blur-md shadow-md rounded-sm border-border"
          >
            <div className="space-y-10">
              {[
                {
                  icon: <Cpu className="h-5 w-5" />,
                  title: "Aerospace Accuracy",
                  desc: "Algorithms process millions of flight paths to ensure zero-lag scheduling and optimal trajectories.",
                  color:
                    "bg-redmix dark:bg-blue-900/20 text-white dark:text-white",
                },
                {
                  icon: <Activity className="h-5 w-5" />,
                  title: "Predictive Preference",
                  desc: "AI that learns your travel rhythm—from seat pitch preferences to in-flight meal timing.",
                  color:
                    "bg-redmix dark:bg-blue-900/20 text-white dark:text-white",
                },
                {
                  icon: <Shield className="h-5 w-5" />,
                  title: "Immutable Safety",
                  desc: "Advanced diagnostic monitoring on every fleet, ensuring standards that exceed the norm.",
                  color:
                    "bg-redmix dark:bg-blue-900/20 text-white dark:text-white",
                },
              ].map((feat, i) => (
                <div key={i} className="flex items-start space-x-6 group">
                  <div
                    className={`p-4 rounded-full ${feat.color} group-hover:scale-105 transition-transform duration-500`}
                  >
                    {feat.icon}
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-bold mb-1.5 tracking-tight text-foreground">
                      {feat.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed text-sm font-medium opacity-80">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5 order-1 lg:order-2 animate-in fade-in slide-in-from-right-8 duration-1000 lg:sticky lg:top-32">
          <span className="text-brand-blue dark:text-brand-red-light font-bold tracking-[0.2em] capitalize text-sm block px-1">
            Technology & Safety
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter leading-[1.1] text-foreground">
            The Precision <br /> of Flight.
          </h2>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
            We don't just book flights; we engineer experiences. By applying
            aerospace-grade data modeling to global travel, Ezee Flights
            eliminates the friction of modern movement.
          </p>
          <div className="pt-4">
            <Button
              size="lg"
              className="group rounded-xl h-12 shadow-md bg-redmix dark:bg-blue-900/20 text-white dark:text-white"
            >
              <span>Our Tech Stack</span>
              <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
