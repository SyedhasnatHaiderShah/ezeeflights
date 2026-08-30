"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

type CheckboxVariant = "default" | "ios";

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  variant?: CheckboxVariant;
}

const variantStyles: Record<CheckboxVariant, string> = {
  default:
    "h-5 w-5 rounded-full border border-brand-yellow ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-brand-yellow data-[state=checked]:border-brand-yellow data-[state=checked]:text-white",
  ios: "h-5 w-5 rounded-full border-2 border-foreground/25 bg-white dark:bg-card shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-redmix/30 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-redmix data-[state=checked]:bg-redmix data-[state=checked]:text-white",
};

const indicatorStyles: Record<CheckboxVariant, string> = {
  default: "flex items-center justify-center text-current",
  ios: "flex items-center justify-center text-current",
};

const checkStyles: Record<CheckboxVariant, string> = {
  default: "h-3 w-3 stroke-gray-800",
  ios: "h-3 w-3 stroke-[3]",
};

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, variant = "default", ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer shrink-0 transition-colors",
      variantStyles[variant],
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={indicatorStyles[variant]}>
      <Check className={checkStyles[variant]} strokeWidth={3} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
