import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBadgeProps {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  variant?: "horizontal" | "vertical";
  className?: string;
}

export function TrustBadge({
  icon: Icon,
  label,
  sublabel,
  variant = "horizontal",
  className,
}: TrustBadgeProps) {
  return (
    <div
      className={cn(
        "flex",
        variant === "horizontal" ? "items-center gap-3" : "items-center text-center flex-col gap-2",
        className,
      )}
    >
      <Icon className="h-5 w-5 text-brand-red" />
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  );
}
