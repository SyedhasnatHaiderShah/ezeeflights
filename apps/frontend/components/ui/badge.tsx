import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-semibold leading-none",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        brand:
          "bg-gradient-to-r from-brand-red to-brand-red-light text-white shadow-sm",
        gold: "bg-brand-yellow text-[#0d2353]",
        success:
          "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
        info: "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20",
        outline: "border border-border bg-transparent text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
        lg: "px-3 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

export { badgeVariants };
