"use client"

import React, { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  /** @deprecated rootMargin no longer used for mounting — kept for API compat */
  rootMargin?: string;
}

export function ScrollReveal({
  children,
  className = "",
  minHeight = "400px",
  rootMargin = "800px",
}: ScrollRevealProps) {
  // Start VISIBLE by default so SSR and initial paint always show content.
  // On the client, if we confirm the element is below the viewport, we set it
  // to invisible and animate it in when the user scrolls to it.
  // This prevents the "white content" bug on real mobile where useEffect
  // fires late and sections remain stuck at opacity-0.
  const [isVisible, setIsVisible] = useState(true)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()

    // If already in or near the viewport: keep visible, mark as animated
    if (rect.top < window.innerHeight + 100) {
      setIsVisible(true)
      setHasAnimated(true)
      return
    }

    // Element is below the fold — hide it and watch for scroll
    setIsVisible(false)

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          setHasAnimated(true)
          observer.disconnect()
        }
      },
      { rootMargin: "0px 0px 60px 0px", threshold: 0 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        // Only apply transition when we have something to animate
        !hasAnimated && "transition-all duration-700 ease-out",
        // Default: fully visible. Only invisible while waiting for scroll-in
        !isVisible ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0",
        className
      )}
    >
      {children}
    </div>
  )
}