"use client";

import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { mockHotels } from "@/data/mock-hotels";
import { 
  Check, 
  X, 
  Star, 
  MapPin, 
  ArrowLeft, 
  Sparkles,
  Zap,
  ShieldCheck,
  Coffee,
  Wifi,
  Waves,
  Bike
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const COMPARISON_CRITERIA = [
  { label: "Star Rating", key: "starRating", type: "stars" },
  { label: "User Rating", key: "userRating", type: "rating" },
  { label: "Price / Night", key: "minPricePerNight", type: "price" },
  { label: "Free Cancellation", key: "rooms.0.freeCancellation", type: "boolean" },
  { label: "Breakfast Included", key: "rooms.0.breakfastIncluded", type: "boolean" },
  { label: "Pool", key: "amenities", type: "amenity", value: "Pool" },
  { label: "Free WiFi", key: "amenities", type: "amenity", value: "Free WiFi" },
  { label: "Gym", key: "amenities", type: "amenity", value: "Gym" },
  { label: "Spa", key: "amenities", type: "amenity", value: "Spa" },
];

export default function HotelComparePage() {
  const searchParams = useSearchParams();
  const ids = searchParams.get("ids")?.split(",") || [];
  
  const hotelsToCompare = mockHotels.filter(h => ids.includes(h.id));

  const getValue = (hotel: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], hotel);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 pt-24 pb-20">
        <div className="mx-auto max-w-screen-2xl px-4 md:px-6">
          {/* Header */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Link 
                href="/hotels/search" 
                className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-brand-red transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Search
              </Link>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Compare Properties</h1>
              <p className="text-sm text-muted-foreground font-medium">Analyze side-by-side to find your perfect stay.</p>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-brand-red/10 border border-brand-red/20 rounded-2xl">
              <Sparkles className="w-4 h-4 text-brand-red" />
              <span className="text-[10px] font-bold text-brand-red uppercase tracking-wider">AI Powered Insights</span>
            </div>
          </div>

          {hotelsToCompare.length === 0 ? (
            <div className="py-20 text-center space-y-6 bg-card/30 backdrop-blur-md rounded-[3rem] border border-border/50">
              <div className="w-20 h-20 bg-muted/50 rounded-[2rem] flex items-center justify-center mx-auto text-muted-foreground/30">
                <Zap className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <p className="text-xl font-bold">No hotels selected</p>
                <p className="text-sm text-muted-foreground">Select up to 3 hotels from the search results to compare them.</p>
              </div>
              <Link href="/hotels/search" className="inline-block bg-brand-red text-white px-8 py-3.5 rounded-2xl font-bold text-xs shadow-xl shadow-brand-red/20">
                Go to Search
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto pb-8 -mx-4 px-4 md:mx-0 md:px-0">
              <div className="min-w-[800px]">
                {/* Table Header: Hotel Info Cards */}
                <div className="grid grid-cols-[200px_repeat(3,1fr)] gap-6 mb-10">
                  <div className="flex flex-col justify-end pb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Comparison Criteria</p>
                  </div>
                  
                  {hotelsToCompare.map((hotel) => (
                    <div key={hotel.id} className="group relative space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-border/50 shadow-xl group-hover:border-brand-red/30 transition-all duration-500">
                        <img src={hotel.images[0]?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        {hotel.isBestForTrip && (
                          <div className="absolute top-4 left-4 bg-brand-red text-white text-[9px] font-bold px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 fill-current" /> AI Top Pick
                          </div>
                        )}
                      </div>
                      <div className="px-2 space-y-1">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-brand-red transition-colors">{hotel.name}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {hotel.city}, {hotel.country}
                        </p>
                      </div>
                      <Link 
                        href={`/hotels/${hotel.id}`} 
                        className="block w-full text-center py-3.5 bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl text-[10px] font-bold hover:bg-brand-red hover:text-white hover:border-brand-red transition-all shadow-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  ))}
                  
                  {/* Empty slots if less than 3 */}
                  {[...Array(3 - hotelsToCompare.length)].map((_, i) => (
                    <div key={i} className="rounded-[2.5rem] border-2 border-dashed border-border/50 bg-muted/10 flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-50">
                      <PlusCircle className="w-8 h-8 text-muted-foreground/30" />
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Add another property</p>
                    </div>
                  ))}
                </div>

                {/* Table Body: Rows */}
                <div className="space-y-3">
                  {COMPARISON_CRITERIA.map((criterion, idx) => (
                    <div 
                      key={idx} 
                      className="grid grid-cols-[200px_repeat(3,1fr)] gap-6 items-center p-6 bg-card/30 backdrop-blur-sm rounded-3xl border border-border/50 hover:bg-muted/20 hover:border-brand-red/10 transition-all group"
                    >
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{criterion.label}</span>
                      
                      {hotelsToCompare.map((hotel) => (
                        <div key={hotel.id} className="text-center">
                          {criterion.type === "stars" && (
                            <div className="flex justify-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("w-3.5 h-3.5", i < hotel.starRating ? "text-amber-500 fill-current" : "text-muted/20")} />
                              ))}
                            </div>
                          )}
                          
                          {criterion.type === "rating" && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-red/5 text-brand-red rounded-lg font-bold text-xs border border-brand-red/10">
                              {hotel.userRating.toFixed(1)} <Star className="w-3 h-3 fill-current" />
                            </div>
                          )}
                          
                          {criterion.type === "price" && (
                            <span className="text-sm font-bold">{hotel.currency} {hotel.minPricePerNight.toLocaleString()}</span>
                          )}
                          
                          {criterion.type === "boolean" && (
                            <div className="flex justify-center">
                              {getValue(hotel, criterion.key) ? (
                                <div className="p-1.5 bg-emerald-500/10 rounded-lg"><Check className="w-4 h-4 text-emerald-500" /></div>
                              ) : (
                                <div className="p-1.5 bg-muted/50 rounded-lg"><X className="w-4 h-4 text-muted-foreground/30" /></div>
                              )}
                            </div>
                          )}
                          
                          {criterion.type === "amenity" && (
                            <div className="flex justify-center">
                              {hotel.amenities.includes(criterion.value!) ? (
                                <div className="p-1.5 bg-blue-500/10 rounded-lg"><Check className="w-4 h-4 text-blue-500" /></div>
                              ) : (
                                <div className="p-1.5 bg-muted/50 rounded-lg"><X className="w-4 h-4 text-muted-foreground/30" /></div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function PlusCircle({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
