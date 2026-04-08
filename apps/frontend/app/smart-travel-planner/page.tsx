'use client';

import { FormEvent, useMemo, useState } from 'react';
import { DynamicItineraryView } from '@/components/hybrid/DynamicItineraryView';
import { FlightOptionsList } from '@/components/hybrid/FlightOptionsList';
import { HotelOptionsGrid } from '@/components/hybrid/HotelOptionsGrid';
import { LivePriceCard } from '@/components/hybrid/LivePriceCard';
import { generateLivePackage, recalculatePackagePrice } from '@/lib/api/hybrid-api';

export default function SmartTravelPlannerPage() {
  const [destination, setDestination] = useState('Dubai');
  const [startDate, setStartDate] = useState('2026-06-10');
  const [endDate, setEndDate] = useState('2026-06-15');
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(3500);
  const [result, setResult] = useState<any>(null);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  const tier = 'standard' as const;

  const activeOption = useMemo(() => result?.options?.[tier], [result]);

  const onGenerate = async (event: FormEvent) => {
    event.preventDefault();
    const response = await generateLivePackage({
      destination,
      travelDates: { startDate, endDate },
      travelers,
      budget,
      preferences: ['culture', 'food'],
      currency: 'USD',
      origin: 'JFK',
    });

    setResult(response);
    setSelectedFlight(response?.options?.standard?.flight ?? null);
    setSelectedHotel(response?.options?.standard?.hotel ?? null);
  };

  const onRefreshPrice = async () => {
    if (!selectedFlight || !selectedHotel || !result?.itinerary) return;

    const refreshed = await recalculatePackagePrice({
      flightPrice: Number(selectedFlight.price),
      hotelPrice: Number(selectedHotel.pricePerNight) * Math.max(result.itinerary.length - 1, 1),
      activitiesCost: result.itinerary.length * 45,
      packageTier: 'standard',
      baseCurrency: 'USD',
      targetCurrency: 'USD',
    });

    setResult((prev: any) => ({
      ...prev,
      options: {
        ...prev.options,
        standard: {
          ...prev.options.standard,
          pricing: refreshed,
        },
      },
    }));
  };

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold">Smart Travel Planner</h1>

      <form className="grid gap-3 rounded-lg border bg-white p-4 md:grid-cols-3" onSubmit={onGenerate}>
        <input className="rounded border p-2" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination" />
        <input className="rounded border p-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input className="rounded border p-2" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <input className="rounded border p-2" type="number" value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} min={1} />
        <input className="rounded border p-2" type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} min={0} />
        <button className="rounded bg-indigo-600 px-4 py-2 text-white" type="submit">
          Generate Live Package
        </button>
      </form>

      {activeOption && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <LivePriceCard tier="standard" total={activeOption.pricing.totalPrice} currency={activeOption.pricing.currency} />
            <button className="rounded border px-4 py-2" onClick={onRefreshPrice} type="button">
              Refresh Price
            </button>
          </div>

          <FlightOptionsList options={[result.options.budget.flight, result.options.standard.flight, result.options.luxury.flight]} onSelect={setSelectedFlight} />
          <HotelOptionsGrid options={[result.options.budget.hotel, result.options.standard.hotel, result.options.luxury.hotel]} onSelect={setSelectedHotel} />
          <DynamicItineraryView itinerary={activeOption.itinerary} />
        </section>
      )}
    </main>
  );
}
