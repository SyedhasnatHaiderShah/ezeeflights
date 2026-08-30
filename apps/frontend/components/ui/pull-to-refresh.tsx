"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2, ArrowDown } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export function PullToRefresh({ onRefresh, children, disabled = false }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const isAtTop = useRef(true);

  const checkScrollTop = (target: HTMLElement | null) => {
    let el = target;
    while (el) {
      if (el.scrollTop > 0) return false;
      el = el.parentElement;
    }
    return window.scrollY === 0;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isRefreshing) return;
    isAtTop.current = checkScrollTop(e.target as HTMLElement);
    if (isAtTop.current) {
      startY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (disabled || isRefreshing || !isAtTop.current) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    if (diff > 0) {
      const pull = Math.min(diff * 0.4, 120);
      setPullDistance(pull);
      
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || isRefreshing || !isAtTop.current) return;

    if (pullDistance > 60) {
      setIsRefreshing(true);
      setPullDistance(60);
      try {
        await onRefresh();
      } catch (err) {
        console.error("Refresh failed:", err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full"
    >
      <div
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? 1 : 0,
          transition: isRefreshing ? "height 0.2s ease" : "none",
        }}
        className="flex items-center justify-center overflow-hidden w-full bg-transparent"
      >
        {isRefreshing ? (
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Refreshing...</span>
          </div>
        ) : (
          <div 
            style={{ 
              transform: `rotate(${Math.min(pullDistance * 3, 180)}deg)`,
              transition: "transform 0.1s ease" 
            }}
            className="text-muted-foreground flex items-center justify-center p-2 rounded-full bg-card shadow-sm border border-border"
          >
            <ArrowDown className="h-5 w-5" />
          </div>
        )}
      </div>

      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : "none",
          transition: isRefreshing ? "transform 0.2s ease" : pullDistance === 0 ? "transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
        }}
        className="w-full origin-top"
      >
        {children}
      </div>
    </div>
  );
}
