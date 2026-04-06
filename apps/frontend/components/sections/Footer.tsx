"use client";

import { Phone, Mail } from "lucide-react"
import { Facebook, Twitter, Instagram, Linkedin } from "@/components/ui/brand-icons"
import { AppIcon } from "@/components/ui/app-icon"
 
export function Footer() {
  return (
    <footer className="w-full bg-muted/40 dark:bg-background pt-16 pb-10 px-6 md:px-12 border-t border-border mt-auto transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-14">
 
        {/* Top 4 Columns - High Density Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
 
          {/* Logo & Mission (Attractive Branding) */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <h3 className="text-xl font-black text-brand-red font-display tracking-tighter uppercase italic">
                Ezee Flights
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 border-l-2 border-brand-red pl-2">
                ISO 9001:2015 Certified
              </p>
            </div>
            <p className="font-medium text-[11.5px] text-muted-foreground leading-relaxed transition-colors opacity-90 pr-4">
              Your premium gateway to the world's most popular destinations. We provide unbeatable value and trusted travel services worldwide.
            </p>
          </div>
 
          {/* Top Airlines List */}
          <div className="space-y-4">
            <h4 className="font-bold text-[13px] text-foreground font-display tracking-widest uppercase border-b border-border/60 pb-2 w-fit pr-8">Airlines</h4>
            <ul className="space-y-2.5 font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
              {["Alaska Airlines", "JetBlue", "Southwest Airlines", "Delta Airlines", "Aeromexico"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-brand-red transition-all hover:translate-x-1 block w-fit">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
 
          {/* Contact (AppIcon Modernization) */}
          <div className="space-y-4">
            <h4 className="font-bold text-[13px] text-foreground font-display tracking-widest uppercase border-b border-border/60 pb-2 w-fit pr-8">Contact</h4>
            <ul className="space-y-4 font-bold text-[11px] text-muted-foreground uppercase tracking-wider">
              <li className="flex items-start gap-3.5 group cursor-pointer">
                <AppIcon icon={Phone} isActive={false} className="w-8 h-8 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-foreground group-hover:text-brand-red transition-colors">+1-888-604-0198</span>
                  <span className="text-[9px] text-muted-foreground/50 opacity-80">24/7 Available (USA)</span>
                </div>
              </li>
              <li className="flex items-start gap-3.5 group cursor-pointer">
                <AppIcon icon={Mail} isActive={false} className="w-8 h-8 shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-foreground group-hover:text-brand-red transition-colors">sales@ezeeflights.com</span>
                  <span className="text-[9px] text-muted-foreground/50 opacity-80">Online Support 24/7</span>
                </div>
              </li>
            </ul>
          </div>
 
          {/* Follow Us (AppIcon Social) */}
          <div className="space-y-5">
            <h4 className="font-bold text-[13px] text-foreground font-display tracking-widest uppercase border-b border-border/60 pb-2 w-fit pr-8">Follow</h4>
            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((IconComponent, idx) => (
                <AppIcon 
                  key={idx} 
                  icon={IconComponent} 
                  isActive={false} 
                  className="w-9 h-9 hover:-translate-y-1"
                />
              ))}
            </div>
          </div>
        </div>
 
        {/* Global Sites & Payment Providers Segment (Elite Brand Bar) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-6 border-y border-border/60 gap-8 bg-card/10 backdrop-blur-sm rounded-2xl px-6 -mx-6 md:mx-0">
          <div className="flex items-center gap-6">
            <h5 className="font-bold text-foreground text-[12px] uppercase tracking-widest border-r border-border pr-6">Global</h5>
            <div className="flex items-center gap-4 text-2xl">
              {["🇬🇧", "🇨🇦", "🇦🇪"].map((flag) => (
                <span key={flag} className="hover:scale-125 cursor-pointer transition-transform drop-shadow-sm">{flag}</span>
              ))}
            </div>
          </div>
 
          {/* Unified Attractive Partner Logos */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 pr-4 border-r border-border/60">
              <span className="font-black text-[12px] bg-foreground text-background rounded-full w-7 h-7 flex items-center justify-center scale-90">A</span>
              <span className="font-black text-[13px] italic text-muted-foreground/80 tracking-tighter">ARC</span>
            </div>
            
            <span className="font-bold text-muted-foreground/80 text-[11px] uppercase tracking-widest pr-4 border-r border-border/60 leading-none">tico.ca</span>
            
            <div className="flex items-center gap-4">
              <span className="font-black text-brand-blue text-[13px] italic hover:text-brand-red transition-colors">PayPal</span>
              <span className="font-black text-muted-foreground/60 text-[14px] italic tracking-tighter">VISA</span>
              <span className="font-black text-brand-red text-[11px] bg-brand-red/5 px-2.5 py-1 border border-brand-red/20 rounded uppercase">AMEX</span>
              <span className="font-black text-foreground text-[13px] italic tracking-tight">affirm</span>
            </div>
 
            <div className="flex items-center gap-2 pl-4 border-l border-border/60">
              <div className="bg-brand-red text-white rounded-full w-5 h-5 flex items-center justify-center font-black text-[11px] shadow-sm shadow-brand-red/20 shrink-0">$</div>
              <span className="text-brand-red font-black text-[11px] uppercase tracking-widest whitespace-nowrap">Full Refund</span>
            </div>
          </div>
        </div>
 
        {/* Bottom Copyright */}
        <div className="text-center pt-2">
          <p className="font-bold text-[9.5px] text-muted-foreground/60 tracking-[0.2em] uppercase transition-colors">
            &copy; {new Date().getFullYear()} Ezeeflights &bull; Part of Ezeewellness &bull; All Rights Reserved
          </p>
        </div>
 
      </div>
    </footer>
  )
}
