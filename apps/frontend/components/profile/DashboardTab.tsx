"use client";

import React from "react";
import { Plane, MapPin, Users, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export function DashboardTab() {
  return (
    <div className="space-y-12">
      {/* Trip Stats Section */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Trip Stats</h2>
        <div className="relative overflow-hidden rounded-2xl bg-[#F8F9FA] border dark:bg-muted/30">
          <div className="flex flex-col md:flex-row items-center p-8 md:p-12 gap-8">
            <div className="flex-1 space-y-6 text-center md:text-left z-10">
              <h3 className="text-xl md:text-2xl font-bold text-foreground">
                You don't have any Trip Stats yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto md:ml-0">
                Kick your trip into gear. Get started by booking your first flight or hotel!
              </p>
              <Button className="bg-[#212121] text-white hover:bg-black px-8 py-6 rounded-lg text-base font-semibold transition-all hover:scale-105">
                View trips
              </Button>
            </div>
            
            {/* Visual Graphic Mockup */}
            <div className="relative h-48 w-48 md:h-64 md:w-64 flex-shrink-0 animate-float">
              <div className="absolute inset-0 bg-brand-red/10 rounded-full blur-3xl opacity-50" />
              <div className="relative h-full w-full flex items-center justify-center">
                 {/* This would ideally be the globe illustration from the image */}
                 <div className="text-8xl">🌍</div>
              </div>
            </div>
          </div>
          
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
               style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
          />
        </div>
      </section>

      {/* Recent Searches Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Recent searches</h2>
          <Button variant="link" className="text-brand-red font-semibold">View all</Button>
        </div>
        
        <div className="grid gap-4">
          {[
            { from: "LHE Lahore", to: "AUH Abu Dhabi", date: "Tue, 05/12", travelers: "4 travelers, economy" },
            { from: "DXB Dubai", to: "JFK New York", date: "Fri, 08/15", travelers: "1 traveler, business" },
          ].map((search, idx) => (
            <Card key={idx} className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
              <div className="flex flex-col md:flex-row items-center justify-between p-5 gap-4">
                <div className="flex items-center gap-6 flex-1">
                  <div className="p-3 bg-muted rounded-full group-hover:bg-brand-red/10 group-hover:text-brand-red transition-colors">
                    <Plane className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-base">{search.from}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <span className="font-bold text-base">{search.to}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{search.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{search.travelers}</span>
                  </div>
                </div>
                
                <Button variant="ghost" size="icon" className="hidden md:flex group-hover:translate-x-1 transition-transform">
                   <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
