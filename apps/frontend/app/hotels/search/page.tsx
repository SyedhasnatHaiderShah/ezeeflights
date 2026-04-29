'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { HotelSearchContainer } from '@/components/hotels/HotelSearchContainer';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { HotelFilters } from '@/components/hotels/HotelFilters';
import { HotelCard } from '@/components/hotels/HotelCard';
import { HotelMapView } from '@/components/hotels/HotelMapView';
import { CompareWidget } from '@/components/hotels/CompareWidget';
import { mockHotels } from '@/data/mock-hotels';
import { List, Map as MapIcon, SlidersHorizontal, ChevronDown, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HotelSearchPage() {
  const searchParams = useSearchParams();
  const location = searchParams.get('location') || '';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<any>({});
  const [comparedHotelIds, setComparedHotelIds] = useState<string[]>([]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const filteredHotels = useMemo(() => {
    return mockHotels.filter(hotel => {
      if (filters.selectedTypes?.length > 0 && !filters.selectedTypes.includes(hotel.type)) return false;
      if (filters.selectedRatings?.length > 0 && !filters.selectedRatings.includes(hotel.starRating)) return false;
      if (filters.maxPrice && hotel.minPricePerNight > filters.maxPrice) return false;
      if (filters.freeCancellation && !hotel.rooms.some(r => r.freeCancellation)) return false;
      if (filters.breakfastIncluded && !hotel.rooms.some(r => r.breakfastIncluded)) return false;
      return true;
    });
  }, [filters]);

  const comparedHotels = useMemo(() => {
    return mockHotels.filter(h => comparedHotelIds.includes(h.id));
  }, [comparedHotelIds]);

  const handleCompareToggle = (hotelId: string, selected: boolean) => {
    if (selected) {
      if (comparedHotelIds.length < 3) {
        setComparedHotelIds(prev => [...prev, hotelId]);
      }
    } else {
      setComparedHotelIds(prev => prev.filter(id => id !== hotelId));
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-brand-red/10 selection:text-brand-red">
      <Header />

      <main className="flex-1 pt-20">
        {/* Search Header Section */}
        <div className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-border/50 backdrop-blur-md">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 md:px-6">
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">Find your perfect stay</h1>
              <p className="text-sm text-muted-foreground font-medium">Explore the best hotels in {location || 'your destination'}</p>
            </div>
            <HotelSearchContainer />
          </div>
        </div>

        <div className="mx-auto w-full max-w-screen-2xl px-4 py-8 md:px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Filters */}
            <aside className={cn(
              "lg:w-72 shrink-0 lg:block",
              showFiltersMobile ? "fixed inset-0 z-50 bg-background p-6 overflow-y-auto" : "hidden"
            )}>
              <div className="sticky top-28">
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <h2 className="text-lg font-bold">Filters</h2>
                  <button onClick={() => setShowFiltersMobile(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
                    <ChevronDown className="w-6 h-6 rotate-180" />
                  </button>
                </div>
                <HotelFilters onFilterChange={setFilters} />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              
              {/* Toolbar */}
              <div className="flex items-center justify-between bg-card/40 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold">
                    {filteredHotels.length} {filteredHotels.length === 1 ? 'Property' : 'Properties'} Found
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    {checkIn} — {checkOut}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowFiltersMobile(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-xs font-bold hover:bg-muted/80 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </button>

                  <div className="flex p-1 bg-muted/50 rounded-xl border border-border/50">
                    <button 
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                        viewMode === 'list' ? "bg-background text-brand-red shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" /> List
                    </button>
                    <button 
                      onClick={() => setViewMode('map')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                        viewMode === 'map' ? "bg-background text-brand-red shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <MapIcon className="w-3.5 h-3.5" /> Map
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Toggle */}
              {viewMode === 'list' ? (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                  {filteredHotels.map(hotel => (
                    <HotelCard 
                      key={hotel.id} 
                      hotel={hotel} 
                      checkInDate={checkIn} 
                      checkOutDate={checkOut}
                      isCompared={comparedHotelIds.includes(hotel.id)}
                      onCompareToggle={handleCompareToggle}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl overflow-hidden border border-border/50 shadow-2xl h-[700px] relative">
                  <HotelMapView hotels={filteredHotels} />
                </div>
              )}

              {filteredHotels.length === 0 && (
                <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border/60">
                  <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MapIcon className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-bold">No properties found</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Adjust your filters or search area to find more options for your stay.</p>
                  <button 
                    onClick={() => setFilters({})}
                    className="mt-6 text-xs font-bold text-brand-red hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <CompareWidget 
        selectedHotels={comparedHotels} 
        onRemove={(id) => setComparedHotelIds(prev => prev.filter(hid => hid !== id))}
        onCompare={() => window.location.href = `/hotels/compare?ids=${comparedHotelIds.join(',')}`}
      />

      <Footer />
    </div>
  );
}

