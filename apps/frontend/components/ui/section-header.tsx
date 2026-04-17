import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  align = "left",
  className,
  light = false,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center",
        className,
      )}
    >
      <div className={cn("space-y-2", align === "center" && "max-w-2xl")}>
        {eyebrow ? (
          <p
            className={cn(
              "text-xs font-bold uppercase tracking-[0.2em]",
              light ? "text-white/80" : "text-brand-red",
            )}
          >
            {eyebrow}
          </p>
        ) : null}
        <h2 className={cn("text-3xl font-black tracking-tight", light ? "text-white" : "text-foreground")}>{title}</h2>
        {subtitle ? (
          <p className={cn("text-sm", light ? "text-white/75" : "text-muted-foreground")}>{subtitle}</p>
        ) : null}
      </div>

      {ctaLabel && ctaHref && align !== "center" ? (
        <Link
          href={ctaHref as any}
          className={cn(
            "text-sm font-semibold transition-colors",
            light ? "text-white hover:text-white/80" : "text-brand-red hover:text-brand-red/80",
          )}
        >
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
