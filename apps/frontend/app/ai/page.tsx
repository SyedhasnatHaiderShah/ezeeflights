import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { GeminiRecommendations } from '@/components/ai/GeminiRecommendations';

export default async function AiAssistantPage() {
  return (
    <section className="space-y-8 pb-10">
      <div className="rounded-3xl bg-gradient-to-r from-[#072f66] to-[#2b73c8] p-10 text-white">
        <div className="flex items-center gap-3"><Sparkles className="h-8 w-8 animate-pulse" /><h1 className="text-4xl font-black">Meet Ezee AI</h1></div>
        <p className="mt-3 text-white/85">Personalized travel intelligence for smarter trips.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">{['Personalized Recommendations','Smart Itinerary','Price Predictions','Destination Insights'].map((f) => <article key={f} className="rounded-xl border p-4 font-medium">{f}</article>)}</div>
      <div className="rounded-2xl border p-4"><h2 className="mb-3 text-xl font-bold">Live Demo</h2>{await GeminiRecommendations({ destinationCode: 'DXB' })}</div>
      <Link href="/smart-travel-planner" className="inline-flex rounded bg-brand-red px-5 py-3 text-white">Try Smart Planner →</Link>
    </section>
  );
}
