"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  expiresAt: Date;
  className?: string;
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

export function CountdownTimer({ expiresAt, className }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = React.useState<TimeParts>(() => getTimeLeft(expiresAt));

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
          <span className="rounded-lg bg-brand-red px-2.5 py-1.5 text-sm font-semibold text-white">
            {unit}
          </span>
          {index < units.length - 1 && <span className="text-brand-red">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
