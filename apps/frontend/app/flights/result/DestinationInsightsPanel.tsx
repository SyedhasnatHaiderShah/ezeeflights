import React from "react";
import { CloudSun, Hotel, Thermometer, Droplets, Star } from "lucide-react";

type DestinationInsights = {
  weather: {
    condition: string;
    tempC: number;
    highC: number;
    lowC: number;
    humidity: number;
    forecast: Array<{ day: string; icon: string; highC: number; lowC: number }>;
  };
  hotels: Array<{
    name: string;
    area: string;
    rating: number;
    fromPrice: number;
    highlight: string;
  }>;
};

const destinationMockInsights: Record<string, DestinationInsights> = {
  DXB: {
    weather: {
      condition: "Sunny",
      tempC: 34,
      highC: 37,
      lowC: 28,
      humidity: 58,
      forecast: [
        { day: "Mon", icon: "☀️", highC: 36, lowC: 28 },
        { day: "Tue", icon: "🌤️", highC: 35, lowC: 27 },
        { day: "Wed", icon: "☀️", highC: 37, lowC: 29 },
      ],
    },
    hotels: [
      {
        name: "Palm Skyline Hotel",
        area: "Dubai Marina",
        rating: 4.7,
        fromPrice: 168,
        highlight: "Beach access + breakfast",
      },
      {
        name: "Souk Gate Residences",
        area: "Deira",
        rating: 4.3,
        fromPrice: 89,
        highlight: "Budget-friendly downtown stay",
      },
    ],
  },
  KHI: {
    weather: {
      condition: "Humid",
      tempC: 31,
      highC: 33,
      lowC: 27,
      humidity: 72,
      forecast: [
        { day: "Mon", icon: "⛅", highC: 32, lowC: 27 },
        { day: "Tue", icon: "🌥️", highC: 33, lowC: 27 },
        { day: "Wed", icon: "🌦️", highC: 31, lowC: 26 },
      ],
    },
    hotels: [
      {
        name: "Clifton Bay Suites",
        area: "Clifton",
        rating: 4.5,
        fromPrice: 74,
        highlight: "Near seaside food street",
      },
      {
        name: "Saddar Business Inn",
        area: "Saddar",
        rating: 4.1,
        fromPrice: 49,
        highlight: "Fast airport transfer",
      },
    ],
  },
  LHE: {
    weather: {
      condition: "Clear",
      tempC: 29,
      highC: 32,
      lowC: 23,
      humidity: 54,
      forecast: [
        { day: "Mon", icon: "☀️", highC: 31, lowC: 23 },
        { day: "Tue", icon: "🌤️", highC: 32, lowC: 24 },
        { day: "Wed", icon: "☀️", highC: 33, lowC: 24 },
      ],
    },
    hotels: [
      {
        name: "Mall Road Grand",
        area: "Gulberg",
        rating: 4.6,
        fromPrice: 81,
        highlight: "Great for shopping + dining",
      },
      {
        name: "Garden Town Lodge",
        area: "Garden Town",
        rating: 4.2,
        fromPrice: 57,
        highlight: "Quiet neighborhood stay",
      },
    ],
  },
};

function getDestinationInsights(destination: string): DestinationInsights {
  const lookupKey = destination.trim().toUpperCase();
  const known = destinationMockInsights[lookupKey];

  if (known) return known;

  return {
    weather: {
      condition: "Pleasant",
      tempC: 27,
      highC: 30,
      lowC: 22,
      humidity: 52,
      forecast: [
        { day: "Mon", icon: "🌤️", highC: 29, lowC: 22 },
        { day: "Tue", icon: "☀️", highC: 30, lowC: 23 },
        { day: "Wed", icon: "⛅", highC: 28, lowC: 21 },
      ],
    },
    hotels: [
      {
        name: `${destination} Central Hotel`,
        area: "City Center",
        rating: 4.4,
        fromPrice: 92,
        highlight: "Top-rated by frequent travelers",
      },
      {
        name: `${destination} Comfort Stay`,
        area: "Airport District",
        rating: 4.1,
        fromPrice: 67,
        highlight: "Best value close to transit",
      },
    ],
  };
}

interface DestinationInsightsPanelProps {
  destination: string;
}

export function DestinationInsightsPanel({
  destination,
}: DestinationInsightsPanelProps) {
  const destinationInsights = React.useMemo(
    () => getDestinationInsights(destination),
    [destination],
  );

  return (
    <>
      <div className="rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-redmix" />
            <h3 className="text-sm font-bold text-foreground">Destination Weather</h3>
          </div>
          {/* <span className="text-[10px] text-foreground/90">Mock Data</span> */}
        </div>

        <div className="rounded-xl bg-muted/30 border border-border p-3 mb-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-foreground">
              {destination} • {destinationInsights.weather.condition}
            </p>
            <p className="text-lg font-black text-redmix">
              {destinationInsights.weather.tempC}°C
            </p>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-foreground/90">
            <span className="inline-flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-redmix" />
              H:{destinationInsights.weather.highC}° L:{destinationInsights.weather.lowC}°
            </span>
            <span className="inline-flex items-center gap-1">
              <Droplets className="w-3 h-3 text-redmix" />
              {destinationInsights.weather.humidity}%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {destinationInsights.weather.forecast.map((item) => (
            <div
              key={item.day}
              className="rounded-lg border border-border bg-muted/40 px-2 py-2 text-center"
            >
              <p className="text-[10px] font-semibold text-foreground/90">{item.day}</p>
              <p className="text-sm leading-tight">{item.icon}</p>
              <p className="text-[10px] font-semibold text-foreground">
                {item.highC}°/{item.lowC}°
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white dark:bg-card border border-border p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Hotel className="w-4 h-4 text-redmix" />
            <h3 className="text-sm font-bold text-foreground">
              Hotel Picks in {destination}
            </h3>
          </div>
          {/* <span className="text-[10px] text-foreground/90">Mock Data</span> */}
        </div>

        <div className="space-y-2.5">
          {destinationInsights.hotels.map((hotel) => (
            <div
              key={hotel.name}
              className="rounded-xl border border-border bg-muted/30 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-foreground">{hotel.name}</p>
                  <p className="text-[11px] text-foreground/90">{hotel.area}</p>
                </div>
                <p className="text-xs font-bold text-redmix">from ${hotel.fromPrice}</p>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span className="inline-flex items-center gap-1 text-yellow font-semibold">
                  <Star className="w-3 h-3 fill-current" />
                  {hotel.rating}
                </span>
                <span className="text-foreground/90">{hotel.highlight}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
