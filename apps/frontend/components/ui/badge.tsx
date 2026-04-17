import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "brand" | "gold";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold",
        variant === "default" && "bg-muted text-foreground",
        variant === "brand" && "bg-brand-red text-white",
        variant === "gold" && "bg-brand-yellow text-[#1f1f1f]",
        className,
      )}
    >
      {children}
    </span>
  );
}
