"use client";

import * as React from 'react';
import { motion } from 'framer-motion';
import { AIRecommendationsPanel } from '@/components/destinations/AIRecommendationsPanel';
import { AttractionCard } from '@/components/destinations/AttractionCard';
import { CategoryFilter } from '@/components/destinations/CategoryFilter';
import { DestinationHero } from '@/components/destinations/DestinationHero';
import { MapClusterView } from '@/components/destinations/MapClusterView';
import { AITravelAlert, VisaHealthCard } from '@/components/insights/VisaHealthCard';
import { PracticalInfoCard, CostGuideCard } from '@/components/insights/PracticalInfoCard';
import { ClimateChart, AIComparisonTool } from '@/components/insights/ClimateChart';
import { mockInsights, comparisonData } from '@/data/mock-insights';
import { Sparkles, Info } from 'lucide-react';

export default function CityInsightsPage({ params }: { params: any }) {
  const resolvedParams = React.use(params) as { slug: string };
  const slug = resolvedParams.slug;
  const insight = mockInsights[slug.toLowerCase()] || mockInsights['dubai'];

  // Simulated city data (matching the old API structure but using mock insight)
  const cityData = {
    name: insight.name,
    description: `Experience the best of ${insight.name}. From cultural landmarks to modern marvels.`,
    heroImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=2000",
    countryName: insight.country,
    attractions: [
      { id: '1', name: 'Burj Khalifa', image: 'https://images.unsplash.com/photo-1597659840241-37e2b9c2f55f?q=80&w=400' },
      { id: '2', name: 'Dubai Mall', image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=400' },
    ],
    highlights: ['Luxury', 'Shopping', 'Architecture'],
    clusters: [{ latBucket: 25.2, lngBucket: 55.3, count: 12 }]
  };

  return (
    <section className="space-y-24 pb-24 pt-10">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200"
      >
        <DestinationHero
          title={cityData.name}
          subtitle={cityData.description}
          image={cityData.heroImage}
        />
      </motion.div>

      {/* AI Travel Alert Banner */}
      <div className="mx-auto max-w-4xl px-4">
        <AITravelAlert alert={insight.health.alert} />
      </div>

      <div className="mx-auto max-w-screen-xl px-4 md:px-6 space-y-24">
        
        {/* Entry & Practical Section */}
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-red">
                <Sparkles className="h-4 w-4" />
                Intelligence Dashboard
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Essential <span className="text-brand-red">Travel Insights</span></h2>
              <p className="text-lg font-medium text-slate-500">Verified entry requirements, health advisories, and cultural norms.</p>
            </div>
            
            <VisaHealthCard visa={insight.visa} health={insight.health} />
            <PracticalInfoCard practical={insight.practical} />
          </motion.div>

          <motion.aside 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <CostGuideCard costs={insight.costs} />
            
            <div className="rounded-[2rem] bg-brand-red p-8 text-white shadow-2xl shadow-brand-red/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-24 h-24" />
               </div>
               <h3 className="text-xl font-black mb-4 relative z-10">Pro Planner Tip</h3>
               <p className="font-bold text-white/80 leading-relaxed mb-8 italic relative z-10">
                 "Dubai is most comfortable between October and March. If you visit in summer, stick to the world-class indoor attractions like the Museum of the Future."
               </p>
               <button className="w-full rounded-2xl bg-white py-4 font-black text-brand-red transition-all hover:shadow-xl active:scale-95 relative z-10">
                 View Smart Itinerary
               </button>
            </div>

            <div className="flex items-center gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
               <Info className="h-6 w-6 text-slate-400" />
               <p className="text-xs font-bold text-slate-500">Data updated 12 hours ago. Source: Ezee Global Intelligence.</p>
            </div>
          </motion.aside>
        </div>

        {/* Climate & Seasonality */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
        >
          <ClimateChart climate={insight.climate} />
        </motion.div>

        {/* AI Comparison Section */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
        >
          <AIComparisonTool comparison={comparisonData} />
        </motion.div>

        {/* Attractions Teaser (Legacy integration) */}
        <div className="space-y-8 border-t border-slate-100 pt-24">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Top Attractions</h2>
            <button className="text-sm font-black text-brand-red uppercase tracking-widest">Explore All</button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cityData.attractions.map((attraction) => (
              <AttractionCard key={attraction.id} attraction={attraction} />
            ))}
          </div>
        </div>

        <MapClusterView clusters={cityData.clusters} />

      </div>
    </section>
  );
}
