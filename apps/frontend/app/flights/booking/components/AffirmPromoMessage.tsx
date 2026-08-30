"use client";

import React from "react";

interface AffirmPromoProps {
  totalCents: number; // Grand total in cents
  fallbackText?: string; // Pre-formatted local currency string
}

declare global {
  interface Window {
    affirm: any;
  }
}

export function AffirmPromoMessage({
  totalCents,
  fallbackText,
}: AffirmPromoProps) {
  if (totalCents <= 0) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      {/* Affirm's JS auto-renders into this element */}
      <div
        className="text-xs font-medium text-foreground/90 mt-0.5"
        data-amount={totalCents.toString()} // Must be in cents as string
      >
        Pay in installments with Affirm.
        {/* {fallbackText || `$${(totalCents / 400).toFixed(2)}`} */}
      </div>
    </div>
  );
}
