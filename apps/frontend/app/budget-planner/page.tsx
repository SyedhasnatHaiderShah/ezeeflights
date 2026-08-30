"use client";

import React, { useState, useMemo } from "react";
import { 
  Calculator, 
  Sparkles, 
  TrendingDown, 
  MapPin, 
  Clock, 
  Users, 
  CreditCard,
  ShieldCheck,
  Plane,
  Hotel as HotelIcon,
  ChevronRight
} from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { mockBudgetCombos } from "@/data/mock-ux";
import { cn } from "@/lib/utils";

export default function BudgetPlannerPage() {
  const [budget, setBudget] = useState([2000]);
  const [duration, setDuration] = useState(5);
  const [passengers, setPassengers] = useState(2);
  const [includeInsurance, setIncludeInsurance] = useState(true);
  const [includeTransfers, setIncludeTransfers] = useState(true);

  const filteredCombos = useMemo(() => {
    return mockBudgetCombos.filter(combo => combo.totalPrice <= budget[0]);
  }, [budget]);

  // Dynamic Cost Calculation for the selected "Best Match"
  const topMatch = filteredCombos[0] || mockBudgetCombos[0];
  const insuranceCost = includeInsurance ? 45 * passengers : 0;
  const transferCost = includeTransfers ? 30 * passengers : 0;
  const taxRate = 0.08;
  const subtotal = topMatch.totalPrice + insuranceCost + transferCost;
  const taxes = subtotal * taxRate;
  const grandTotal = subtotal + taxes;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      
      <main className="mx-auto max-w-screen-xl px-4 py-24 md:py-32">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-redmix/10 px-4 py-1.5 text-sm font-black uppercase tracking-widest text-redmix mb-4">
            <Calculator className="h-4 w-4" /> AI Budget Planner
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Plan your trip within <span className="text-redmix">Budget</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium italic">
            Set your total budget and we'll find the best flight + hotel combos for you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Controls & Results */}
          <div className="space-y-8">
            <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black uppercase tracking-widest text-slate-400">Total Budget</label>
                    <div className="text-2xl font-black text-redmix">
                      <CurrencyDisplay amount={budget[0]} currency="USD" showComparison={false} />
                    </div>
                  </div>
                  <Slider 
                    value={budget} 
                    onValueChange={setBudget} 
                    max={5000} 
                    step={100} 
                    className="py-4"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                    <span>$500</span>
                    <span>$5000+</span>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration (Days)</label>
                         <div className="flex items-center gap-3">
                            <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold">-</button>
                            <span className="font-black text-lg">{duration}</span>
                            <button onClick={() => setDuration(duration + 1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold">+</button>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Passengers</label>
                         <div className="flex items-center gap-3">
                            <button onClick={() => setPassengers(Math.max(1, passengers - 1))} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold">-</button>
                            <span className="font-black text-lg">{passengers}</span>
                            <button onClick={() => setPassengers(passengers + 1)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center font-bold">+</button>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            </section>

            <div className="space-y-4">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-amber-500" /> Best Matching Combos
              </h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredCombos.length > 0 ? (
                  filteredCombos.map((combo) => (
                    <div key={combo.id} className="group relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-redmix/10 transition-all duration-500">
                      <div className="aspect-video relative overflow-hidden">
                         <img src={combo.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                         <div className="absolute top-4 left-4">
                            <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white border border-white/20">
                               {combo.duration} Days Escape
                            </span>
                         </div>
                         <div className="absolute bottom-4 left-4 right-4">
                            <p className="text-white font-black text-xl leading-tight mb-1">{combo.title}</p>
                            <div className="flex items-center gap-1 text-white/70 text-xs font-bold">
                               <MapPin className="h-3 w-3" /> {combo.destination}
                            </div>
                         </div>
                      </div>
                      <div className="p-6">
                         <div className="flex items-center justify-between mb-4">
                            <div className="space-y-1">
                               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Bundle</p>
                               <CurrencyDisplay amount={combo.totalPrice} currency="USD" className="text-slate-900 dark:text-white" />
                            </div>
                            <Button size="sm" className="rounded-full bg-slate-900 dark:bg-white dark:text-slate-900 font-black">Details</Button>
                         </div>
                         <div className="space-y-2 border-t border-slate-50 dark:border-slate-800 pt-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                               <Plane className="h-3 w-3" /> {combo.flight}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                               <HotelIcon className="h-3 w-3" /> {combo.hotel}
                            </div>
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-12 text-center rounded-[2rem] border-2 border-dashed border-slate-200">
                     <p className="text-slate-400 font-black uppercase tracking-widest">No combos found within this budget</p>
                     <p className="text-sm text-slate-400 mt-2">Try increasing your budget or reducing passengers.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Calculator Sidebar */}
          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
               <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/30 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Calculator className="w-32 h-32 rotate-12" />
                  </div>
                  
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-redmix" /> Trip Cost Calculator
                  </h3>

                  <div className="space-y-6 relative z-10">
                     <div className="space-y-3">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                           <span>Base Bundle</span>
                           <span><CurrencyDisplay amount={topMatch.totalPrice} currency="USD" showComparison={false} className="text-white" /></span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={includeInsurance} 
                                onChange={(e) => setIncludeInsurance(e.target.checked)}
                                className="w-4 h-4 rounded accent-redmix"
                              />
                              <span className="text-xs font-bold">Travel Insurance</span>
                           </div>
                           <span className="text-xs font-bold text-slate-300">+${insuranceCost}</span>
                        </div>

                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <input 
                                type="checkbox" 
                                checked={includeTransfers} 
                                onChange={(e) => setIncludeTransfers(e.target.checked)}
                                className="w-4 h-4 rounded accent-redmix"
                              />
                              <span className="text-xs font-bold">VIP Transfers</span>
                           </div>
                           <span className="text-xs font-bold text-slate-300">+${transferCost}</span>
                        </div>
                     </div>

                     <div className="h-px bg-white/10" />

                     <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                           <span>Subtotal</span>
                           <span>${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-400">
                           <span>Taxes & Fees (8%)</span>
                           <span>${taxes.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="pt-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Estimated Total Price</p>
                        <CurrencyDisplay amount={grandTotal} currency="USD" className="text-4xl text-white font-black" />
                     </div>

                     <Button className="w-full h-14 rounded-2xl bg-redmix hover:bg-redmix/90 text-white font-black text-lg shadow-xl shadow-redmix/20">
                        Secure This Bundle <ChevronRight className="ml-2 h-5 w-5" />
                     </Button>

                     <div className="flex items-center justify-center gap-2 pt-4">
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Price Lock Guarantee</span>
                     </div>
                  </div>
               </section>

               <div className="p-6 bg-amber-50 dark:bg-amber-950/20 rounded-[2rem] border border-amber-100 dark:border-amber-900/50 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-amber-800 dark:text-amber-500 text-sm">Save with Bundle!</p>
                    <p className="text-xs text-amber-700/70 dark:text-amber-600/70 font-medium">Bundling flights and hotels typically saves you $200-$400 on international trips.</p>
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
