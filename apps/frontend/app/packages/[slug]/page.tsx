'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ItineraryTimeline } from '@/components/packages/ItineraryTimeline';
import { mockPackages, MockPackage } from '@/data/mock-packages';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { 
  Check, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Plane, 
  Hotel, 
  Car, 
  Info, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Tag,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PackageDetailsPage({ params }: { params: { slug: string } }) {
  const [open, setOpen] = useState(false);
  
  // Customization state
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null);

  const item = useMemo(() => {
    return mockPackages.find(p => p.slug === params.slug) || mockPackages[0];
  }, [params.slug]);

  const selectedHotel = useMemo(() => {
    if (!selectedHotelId) return null;
    return item.alternativeHotels.find(h => h.id === selectedHotelId);
  }, [selectedHotelId, item]);

  const selectedFlight = useMemo(() => {
    if (!selectedFlightId) return null;
    return item.alternativeFlights.find(f => f.id === selectedFlightId);
  }, [selectedFlightId, item]);

  const totalBase = item.basePrice;
  const hotelDiff = selectedHotel?.priceDiff || 0;
  const flightDiff = selectedFlight?.priceDiff || 0;
  const totalPrice = totalBase + hotelDiff + flightDiff;

  const itemisedTotal = item.itemisedPricing.flights + item.itemisedPricing.hotel + item.itemisedPricing.transfers + item.itemisedPricing.activities;
  const totalSavings = itemisedTotal - totalBase;

  const images = [
    item.thumbnailUrl || 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800'
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-screen-2xl px-4 py-8 md:px-6 md:py-12">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <Link href="/packages" className="hover:text-brand-red transition-colors">Packages</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground/60">{item.country}</span>
            </nav>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground">{item.title}</h1>
            <div className="flex flex-wrap items-center gap-5 text-sm font-medium text-muted-foreground">
              <p className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                <MapPin className="w-4 h-4 text-brand-red" /> {item.destination}, {item.country}
              </p>
              <p className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                <Clock className="w-4 h-4 text-slate-400" /> {item.durationDays} Days / {item.durationDays - 1} Nights
              </p>
              {item.agencyTag && (
                <span className="bg-brand-red text-white text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-brand-red/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> {item.agencyTag}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 text-right">
             <div className="hidden sm:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Bundle Savings</p>
                <p className="text-2xl font-black text-emerald-500 flex items-center gap-1.5 justify-end">
                   <Tag className="w-5 h-5" /> -{item.currency} {totalSavings.toLocaleString()}
                </p>
             </div>
             <div className="hidden sm:block w-px h-12 bg-border mx-2" />
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">From</p>
                <p className="text-4xl font-black text-brand-red">{item.currency} {item.basePrice.toLocaleString()}</p>
             </div>
          </div>
        </div>

        {/* Media Gallery - Premium Grid */}
        <div className="grid grid-cols-12 grid-rows-2 gap-4 h-[450px] md:h-[600px] mb-16 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="col-span-12 md:col-span-8 row-span-2 relative group cursor-pointer" onClick={() => setOpen(true)}>
            <img src={images[0]} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" alt={item.title} />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          </div>
          <div className="hidden md:block col-span-4 relative group cursor-pointer" onClick={() => setOpen(true)}>
            <img src={images[1]} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="thumb" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          </div>
          <div className="hidden md:block col-span-2 relative group cursor-pointer" onClick={() => setOpen(true)}>
            <img src={images[2]} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="thumb" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
          </div>
          <div className="hidden md:block col-span-2 relative group cursor-pointer" onClick={() => setOpen(true)}>
            <div className="relative h-full w-full">
              <img src={images[3]} className="h-full w-full object-cover" alt="thumb" />
              <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex flex-col items-center justify-center text-white border-l border-white/10">
                <p className="text-3xl font-black">+15</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">View Gallery</p>
              </div>
            </div>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black/95 border-none backdrop-blur-xl">
            <div className="relative aspect-video">
               <img src={images[0]} alt={item.title} className="h-full w-full object-contain" />
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid gap-16 lg:grid-cols-[1fr_400px]">
          <div className="space-y-16">
            {/* Overview */}
            <section className="space-y-6">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-brand-red" /> Package Intelligence
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium max-w-3xl">
                {item.description}
              </p>
              
              <div className="grid sm:grid-cols-3 gap-5 pt-4">
                {[
                  { icon: Plane, label: "Flight", value: "Business Class", color: "text-brand-red", bg: "bg-brand-red/5" },
                  { icon: Hotel, label: "Stay", value: "5-Star Resort", color: "text-blue-500", bg: "bg-blue-500/5" },
                  { icon: Car, label: "Transfers", value: "Luxury Private", color: "text-emerald-500", bg: "bg-emerald-500/5" },
                ].map((stat) => (
                  <div key={stat.label} className="p-5 bg-card/50 backdrop-blur-sm rounded-3xl border border-border/50 shadow-sm flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                      <p className="text-sm font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Customization Section */}
            <section className="space-y-8 bg-card/40 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] border border-border/50 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                 <RefreshCw className="w-48 h-48 rotate-12" />
               </div>
               
               <div className="flex items-center justify-between relative z-10">
                 <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                   <RefreshCw className="w-6 h-6 text-brand-red" /> Tailor Your Experience
                 </h2>
                 <span className="text-[10px] font-black uppercase bg-muted px-3 py-1.5 rounded-full text-muted-foreground tracking-widest border border-border/50">Fully Customizable</span>
               </div>
               
               <div className="space-y-10 relative z-10">
                 {/* Hotel Swap */}
                 <div className="space-y-5">
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                     <Hotel className="w-4 h-4" /> Accommodation Upgrades
                   </p>
                   <div className="grid gap-4">
                     <div 
                      className={cn(
                        "p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                        !selectedHotelId ? "border-brand-red bg-brand-red/5" : "border-border/50 bg-background/50 hover:border-brand-red/30"
                      )}
                      onClick={() => setSelectedHotelId(null)}
                     >
                       <div className="flex items-center gap-4">
                         <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden relative">
                           <img src={images[3]} className="w-full h-full object-cover" alt="default" />
                         </div>
                         <div>
                           <p className="font-bold text-foreground">Standard Choice (Included)</p>
                           <p className="text-xs text-muted-foreground font-medium italic">Handpicked luxury stay included</p>
                         </div>
                       </div>
                       {!selectedHotelId ? <Check className="w-6 h-6 text-brand-red" /> : <div className="w-6 h-6 rounded-full border border-border group-hover:border-brand-red/50" />}
                     </div>

                     {item.alternativeHotels.map(h => (
                       <div 
                        key={h.id}
                        className={cn(
                          "p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                          selectedHotelId === h.id ? "border-brand-red bg-brand-red/5" : "border-border/50 bg-background/50 hover:border-brand-red/30"
                        )}
                        onClick={() => setSelectedHotelId(h.id)}
                       >
                         <div className="flex items-center gap-4">
                           <div className="w-14 h-14 rounded-2xl bg-muted overflow-hidden relative">
                             <img src={h.image || images[4]} className="w-full h-full object-cover" alt={h.name} />
                           </div>
                           <div>
                             <p className="font-bold text-foreground">{h.name}</p>
                             <div className="flex items-center gap-2">
                               <div className="flex text-amber-400">
                                 {Array.from({ length: h.rating || 5 }).map((_, i) => (
                                   <Star key={i} className="w-3 h-3 fill-current" />
                                 ))}
                               </div>
                               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter">Premium Upgrade</span>
                             </div>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="text-sm font-black text-brand-red">+{item.currency} {h.priceDiff}</p>
                           {selectedHotelId === h.id ? <Check className="w-6 h-6 text-brand-red ml-auto mt-1" /> : <div className="w-6 h-6 rounded-full border border-border group-hover:border-brand-red/50 ml-auto mt-1" />}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* Flight Swap */}
                 <div className="space-y-5">
                   <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                     <Plane className="w-4 h-4" /> Flight Preference
                   </p>
                   <div className="grid gap-4">
                     <div 
                      className={cn(
                        "p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                        !selectedFlightId ? "border-brand-red bg-brand-red/5" : "border-border/50 bg-background/50 hover:border-brand-red/30"
                      )}
                      onClick={() => setSelectedFlightId(null)}
                     >
                       <div>
                         <p className="font-bold text-foreground">Standard Direct Flight</p>
                         <p className="text-xs text-muted-foreground font-medium">Included in bundle price</p>
                       </div>
                       {!selectedFlightId ? <Check className="w-6 h-6 text-brand-red" /> : <div className="w-6 h-6 rounded-full border border-border group-hover:border-brand-red/50" />}
                     </div>

                     {item.alternativeFlights.map(f => (
                       <div 
                        key={f.id}
                        className={cn(
                          "p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                          selectedFlightId === f.id ? "border-brand-red bg-brand-red/5" : "border-border/50 bg-background/50 hover:border-brand-red/30"
                        )}
                        onClick={() => setSelectedFlightId(f.id)}
                       >
                         <div>
                           <p className="font-bold text-foreground">{f.airline} ({f.time})</p>
                           <p className="text-xs text-muted-foreground font-medium">Premium cabin experience</p>
                         </div>
                         <div className="text-right">
                           <p className="text-sm font-black text-brand-red">+{item.currency} {f.priceDiff}</p>
                           {selectedFlightId === f.id ? <Check className="w-6 h-6 text-brand-red ml-auto mt-1" /> : <div className="w-6 h-6 rounded-full border border-border group-hover:border-brand-red/50 ml-auto mt-1" />}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
            </section>

            {/* Itinerary */}
            <section className="space-y-8">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Clock className="w-6 h-6 text-brand-red" /> Experience Roadmap
              </h2>
              <div className="p-8 bg-card/40 backdrop-blur-sm rounded-[2.5rem] border border-border/50 shadow-sm">
                <ItineraryTimeline itinerary={item.itinerary} />
              </div>
            </section>

            {/* Inclusions & Exclusions */}
            <div className="grid gap-8 md:grid-cols-2">
              <section className="p-10 bg-emerald-500/5 rounded-[2.5rem] border border-emerald-500/10 space-y-6">
                <h3 className="text-xl font-black text-emerald-600 flex items-center gap-3">
                  <Check className="w-6 h-6" /> What's Included
                </h3>
                <ul className="space-y-4">
                  {item.inclusions?.map((i: any) => (
                    <li key={i.id} className="text-sm font-bold text-emerald-800/70 flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" /> {i.description}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="p-10 bg-muted/50 rounded-[2.5rem] border border-border/50 space-y-6">
                <h3 className="text-xl font-black text-foreground/80">Exclusions</h3>
                <ul className="space-y-4">
                  {item.exclusions?.map((e: any) => (
                    <li key={e.id} className="text-sm font-bold text-muted-foreground flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-border mt-1.5 shrink-0" /> {e.description}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>

          {/* Sticky Sidebar */}
          <aside className="space-y-8">
            <div className="sticky top-24 space-y-8">
              {/* Limited Time Deal Banner */}
              {item.isLimitedTimeDeal && item.dealEndsAt && (
                <div className="bg-linear-to-br from-slate-900 to-slate-800 p-8 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 bg-brand-red text-white text-[9px] font-black uppercase tracking-[0.2em] rotate-45 translate-x-6 translate-y-[-4px]">Limited</div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-brand-red/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-brand-red animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Limited Deal</p>
                      <p className="text-sm font-bold text-white">Ends strictly in:</p>
                    </div>
                  </div>
                  <CountdownTimer 
                    expiresAt={new Date(item.dealEndsAt)} 
                    className="gap-3"
                  />
                </div>
              )}

              {/* Price Card */}
              <div className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden">
                 <div className="p-10 space-y-10">
                   <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Current Selection</p>
                     <div className="flex items-baseline gap-2">
                       <p className="text-5xl font-black text-foreground">{item.currency} {totalPrice.toLocaleString()}</p>
                       <p className="text-xs font-bold text-muted-foreground">/ Per Adult</p>
                     </div>
                   </div>

                   {/* Price Breakdown Comparison */}
                   <div className="space-y-6">
                     <p className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground border-b border-border pb-3">Savings Transparency</p>
                     <div className="space-y-4">
                        <div className="flex justify-between text-xs font-bold text-muted-foreground">
                          <span>Component Total</span>
                          <span className="line-through">{item.currency} {itemisedTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black text-emerald-500 bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/10">
                          <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Bundle Discount</span>
                          <span>-{item.currency} {totalSavings.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm font-black text-foreground pt-2">
                          <span>Final Package Rate</span>
                          <span className="text-brand-red">{item.currency} {totalBase.toLocaleString()}</span>
                        </div>
                     </div>
                   </div>

                   {/* Group Booking Promo */}
                   <div className="p-5 bg-blue-600/5 rounded-3xl border border-blue-600/10 flex items-start gap-3">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div className="space-y-1">
                        <p className="text-xs font-black text-blue-600 uppercase tracking-wider">Group Advantage</p>
                        <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">Traveling as a group of 10+? An extra 15% discount will be applied automatically.</p>
                      </div>
                   </div>

                   <Link 
                    href={`/packages/book?id=${item.id}&hotelId=${selectedHotelId || 'default'}&flightId=${selectedFlightId || 'default'}`} 
                    className="flex items-center justify-center gap-3 w-full bg-brand-red text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-brand-red/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-red/40 transition-all group"
                   >
                     Complete Reservation <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1.5" />
                   </Link>
                   
                   <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-widest opacity-60">Handpicked Quality · Instant Confirmation</p>
                 </div>
              </div>

              {/* Assistance Card */}
              <div className="p-8 bg-foreground text-background rounded-[2.5rem] text-center space-y-4">
                 <p className="text-sm font-bold opacity-90">Need a custom itinerary for a large group?</p>
                 <button className="text-[10px] font-black uppercase tracking-[0.2em] border border-background/20 w-full py-4 rounded-2xl hover:bg-background/10 transition-all">Consult Destination Expert</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
