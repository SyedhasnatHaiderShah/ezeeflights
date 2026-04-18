import { cn } from "@/lib/utils";

interface PriceTagProps {
  amount: number;
  originalAmount?: number;
  currency?: string;
  className?: string;
}

export function PriceTag({ amount, originalAmount, currency = "USD", className }: PriceTagProps) {
  return (
    <div className={cn("flex items-end gap-2", className)}>
      <p className="text-2xl font-black text-foreground">
        {currency === "USD" ? "$" : ""}
        {amount}
      </p>
      {originalAmount ? <p className="pb-1 text-sm text-muted-foreground line-through">${originalAmount}</p> : null}
    </div>
  );
}
