"use client";

import * as React from "react";
import {
  Globe,
  PhoneCall,
  Wallet,
  Wifi,
  Coffee,
  Building,
  Train,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCurrencyStore, SUPPORTED_CURRENCIES } from "@/lib/store/currency-store";

const getSourceCurrencyCode = (currencyStr?: string) => {
  if (!currencyStr) return "USD";
  const match = currencyStr.match(/\(([A-Z]{3})\)/);
  if (match) return match[1];
  const directMatch = currencyStr.match(/[A-Z]{3}/);
  if (directMatch) return directMatch[0];
  return "USD";
};

const getSourceCurrencyFromCosts = (costs: any) => {
  const sample = costs.meals || costs.dailyTotal || "";
  const match = sample.match(/[A-Za-z]{3}/);
  if (match) return match[0].toUpperCase();
  if (sample.includes("€")) return "EUR";
  if (sample.includes("฿")) return "THB";
  if (sample.includes("$")) return "USD";
  return "USD";
};

export function PracticalInfoCard({ practical }: { practical: any }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const currencyMeta = SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES["USD"];
  
  const sourceCurrencyCode = getSourceCurrencyCode(practical.currency);

  const convertCostString = (str: string) => {
    if (!str || !mounted) return str;
    
    // Find all digit groupings
    const matches = str.match(/\d+([.,]\d+)?/g);
    if (!matches) return str;

    let result = str;
    const uniqueMatches = Array.from(new Set(matches)).sort((a, b) => b.length - a.length);

    uniqueMatches.forEach((numStr) => {
      const numVal = parseFloat(numStr.replace(",", ""));
      const convertedVal = getConvertedAmount(numVal, sourceCurrencyCode, baseCurrency);
      const formatted = Math.round(convertedVal).toLocaleString("en-US");
      result = result.replaceAll(numStr, formatted);
    });

    // Remove old symbols/codes
    const codesToReplace = [sourceCurrencyCode, "AED", "EUR", "THB", "USD", "€", "฿", "$"];
    codesToReplace.forEach((c) => {
      result = result.replaceAll(c, "");
    });
    
    // Clean up multiple spaces
    result = result.replace(/\s+/g, " ").trim();

    return `${currencyMeta.symbol}${result}`;
  };

  const localRate = getConvertedAmount(1, sourceCurrencyCode, baseCurrency);
  const displayExchangeRate = mounted
    ? `1 ${sourceCurrencyCode} = ${localRate.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${baseCurrency}`
    : practical.exchangeRate || "";

  const infoItems = [
    {
      icon: Globe,
      label: "Currency",
      value: practical.currency,
      sub: displayExchangeRate,
    },
    {
      icon: Wifi,
      label: "Connectivity",
      value: practical.connectivity,
      sub: convertCostString(practical.simCost),
    },
    {
      icon: Coffee,
      label: "Language & Culture",
      value: practical.language,
      sub: practical.religion,
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 border-b border-border pb-3">
        <h3 className="text-base font-bold text-foreground">
          Practical Intelligence
        </h3>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {infoItems.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-background">
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                {item.label}
              </p>
              <p className="font-bold text-xs text-foreground leading-tight">
                {item.value}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                {item.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 rounded-xl bg-muted/40 p-4 md:grid-cols-3 border border-border/40">
        <div className="space-y-0.5">
          <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
            Emergency Police
          </p>
          <p className="text-sm font-bold text-foreground">
            {practical.emergency.police}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
            Emergency Medical
          </p>
          <p className="text-sm font-bold text-foreground">
            {practical.emergency.medical}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
            Global Assistance
          </p>
          <div className="flex items-center gap-1">
            <PhoneCall className="h-3 w-3 text-redmix" />
            <p className="text-xs font-bold text-foreground">
              {practical.emergency.embassy}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CostGuideCard({ costs }: { costs: any }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const { baseCurrency, getConvertedAmount } = useCurrencyStore();
  const currencyMeta = SUPPORTED_CURRENCIES[baseCurrency] || SUPPORTED_CURRENCIES["USD"];

  const sourceCurrencyCode = getSourceCurrencyFromCosts(costs);

  const convertCostString = (str: string) => {
    if (!str || !mounted) return str;
    
    const matches = str.match(/\d+([.,]\d+)?/g);
    if (!matches) return str;

    let result = str;
    const uniqueMatches = Array.from(new Set(matches)).sort((a, b) => b.length - a.length);

    uniqueMatches.forEach((numStr) => {
      const numVal = parseFloat(numStr.replace(",", ""));
      const convertedVal = getConvertedAmount(numVal, sourceCurrencyCode, baseCurrency);
      const formatted = Math.round(convertedVal).toLocaleString("en-US");
      result = result.replaceAll(numStr, formatted);
    });

    const codesToReplace = [sourceCurrencyCode, "AED", "EUR", "THB", "USD", "€", "฿", "$"];
    codesToReplace.forEach((c) => {
      result = result.replaceAll(c, "");
    });
    
    result = result.replace(/\s+/g, " ").trim();

    return `${currencyMeta.symbol}${result}`;
  };

  const displayBaseCurrency = mounted ? baseCurrency : sourceCurrencyCode;

  const costRows = [
    { icon: Coffee, label: "Meals", value: convertCostString(costs.meals) },
    { icon: Building, label: "Accommodation", value: convertCostString(costs.accommodation) },
    { icon: Train, label: "Transport", value: convertCostString(costs.transport) },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between border-b border-border pb-2.5">
        <h3 className="text-base font-bold text-foreground">Cost of Discovery</h3>
        <div className="flex items-center gap-1 rounded-full bg-redmix/10 px-2.5 py-0.5 text-[9px] font-bold text-foreground tracking-wider">
          Average Daily ({displayBaseCurrency})
        </div>
      </div>

      <div className="space-y-2">
        {costRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs">
              <div className="flex h-6 w-6 items-center justify-center text-foreground">
                <row.icon className="h-4 w-4" />
              </div>
              <p className="font-semibold text-xs text-foreground">
                {row.label}
              </p>
            </div>
            <p className="font-semibold text-xs text-foreground/80">
              {row.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-redmix/5 p-3.5 text-center border border-redmix/10">
        <p className="text-[10px] font-bold tracking-wider text-foreground/80 mb-0.5">
          Estimated Daily Total
        </p>
        <p className="text-xl font-bold text-redmix">{convertCostString(costs.dailyTotal)}</p>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-xl border border-dashed border-border p-2.5">
        <Sparkles className="h-4 w-4 text-redmix shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-bold tracking-wider text-foreground">
            Tipping Culture
          </p>
          <p className="text-[10px] font-semibold text-foreground/80">
            {costs.tipping}
          </p>
        </div>
      </div>
    </div>
  );
}
