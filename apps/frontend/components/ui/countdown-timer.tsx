"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: Date;
  className?: string;
  compact?: boolean;
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const getTimeLeft = (expiresAt: Date): TimeParts => {
  const diff = Math.max(0, expiresAt.getTime() - Date.now());

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
};

const pad = (value: number) => String(value).padStart(2, "0");

export function CountdownTimer({
  expiresAt,
  className,
  compact = false,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState<TimeParts>(() =>
    getTimeLeft(expiresAt),
  );

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeLeft(getTimeLeft(expiresAt));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [expiresAt]);

  const units = [
    `${pad(timeLeft.days)}d`,
    `${pad(timeLeft.hours)}h`,
    `${pad(timeLeft.minutes)}m`,
    `${pad(timeLeft.seconds)}s`,
  ];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {units.map((unit, index) => (
        <React.Fragment key={unit}>
          <span
            className={cn(
              "bg-brand-red font-semibold text-white",
              compact
                ? "rounded-md px-2 py-1 text-xs"
                : "rounded-lg px-2.5 py-1.5 text-sm",
            )}
          >
            {unit}
          </span>
          {index < units.length - 1 && (
            <span
              className={cn("text-brand-red", compact && "text-xs font-bold")}
            >
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
