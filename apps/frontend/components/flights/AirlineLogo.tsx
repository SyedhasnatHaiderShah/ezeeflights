"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AirlineLogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  code?: string | null;
  name?: string | null;
}

export function AirlineLogo({
  code,
  name,
  className,
  alt,
  ...props
}: AirlineLogoProps) {
  // Levels: 0 = SVG (symbol), 1 = PNG (wordmark), 2 = Initials Avatar
  const [fallbackLevel, setFallbackLevel] = useState(0);
  const normalizedCode = String(code || "XX").trim().toUpperCase();
  const airlineName = name || normalizedCode;

  // Reset fallback level if the airline code changes
  useEffect(() => {
    setFallbackLevel(0);
  }, [normalizedCode]);

  let logoSrc = "";
  if (fallbackLevel === 0) {
    logoSrc = `/images/airlines/${normalizedCode}.svg`;
  } else if (fallbackLevel === 1) {
    logoSrc = `/images/airlines/${normalizedCode}.png`;
  } else {
    logoSrc = `https://ui-avatars.com/api/?name=${encodeURIComponent(airlineName)}&background=F1F5F9&color=0F172A&size=100&bold=true`;
  }

  return (
    <img
      src={logoSrc}
      alt={alt || airlineName}
      className={cn("h-full w-full object-contain", className)}
      onError={() => {
        if (fallbackLevel < 2) {
          setFallbackLevel((prev) => prev + 1);
        }
      }}
      {...props}
    />
  );
}
