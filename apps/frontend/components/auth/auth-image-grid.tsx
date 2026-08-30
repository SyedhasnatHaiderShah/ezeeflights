"use client";

import { AppImage } from "@/components/ui/app-image";

export function AuthImageGrid() {
  return (
    <div className="hidden md:flex gap-4 w-full h-full min-h-[600px] relative p-8 select-none">
      {/* Column 1 */}
      <div className="flex-1 flex flex-col gap-4 animate-in slide-in-from-right-20 duration-1000">
        <div className="flex-[0.6] rounded-md overflow-hidden bg-muted relative group shadow-2xl border-4 border-white/10">
          <AppImage
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80"
            alt="Luxury Travel"
            fill
            priority
            className="object-cover transition-transform group-hover:scale-110 duration-700"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
        </div>
        <div className="flex-[1] rounded-md overflow-hidden bg-muted relative group shadow-2xl border-4 border-white/10">
          <AppImage
            src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80"
            alt="Global Destinations"
            fill
            priority
            className="object-cover transition-transform group-hover:scale-110 duration-700"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
        </div>
      </div>

      {/* Column 2 */}
      <div className="flex-1 flex flex-col gap-4 mt-20 animate-in slide-in-from-right-40 duration-1000">
        <div className="flex-[0.4] rounded-md overflow-hidden bg-muted relative group shadow-2xl border-4 border-white/10">
          <AppImage
            src="https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80"
            alt="Modern Architecture"
            fill
            className="object-cover transition-transform group-hover:scale-110 duration-700"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
        </div>
        <div className="flex-[0.8] rounded-md overflow-hidden bg-muted relative group shadow-2xl border-4 border-white/10">
          <AppImage
            src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80"
            alt="Escape"
            fill
            className="object-cover transition-transform group-hover:scale-110 duration-700"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
        </div>
        <div className="flex-[0.5] rounded-md overflow-hidden bg-muted relative group shadow-2xl border-4 border-white/10">
          <AppImage
            src="https://images.unsplash.com/photo-1436491865332-7a61a109c05e?auto=format&fit=crop&q=80"
            alt="Airlines"
            fill
            className="object-cover transition-transform group-hover:scale-110 duration-700"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-redmix/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute -top-10 -left-10 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
    </div>
  );
}
