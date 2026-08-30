'use client';

import { BookingSearchForm } from '@/components/search/BookingSearchForm';
import { Sparkles, History, MapPin, Plane, Hotel, Car, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { MobileBottomNav } from '@/components/sections/MobileBottomNav';
import { MobileStatusBarSpacer } from '@/components/shared/MobileStatusBarSpacer';

export function MobileHome() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'flight' | 'hotel' | 'car' | 'package' | 'insurance'>('flight');
  
  // Search Form State
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState<Date | undefined>(new Date());
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [cabinClass, setCabinClass] = useState("Economy");
  const [tripType, setTripType] = useState("round-trip");

  const handlePassengerChange = setPassengers;

  const handleSearch = () => {
    router.push(`/flights/result?origin=${origin}&destination=${destination}&depart=${departDate?.toISOString()}`);
  };

  const trendingDestinations = [
    { name: 'Dubai', price: '$299', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=400' },
    { name: 'London', price: '$450', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=400' },
    { name: 'New York', price: '$380', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=400' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <MobileStatusBarSpacer />
      
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-md dark:bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-red">
            <Plane className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">EzeeFlights</span>
        </div>
        <button className="rounded-full bg-slate-100 p-2 dark:bg-slate-800">
          <History className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </button>
      </header>

      <main className="flex-1 space-y-8 pb-32 pt-4">
        <section className="px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-blue to-slate-900 p-6 text-white shadow-xl shadow-brand-blue/20">
            <div className="relative z-10 space-y-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md">
                <Sparkles className="h-3 w-3 text-brand-yellow" />
                Mobile Exclusive
              </span>
              <h2 className="text-2xl font-bold tracking-tight">Save 15% on your first app booking</h2>
              <p className="text-sm font-medium text-slate-300">Use code: EZEEMOBILE</p>
            </div>
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand-red/10 blur-3xl" />
          </div>
        </section>

        <section className="px-6">
          <div className="rounded-3xl bg-white p-2 shadow-2xl shadow-slate-200 dark:bg-slate-900 dark:shadow-none">
            <div className="mb-2 flex gap-1 p-1">
              {[
                { id: 'flight', icon: Plane, label: 'Flights' },
                { id: 'hotel', icon: Hotel, label: 'Hotels' },
                { id: 'car', icon: Car, label: 'Cars' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-all",
                    activeTab === tab.id 
                      ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" 
                      : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                  )}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 pt-2">
              <BookingSearchForm 
                variant={activeTab as any} 
                hideTabs 
                origin={origin}
                setOrigin={setOrigin}
                destination={destination}
                setDestination={setDestination}
                departDate={departDate}
                setDepartDate={setDepartDate}
                returnDate={returnDate}
                setReturnDate={setReturnDate}
                passengers={passengers}
                handlePassengerChange={handlePassengerChange}
                cabinClass={cabinClass}
                setCabinClass={setCabinClass}
                tripType={tripType}
                setTripType={setTripType}
                handleSearch={handleSearch}
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-4 px-6">
          {[
            { label: 'Check-in', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'My Trips', icon: History, color: 'text-brand-red', bg: 'bg-brand-red/10' },
            { label: 'Offers', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            { label: 'Support', icon: MapPin, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((action) => (
            <button key={action.label} className="flex flex-col items-center gap-2">
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl", action.bg)}>
                <action.icon className={cn("h-6 w-6", action.color)} />
              </div>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">{action.label}</span>
            </button>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-6">
            <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">Trending Destinations</h3>
            <button className="text-xs font-bold text-brand-red">See All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto px-6 pb-4 no-scrollbar">
            {trendingDestinations.map((dest) => (
              <div 
                key={dest.name} 
                className="group relative h-48 w-40 shrink-0 overflow-hidden rounded-3xl"
              >
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-xs font-medium text-slate-300">{dest.name}</p>
                  <p className="text-sm font-bold text-white">From {dest.price}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <MobileBottomNav />
    </div>
  );
}
