import * as React from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Sparkles, ArrowRight, Star, Sun, Cloud, CloudRain, CloudLightning, Snowflake, Utensils, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Static placeholders for the hotel images
const STAY_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBccvRXCzpf1qbcEm46Er8fve1tSsYIQEWm3qSpjbvrXmixtwvmovz8Y6aUWnxIE7rEbXrOsP1nso0XYTz5odiJlPo07JXSxe3upZrbGlhMupt3wNdDcAQ0YV3X3XVCuAeZ1o0JXK9kuMIOLRQit3H6lyD_UvLz9iQQbhfxcb6z_tatqT-5zH53kefscILShrYnnrychF3lclVKOlynG9dvDvsiO8IO-PmIfAYrxhV2JOIGlPOFp28ApT9LJIUjnYXKt3bQI57ouxE",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB6pXX2SfHM-TjWzMcY0yrXRr6blNxX1IrlJASg-B4jLkfS2nAEtS9m7NcMOiJ9Izsfj29QcWlX-Kw-_Ez_JT5r0SfdtaK9Aad8l5Y3mEtTekR-1qhdvqWE9EwDR9_fgGEx_lxzOvGrnd7NxzRjVAdCq9HbvwvFZ8Zsxu-_1YsnE1R0o06ceTf7u_AAd1ldij2iW7t67Jti2muNbyogwQI6OqNsSAufQ94i0neuQ13YHHWYihsttdSdzRtsdAfAc4cQSueiTmUiXTg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBZcdm00lwe14dKao4NwHCfUP8QHizda850-5T5zo7W0anw_yDhkpEcJkA0MA5u5_vBKPCZhs1iVThsKzhTEhUlOtvCQzlVud04CzZ802sfVtQC2nltjXeNIjuQRPJeDq3_qTXAel9PoN5yddaZ0UXWf3kjgh_4J-Pa-p091z_DjuEOVGXyHDwmYfV0_L56rbGQWiSegpi7StT1gX60ePVtorktOkLiqttSAH33GEv5gNBsnLOgwZLUNDzSiu78wWQTHiK8lCKwock"
]

const RESTAURANT_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1080&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1080&auto=format&fit=crop"
]

function WeatherIcon({ name, className }: { name: string; className?: string }) {
  const iconMap: Record<string, any> = {
    "sunny": Sun,
    "clear sky": Sun,
    "partly_cloudy_day": Cloud,
    "cloud": Cloud,
    "cloudy": Cloud,
    "overcast": Cloud,
    "rainy": CloudRain,
    "showers": CloudRain,
    "storm": CloudLightning,
    "snow": Snowflake
  };
  const Icon = iconMap[name?.toLowerCase()] || Sun;
  return <Icon className={className} />;
}

