"use client";

import Link from 'next/link';
import { AppImage } from '@/components/ui/app-image';
import { MockPackage } from '@/data/mock-packages';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { Clock, MapPin, Sparkles, ShieldCheck, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PackageCard({ item }: { item: MockPackage }) {
  const isDeal = item.isLimitedTimeDeal && item.dealEndsAt;

  return (
    <article className="group overflow-hidden rounded-3xl border border-border/50 bg-card/40 backdrop-blur-md shadow-sm transition-all duration-500 hover:shadow-2xl hover:border-brand-red/30 hover:-translate-y-1">
      <div className="relative aspect-[16/11] overflow-hidden">
        <AppImage
          src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&q=80&w=1200'}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {item.isB2B && (
            <div className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
              <Globe className="w-3 h-3" /> Agency Exclusive
            </div>
          )}
          {item.agencyTag && !item.isB2B && (
            <div className="bg-slate-900/80 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md border border-white/10">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> {item.agencyTag}
            </div>
          )}
        </div>

        {/* Countdown Overlay */}
        {isDeal && (
          <div className="absolute bottom-4 left-4 right-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-2xl p-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-red/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-brand-red animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-white uppercase tracking-tight">Ends in:</span>
              </div>
              <CountdownTimer 
                expiresAt={new Date(item.dealEndsAt!)} 
                compact 
                className="gap-1.5"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold text-brand-red uppercase tracking-[0.1em]">{item.country}</p>
            <div className="flex gap-1.5">
              {item.themes.slice(0, 2).map((theme) => (
                <span key={theme} className="text-[9px] font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border/50">
                  {theme}
                </span>
              ))}
            </div>
          </div>
          <h3 className="text-lg font-bold text-foreground leading-snug group-hover:text-brand-red transition-colors duration-300 line-clamp-1">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <span>{item.destination} • {item.durationDays} Days</span>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Per Person</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-foreground">
                {item.currency} {item.basePrice.toLocaleString()}
              </span>
              <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                -{item.savingsPercentage}%
              </span>
            </div>
          </div>
          
          <Link 
            href={`/packages/${item.slug}`} 
            className="p-3 bg-brand-red text-white rounded-2xl font-bold text-xs hover:shadow-xl hover:shadow-brand-red/30 transition-all active:scale-95 flex items-center gap-2 group/btn"
          >
            Explore <Sparkles className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
}
