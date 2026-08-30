import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string | React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  align = "left",
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-3",
        align === "center"
          ? "text-center items-center flex flex-col"
          : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-widest text-redmix">
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          "text-[length:var(--text-section)] font-bold leading-tight text-foreground",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-xs font-semibold text-foreground/80">
          {subtitle}
        </p>
      )}
      {/* {ctaLabel && ctaHref && (
        <Link
          href={ctaHref as never}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-redmix"
        >
          {ctaLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      )} */}
    </div>
  );
}
