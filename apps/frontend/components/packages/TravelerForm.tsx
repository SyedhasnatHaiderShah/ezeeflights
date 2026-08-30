"use client";

import { User, Baby, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export function TravelerForm({
  counts,
  onChange,
  readonly = false,
}: {
  counts: { adult: number; child: number; infant: number };
  onChange: (next: { adult: number; child: number; infant: number }) => void;
  readonly?: boolean;
}) {
  const { t } = useTranslation();

  const config = [
    {
      type: "adult",
      label: t("Adults"),
      sub: t("12+ years"),
      icon: UserCircle,
    },
    { type: "child", label: t("Children"), sub: t("2-11 years"), icon: User },
    { type: "infant", label: t("Infants"), sub: t("Under 2y"), icon: Baby },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {config.map(({ type, label, sub, icon: Icon }) => (
        <div
          key={type}
          className="relative group p-3 rounded-xl border border-border/60 bg-card transition-all duration-300 hover:border-redmix/30 hover:shadow-md hover:shadow-redmix/5 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-redmix text-white transition-all duration-300 shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground transition-colors duration-300 group-hover:text-redmix truncate">
                {label}
              </p>
              <p className="text-[10px] font-semibold text-muted-foreground tracking-wide mt-0.5">
                {sub}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-muted/40 p-1 rounded-lg border border-border/30 w-24 shrink-0">
            <button
              type="button"
              onClick={() =>
                !readonly &&
                onChange({
                  ...counts,
                  [type]: Math.max(type === "adult" ? 1 : 0, counts[type] - 1),
                })
              }
              disabled={readonly}
              className={cn(
                "w-7 h-7 rounded-full bg-background flex items-center justify-center text-foreground font-bold transition-all text-xs shadow-sm border border-border/30",
                readonly ? "opacity-50 cursor-not-allowed" : "hover:bg-redmix/10 hover:text-redmix active:scale-90 cursor-pointer"
              )}
            >
              -
            </button>
            <div className="flex-1 text-center font-bold text-sm text-foreground select-none">
              {counts[type]}
            </div>
            <button
              type="button"
              onClick={() => !readonly && onChange({ ...counts, [type]: counts[type] + 1 })}
              disabled={readonly}
              className={cn(
                "w-7 h-7 rounded-full bg-background flex items-center justify-center text-foreground font-bold transition-all text-xs shadow-sm border border-border/30",
                readonly ? "opacity-50 cursor-not-allowed" : "hover:bg-redmix/10 hover:text-redmix active:scale-90 cursor-pointer"
              )}
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
