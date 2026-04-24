"use client";

import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useDestinationThemes } from "@/lib/api/destinations";

const gradients = [
  "from-cyan-500 to-blue-500",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-indigo-600",
  "from-pink-500 to-rose-600",
  "from-orange-500 to-amber-500",
  "from-sky-600 to-blue-700",
  "from-blue-500 to-cyan-600",
  "from-fuchsia-500 to-pink-600",
];

export function ExploreByTheme() {
  const { data: themes = [], isLoading } = useDestinationThemes();

  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeader
          title="Travel Your Way"
          subtitle="Find trips that match your vibe"
          align="center"
        />
        <div className="flex gap-4 flex-wrap justify-center mt-5">
          {isLoading
            ? Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton key={idx} className="aspect-square rounded-2xl" />
              ))
            : themes.map((theme, idx) => (
                <Link
                  key={theme.slug}
                  href={`/destinations?theme=${theme.slug}` as any}
                  className={`aspect-square rounded-2xl bg-gradient-to-br ${gradients[idx % gradients.length]} flex flex-col items-center justify-center gap-2 text-white transition hover:scale-105 hover:border-2 hover:border-white/50 hover:shadow-lg w-32`}
                >
                  <span className="text-4xl">{theme.emoji || "🌍"}</span>
                  <span className="text-sm font-semibold">{theme.label}</span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
