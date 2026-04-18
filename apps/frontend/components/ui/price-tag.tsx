import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PriceTagProps {
  amount: number;
  currency?: string;
  originalAmount?: number;
  savingsPercent?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: {
    amount: "text-xl",
    currency: "text-xs",
    prefix: "text-[10px]",
  },
  md: {
    amount: "text-3xl",
    currency: "text-sm",
    prefix: "text-xs",
  },
  lg: {
    amount: "text-4xl",
    currency: "text-base",
    prefix: "text-sm",
  },
} as const;

export function PriceTag({
  amount,
  currency = "USD",
  originalAmount,
  savingsPercent,
  size = "md",
  className,
}: PriceTagProps) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  const formattedAmount = formatter.format(amount);
  const formattedOriginalAmount =
    typeof originalAmount === "number" ? formatter.format(originalAmount) : null;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <span className={cn("text-muted-foreground", sizeMap[size].prefix)}>From</span>
      <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
        <p className="font-bold leading-none text-foreground">
          <span className={cn(sizeMap[size].amount)}>{formattedAmount}</span>
          <span className={cn("ml-1 align-baseline text-muted-foreground", sizeMap[size].currency)}>
            {currency}
          </span>
        </p>

        {formattedOriginalAmount && (
          <span className="text-sm text-muted-foreground line-through">
            {formattedOriginalAmount}
          </span>
        )}

        {typeof savingsPercent === "number" && savingsPercent > 0 && (
          <Badge variant="brand" size="sm" className="whitespace-nowrap">
            Save {savingsPercent}%
          </Badge>
        )}
      </div>
    </div>
  );
}
