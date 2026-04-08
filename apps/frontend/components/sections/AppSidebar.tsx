"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { Button } from "@/components/ui/button";
import {
  Plane,
  Building2,
  Car,
  PackageOpen,
  Map,
  User,
  CalendarDays,
  Heart,
  Moon,
  Sun,
  Globe,
  DollarSign,
  HelpCircle,
  Phone,
  X,
  Tag,
  Star,
  Compass,
  MessageSquare,
  LucideIcon
} from "lucide-react";
import EzeeFlightsLogo from "@/components/ezee-flights-logo";

interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    label: "Explore",
    items: [
      { title: "Flights", url: "/flights", icon: Plane },
      { title: "Stays", url: "/stays", icon: Building2 },
      { title: "Cars", url: "/cars", icon: Car },
      { title: "Packages", url: "/packages", icon: PackageOpen },
      { title: "Destinations", url: "/destinations", icon: Map },
      { title: "Deals", url: "/deals", icon: Tag },
      { title: "Experience", url: "/experience", icon: Star },
      { title: "Journeys", url: "/journeys", icon: Compass },
      { title: "Reviews", url: "/reviews", icon: MessageSquare },
    ],
  },
  {
    label: "Top Airlines",
    items: [
      { name: "Alaska Airlines", url: "/alaska-airlines", icon: Plane },
      { name: "JetBlue Airlines", url: "/jetblue-airlines", icon: Plane },
      { name: "Southwest Airlines", url: "/southwest-airlines", icon: Plane },
      { name: "Delta Airlines", url: "/delta-airlines", icon: Plane },
      { name: "Aeromexico Airlines", url: "/aeromexico-airlines", icon: Plane },
    ].map(a => ({ title: a.name, url: a.href || a.url, icon: a.icon })),
  },
  {
    label: "Account",
    items: [
      { title: "Sign in / Profile", url: "/profile", icon: User },
      { title: "My Trips", url: "/trips", icon: CalendarDays },
      { title: "Saved", url: "/saved", icon: Heart },
    ],
  },
  {
    label: "Preferences",
    items: [
      { title: "Currency", url: "?config=currency", icon: DollarSign },
      { title: "Language", url: "?config=language", icon: Globe },
    ],
  },
  {
    label: "Support",
    items: [
      { title: "Help Center", url: "/help", icon: HelpCircle },
      { title: "Contact Us", url: "/contact", icon: Phone },
    ],
  },
];

export function AppSidebar() {
  const { isOpen, close, open } = useSidebarStore();
  const currentPath = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar when escape key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  // Click outside to close (mobile and desktop)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, close]);

  const getNavClassName = (active: boolean) =>
    active
      ? "bg-brand-red text-white font-medium shadow-md"
      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          aria-hidden="true"
          onClick={close}
        />
      )}

      {/* Hover Trigger Zone (Desktop only) */}
      {!isOpen && (
        <div
          className="fixed left-0 top-0 bottom-0 w-3 z-50 hidden lg:block cursor-pointer bg-transparent hover:bg-gradient-to-r from-black/5 to-transparent dark:from-white/5 transition-colors"
          onMouseEnter={open}
          aria-label="Open sidebar"
        />
      )}

      {/* Sidebar Panel */}
      <div
        ref={sidebarRef}
        className={cn(
          "fixed top-0 bottom-0 left-0 z-[70] w-[280px] bg-background/95 backdrop-blur-md border-r shadow-2xl flex flex-col",
          "transition-transform duration-300 ease-in-out lg:duration-400",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
        onMouseLeave={() => {
          // Only auto-close on mouse leave for desktop and if it's currently open
          if (window.innerWidth >= 1024 && isOpen) {
            close();
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b h-20">
          <Link href="/" onClick={close} className="flex gap-0.5 group shrink-0">
            <EzeeFlightsLogo
              isDarkMode={mounted && theme === "dark"}
              className="w-28 h-auto"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            className="h-8 w-8 rounded-full lg:hidden hover:bg-muted"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 no-scrollbar">
          {isOpen && (
            <div className="space-y-6">
              {NAVIGATION_GROUPS.map((group) => (
                <div key={group.label}>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                    {group.label}
                  </h4>
                  <ul className="space-y-1">
                    {group.items.map((item) => {
                      const isActive = currentPath === item.url;
                      return (
                        <li key={item.title}>
                          <Link
                            href={item.url as any}
                            onClick={close}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                              getNavClassName(isActive)
                            )}
                          >
                            <item.icon
                              className={cn(
                                "h-5 w-5 flex-shrink-0",
                                isActive ? "text-white" : "text-muted-foreground"
                              )}
                            />
                            <span className="text-sm font-medium">
                              {item.title}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}

              {/* Theme Toggle within Preferences */}
              <div className="pt-2">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    {mounted && theme === "dark" ? (
                      <Moon className="h-5 w-5 flex-shrink-0" />
                    ) : (
                      <Sun className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">Dark Mode</span>
                  </div>
                  {/* Visual indicator of switch state */}
                  <div className="w-10 h-5 bg-muted rounded-full relative flex items-center px-0.5 border">
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full transition-all duration-300 shadow-sm",
                        mounted && theme === "dark"
                          ? "bg-primary translate-x-5"
                          : "bg-background translate-x-0"
                      )}
                    />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
