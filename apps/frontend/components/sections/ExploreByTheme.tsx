import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";

const THEMES = [
  ["🏖", "Beach", "from-cyan-500 to-blue-500"],
  ["🏔", "Mountains", "from-emerald-500 to-teal-600"],
  ["🌆", "City Break", "from-purple-500 to-indigo-600"],
  ["🎭", "Culture", "from-pink-500 to-rose-600"],
  ["🍽", "Food Tours", "from-orange-500 to-amber-500"],
  ["🎿", "Adventure", "from-sky-600 to-blue-700"],
  ["🛳", "Cruises", "from-blue-500 to-cyan-600"],
  ["💑", "Honeymoon", "from-fuchsia-500 to-pink-600"],
] as const;

export function ExploreByTheme() {
  return (
    <section className="py-14">
      <div className="mx-auto max-w-[1000px] px-6">
        <SectionHeader title="Travel Your Way" subtitle="Find trips that match your vibe" align="center" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {THEMES.map(([emoji, label, gradient]) => (
            <Link key={label} href={`/destinations?theme=${label.toLowerCase().replace(/\s+/g, "-")}` as any} className={`aspect-square rounded-2xl bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2 text-white transition hover:scale-105 hover:border-2 hover:border-white/50 hover:shadow-lg`}>
              <span className="text-4xl">{emoji}</span>
              <span className="text-sm font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
