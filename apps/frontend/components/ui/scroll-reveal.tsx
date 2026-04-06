"use client"

import React, { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  minHeight?: string;
  /** How far before the element enters the viewport to START RENDERING.
   *  Larger = earlier mount = no stall when user arrives. Default: 800px */
  rootMargin?: string;
}

export function ScrollReveal({
  children,
  className = "",
  minHeight = "400px",
  rootMargin = "800px",
}: ScrollRevealProps) {
  // `isMounted`  → controls whether children are in the DOM (triggers dynamic() load)
  // `isAnimated` → controls the CSS fade-in (fires when element nears the viewport)
  const [isMounted, setIsMounted] = useState(false)
  const [isAnimated, setIsAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Already within trigger range on mount (e.g. refreshed mid-page)
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight + parseInt(rootMargin)) {
      setIsMounted(true)
      requestAnimationFrame(() => setIsAnimated(true))
      return
    }

    // Observer 1: mount children early (well before user arrives)
    // This kicks off the dynamic() import while the section is still off-screen
    const mountObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsMounted(true)
          mountObserver.disconnect()
        }
      },
      { rootMargin: `0px 0px ${rootMargin} 0px`, threshold: 0 }
    )

    // Observer 2: trigger the animation only when truly near the viewport
    // Preserves your original smooth fade-in feel
    const animateObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAnimated(true)
          animateObserver.disconnect()
        }
      },
      { rootMargin: "0px 0px 100px 0px", threshold: 0.01 }
    )

    mountObserver.observe(el)
    animateObserver.observe(el)

    return () => {
      mountObserver.disconnect()
      animateObserver.disconnect()
    }
  }, [rootMargin])

  return (
    <div
      ref={ref}
      style={!isMounted ? { minHeight, contain: "layout style" } : undefined}
      className={cn(
        "transition-all duration-1000 ease-out will-change-[opacity,transform]",
        isMounted && (isAnimated ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"),
        className
      )}
    >
      {isMounted ? children : null}
    </div>
  )
}