'use client';
import { Suspense } from 'react';


import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BookingSummary } from '@/components/packages/BookingSummary';
import { TravelerForm } from '@/components/packages/TravelerForm';
import { mockPackages } from '@/data/mock-packages';
import { 
  ShieldCheck, 
  ChevronRight, 
  Info, 
  Sparkles,
  Users,
  CreditCard,
  Lock,
  ArrowRight,
  Shield,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

function PackageBookingPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const packageId = useMemo(() => searchParams.get('id') ?? '', [searchParams]);
  const hotelId = searchParams.get('hotelId');
  const flightId = searchParams.get('flightId');

  const [counts, setCounts] = useState({ adult: 1, child: 0, infant: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const item = useMemo(() => {
    return mockPackages.find(p => p.id === packageId) || mockPackages[0];
  }, [packageId]);

  const selectedHotel = useMemo(() => {
    return item.alternativeHotels.find(h => h.id === hotelId);
  }, [hotelId, item]);

  const selectedFlight = useMemo(() => {
    return item.alternativeFlights.find(f => f.id === flightId);
  }, [flightId, item]);

  // Pricing Logic
  const baseAdultPrice = item.basePrice + (selectedHotel?.priceDiff || 0) + (selectedFlight?.priceDiff || 0);
  const pricing = {
    adultPrice: baseAdultPrice,
    childPrice: baseAdultPrice * 0.75,
    infantPrice: baseAdultPrice * 0.2
  };

  const totalTravelers = counts.adult + counts.child + counts.infant;
  const isGroupBooking = totalTravelers >= 10;
  
  const subtotal = (counts.adult * pricing.adultPrice) + (counts.child * pricing.childPrice) + (counts.infant * pricing.infantPrice);
  const groupDiscount = isGroupBooking ? subtotal * 0.15 : 0; // 15% discount for 10+ people
  const finalTotal = subtotal - groupDiscount;

  const itemisedTotal = (item.itemisedPricing.flights + item.itemisedPricing.hotel + item.itemisedPricing.transfers + item.itemisedPricing.activities) * totalTravelers;
  const totalBundleSavings = itemisedTotal - finalTotal;

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 2000));
      router.push('/payment/success');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="mx-auto max-w-screen-xl px-4 py-24 md:py-32">
        <div className="grid gap-16 lg:grid-cols-[1fr_420px]">
          
          <div className="space-y-12">
            <div className="space-y-4">
              <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <span>Discovery</span>
                <ChevronRight className="w-3 h-3" />
                <span>Customization</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-brand-red">Reservation</span>
              </nav>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground flex items-center gap-4">
                Finalize <span className="text-brand-red underline decoration-brand-red/20 underline-offset-8">Booking</span>
              </h1>
              <p className="text-lg text-muted-foreground font-medium max-w-xl">
                One final step to secure your handpicked bundle. Review your traveler details and complete your reservation.
              </p>
            </div>

            {/* Traveler Configuration */}
            <section className="bg-card/40 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] border border-border/50 shadow-2xl space-y-10">
              <div className="flex items-center justify-between border-b border-border/50 pb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-brand-red" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight">Traveler Composition</h2>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Adjust group size</p>
                    </div>
                 </div>
                 <div className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border border-emerald-500/20">
                   Bundle Rate Locked
                 </div>
              </div>

              <TravelerForm counts={counts} onChange={setCounts} />

              {isGroupBooking && (
                <div className="p-8 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 flex items-start gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                    <Sparkles className="w-8 h-8 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-emerald-600">Group Advantage Applied!</p>
                    <p className="text-sm text-muted-foreground font-medium mt-1">
                      As a group of {totalTravelers}, you've unlocked an additional 15% discount on the entire bundle.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Security Assurance */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-8 bg-muted/50 rounded-[2rem] border border-border/50">
                <Lock className="w-8 h-8 text-muted-foreground opacity-50" />
                <div>
                  <p className="font-black text-sm text-foreground">Secure Encryption</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">256-bit SSL Protected</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-8 bg-muted/50 rounded-[2rem] border border-border/50">
                <Shield className="w-8 h-8 text-muted-foreground opacity-50" />
                <div>
                  <p className="font-black text-sm text-foreground">Buyer Protection</p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Verified by EzeeFlights</p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Sidebar */}
          <aside className="space-y-8">
            <div className="sticky top-32 space-y-8">
               <div className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-border/50 shadow-2xl overflow-hidden">
                  <div className="h-48 relative">
                    <img src={item.thumbnailUrl || ''} className="w-full h-full object-cover" alt="package" />
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">{item.country}</p>
                      <p className="text-xl font-black text-white leading-tight">{item.title}</p>
                    </div>
                  </div>

                  <div className="p-10 space-y-10">
                     <BookingSummary counts={counts} pricing={pricing} />

                     <div className="space-y-5 pt-8 border-t border-border/50">
                        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                          <span>Bundle Subtotal</span>
                          <span>{item.currency} {subtotal.toLocaleString()}</span>
                        </div>
                        {isGroupBooking && (
                          <div className="flex justify-between items-center text-xs font-black text-emerald-500 bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                            <span className="flex items-center gap-2">Group Discount <Sparkles className="w-3.5 h-3.5" /></span>
                            <span>-{item.currency} {groupDiscount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-end pt-4">
                           <div className="space-y-1">
                             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total to Pay</p>
                             <p className="text-4xl font-black text-foreground tracking-tighter">{item.currency} {finalTotal.toLocaleString()}</p>
                           </div>
                        </div>
                     </div>

                     <div className="p-6 bg-brand-red/5 rounded-[2rem] border border-brand-red/10 relative overflow-hidden">
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] font-black text-brand-red uppercase tracking-widest">Total Value Saved</p>
                            <Sparkles className="w-4 h-4 text-brand-red" />
                          </div>
                          <p className="text-3xl font-black text-brand-red">{item.currency} {totalBundleSavings.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tight mt-1">Vs. Independent component bookings</p>
                        </div>
                        <Sparkles className="absolute -bottom-4 -right-4 w-24 h-24 text-brand-red opacity-[0.03] pointer-events-none" />
                     </div>

                     <button 
                      onClick={onSubmit}
                      disabled={isSubmitting}
                      className="flex items-center justify-center gap-3 w-full bg-foreground text-background py-6 rounded-[2rem] font-black text-xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all disabled:opacity-50 group"
                     >
                       {isSubmitting ? (
                         <Loader2 className="w-6 h-6 animate-spin" />
                       ) : (
                         <>
                           Pay Securely <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                         </>
                       )}
                     </button>

                     <div className="flex items-center justify-center gap-2 pt-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Price Protected for 15:00</span>
                     </div>
                  </div>
               </div>
            </div>
          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// Suspense-wrapped
export default function PackageBookingPage(props: any) {
  return <Suspense fallback={null}><PackageBookingPageContent {...props} /></Suspense>;
}
