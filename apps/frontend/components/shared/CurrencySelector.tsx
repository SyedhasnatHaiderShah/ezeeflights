"use client";

import * as React from "react";
import { Globe, Check, ChevronsUpDown } from "lucide-react";
import { useCurrencyStore } from "@/lib/store/currency-store";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function CurrencySelector({
  isTransparent,
}: {
  isTransparent?: boolean;
}) {
  const baseCurrency = useCurrencyStore((s) => s.baseCurrency);

  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currencies = useCurrencyStore((s) => s.currencies);
  const setBaseCurrency = useCurrencyStore((s) => s.setBaseCurrency);
  const [search, setSearch] = React.useState("");

  const sorted = React.useMemo(
    () =>
      Object.values(currencies).sort((a, b) => a.code.localeCompare(b.code)),
    [currencies],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toUpperCase();
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.code.includes(q) ||
        c.label.toUpperCase().includes(q) ||
        c.symbol.includes(q),
    );
  }, [sorted, search]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "h-9 flex items-center gap-1.5 rounded-full px-3 text-xs font-semibold uppercase tracking-widest select-none cursor-default",
        isTransparent ? "text-white" : "text-foreground",
      )}
    >
      {/* <Globe
        className={cn(
          "h-3.5 w-3.5 hidden sm:block",
          isTransparent ? "text-white" : "text-foreground",
        )}
      /> */}
      {baseCurrency}
    </div>
  );
}
