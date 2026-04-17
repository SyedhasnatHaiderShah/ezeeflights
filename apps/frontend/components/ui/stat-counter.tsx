"use client";

import * as React from "react";

export function StatCounter({ value, suffix = "+", duration = 900 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let raf = 0;
    let started = false;

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting || started) return;
      started = true;
      const start = performance.now();
      const tick = (time: number) => {
        const progress = Math.min((time - start) / duration, 1);
        setCount(Math.floor(progress * value));
        if (progress < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      observer.disconnect();
    });

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [duration, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}
