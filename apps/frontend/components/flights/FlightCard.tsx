'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Share2, Briefcase, Info } from 'lucide-react';
import { useBookingFlowStore } from '@/lib/store/booking-flow-store';
import { cn } from '@/lib/utils';
import { AppImage } from '../ui/app-image';
import { Button } from '../ui/button';

interface Props {
  id: string;
  airline: string;
  airlineCode: string;
  airlineLogo?: string;
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureTime?: string;
  arrivalTime?: string;
  departureAt: string;
  arrivalAt: string;
  duration?: string;
  stops?: number;
  baseFare: number;
  totalFare?: number;
  currency: string;
  cabinClass?: string;
}

export function FlightCard(props: Props) {
  const router = useRouter();
  const setFlights = useBookingFlowStore((state) => state.setFlights);

  const duration = props.duration || "3h 20m";
  const stopsText = props.stops === 0 ? "nonstop" : `${props.stops} stop${props.stops > 1 ? 's' : ''}`;
  const totalFare = props.totalFare || (props.baseFare * 4); // Default to 4 travelers for mock display
  const cabinClass = props.cabinClass || "Economy Basic";

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="bg-white dark:bg-muted/10 rounded-[4px] border border-gray-200 dark:border-border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row relative group"
    >
      {/* Left & Middle Content */}
      <div className="flex-grow p-4 md:p-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-500 dark:text-muted-foreground mb-1">
          <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Heart className="w-3.5 h-3.5" /> Save
          </button>
          <button className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            {/* Airline Logo & Time */}
            <div className="flex items-center gap-4 min-w-0 flex-[1.5]">
              <div className="w-10 h-10 relative flex-shrink-0 bg-white dark:bg-white p-1 rounded-sm border border-gray-100 shadow-sm">
                <AppImage 
                  src={props.airlineLogo || `https://www.kayak.com/rimg/provider-logos/airlines/v/${props.airlineCode}.png`} 
                  alt={props.airline}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-bold text-foreground truncate">
                  {props.departureTime || new Date(props.departureAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – {props.arrivalTime || new Date(props.arrivalAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
                <span className="text-sm text-gray-500 dark:text-muted-foreground font-medium truncate">
                  {props.airline}
                </span>
              </div>
            </div>

            {/* Stops */}
            <div className="flex flex-col items-center flex-1 text-center">
              <span className="text-sm font-semibold text-foreground">
                {stopsText}
              </span>
              <span className="text-xs text-gray-400 dark:text-muted-foreground/60 tracking-wider font-bold mt-0.5">
                {props.departureAirport}-{props.arrivalAirport}
              </span>
            </div>

            {/* Duration */}
            <div className="flex flex-col items-end flex-1 text-right">
              <span className="text-sm font-semibold text-foreground">
                {duration}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end md:hidden">
            <span className="text-xs text-gray-500 dark:text-muted-foreground/50 self-end">Ad</span>
        </div>
      </div>

      {/* Right Action/Price Section */}
      <div className="w-full md:w-[220px] flex-shrink-0 border-t md:border-t-0 md:border-l border-gray-100 dark:border-border/50 bg-gray-50/30 dark:bg-muted/5 p-4 md:p-6 flex flex-col justify-center items-center md:items-end gap-1">
        <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1 text-gray-500 dark:text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">1</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500 dark:text-muted-foreground">
                <Briefcase className="w-3.5 h-3.5" fill="currentColor" />
                <span className="text-[10px] font-bold">0</span>
            </div>
        </div>

        <div className="text-right">
          <div className="flex flex-col items-center md:items-end">
             <span className="text-2xl font-black text-foreground">
                {props.currency}{props.baseFare.toLocaleString()} <span className="text-sm font-medium text-gray-500 dark:text-muted-foreground">/ person</span>
             </span>
             <span className="text-sm font-bold text-foreground mt-1">
                {props.currency}{totalFare.toLocaleString()} total
             </span>
             <span className="text-xs text-gray-500 dark:text-muted-foreground/70 mt-0.5 font-medium">
                {cabinClass}
             </span>
          </div>
        </div>

        <Button
          onClick={() => {
            setFlights([props.id]);
            router.push('/flights/booking');
          }}
          className="mt-6 w-full bg-[#ff4b2b] hover:bg-[#ff3b1b] text-white font-bold py-3 md:py-6 rounded-[4px] shadow-sm hover:shadow-lg transition-all"
        >
          View Deal
        </Button>
      </div>

      <div className="absolute right-4 bottom-2 hidden md:block">
         <span className="text-[10px] font-bold text-gray-300 dark:text-muted-foreground/30">Ad</span>
      </div>
    </motion.article>
  );
}