export async function GeminiRecommendations({ destinationCode, searchParamsString = "" }: { destinationCode: string, searchParamsString?: string }) {
  const destMap: Record<string, string> = {
    "LHE": "Lahore, Pakistan",
    "AUH": "Abu Dhabi, UAE",
    "LHR": "London, UK",
    "DXB": "Dubai, UAE",
    "JFK": "New York, USA"
  };

  const cityName = destMap[destinationCode?.toUpperCase()] || destinationCode || "your destination";

  if (!process.env.GEMINI_API_KEY) {
    return (
      <div className="w-full bg-[#f2f3ff] dark:bg-muted/10 border-dashed border-2 border-border p-8 rounded-3xl mb-8 flex flex-col items-center justify-center text-center">
        <Sparkles className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
        <h3 className="font-bold text-base text-foreground font-display">Aero Intelligence Offline</h3>
        <p className="font-medium text-sm text-muted-foreground w-full max-w-md mt-2">
          Unable to generate travel insights for {cityName}. Please configure your GEMINI_API_KEY.
        </p>
      </div>
    );
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const prompt = `Provide travel recommendations for someone flying to: ${cityName}.
  Respond strictly in RAW JSON format matching exactly this schema:
  {
    "weather": [
        { "day": "MON", "temp": "18°", "condition": "Clear Sky", "icon": "sunny" }
    ],
    "hotels": [
       { "name": "Iconic Hotel Name", "description": "Short impressive description", "rating": "4.9" }
    ],
    "restaurants": [
       { "name": "Top Local Restaurant", "description": "Short delicious description", "rating": "4.8" }
    ]
  }
  IMPORTANT: Provide exactly 5 days of weather starting from today. Use "sunny", "cloudy", "rainy", "showers", "storm", or "snow" for icon.
  Limit hotels to exactly 3 Premium luxury stays. Limit restaurants to exactly 3 top-rated dining spots. Your entire response MUST evaluate inside JSON.parse() successfully. DO NOT WRAP IN MARKDOWN BACKTICKS.`;

  let aiData = null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
    const result = await model.generateContent(prompt);
    let text = result.response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
      text = text.trim();
    }

    aiData = JSON.parse(text);
  } catch (error: any) {
    console.warn("Aero Intelligence Offline or API Key Invalid:", error.message);
    return null;
  }

  if (!aiData || !aiData.weather) return null;

  return (
    <div className="w-full flex flex-col gap-16 mb-16 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">

      {/* Premium Stays */}
      <div>
        <div className="flex justify-between items-end mb-6 pl-1">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground font-display">Premium Stays</h2>
            <p className="text-muted-foreground mt-2 font-medium">Curated by our intelligence engine for elite comfort in {cityName}.</p>
          </div>
          <Link href={`/flights/stays?${searchParamsString}`}>
            <Button variant="ghost" className="text-[#ff4b2b] hover:text-[#ff4b2b] hover:bg-brand-red/5 font-bold flex items-center gap-2 hover:gap-3 transition-all h-10 px-4 group">
              View Stays <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {aiData.hotels?.slice(0, 3).map((hotel: any, idx: number) => (
            <div key={`hotel-${idx}`} className="group cursor-pointer">
              <div className="h-64 rounded-2xl overflow-hidden mb-4 relative drop-shadow-sm">
                <img
                  src={STAY_IMAGES[idx] || STAY_IMAGES[0]}
                  alt={hotel.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/50 backdrop-blur-md px-3 py-1 flex items-center gap-1 rounded-full shadow-sm">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs font-bold text-foreground">{hotel.rating || "4.8"}</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1 text-foreground font-display">{hotel.name}</h3>
              <p className="font-medium text-xs text-muted-foreground line-clamp-2">{hotel.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Culinary Spotlights (Restaurants) */}
      <div>
        <div className="flex justify-between items-end mb-6 pl-1">
          <div>
            <h2 className="text-4xl font-bold tracking-tight text-foreground font-display flex items-center gap-3">
              Culinary Discoveries <Utensils className="h-6 w-6 text-[#ff4b2b]" />
            </h2>
            <p className="text-muted-foreground mt-2 font-medium">Top-rated dining spots hand-picked for your layout in {cityName}.</p>
          </div>
          <Link href={`/flights/restaurants?${searchParamsString}`}>
            <Button variant="ghost" className="text-[#ff4b2b] hover:text-[#ff4b2b] hover:bg-brand-red/5 font-bold flex items-center gap-2 hover:gap-3 transition-all h-10 px-4 group">
              View Dining <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {aiData.restaurants?.slice(0, 3).map((rest: any, idx: number) => (
            <div key={`rest-${idx}`} className="group cursor-pointer">
              <div className="h-48 rounded-2xl overflow-hidden mb-4 relative drop-shadow-sm">
                <img
                  src={RESTAURANT_IMAGES[idx] || RESTAURANT_IMAGES[0]}
                  alt={rest.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/50 backdrop-blur-md px-3 py-1 flex items-center gap-1 rounded-full shadow-sm">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <span className="text-xs font-bold text-foreground">{rest.rating || "4.8"}</span>
                </div>
              </div>
              <h3 className="font-bold text-lg mb-1 text-foreground font-display">{rest.name}</h3>
              <p className="font-medium text-xs text-muted-foreground line-clamp-2">{rest.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Atmospheric Intelligence (Weather Configured Compactly) */}
      <div>
        <div className="flex justify-between items-end mb-6 pl-1">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-display">Atmospheric Intelligence</h2>
            <p className="text-muted-foreground mt-1 text-sm font-medium">Precision forecasting for tactical planning.</p>
          </div>
          <Link href={`/flights/places?${searchParamsString}`}>
            <Button variant="ghost" className="text-[#ff4b2b] hover:text-[#ff4b2b] hover:bg-brand-red/5 font-bold flex items-center gap-2 hover:gap-3 transition-all h-10 px-4 group whitespace-nowrap">
              Explore Attractions <MapPin className="h-4 w-4 group-hover:translate-y-[-2px] transition-transform ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {aiData.weather?.slice(0, 5).map((w: any, idx: number) => {
            const isToday = idx === 1; // Highlight second day arbitrarily
            return (
              <div key={`weather-${idx}`} className={cn(
                "p-3 text-center flex flex-col items-center gap-2 rounded-md transition-colors shadow-sm",
                isToday
                  ? "bg-[#ff4b2b] text-white"
                  : "bg-white dark:bg-muted/10 hover:bg-gray-50 dark:hover:bg-muted/20 text-foreground"
              )}>
                <p className={cn("font-bold text-xs tracking-widest", isToday ? "text-white/80" : "text-muted-foreground")}>{w.day}</p>

                <WeatherIcon
                  name={w.icon || w.condition}
                  className={cn("h-7 w-7", isToday ? "text-white" : "text-[#ff4b2b]")}
                />

                <div>
                  <p className={cn("text-lg font-bold", isToday ? "text-white" : "text-muted-foreground")}>{w.temp}</p>
                  <p className={cn("text-sm font-medium", isToday ? "text-white" : "text-muted-foreground")}>{w.condition}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

// Skeleton loading state
export function GeminiSkeleton() {
  return (
    <div className="w-full flex flex-col gap-16 mb-16 pt-2">

      {/* Premium Stays Skeleton */}
      <div>
        <div className="mb-8 pl-1">
          <div className="h-10 w-64 bg-muted/50 rounded-xl animate-pulse" />
          <div className="h-5 w-80 bg-muted/30 rounded-md animate-pulse mt-3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-80 bg-muted/40 rounded-2xl mb-4" />
              <div className="h-6 w-48 bg-muted/40 rounded mb-2" />
              <div className="h-4 w-full bg-muted/30 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Atmospheric Skeleton */}
      <div>
        <div className="mb-8 pl-1">
          <div className="h-10 w-72 bg-muted/50 rounded-xl animate-pulse" />
          <div className="h-5 w-60 bg-muted/30 rounded-md animate-pulse mt-3" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-muted/20 h-48 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>

    </div>
  )
}
