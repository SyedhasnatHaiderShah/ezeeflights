"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Plane,
  Sparkles,
  Ticket,
  User,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { useSidebarStore } from "@/lib/store/sidebar-store";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
  isMenu?: boolean;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Flights", href: "/flights", icon: Plane },
  { label: "Menu", href: "#", icon: Menu, isMenu: true },
  { label: "Trips", href: "/my-trips", icon: Ticket, requiresAuth: true },
  { label: "Profile", href: "/profile", icon: User, requiresAuth: true },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useAuthSession();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const { open: openSidebar, isOpen: isSidebarOpen } = useSidebarStore();
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isHomePage = pathname === "/";
  const isTransparent = isHomePage && !isScrolled;

  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t transition-all duration-500 ease-in-out md:hidden pb-safe will-change-[background-color,border-color,backdrop-filter,box-shadow]",
        isTransparent
          ? "bg-white/10 backdrop-blur-xl border-white/10 text-white shadow-transparent"
          : "bg-background/95 backdrop-blur-xl border-border/50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]",
      )}
    >
      <div className="grid h-[54px] grid-cols-5 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isMenu
            ? isSidebarOpen
            : pathname === item.href || pathname?.startsWith(`${item.href}/`);

          const content = (
            <>
              {active && (
                <motion.span
                  layoutId="tab-indicator"
                  className={cn(
                    "absolute inset-x-2 inset-y-1 rounded",
                    isTransparent ? "bg-transparent" : "bg-transparent",
                  )}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] transition-all duration-300",
                    active
                      ? isTransparent
                        ? "text-white scale-110"
                        : "text-brand-red scale-110"
                      : isTransparent
                        ? "text-white"
                        : "text-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-[9px] font-normal tracking-wide transition-colors duration-100",
                    active
                      ? isTransparent
                        ? "text-white"
                        : "text-brand-red"
                      : isTransparent
                        ? "text-white"
                        : "text-foreground",
                  )}
                >
                  {item.label}
                </span>
              </div>
            </>
          );

          if (item.isMenu) {
            return (
              <button
                key={item.label}
                onClick={openSidebar}
                className="relative flex flex-col items-center justify-center"
              >
                {content}
              </button>
            );
          }

          if (item.requiresAuth && !session) {
            return (
              <button
                key={item.href}
                onClick={() => openAuthModal("login")}
                className="relative flex flex-col items-center justify-center"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href as never}
              className="relative flex flex-col items-center justify-center"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
