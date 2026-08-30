"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/section-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useDestinationThemes } from "@/lib/api/destinations";
import { cn } from "@/lib/utils";

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

function ThemeTile({
  href,
  emoji,
  label,
  gradient,
}: {
  href: string;
  emoji: string;
  label: string;
  gradient: string;
}) {
  return (
    <Link
      href={href as never}
      className="group flex w-[120px] shrink-0 snap-start flex-col items-center gap-2.5 rounded-[28px] border border-border/60 p-3 shadow-sm transition-all duration-300 hover:border-redmix/20 hover:shadow-md active:scale-[0.97] sm:w-[132px]"
    >
      <div
        className={cn(
          "flex aspect-square w-full items-center justify-center rounded-2xl bg-gradient-to-br shadow-inner transition-transform duration-300 group-hover:scale-[1.03]",
          gradient,
        )}
      >
        <span className="text-3xl sm:text-4xl">{emoji}</span>
      </div>
      <span className="line-clamp-2 px-1 text-center text-xs font-semibold leading-tight text-foreground transition-colors group-hover:text-redmix">
        {label}
      </span>
    </Link>
  );
}

export function ExploreByTheme() {
  const { t } = useTranslation();
  const { data: themes = [], isLoading } = useDestinationThemes();

  return (
    <section className="overflow-x-hidden bg-background py-5 md:py-14">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="rounded-[28px] border border-border/50 px-5 py-4 shadow-sm">
          <SectionHeader
            title={t("Travel Your Way")}
            subtitle={t("Find trips that match your vibe")}
            align="center"
          />
        </div>

        <div className="mt-6 rounded-[28px] border border-border/60 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between px-1 md:hidden">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {t("Browse themes")}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              {t("Swipe")}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar md:flex-wrap md:justify-center md:gap-4 md:overflow-visible">
            {isLoading
              ? Array.from({ length: 8 }).map((_, idx) => (
                  <Skeleton
                    key={idx}
                    className="h-[156px] w-[120px] shrink-0 rounded-[28px] sm:w-[132px]"
                  />
                ))
              : themes.map((theme, idx) => (
                  <ThemeTile
                    key={theme.slug}
                    href={`/destinations?theme=${theme.slug}`}
                    emoji={theme.emoji || "🌍"}
                    label={t(theme.label)}
                    gradient={gradients[idx % gradients.length]}
                  />
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}
