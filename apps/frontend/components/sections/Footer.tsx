"use client"

import * as React from "react"
import { Phone, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-muted dark:bg-card pt-20 pb-8 px-6 md:px-12 border-t border-border mt-auto transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto space-y-16">

        {/* Top 4 Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Company */}
          <div className="space-y-6">
            <h4 className="font-bold text-base text-foreground font-display tracking-tight transition-colors">Company</h4>
            <ul className="space-y-3.5 font-medium text-xs text-muted-foreground transition-colors">
              <li><a href="#" className="hover:text-brand-red transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Review</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Terms and conditions</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Transaction & Refund Policy</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Top Airlines */}
          <div className="space-y-6">
            <h4 className="font-bold text-base text-foreground font-display tracking-tight transition-colors">Top Airlines</h4>
            <ul className="space-y-3.5 font-medium text-xs text-muted-foreground transition-colors">
              <li><a href="#" className="hover:text-brand-red transition-colors">Alaska Airlines</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">JetBlue Airlines</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Southwest Airlines</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Delta Airlines</a></li>
              <li><a href="#" className="hover:text-brand-red transition-colors">Aeromexico Airlines</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="font-bold text-base text-foreground font-display tracking-tight transition-colors">Contact</h4>
            <ul className="space-y-6 font-medium text-xs text-muted-foreground transition-colors">
              <li className="flex items-start gap-3">
                <span className="text-xl leading-none">🇺🇸</span>
                <div className="flex flex-col gap-2">
                  <span>945 Taraval Street, San Francisco, CA 94116 United States of America</span>
                  <span className="flex items-center gap-2 font-bold text-sm text-foreground transition-colors">
                    <Phone className="w-4 h-4 text-brand-red" /> +1-888-604-0198
                    <span className="font-medium text-xs text-muted-foreground/50">(24x7 Available)</span>
                  </span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl leading-none">🇦🇪</span>
                <div className="flex flex-col gap-2">
                  <span>17th floor 1703 Venture Zone Business Center Fahidi Heights Khalid Bin Al Waleed Street Bur Dubai 44320</span>
                  <span className="flex items-center gap-2 font-bold text-sm text-foreground transition-colors">
                    <Phone className="w-4 h-4 text-brand-red" /> +971-04-254-3652
                    <span className="font-medium text-xs text-muted-foreground/50">(24x7 Available)</span>
                  </span>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-red transition-colors" />
                <a href="mailto:sales@ezeeflights.com" className="hover:text-brand-red transition-colors">sales@ezeeflights.com</a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div className="space-y-6">
            <h4 className="font-bold text-base text-foreground font-display tracking-tight transition-colors">Follow Us</h4>
            <div className="flex items-center gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border hover:bg-brand-red hover:text-white text-foreground flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border hover:bg-brand-red hover:text-white text-foreground flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border hover:bg-brand-red hover:text-white text-foreground flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background border border-border hover:bg-brand-red hover:text-white text-foreground flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-1 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Global Sites & Payment Providers Segment */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-8 border-y border-border gap-8">
          <div className="space-y-3">
            <h5 className="font-bold text-foreground text-base transition-colors">Our Global Sites</h5>
            <div className="flex items-center gap-3 text-3xl">
              <span className="hover:scale-110 cursor-pointer transition-transform drop-shadow-sm">🇬🇧</span>
              <span className="hover:scale-110 cursor-pointer transition-transform drop-shadow-sm">🇨🇦</span>
              <span className="hover:scale-110 cursor-pointer transition-transform drop-shadow-sm">🇦🇪</span>
            </div>
          </div>

          {/* Mock Logos for Payments and Trust */}
          <div className="flex flex-wrap items-center gap-3 lg:gap-5 bg-card border border-border p-3 sm:p-4 rounded-xl shadow-sm transition-colors">
            <span className="font-bold text-xs bg-foreground text-background rounded-full h-8 w-8 flex items-center justify-center">IATA</span>
            <span className="font-bold text-muted-foreground text-sm italic pr-2 border-r border-border">ARC</span>
            <span className="font-bold text-muted-foreground text-xs pr-2 border-r border-border">tico.ca</span>
            <span className="font-bold text-brand-red text-sm italic">PayPal</span>
            <span className="flex items-center">
              <span className="w-5 h-5 rounded-full bg-red-500 opacity-90 -mr-2 mix-blend-multiply"></span>
              <span className="w-5 h-5 rounded-full bg-yellow-400 opacity-90 mix-blend-multiply"></span>
            </span>
            <span className="font-bold text-muted-foreground text-base italic tracking-tighter">VISA</span>
            <span className="font-bold text-brand-red text-sm bg-brand-red/5 px-2 py-0.5 border border-brand-red/20 rounded">AMEX</span>
            <span className="font-bold text-foreground text-sm transition-colors">affirm</span>
            <span className="text-brand-red font-bold text-sm flex items-center gap-1">
              <span className="bg-brand-red/10 rounded-full w-4 h-4 flex items-center justify-center border border-brand-red/50 text-[10px]">$</span>
              FULL REFUND
            </span>
          </div>
        </div>

        {/* Bottom Disclaimers & Copyright */}
        <div className="text-center space-y-4 max-w-5xl mx-auto pt-4">
          <p className="font-medium text-xs text-muted-foreground leading-relaxed transition-colors">
            Ezee Flights is an ISO 9001:2015 certified, world-leading platform for booking the cheapest flights online. With our lowest fare guarantee and unbeatable value, you can explore the world's most popular destinations within your budget! Ezee Flights provides trusted travel services worldwide, helping you discover new places with confidence and ease.
          </p>
          <p className="font-medium text-xs text-muted-foreground tracking-wide capitalize mt-4 transition-colors">
            Copyright {new Date().getFullYear()} Ezeeflights. All Rights Reserved. Ezeeflights is a part of Ezeewellness.
          </p>
        </div>

      </div>
    </footer>
  )
}
