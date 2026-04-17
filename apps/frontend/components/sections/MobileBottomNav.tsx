"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Plane, Sparkles, Ticket, User, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Flights", href: "/flights", icon: Plane },
  { label: "Deals", href: "/deals", icon: Sparkles },
  { label: "Trips", href: "/my-trips", icon: Ticket, requiresAuth: true },
  { label: "Profile", href: "/profile", icon: User, requiresAuth: true },
];

const notificationCount = 2;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useAuthSession();
  const openAuthModal = useAuthModalStore((state) => state.open);

  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 pb-safe backdrop-blur md:hidden">
      <div className="grid h-16 grid-cols-5 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);

          const content = (
            <>
              {active && (
                <motion.span
                  layoutId="tab-indicator"
                  className="absolute inset-1 rounded-2xl bg-brand-red/15"
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 h-5 w-5 transition-colors",
                  active ? "text-brand-red fill-brand-red/10" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "relative z-10 text-[11px] font-medium",
                  active ? "text-brand-red" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
              {item.label === "Profile" && notificationCount > 0 && (
                <span className="absolute right-3 top-2 z-20 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white">
                  {notificationCount}
                </span>
              )}
            </>
          );

          if (item.requiresAuth && !session) {
            return (
              <button
                key={item.href}
                onClick={() => openAuthModal("login")}
                className="relative flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-2xl"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-2xl"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
