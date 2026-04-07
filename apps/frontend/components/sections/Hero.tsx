"use client";

import { BookingForm } from "@/components/booking-form";
import { AppImage } from "@/components/ui/app-image";

interface HeroProps {
  title?: React.ReactNode;
  description?: string;
}

export function Hero({
  title = (
    <>
      Domestic & International Flights Booking in USA
      <span className="text-brand-red">.</span>
    </>
  ),
  description = "Reach new heights with EzeeFlights' unbeatable domestic & international deals! Explore your dream destination at the perfect price with cheap budget airlines!",
}: HeroProps) {
  return (
    <section className="relative w-full pt-20 pb-5 overflow-hidden lg:min-h-[70dvh] h-auto bg-muted/10 dark:bg-background transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-5 w-full flex items-center gap-5">
        {/* Left Side: Content & Search (3/4 width) */}
        <div className="flex flex-col space-y-5 py-12 lg:w-[70%] w-full">
          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-foreground break-words">
              {title}
            </h1>
            <p className="text-sm lg:text-base text-foreground max-w-2xl">
              {description}
            </p>
          </div>
          <div className="w-full">
            <BookingForm />
          </div>
        </div>

        <div className="hidden lg:flex gap-2 h-[500px] py-12 -mr-32 relative lg:w-[30%] hidden">
          <div className="flex-1 flex flex-col gap-4 animate-in slide-in-from-right-20 duration-1000">
            <div className="flex-[0.6] rounded-2xl overflow-hidden bg-muted relative group">
              <AppImage
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80"
                alt="Luxury Stay"
                fill
                className="object-cover transition-transform group-hover:scale-110 duration-700"
              />
            </div>
            <div className="flex-[1] rounded-2xl overflow-hidden bg-muted relative group">
              <AppImage
                src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80"
                alt="Pool Side"
                fill
                className="object-cover transition-transform group-hover:scale-110 duration-700"
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-4 mt-12 animate-in slide-in-from-right-40 duration-1000">
            <div className="flex-[0.4] rounded-2xl overflow-hidden bg-muted relative group">
              <AppImage
                src="https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80"
                alt="Architecture"
                fill
                className="object-cover transition-transform group-hover:scale-110 duration-700"
              />
            </div>
            <div className="flex-[0.8] rounded-2xl overflow-hidden bg-muted relative group">
              <AppImage
                src="https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80"
                alt="Paradise"
                fill
                className="object-cover transition-transform group-hover:scale-110 duration-700"
              />
            </div>
            <div className="flex-[0.3] rounded-2xl overflow-hidden bg-muted relative group">
              <AppImage
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80"
                alt="Luxury Stay"
                fill
                className="object-cover transition-transform group-hover:scale-110 duration-700"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
