"use client";

import { useState, useMemo, useEffect } from 'react';
import { HotelSearchContainer } from '@/components/hotels/HotelSearchContainer';
import { Header } from '@/components/sections/Header';
import { Footer } from '@/components/sections/Footer';
import { HotelFilters } from '@/components/hotels/HotelFilters';
import { HotelCard } from '@/components/hotels/HotelCard';
import { HotelMapView } from '@/components/hotels/HotelMapView';
import { HotelCompareWidget } from '@/components/hotels/HotelCompareWidget';
import { List, Map as MapIcon, SlidersHorizontal, ChevronDown, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { FlightAiSuggestionsPanel } from '@/app/flights/result/FlightAiSuggestionsPanel';
import { useLoadingStore } from '@/lib/store/use-loading-store';

export function HotelResultsContainer({ initialHotels, location, checkIn, checkOut }: any) {
  const { t } = useTranslation();
  const { isLoading, stopLoading } = useLoadingStore();
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<any>({});
  const [comparedHotelIds, setComparedHotelIds] = useState<string[]>([]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  useEffect(() => {
    if (isLoading) {
      stopLoading();
    }
  }, [isLoading, stopLoading]);

  const filteredHotels = useMemo(() => {
    return initialHotels.filter((hotel: any) => {
      if (filters.selectedTypes?.length > 0 && !filters.selectedTypes.includes(hotel.type)) return false;
      if (filters.selectedRatings?.length > 0 && !filters.selectedRatings.includes(hotel.starRating)) return false;
      if (filters.maxPrice && hotel.minPricePerNight > filters.maxPrice) return false;
      if (filters.freeCancellation && !hotel.rooms?.some((r: any) => r.freeCancellation)) return false;
      if (filters.breakfastIncluded && !hotel.rooms?.some((r: any) => r.breakfastIncluded)) return false;
      return true;
    });
  }, [filters, initialHotels]);

  const comparedHotels = useMemo(() => {
    return initialHotels.filter((h: any) => comparedHotelIds.includes(h.id));
  }, [comparedHotelIds, initialHotels]);

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
          <div className="mx-auto w-full max-w-[1440px] px-4 py-8 md:px-6">
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">{t("Find your perfect stay")}</h1>
              <p className="text-sm text-muted-foreground font-medium">{t("Explore the best hotels in {{location}}", { location: location || t("your destination") })}</p>
            </div>
            <HotelSearchContainer />
          </div>
        </div>

        <div className="w-full max-w-[1440px] mx-auto px-4 md:px-6 pt-6 pb-0 flex-1 min-h-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_320px] lg:grid-cols-[240px_minmax(0,1fr)_380px] gap-6 h-full min-h-0">
            
            {/* Sidebar Filters */}
            <aside className={cn(
              "lg:block shrink-0 h-full overflow-y-auto no-scrollbar",
              showFiltersMobile ? "fixed inset-0 z-50 bg-background p-6" : "hidden"
            )}>
              <div className="sticky top-28">
                <div className="flex items-center justify-between mb-6 lg:hidden">
                  <h2 className="text-lg font-bold">{t("Filters")}</h2>
                  <button onClick={() => setShowFiltersMobile(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
                    <ChevronDown className="w-6 h-6 rotate-180" />
                  </button>
                </div>
                <HotelFilters onFilterChange={setFilters} />
              </div>
            </aside>

            {/* Main Content */}
            <div className="space-y-6 overflow-y-auto no-scrollbar h-full pr-1 flex flex-col min-h-0">
              
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-2xl border border-border bg-card px-4 py-2 shadow-sm mb-3">
                <div className="space-y-1">
                  <h2 className="text-sm font-bold">
                    {filteredHotels.length} {filteredHotels.length === 1 ? t('Property') : t('Properties')} {t('Found')}
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {checkIn} — {checkOut}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowFiltersMobile(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-xs font-bold hover:bg-muted/80 transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" /> {t("Filters")}
                  </button>

                  <div className="flex p-1 bg-muted/50 rounded-[10px] border border-border/50">
                    <button 
                      onClick={() => setViewMode('list')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        viewMode === 'list' ? "bg-background text-brand-red shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-border/50" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" /> {t("List")}
                    </button>
                    <button 
                      onClick={() => setViewMode('map')}
                      className={cn(
                        "flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                        viewMode === 'map' ? "bg-background text-brand-red shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-border/50" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <MapIcon className="w-3.5 h-3.5" /> {t("Map")}
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Toggle */}
              {viewMode === 'list' ? (
                <div className="grid gap-4">
                  {filteredHotels.map((hotel: any) => (
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
                <div className="rounded-[20px] overflow-hidden border border-border/50 shadow-sm min-h-[500px] h-[70vh] relative">
                  <HotelMapView hotels={filteredHotels} />
                </div>
              )}

              {filteredHotels.length === 0 && (
                <div className="text-center py-24 bg-card/20 rounded-3xl border border-dashed border-border/60">
                  <div className="w-16 h-16 bg-muted/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MapIcon className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="text-lg font-bold">{t("No properties found")}</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">{t("Adjust your filters or search area to find more options for your stay.")}</p>
                  <button 
                    onClick={() => setFilters({})}
                    className="mt-6 text-xs font-bold text-brand-red hover:underline"
                  >
                    {t("Clear all filters")}
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: AI Suggestions Panel */}
            <aside className="hidden md:block h-full overflow-y-auto no-scrollbar pb-6 pl-2">
              <div className="sticky top-0 bg-background/80 backdrop-blur-md pb-3 pt-1 z-10">
                 <h3 className="font-bold px-1 text-sm">{t("AI Recommendations")}</h3>
              </div>
              <FlightAiSuggestionsPanel flights={[]} origin={""} destination={location} variant="sidebar" domain="hotels" />
            </aside>

          </div>
        </div>
      </main>

      <HotelCompareWidget 
        selectedHotels={comparedHotels} 
        onRemove={(id: string) => setComparedHotelIds(prev => prev.filter(hid => hid !== id))}
        onCompare={() => window.location.href = `/hotels/compare?ids=${comparedHotelIds.join(',')}`}
      />

      <Footer />
    </div>
  );
}
