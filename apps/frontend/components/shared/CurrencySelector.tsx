"use client";

import * as React from "react";
import { Globe, Check, ChevronsUpDown } from "lucide-react";
import {
  useCurrencyStore,
  SUPPORTED_CURRENCIES,
  CurrencyCode,
} from "@/lib/store/currency-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function CurrencySelector() {
  const {
    baseCurrency,
    comparisonCurrencies,
    setBaseCurrency,
    toggleComparisonCurrency,
  } = useCurrencyStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-2 rounded-full px-3 text-xs font-semibold uppercase tracking-widest hover:bg-muted text-foreground"
        >
          <Globe className="h-3.5 w-3.5 text-foreground hidden sm-block" />
          {baseCurrency}
          <ChevronsUpDown className="h-3 w-3 opacity-50 hidden sm-block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl p-2 shadow-2xl"
      >
        <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold tracking-wider text-foreground/90">
          Base Currency
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
            <DropdownMenuItem
              key={curr.code}
              onClick={() => setBaseCurrency(curr.code)}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{curr.code}</span>
                <span className="text-xs text-foreground/90">{curr.label}</span>
              </div>
              {baseCurrency === curr.code && (
                <Check className="h-4 w-4 text-redmix" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-2" />

        {/* <DropdownMenuLabel className="px-2 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Compare with (Max 2)
        </DropdownMenuLabel>
        <div className="grid grid-cols-2 gap-1 p-1">
          {Object.values(SUPPORTED_CURRENCIES).map((curr) => (
            <button
              key={`compare-${curr.code}`}
              onClick={(e) => {
                e.preventDefault();
                toggleComparisonCurrency(curr.code);
              }}
              className={cn(
                "flex items-center justify-center rounded-lg border py-1.5 text-[10px] font-black transition-all active:scale-95",
                comparisonCurrencies.includes(curr.code)
                  ? "bg-brand-red/10 border-brand-red/30 text-brand-red"
                  : "bg-muted/50 border-transparent text-muted-foreground hover:bg-muted",
              )}
            >
              {curr.code}
            </button>
          ))}
        </div> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
