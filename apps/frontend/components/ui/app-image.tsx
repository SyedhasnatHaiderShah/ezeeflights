"use client"

import NextImage, { ImageProps as NextImageProps } from "next/image"
import { cn } from "@/lib/utils"
import * as React from "react"
import { useState } from "react"
import { ImageOff } from "lucide-react"

/**
 * AppImage - A reusable, performance-optimized image component.
 */

interface AppImageProps extends Omit<NextImageProps, 'src' | 'alt'> {
  src: any;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string; // Correctly define className to avoid ambiguity with NextImage props
  wrapperClassName?: string;
  priority?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  fallback?: string | null;
  isCompact?: boolean;
}

export function AppImage({
  src,
  alt,
  fill = false,
  width,
  height,
  className,
  wrapperClassName,
  priority = false,
  objectFit = "cover",
  fallback = null,
  isCompact = false,
  ...rest
}: AppImageProps) {
  const [errored, setErrored] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const resolvedSrc = (errored && fallback) ? fallback : src

  // When both the original src and fallback fail
  const hasReallyErrored = errored && (!fallback || (errored && resolvedSrc === fallback))

  // Destructure children and other potential non-DOM props from rest
  const { children: _children, ...restForNextImage } = rest as any;

  const commonProps = {
    src: resolvedSrc,
    alt: String(alt || ""),
    priority,
    onLoad: () => setIsLoading(false),
    onError: () => {
      setIsLoading(false)
      setErrored(true)
    },
    className: cn(
      isCompact ? "duration-300 ease-out transition-all" : "duration-700 ease-in-out transition-all",
      isLoading || errored 
        ? cn("opacity-0", isCompact ? "scale-100 blur-[2px]" : "scale-[1.02] blur-sm grayscale") 
        : cn("opacity-100 scale-100 blur-0 grayscale-0"),
      fill ? "object-cover" : "",
      className
    ),
    ...restForNextImage
  }

  const skeleton = (
    <div
      key="skeleton"
      className={cn(
        "absolute inset-0 z-10 bg-neutral-100 dark:bg-neutral-900",
        isCompact ? "animate-none bg-muted/40" : "animate-pulse",
        fill ? "" : "rounded-md"
      )}
    >
      <div className={cn(
        "absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full",
        isCompact ? "animate-shimmer-fast" : "animate-shimmer"
      )} />
    </div>
  )

  const fallbackUI = (
    <div
      key="fallback"
      className={cn(
        "absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-900",
        fill ? "" : "rounded-md",
        className
      )}
    >
      <ImageOff className="w-8 h-8 text-neutral-400 mb-2" />
      <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 px-4 text-center truncate w-full">
        {String(alt || "Image Unavailable")}
      </span>
    </div>
  )

  const content = (
    <React.Fragment>
      {(isLoading && !errored) && skeleton}
      {hasReallyErrored ? fallbackUI : (
        <NextImage
          {...commonProps}
          {...(fill 
            ? { fill: true, sizes: restForNextImage.sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" }
            : { width, height, style: { ...restForNextImage.style, objectFit } }
          )}
        />
      )}
    </React.Fragment>
  )

  if (fill) {
    return (
      <div className={cn(
        "relative w-full h-full overflow-hidden", 
        isCompact && "rounded-xl ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.08] bg-muted/10",
        wrapperClassName
      )}>
        {content}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden inline-block", 
        isCompact && "rounded-xl ring-1 ring-inset ring-black/[0.08] dark:ring-white/[0.08] bg-muted/10",
        wrapperClassName
      )}
      style={!fill ? { width, height } : {}}
    >
      {content}
    </div>
  )
}
