"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { AppImage } from "@/components/ui/app-image";

export function Newsletter() {
  return (
    <section className="relative py-20">
      <div className="absolute inset-0">
        <AppImage src="https://images.unsplash.com/photo-1488085061387-422e29b40080?q=80&w=1600&auto=format&fit=crop" alt="Travel" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 to-black/75" />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center text-white">
        <p className="text-xs font-bold tracking-[0.2em]">✉ STAY IN THE LOOP</p>
        <h2 className="mt-2 text-section text-4xl font-bold">Get the Best Deals in Your Inbox</h2>
        <p className="mt-3 text-white/80">Join 2M+ travelers who never miss a deal</p>

        <form className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto]" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Enter your email" className="h-12 rounded-xl border border-white/30 bg-white/20 px-4 text-white placeholder:text-white/60 outline-none focus:bg-white/30" />
          <button className="h-12 rounded-xl bg-brand-yellow px-6 font-bold text-gray-900 hover:bg-brand-yellow/90">Subscribe</button>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
          <label className="flex items-center gap-2"><Checkbox defaultChecked />Flights</label>
          <label className="flex items-center gap-2"><Checkbox defaultChecked />Hotels</label>
          <label className="flex items-center gap-2"><Checkbox defaultChecked />Packages</label>
        </div>
        <p className="mt-3 text-xs text-white/50">Unsubscribe anytime · No spam · Privacy protected</p>
      </div>
    </section>
  );
}
