'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { generateLivePackage, recalculatePackagePrice } from '@/lib/api/hybrid-api';
import { LocationSelector } from '@/components/ui/LocationSelector';

export default function SmartTravelPlannerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [destination, setDestination] = useState('Dubai');
  const [startDate, setStartDate] = useState('2026-06-10');
  const [endDate, setEndDate] = useState('2026-06-15');
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState(3500);
  const [groupType, setGroupType] = useState('Couple');
  const [interests, setInterests] = useState<string[]>(['Culture', 'Food']);
  const [result, setResult] = useState<any>(null);
  const [selectedFlight, setSelectedFlight] = useState<any>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);
  const [errors, setErrors] = useState<{ destination?: string; date?: string }>({});
  const tier = 'standard' as const;
  const activeOption = useMemo(() => result?.options?.[tier], [result]);

  useEffect(() => {
    const urlDestination = searchParams.get('destination');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    if (urlDestination) setDestination(urlDestination);
    if (from) setStartDate(from);
    if (to) setEndDate(to);
  }, [searchParams]);

  const onGenerate = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: { destination?: string; date?: string } = {};
    if (!destination) nextErrors.destination = 'Destination is required';
    if (new Date(startDate) >= new Date(endDate)) nextErrors.date = 'Start date must be before end date';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    router.replace(`?destination=${encodeURIComponent(destination)}&from=${startDate}&to=${endDate}`);

    const response = await generateLivePackage({
      destination,
      travelDates: { startDate, endDate },
      travelers,
      budget,
      preferences: interests,
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
    setResult((prev: any) => ({ ...prev, options: { ...prev.options, standard: { ...prev.options.standard, pricing: refreshed } } }));
  };

  return (
    <main className="space-y-8 pb-8">
      <h1 className="text-3xl font-black">Smart Travel Planner</h1>
      <section className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-4 rounded-2xl border bg-white p-5" onSubmit={onGenerate}>
          <h2 className="font-semibold">AI Input Form</h2>
          <LocationSelector value={destination} onChange={(_id, label) => setDestination(label)} endpoint="/cars/locations" placeholder="Destination" />
          <div className="grid gap-3 sm:grid-cols-2"><input className="rounded border p-2" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /><input className="rounded border p-2" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
          <div><p className="mb-1 text-sm">Budget: ${budget}</p><input className="w-full" type="range" min={500} max={10000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} /></div>
          <div className="space-y-2"><p className="text-sm">Interests</p><div className="flex flex-wrap gap-2">{['Culture', 'Food', 'Adventure', 'Shopping', 'Nature'].map((i) => <button key={i} type="button" onClick={() => setInterests((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i])} className={`rounded-full border px-3 py-1 text-sm ${interests.includes(i) ? 'bg-brand-red text-white' : ''}`}>{i}</button>)}</div></div>
          <select className="w-full rounded border p-2" value={groupType} onChange={(e) => setGroupType(e.target.value)}><option>Solo</option><option>Couple</option><option>Family</option><option>Group</option></select>
          <input className="w-full rounded border p-2" type="number" value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} min={1} />
          {errors.date && <p className="text-xs text-red-600">{errors.date}</p>}
          <button className="rounded bg-brand-red px-4 py-2 text-white" type="submit">Generate</button>
        </form>

        <div className="rounded-2xl border bg-slate-50 p-5">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Itinerary Preview</h2><button onClick={onRefreshPrice} className="rounded border px-3 py-1 text-sm" type="button">Regenerate</button></div>
          <div className="space-y-3">{activeOption?.itinerary?.map((day: any) => <div key={day.id} className="rounded-xl border bg-white p-3"><p className="text-xs font-semibold text-brand-red">Day {day.dayNumber}</p><p className="font-medium">{day.title}</p><p className="text-sm text-slate-600">Hotel: {selectedHotel?.name || 'TBD'} · Meals Included</p></div>) ?? <p className="text-sm text-slate-500">Generate a plan to preview itinerary days.</p>}</div>
        </div>
      </section>

      <Link href="/packages/book" className="inline-flex rounded bg-brand-red px-6 py-3 font-semibold text-white">Book This Trip</Link>
    </main>
  );
}
